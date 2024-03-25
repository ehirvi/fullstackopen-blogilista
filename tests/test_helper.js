const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Pekka flies to the Moon',
    author: 'Pekka',
    url: 'pekka.com/blog',
    likes: 4
  },
  {
    title: 'Pekka drives a car',
    author: 'Pekka',
    url: 'pekka.com/blog',
    likes: 2
  }
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'title',
    url: 'url'
  })
  await blog.save()
  await blog.deleteOne()
  return blog._id.toString()
}

const blogsInDb = async () => {
  const allBlogs = await Blog.find({})
  return allBlogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const allUsers = await User.find({})
  return allUsers.map(user => user.toJSON())
}

module.exports = { initialBlogs, nonExistingId, blogsInDb, usersInDb }