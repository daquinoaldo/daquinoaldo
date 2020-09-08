export default interface ViewerQueryResult {
  message: string | undefined
  errors: string | undefined
  data: {
    rateLimit: {
      limit: number
      cost: number
      remaining: number
      resetAt: string
    }
    viewer: {
      repositories: {
        totalCount: number
        nodes: {
          nameWithOwner: string
          languages: {
            totalCount: number
            nodes: {
              name: string
            }[]
            edges: {
              size: number
            }[]
          }
        }[]
      }
    }
  }
}