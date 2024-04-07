const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const helper = require('../tests/test_helper')


blogsRouter.get('/', async (req, res) => {
  const allBlogs = await Blog.find({}).populate('user', { blogs: 0 })
  res.json(allBlogs)
})

blogsRouter.post('/', async (req, res, next) => {
  const body = req.body

  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)

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