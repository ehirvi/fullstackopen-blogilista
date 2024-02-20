const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  const favorite = blogs.reduce((initial, blog) => blog.likes > initial.likes ? blog : initial, blogs[0])
  return blogs.length === 0
    ? null
    : {
      title: favorite.title,
      author: favorite.author,
      likes: favorite.likes
    }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const authors = _.countBy(blogs, blog => blog.author)
  const authorsArray = _.toPairs(authors)
  const authorsSorted = _.orderBy(authorsArray, [1], 'desc')
  return {
    author: authorsSorted[0][0],
    blogs: authorsSorted[0][1]
  }
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs }