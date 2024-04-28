const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// const initialBlogs = [
//   {
//     title: 'Pekka flies to the Moon',
//     author: 'Pekka',
//     url: 'pekka.com/blog',
//     likes: 4,
//     user:
//   },
//   {
//     title: 'Pekka drives a car',
//     author: 'Pekka',
//     url: 'pekka.com/blog',
//     likes: 2,
//     user: '6604812abcd0c06c8edc47b9'
//   }
// ]

const nonExistingId = async (user) => {
  const blog = new Blog({
    title: 'title',
    url: 'url',
    user: user.id
  })
  const savedBlog = await blog.save()
  await blog.deleteOne()
  return savedBlog._id.toString()
}

const blogsInDb = async () => {
  const allBlogs = await Blog.find({})
  return allBlogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const allUsers = await User.find({})
  return allUsers.map(user => user.toJSON())
}

const createTestUser = async () => {
  const passHash = await bcrypt.hash('test', 10)
  const user = await new User({ username: 'test', passwordHash: passHash }).save()
  return user
}

const createTestBlog = async (user) => {
  const blog = new Blog({
    title: 'blog_title',
    url: 'blog_url',
    user: user._id
  })
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog)
  await user.save()
}

const getTestUserToken = (user) => {
  // const user = await usersInDb()[0]
  const userForToken = {
    username: user.username,
    id: user.id
  }
  const token = jwt.sign(userForToken, process.env.SECRET)
  return token
}

module.exports = { nonExistingId, blogsInDb, usersInDb, createTestUser, createTestBlog, getTestUserToken }