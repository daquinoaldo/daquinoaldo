interface Item {
  title: string
  pubDate: string
  link: string
  author: string
  thumbnail: string
  description: string
  content: string
  categories: string[]
}

function getPosts(): Promise<string> {
  return fetch("https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@daquinoaldo")
    .then((res) => res.json())
    .then((mediumFeed: { items: Item[] }) =>
      mediumFeed.items
        .filter((item) => item.categories.length > 0) // remove comments (they have no categories)
        .slice(0, 10)
        .map((item) => `- [${item.title}](${item.link})\n`)
        .reduce((list, entry) => list += entry)
    )
}

const writeFile = (filename: string, content: string) =>
  Deno.writeFile(filename, new TextEncoder().encode(content))
const readFile = (filename: string) =>
  Deno.readFile(filename).then((data) => new TextDecoder("utf-8").decode(data))

let readme = await readFile("README.md")
const posts = await getPosts()

readme = readme.replace(
  /(?<=<!-- MEDIUM_POSTS_START -->)(.*?)(?=<!-- MEDIUM_POSTS_END -->)/s,
  `\n${posts}\n`,
)

// write back the files
writeFile("README.md", readme)
