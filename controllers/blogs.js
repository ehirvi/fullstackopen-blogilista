const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (req, res) => {
  const allBlogs = await Blog.find({})
  res.json(allBlogs)
})

blogsRouter.post('/', (req, res) => {
  const newBlog = new Blog(req.body)
  newBlog
    .save()
    .then(result => {
      res.status(201).json(result)
    })
})

module.exports = blogsRouter