const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  const favorite = blogs.reduce((mostLiked, blog) => blog.likes > mostLiked.likes ? blog : mostLiked, blogs[0])
  return blogs.length === 0
    ? null
    : {
      title: favorite.title,
      author: favorite.author,
      likes: favorite.likes
    }
}

module.exports = { dummy, totalLikes, favoriteBlog }