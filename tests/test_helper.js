const Blog = require('../models/blog')

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

const blogsInDb = async () => {
    const allBlogs = await Blog.find({})
    return allBlogs.map(blog => blog.toJSON())
}

module.exports = { initialBlogs, blogsInDb }