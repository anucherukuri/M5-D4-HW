import express from "express"
import uniqid from "uniqid"
import createHttpError from "http-errors"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import fs from "fs"
import { validationResult } from "express-validator"
import { newBlogPostValidation } from "./validation.js"
import { getBlogPosts, writeBlogPosts, getAuthors } from "../../lib/fs-tools.js"
 
const blogPostsRouter = express.Router()

// 0. blogPosts json path
// const blogPostsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "blogPosts.json")
// console.log(import.meta.url)
// console.log(fileURLToPath(import.meta.url))
// console.log(dirname(fileURLToPath(import.meta.url)))
// console.log(blogPostsJSONPath)

// const getBlogPosts = () => JSON.parse(fs.readFileSync(blogPostsJSONPath))
// const writeBlogPosts = content => fs.writeFileSync(blogPostsJSONPath, JSON.stringify(content))

// 1.
blogPostsRouter.post("/", newBlogPostValidation, async(req, res, next) => {
  try {
    const errorsList = validationResult(req)
    if (errorsList.isEmpty()) {
      // 1. Get new blogPost info from req.body & Add additional info
      const newBlogPost = { ...req.body, createdAt: new Date(), id: uniqid() }

      // 2. Read blogPosts.json file --> buffer --> array
      const blogPostsArray = await getBlogPosts()

      // 3. Add new blogPost to array
      blogPostsArray.push(newBlogPost)

      // 4. Write array to file
      await writeBlogPosts(blogPostsArray)

      // 5. Send back a proper response
      res.status(201).send({ id: newBlogPost.id })
    } else {
      next(createHttpError(400, "Some errors occured in request body!", { errorsList }))
    }
  } catch (error) {
    next(error)
  }
})

// 2.
blogPostsRouter.get("/", async(req, res, next) => {
  try {
    // throw new Error("Kabooooooooooooooooooooooom!")
    // console.log("QUERY PARAMETERS: ", req.query) // URL: ?category=fantasy --> req.query: { category: "fantasy"}
    // Read the file --> array
    const blogPostsArray = await getBlogPosts()
    const authorsArray = await getAuthors()
    if (req.query && req.query.category) {
      const filteredBlogPosts = blogPostsArray.filter(blogPost => blogPost.category === req.query.category)
      res.send(filteredBlogPosts)
    } else {
      // Send response
      res.send({authorsArray,blogPostsArray})
    }
  } catch (error) {
    next(error) // With the next function I can send the error to the error handler middleware
  }
})






// 3.
blogPostsRouter.get("/:blogPostId", async(req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId

    const blogPostsArray = await getBlogPosts()

    const foundBlogPost = blogPostsArray.find(blogPost => blogPost.id === blogPostId)
    if (foundBlogPost) {
      res.send(foundBlogPost)
    } else {
      next(createHttpError(404, `BLog Post with id ${req.params.blogPostId} not found!`))
    }
  } catch (error) {
    next(error)
  }
})

// 4.
blogPostsRouter.put("/:blogPostId", async(req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId

    const blogPostsArray = await getBlogPosts()

    const index = blogPostsArray.findIndex(blogPost => blogPost.id === blogPostId)

    const oldBlogPost = blogPostsArray[index]

    const updatedBlogPost = { ...oldBlogPost, ...req.body, updatedAt: new Date() }

    blogPostsArray[index] = updatedBlogPost

    await writeBlogPosts(blogPostsArray)

    res.send(updatedBlogPost)
  } catch (error) {
    next(error)
  }
})

// 5.
blogPostsRouter.delete("/:blogPostId", async(req, res, next) => {
  try {
    const blogPostId = req.params.blogPostId

    const blogPostsArray = await getBlogPosts()

    const remaningBlogPosts = blogPostsArray.filter(blogPost => blogPost.id !== blogPostId)

    await writeBlogPosts(remaningBlogPosts)

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// blogPostsRouter.get("/example", (req, res, next) => {
//   try {
//   } catch (error) {
//     next(error)
//   }
// })

export default blogPostsRouter