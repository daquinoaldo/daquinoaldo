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

function itemToHTML(item: Item) {
  // cut the description to max 100 chars
  item.description = item.description
    .replace(/<[^>]*>?/gm, "") // remove html tags
    .slice(0, 100) // cut to 100 characters
    .split(" ") // split the string in words
    .slice(0, -1) // remove the last (cropped) word
    .join(" ") // join back into a string

  // format the date
  item.pubDate = new Date(item.pubDate)
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

  // create the card
  return `
<a href="${item.link}"><img src="${item.thumbnail}"></a>
<h3><a href="${item.link}">${item.title}</a></h3>
<p>${item.description}...</p>
<sub><sup>${item.pubDate}</sup></sub>
`
}

function getPosts(): Promise<string> {
  return fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@daquinoaldo`,
  )
    .then((res) => res.json())
    .then((mediumFeed: { items: Item[] }) =>
      mediumFeed.items
        .filter((item) => item.categories.length > 0) // remove comments (they have no categories)
        .slice(0, 3) // keep the last three posts
        .map((item) => itemToHTML(item)) // obtain the html for each post
        .reduce((acc, post) =>
          // insert them into a 1x3 table
          acc += `<td valign="top">${post}</td>`, "<table><tr>") +
      "</tr></table>"
    )
}

const writeFile = (filename: string, content: string) =>
  Deno.writeFile(filename, new TextEncoder().encode(content))
const readFile = (filename: string) =>
  Deno.readFile(filename).then((data) => new TextDecoder("utf-8").decode(data))

// read the readme
let readme = await readFile("README.md")

// update the about section
const about = await readFile("about.md")
readme = readme.replace(
  /(?<=<!-- ABOUT_START -->)(.*?)(?=<!-- ABOUT_END -->)/s,
  `\n${about}\n`,
)

// update the Medium posts
const posts = await getPosts()
readme = readme.replace(
  /(?<=<!-- MEDIUM_POSTS_START -->)(.*?)(?=<!-- MEDIUM_POSTS_END -->)/s,
  `\n${posts}\n`,
)

// write back the files
writeFile("README.md", readme)
