const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (req, res) => {
  Blog
    .find({})
    .then(blogs => {
      res.json(blogs)
    })
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