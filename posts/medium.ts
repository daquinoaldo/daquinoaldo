import Post from "./post.ts"

interface MediumItem {
  title: string
  pubDate: string
  link: string
  author: string
  thumbnail: string
  description: string
  content: string
  categories: string[]
}

export default class Medium {

  private static itemToPost(item: MediumItem): Post {
    return {
      title: item.title,
      link: item.link,
      author: item.author,
      thumbnail: item.thumbnail,
      categories: item.categories,
      date: new Date(item.pubDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      content: item.content,
      description: item.description
        .replace(/<[^>]*>?/gm, '')  // remove html tags
        .slice(0, 100)              // cut to 100 characters
        .split(" ")                 // split the string in words
        .slice(0, - 1)              // remove the last (cropped) word
        .join(" ")                  // join back into a string
    }
  }

  static async getPosts(): Promise<Post[]> {
    return fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@daquinoaldo`)
      .then(res => res.json())
      .then((mediumFeed: ({ items: MediumItem[] })) => mediumFeed.items
        .filter(item => item.categories.length > 0)   // remove comments (they have no categories)
        .slice(0, 3)                                  // keep the last three posts
        .map(item => Medium.itemToPost(item))         // convert to the post format
      )
  }
}