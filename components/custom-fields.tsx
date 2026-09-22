import type { CustomField } from "@/content/types"

export function CustomFields({ fields }: { fields?: CustomField[] }) {
  if (!fields || fields.length === 0) return null

  return (
    <dl className="mt-2 space-y-0.5 text-sm text-muted-foreground">
      {fields.map((field) => (
        <div key={field.label} className="flex gap-1.5">
          <dt className="font-medium text-foreground">{field.label}:</dt>
          <dd>
            {field.href ? (
              <a
                href={field.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-2 hover:text-primary hover:underline"
              >
                {field.value}
              </a>
            ) : (
              field.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
