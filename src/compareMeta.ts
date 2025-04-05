import { diffLines, Change } from "diff"
import { PageMeta } from "./parsePage"

export interface MetaDiff {
  path: string
  titleDiff: Change[]
  descDiff: Change[]
}

export function compareMeta(site1: PageMeta[], site2: PageMeta[]): MetaDiff[] {
  const diffs: MetaDiff[] = []
  const map2 = new Map(site2.map((p) => [p.path, p]))

  for (const page1 of site1) {
    const page2 = map2.get(page1.path)
    if (!page2) continue

    const titleDiff = diffLines(page1.title, page2.title)
    const descDiff = diffLines(page1.description, page2.description)

    if (
      titleDiff.some((p) => p.added || p.removed) ||
      descDiff.some((p) => p.added || p.removed)
    ) {
      diffs.push({ path: page1.path, titleDiff, descDiff })
    }
  }

  return diffs
}
