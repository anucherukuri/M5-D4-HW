import express from "express" 
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import { join } from "path"

import authorsRouter from "./services/authors/index.js"
import blogPostsRouter from "./services/blogPosts/index.js"
import filesRouter from "./services/files/index.js"
import {badRequestHandler,unauthorizedHandler,notFoundHandler,genericErrorHandler} from "./errorHandlers.js"

const server = express()

// every process on this computer must have a different port number (REACT APPS ARE BY DEFAULT ON 3000)
const port = 3003 

const publicFolderPath = join(process.cwd(), "./public")

// ************************** MIDDLEWARES ********************************

const loggerMiddleware = (req, res, next) => {
  console.log(`Request method: ${req.method} --- URL ${req.url} --- ${new Date()}`)
  next()
}

server.use(express.static(publicFolderPath))
server.use(loggerMiddleware) // Global middleware
server.use(cors()) // If you want to connect your frontend to this backend remember to add this cors middleware
server.use(express.json()) // If you don't add this configuration to our server (BEFORE the endpoints), all requests' bodies will be undefined!

// ************************** ENDPOINTS *****************************

server.use("/authors", loggerMiddleware, authorsRouter) // loggerMiddleware here is used as a ROUTER LEVEL MIDDLEWARE
server.use("/blogPosts", blogPostsRouter)
server.use("/files", filesRouter)


// *********************** ERROR HANDLERS ***************************

server.use(badRequestHandler)
server.use(unauthorizedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

// ******************* DISPLAYING CONTENT IN A TABLE *******************

console.table(listEndpoints(server))


// *********************** SERVER RUNNING ON PORT ***********************

server.listen(port, ()=>{
    console.log(`Server Running on port ${port}`)
})