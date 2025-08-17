import postsData from "../mock_data/posts.json"

export const getPosts = () => {
   return new Promise((resolve) => {
      setTimeout(() => {
         resolve(postsData)
      }, 500)
   })
}
