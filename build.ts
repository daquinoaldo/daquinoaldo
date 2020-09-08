import Post from "./posts/post.ts"
import Medium from './posts/medium.ts'
import GitHub, { Language } from './github/github.ts'

async function postsToHTML(posts: Post[]): Promise<string> {
  return posts
    .map(post =>  // obtain the html for each post
      `
        <a href="${post.link}"><img src="${post.thumbnail}"></a>
        <h3><a href="${post.link}">${post.title}</a></h3>
        <p>${post.description}...</p>
        <sub><sup>${post.date}</sup></sub>
      `
    )
    .reduce((acc, post) =>  // insert them into a 1x3 table 
      acc += `<td valign="top">${post}</td>`, "<table><tr>") + "</tr></table>"
}

async function programmingLanguagesToHTML(programmingLanguages: Language[]): Promise<string> {
  let html = "<ol>"
  for (let lang of programmingLanguages) {
    const repos = lang.repos
      .map(repo => `<a href="https://github.com/${repo.name}">${repo.name}</a>`)
      .join(", ") || "Private repos only"
    html += `<li>${lang.name}<br><sup>${repos}</sup></li>`
  }
  html += "</ol>"
  return html
}

const writeFile = (filename: string, content: string) => Deno.writeFile(filename, new TextEncoder().encode(content))
const readFile = (filename: string) => Deno.readFile(filename).then(data => new TextDecoder("utf-8").decode(data))

// read the readme
let readme = await readFile("README.md")

// update the about section
const about = await readFile("about.md")
readme = readme.replace(/(?<=<!-- ABOUT_START -->)(.*?)(?=<!-- ABOUT_END -->)/s, `\n${about}\n`)

// update the Medium posts
const posts = await Medium.getPosts().then(postsToHTML)
readme = readme.replace(/(?<=<!-- MEDIUM_POSTS_START -->)(.*?)(?=<!-- MEDIUM_POSTS_END -->)/s, `\n${posts}\n`)

// update the programming languages section
const programmingLanguages = await GitHub.getProgrammingLanguages().then(programmingLanguagesToHTML)
readme = readme.replace(/(?<=<!-- PROGRAMMING_LANGUAGES_START -->)(.*?)(?=<!-- PROGRAMMING_LANGUAGES_END -->)/s, `\n${programmingLanguages}\n`)

// write back the files
writeFile("README.md", readme)