import axios from "axios"
import * as cheerio from "cheerio"

export interface PageMeta {
  path: string
  title: string
  description: string
  error?: string
}

function cleanMeta(value: string): string {
  // Remove trailing "noise" characters: | . , - : ; / + & ( [ { " '
  return value
    .trim()
    .replace(/[|.,\-:;\/+&([{"']+$/g, "")
    .trim()
}

export async function parsePageMeta(url: string): Promise<PageMeta> {
  try {
    const { data: html } = await axios.get(url)
    const $ = cheerio.load(html)
    const title = cleanMeta($("title").text())
    const description = cleanMeta(
      $('meta[name="description"]').attr("content") || ""
    )
    return { path: new URL(url).pathname, title, description }
  } catch (err: any) {
    return {
      path: new URL(url).pathname,
      title: "",
      description: "",
      error: err.message,
    }
  }
}
