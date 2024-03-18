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

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (e) {
    next(e)
  }
})

module.exports = blogsRouter