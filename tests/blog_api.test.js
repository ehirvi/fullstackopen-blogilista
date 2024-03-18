const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

describe('when some blogs are initially added', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are two blogs', async () => {
    const res = await api.get('/api/blogs')
    assert.strictEqual(res.body.length, helper.initialBlogs.length)
  })

  test('blog id\'s are correctly named', async () => {
    const blogs = await helper.blogsInDb()
    assert('id' in blogs[0])
    assert('_id' in blogs[0] === false)
  })

  describe('adding a new blog', () => {
    test('succeeds when the data is valid', async () => {
      const newBlog = {
        title: 'Pekka swims in the ocean',
        author: 'Pekka',
        url: 'pekka.com/blog',
        likes: 8
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const res = await api.get('/api/blogs')
      const titles = res.body.map(blog => blog.title)

      assert.strictEqual(res.body.length, helper.initialBlogs.length + 1)
      assert(titles.includes('Pekka swims in the ocean'))
    })

    test('succeeds even if likes are not added, defaulted to zero', async () => {
      const newBlog = {
        title: 'Pekka finds out the meaning of life',
        author: 'Pekka',
        url: 'pekka.com/blog',
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const res = await api.get('/api/blogs')
      const likes = res.body.map(blog => blog.likes)

      assert.strictEqual(res.body.length, helper.initialBlogs.length + 1)
      assert.strictEqual(likes.at(-1), 0)
    })

    test('fails with error 400 if title is not added', async () => {
      const newBlog = {
        author: 'Pekka',
        url: 'pekka.com/blog',
        likes: 5
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const res = await api.get('/api/blogs')
      assert.strictEqual(res.body.length, helper.initialBlogs.length)
    })

    test('fails with error 400 if url is not added', async () => {
      const newBlog = {
        title: 'Pekka does a thing',
        author: 'Pekka',
        likes: 6
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

      const res = await api.get('/api/blogs')
      assert.strictEqual(res.body.length, helper.initialBlogs.length)
    })
  })

  describe('deleting a blog', () => {
    test('succeeds with status code 204 if the id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(blog => blog.title)

      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length + 1)
      assert(!titles.includes(blogToDelete.title))
    })

    test('fails with error 400 if the id is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogId = "123abc"

      await api
        .delete(`/api/blogs/${blogId}`)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtStart.length, blogsAtEnd.length)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})