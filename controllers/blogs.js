const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (req, res) => {
  const allBlogs = await Blog.find({})
  res.json(allBlogs)
})

blogsRouter.post('/', async (req, res, next) => {
  const newBlog = new Blog(req.body)

  try {
    const savedBlog = await newBlog.save()
    res.status(201).json(savedBlog)
  } catch (e) {
    next(e)
  }
})

module.exports = blogsRouter