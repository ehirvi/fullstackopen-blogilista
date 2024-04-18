const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { tokenExtractor, userExtractor } = require('../utils/middleware')


blogsRouter.get('/', async (req, res) => {
  const allBlogs = await Blog.find({}).populate('user', { blogs: 0 })
  res.json(allBlogs)
})

blogsRouter.post('/', tokenExtractor, userExtractor, async (req, res, next) => {
  const body = req.body
  try {
    const user = req.user
    const newBlog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    })
    const savedBlog = await newBlog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    res.status(201).json(savedBlog)

  } catch (err) {
    next(err)
  }
})

blogsRouter.delete('/:id', tokenExtractor, userExtractor, async (req, res, next) => {
  try {
    const blogToDelete = await Blog.findById(req.params.id)
    if (blogToDelete === null) {
      return res.status(400).json({ error: 'blog not found' })
    }
    const user = req.user
    if (!(blogToDelete.user.toString() === user._id.toString())) {
      return res.status(401).json({ error: 'token invalid' })
    }
    await Blog.findOneAndDelete(blogToDelete)
    user.blogs = user.blogs.filter(blog => blog._id.toString() !== blogToDelete._id.toString())
    await user.save()
    res.status(204).end()
  } catch (err) {
    next(err)
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
  } catch (err) {
    next(err)
  }
})

module.exports = blogsRouter