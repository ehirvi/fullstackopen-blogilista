const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

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

test('a valid blog can be added', async () => {
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

test('blog without likes is defaulted to zero', async () => {
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

test('blog without title cannot be added', async () => {
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

test('blog without url cannot be added', async () => {
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

after(async () => {
    await mongoose.connection.close()
})