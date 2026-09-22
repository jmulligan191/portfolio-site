import { Fragment } from "react"
import { HeroSection } from "@/components/hero-section"
import { SectionRenderer } from "@/components/section-renderer"
import { Separator } from "@/components/ui/separator"
import { visibleSections } from "@/content/data"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      {visibleSections.map((section, index) => (
        <Fragment key={`${section.type}-${index}`}>
          <Separator className="mx-auto max-w-5xl" />
          <SectionRenderer section={section} />
        </Fragment>
      ))}
    </>
  )
}
