import { fetchSitemap } from "./fetchSitemap"
import { parsePageMeta } from "./parsePage"
import { compareMeta } from "./compareMeta"
import chalk from "chalk"
import fs from "fs/promises" // optional, if you want to write output later
import path from "path"

function printDiffLabel(label: string, change: any) {
  if (change.added) {
    return chalk.green(`+ ${label}${change.value.trim()}`)
  } else if (change.removed) {
    return chalk.red(`- ${label}${change.value.trim()}`)
  } else {
    return chalk.gray(`  ${label}${change.value.trim()}`)
  }
}

async function run() {
  const args = process.argv.slice(2)

  const sitemapUrl1 = args[0]
  const sitemapUrl2 = args[1]
  const shouldExportJson = args.includes("--json")

  if (!sitemapUrl1 || !sitemapUrl2) {
    console.error("❌ Usage: pnpm dev <sitemap1> <sitemap2> [--json]")
    process.exit(1)
  }

  const [urls1, urls2] = await Promise.all([
    fetchSitemap(sitemapUrl1),
    fetchSitemap(sitemapUrl2),
  ])

  const [pages1, pages2] = await Promise.all([
    Promise.all(urls1.map(parsePageMeta)),
    Promise.all(urls2.map(parsePageMeta)),
  ])

  const diffs = compareMeta(pages1, pages2)

  let titleChanges = 0
  let descriptionChanges = 0

  for (const { path, titleDiff, descDiff } of diffs) {
    const hasTitleChange = titleDiff.some((p) => p.added || p.removed)
    const hasDescChange = descDiff.some((p) => p.added || p.removed)
    if (hasTitleChange) titleChanges++
    if (hasDescChange) descriptionChanges++

    console.log(chalk.bold(`\n🔗 ${path}`))

    if (titleDiff.length > 1) {
      console.log(chalk.blue("📝 Title:"))
      titleDiff.forEach((change) => {
        console.log(printDiffLabel("T: ", change))
      })
    }

    if (descDiff.length > 1) {
      console.log(chalk.yellow("📄 Description:"))
      descDiff.forEach((change) => {
        console.log(printDiffLabel("D: ", change))
      })
    }
  }

  console.log("\n📊 Summary")
  console.log("───────────────")
  console.log(`🔗 Pages compared:       ${pages1.length}`)
  console.log(`🧾 Pages with changes:   ${diffs.length}`)
  console.log(`📝 Title changes:        ${titleChanges}`)
  console.log(`📄 Description changes:  ${descriptionChanges}`)

  if (shouldExportJson) {
    const jsonPath = path.resolve("diff-output.json")
    await fs.writeFile(jsonPath, JSON.stringify(diffs, null, 2), "utf-8")
    console.log(`\n💾 Diff results written to ${jsonPath}`)
  }
}

run()
