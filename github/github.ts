import "https://deno.land/x/dotenv/load.ts"
import ViewerQueryResult from './viewerQueryResult.ts'

export class Language {
  name: string
  size: number
  repos: Repository[]

  constructor(name: string) {
    this.name = name
    this.size = 0
    this.repos = []
  }
}

interface Repository {
  name: string
  size: number
}

export default class GitHub {

  static languageToExclude = [
    "PostScript",
    "Jupyter Notebook",
    "TeX",
    "CMake",
    "Makefile"
  ]

  static async queryViewer(): Promise<ViewerQueryResult> {
    const res: ViewerQueryResult = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Authorization": `token ${Deno.env.get("GH_API_TOKEN")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query:
          `{
            rateLimit {
              limit
              cost
              remaining
              resetAt
            }
            viewer {
              repositories(first: 100, privacy: PUBLIC, affiliations: [OWNER, COLLABORATOR], ownerAffiliations:[OWNER, COLLABORATOR]) {
                totalCount
                nodes {
                  nameWithOwner
                  languages(first: 100) {
                    totalCount
                    nodes {
                      name
                    }
                    edges {
                      size
                    }
                  }
                }
              }
            }
          }`
      })
    }).then(res => res.json())
    if (res.message) console.error(`GitHub APIs error: ${res.message}.`)
    if (res.errors) console.error(`GitHub APIs error: ${JSON.stringify(res.errors)}.`)
    if (!res.message && !res.errors) console.info(`${res.data.rateLimit.remaining} remaining APIs calls.`)
    return res
  }

  static async getProgrammingLanguages() {
    const viewer = await GitHub.queryViewer()
    const repos = viewer.data.viewer.repositories.nodes

    const languages = new Map<string, Language>()

    for (let repo of repos) {                                                             // iterate over repos
      for (let i = 0; i < repo.languages.totalCount; i++) {                                 // iterate over repos' languages
        const languageName = repo.languages.nodes[i].name
        if (GitHub.languageToExclude.includes(languageName)) continue                         // skip those to be excluded
        const languageSize = repo.languages.edges[i].size
        const language = languages.get(languageName) || new Language(languageName)            // retrieve the existing lang obj or create a new one
        language.size += languageSize                                                         // update the language size
        language.repos.push({ name: repo.nameWithOwner, size: languageSize })                 // add the current repo inside the language with the code amount
        languages.set(languageName, language)                                                 // add the language to the map
      }
    }

    return [...languages.values()]            // convert map values to array
      .sort((a, b) => b.size - a.size)        // sort languages by size
      .map(lang => {                          // for each language
        lang.repos = lang.repos
          .sort((a, b) => b.size - a.size)        // sort repos by size
          .slice(0, 3)                            // keep the first three repos
        return lang
      })
  }

}