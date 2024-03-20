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
    const blogExists = await Blog.findById(req.params.id)
    if (blogExists !== null) {
      await Blog.findByIdAndDelete(req.params.id)
      res.status(204).end()
    } else {
      res.status(400).end()
    }
  } catch (e) {
    next(e)
  }
})

blogsRouter.put('/:id', async (req, res, next) => {
  const editedBlog = {
    title: req.body.title,
    author: req.body.author,
    url: req.body.url,
    likes: req.body.likes
  }

  try {
    const blogExists = await Blog.findById(req.params.id)
    if (blogExists !== null) {
      const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, editedBlog, { new: true })
      res.status(200).json(updatedBlog)
    } else {
      res.status(400).end()
    }
  } catch (e) {
    next(e)
  }
})

module.exports = blogsRouter