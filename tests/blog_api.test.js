const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const { log } = require('node:console')

const api = supertest(app)

describe('when some blogs are initially added', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
    const user = await helper.createTestUser()
    await helper.createTestBlog(user)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there is one blog', async () => {
    const res = await api.get('/api/blogs')
    assert.strictEqual(res.body.length, 1)
  })

  test('blog id\'s are correctly named', async () => {
    const blogs = await helper.blogsInDb()
    assert('id' in blogs[0])
    assert('_id' in blogs[0] === false)
  })

  describe('adding a new blog', () => {
    test('succeeds when the data is valid', async () => {
      const users = await helper.usersInDb()
      const user = users[0]
      const token = helper.getTestUserToken(user)
      const blogsAtStart = await helper.blogsInDb()

      const newBlog = {
        title: 'Pekka swims in the ocean',
        author: 'Pekka',
        url: 'pekka.com/blog',
        likes: 8,
        user: user.id
      }
      await api
        .post('/api/blogs')
        .set({ 'authorization': `Bearer ${token}` })
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const res = await api.get('/api/blogs')
      const titles = res.body.map(blog => blog.title)
      assert.strictEqual(res.body.length, blogsAtStart.length + 1)
      assert(titles.includes('Pekka swims in the ocean'))
    })

    test('succeeds even if likes are not added, defaulted to zero', async () => {
      const users = await helper.usersInDb()
      const user = users[0]
      const token = helper.getTestUserToken(user)
      const blogsAtStart = await helper.blogsInDb()

      const newBlog = {
        title: 'Pekka finds out the meaning of life',
        author: 'Pekka',
        url: 'pekka.com/blog',
        user: user.id
      }
      await api
        .post('/api/blogs')
        .set({ 'authorization': `Bearer ${token}` })
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const res = await api.get('/api/blogs')
      const likes = res.body.map(blog => blog.likes)
      assert.strictEqual(res.body.length, blogsAtStart.length + 1)
      assert.strictEqual(likes.at(-1), 0)
    })

    test('fails with error 400 if title is not added', async () => {
      const users = await helper.usersInDb()
      const user = users[0]
      const token = helper.getTestUserToken(user)
      const blogsAtStart = await helper.blogsInDb()

      const newBlog = {
        author: 'Pekka',
        url: 'pekka.com/blog',
        likes: 5,
        user: user.id
      }
      await api
        .post('/api/blogs')
        .set({ 'authorization': `Bearer ${token}` })
        .send(newBlog)
        .expect(400)

      const res = await api.get('/api/blogs')
      assert.strictEqual(res.body.length, blogsAtStart.length)
    })

    test('fails with error 400 if url is not added', async () => {
      const users = await helper.usersInDb()
      const user = users[0]
      const token = helper.getTestUserToken(user)
      const blogsAtStart = await helper.blogsInDb()

      const newBlog = {
        title: 'Pekka does a thing',
        author: 'Pekka',
        likes: 6,
        user: user.id
      }
      await api
        .post('/api/blogs')
        .set({ 'authorization': `Bearer ${token}` })
        .send(newBlog)
        .expect(400)

      const res = await api.get('/api/blogs')
      assert.strictEqual(res.body.length, blogsAtStart.length)
    })

    test('fails with error 401 if user token is not provided', async () => {
      const users = await helper.usersInDb()
      const user = users[0]
      const blogsAtStart = await helper.blogsInDb()

      const newBlog = {
        title: 'Pekka goes to space',
        author: 'Pekka',
        url: 'pekka.com/blog',
        user: user.id
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      const res = await api.get('/api/blogs')
      assert.strictEqual(res.body.length, blogsAtStart.length)
    })
  })

  describe('deleting a blog', async () => {
    beforeEach(async () => {
      await User.deleteMany({})
      await Blog.deleteMany({})
      const user = await helper.createTestUser()
      await helper.createTestBlog(user)
    })

    test('succeeds with status code 204 if the id is valid', async () => {
      const users = await helper.usersInDb()
      const user = users[0]
      const token = helper.getTestUserToken(user)
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ 'authorization': `Bearer ${token}` })
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      const titles = blogsAtEnd.map(blog => blog.title)

      assert.strictEqual(blogsAtEnd.length + 1, blogsAtStart.length)
      assert(!titles.includes(blogToDelete.title))
    })

    test('fails with error 400 if the id is invalid format', async () => {
      const users = await helper.usersInDb()
      const user = users[0]
      const token = helper.getTestUserToken(user)
      const blogsAtStart = await helper.blogsInDb()
      const blogId = "123abc"

      await api
        .delete(`/api/blogs/${blogId}`)
        .set({ 'authorization': `Bearer ${token}` })
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('fails with error 400 if the id is valid but doesn\'t exist', async () => {
      const users = await helper.usersInDb()
      const user = users[0]
      const token = helper.getTestUserToken(user)
      const blogsAtStart = await helper.blogsInDb()
      const blogId = await helper.nonExistingId(user)

      await api
        .delete(`/api/blogs/${blogId}`)
        .set({ 'authorization': `Bearer ${token}` })
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('fails with error 401 if user token is not provided', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })
  })

  describe('editing a blog', () => {
    beforeEach(async () => {
      await User.deleteMany({})
      await Blog.deleteMany({})
      const user = await helper.createTestUser()
      await helper.createTestBlog(user)
    })

    test('succeeds if id and object are valid', async () => {
      const users = await helper.usersInDb()
      const user = users[0]
      const token = helper.getTestUserToken(user)
      const blogsAtStart = await helper.blogsInDb()
      const blogToEdit = blogsAtStart[0]
      const editedBlog = { ...blogToEdit, likes: blogToEdit.likes + 100 }

      await api
        .put(`/api/blogs/${blogToEdit.id}`)
        .set({ 'authorization': `Bearer ${token}` })
        .send(editedBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlog = blogsAtEnd.filter(blog => blog.id === blogToEdit.id)[0]
      assert.strictEqual(updatedBlog.likes, blogToEdit.likes + 100)
    })

    test('fails if id doesn\'t exist', async () => {
      const users = await helper.usersInDb()
      const user = users[0]
      const token = helper.getTestUserToken(user)
      const blogsAtStart = await helper.blogsInDb()
      const blogToEdit = blogsAtStart[0]
      const editedBlog = { ...blogToEdit, likes: blogToEdit.likes + 100 }
      // const blogId = '123abc'
      const blogId = await helper.nonExistingId(user)
      await api
        .put(`/api/blogs/${blogId}`)
        .set({ 'authorization': `Bearer ${token}` })
        .send(editedBlog)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })
  })

})

after(async () => {
  await mongoose.connection.close()
})