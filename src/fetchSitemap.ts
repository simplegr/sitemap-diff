import axios from "axios"
import { XMLParser } from "fast-xml-parser"

export async function fetchSitemap(url: string): Promise<string[]> {
  const res = await axios.get(url)
  const parser = new XMLParser()
  const sitemap = parser.parse(res.data)
  return sitemap.urlset.url.map((entry: any) => entry.loc)
}
