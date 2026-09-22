import { PDFDocument, PDFDict, PDFName, PDFString, PDFHexString, PDFRef } from "pdf-lib"

// Hidden tracking fields (export_id, exported_at, source) live in the
// /Info dictionary only — a single location, so exiftool/pikepdf show each
// field exactly once. Mirrors what the resume repo's export/metadata.py
// does (pikepdf) so a stamped PDF looks the same regardless of whether it
// was stamped locally or by the site.
export interface StampFields {
  export_id: string
  exported_at: string
  source: "local" | "site" | "site-default"
}

// Maps each field's internal name to its /Info dict key. PascalCase with
// acronyms kept together (ID, not Id) so exiftool's own title-casing prints
// e.g. "Export ID" rather than "Export Id".
const FIELD_KEYS: Record<keyof StampFields, string> = {
  export_id: "ExportID",
  exported_at: "ExportedAt",
  source: "Source",
}

// The resume repo's local pikepdf tool (export/metadata.py) stamps the
// base PDF's own build info under these keys before the site ever sees it.
const BUILD_VERSION_KEY = "BuildVersion"

// Standard /Info keys (plus /Lang on the Catalog) we actively manage,
// distinct from the custom tracking fields above.
export interface BrandingFields {
  /** Overwrites /Author (LaTeX/hyperref usually leaves this blank). */
  author?: string
  /** Sets a custom /Copyright field. */
  copyright?: string
  /**
   * Overwrites /Creator. `{version}` is replaced with the base PDF's own
   * stamped BuildVersion if present, or dropped (along with surrounding
   * whitespace) if not.
   */
  creator?: string
  title?: string
  subject?: string
  description?: string
  /** Comma-separated keyword list. */
  keywords?: string
  /** BCP 47 / RFC 3066 locale, e.g. "en-US". Written to the Catalog's /Lang, the actual PDF mechanism for document language. */
  language?: string
}

// Vendor/toolchain fingerprints we strip so the visible metadata doesn't
// reveal the LaTeX/pdf-lib pipeline: /Creator (hyperref) and /Producer
// (pdfTeX, then pdf-lib would otherwise overwrite it again at load time) —
// both get replaced by `branding.creator` instead — and any /PTEX.* key
// pdfTeX writes.
const FINGERPRINT_KEYS = ["Creator", "Producer"]

/**
 * Returns a new copy of the PDF with hidden metadata fields set, vendor
 * fingerprints stripped, standard metadata branded, and, optionally, the
 * embedded portfolio-link annotation's target URI rewritten. Never
 * regenerates or edits visible page content.
 */
export async function stampAndRewrite(
  pdfBytes: Uint8Array,
  fields: StampFields,
  trackedUrl?: string,
  branding?: BrandingFields
): Promise<Uint8Array> {
  // updateMetadata: false stops pdf-lib from silently overwriting
  // /Producer and /ModDate the moment the document loads, before we get a
  // chance to touch anything ourselves.
  const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false })

  const buildVersion = decodePdfString(getInfoDict(pdfDoc).get(PDFName.of(BUILD_VERSION_KEY)))

  const fieldEntries = (Object.keys(fields) as (keyof StampFields)[]).map(
    (key) => [FIELD_KEYS[key], fields[key]] as [string, string]
  )
  setInfoFields(pdfDoc, fieldEntries)
  stripFingerprints(pdfDoc)
  applyBranding(pdfDoc, branding, buildVersion)

  if (trackedUrl) {
    rewritePortfolioLink(pdfDoc, trackedUrl)
  }

  return pdfDoc.save()
}

function getInfoDict(pdfDoc: PDFDocument): PDFDict {
  const { context } = pdfDoc
  const infoRef = context.trailerInfo.Info
  if (infoRef instanceof PDFRef) {
    const looked = context.lookup(infoRef)
    if (looked instanceof PDFDict) return looked
  }
  const infoDict = context.obj({})
  context.trailerInfo.Info = context.register(infoDict)
  return infoDict
}

function setInfoFields(pdfDoc: PDFDocument, fields: [string, string][]) {
  const info = getInfoDict(pdfDoc)
  for (const [key, value] of fields) {
    info.set(PDFName.of(key), PDFString.of(value))
  }
}

function stripFingerprints(pdfDoc: PDFDocument) {
  const info = getInfoDict(pdfDoc)
  for (const key of FINGERPRINT_KEYS) {
    info.delete(PDFName.of(key))
  }
  // pdfTeX writes PTEX.Fullbanner, PTEX.FileName, etc.
  for (const key of info.keys()) {
    if (key.asString().startsWith("/PTEX")) {
      info.delete(key)
    }
  }

  // hyperref also embeds its own XMP metadata stream on the Catalog, with
  // its own copies of Producer/Creator/PTEX.Fullbanner (as CreatorTool) —
  // untouched by the /Info edits above. Drop it entirely rather than
  // trying to patch it in place: it carries no data we want to keep, and
  // its presence is exactly what caused every tracking field to appear
  // twice (once in /Info, once in this XMP block) before this fix.
  pdfDoc.catalog.delete(PDFName.of("Metadata"))
}

function applyBranding(pdfDoc: PDFDocument, branding: BrandingFields | undefined, buildVersion: string | null) {
  if (!branding) return

  const standardFields: [string, string | undefined][] = [
    ["Author", branding.author],
    ["Copyright", branding.copyright],
    ["Title", branding.title],
    ["Subject", branding.subject],
    ["Description", branding.description],
    ["Keywords", branding.keywords],
  ]
  setInfoFields(
    pdfDoc,
    standardFields.filter((entry): entry is [string, string] => entry[1] != null)
  )

  if (branding.creator != null) {
    const creator = branding.creator
      .replace("{version}", buildVersion ? `V${buildVersion}` : "")
      .replace(/\s+/g, " ")
      .trim()
    setInfoFields(pdfDoc, [["Creator", creator]])
  }

  if (branding.language != null) {
    pdfDoc.catalog.set(PDFName.of("Lang"), PDFString.of(branding.language))
  }
}

function decodePdfString(value: unknown): string | null {
  if (value instanceof PDFString || value instanceof PDFHexString) {
    return value.decodeText()
  }
  return null
}

/**
 * Finds the first /Subtype /Link annotation whose /A /URI targets the given
 * domain and rewrites that URI to `trackedUrl`. Non-fatal if no such
 * annotation exists (e.g. the base PDF has no embedded portfolio link) —
 * metadata stamping still succeeds either way.
 */
function rewritePortfolioLink(pdfDoc: PDFDocument, trackedUrl: string) {
  let domain: string
  try {
    domain = new URL(trackedUrl).hostname
  } catch {
    return
  }

  for (const page of pdfDoc.getPages()) {
    const annots = page.node.Annots()
    if (!annots) continue

    for (let i = 0; i < annots.size(); i++) {
      const annotRef = annots.get(i)
      const annot = annotRef instanceof PDFRef ? pdfDoc.context.lookup(annotRef) : annotRef
      if (!(annot instanceof PDFDict)) continue

      const subtype = annot.get(PDFName.of("Subtype"))
      if (!(subtype instanceof PDFName) || subtype.asString() !== "/Link") continue

      const actionRef = annot.get(PDFName.of("A"))
      const actionDict = actionRef instanceof PDFRef ? pdfDoc.context.lookup(actionRef) : actionRef
      if (!(actionDict instanceof PDFDict)) continue

      const uriText = decodePdfString(actionDict.get(PDFName.of("URI")))
      if (uriText && uriText.includes(domain)) {
        actionDict.set(PDFName.of("URI"), PDFString.of(trackedUrl))
      }
    }
  }
}
