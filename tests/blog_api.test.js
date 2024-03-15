const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const api = supertest(app)

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

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(initialBlogs)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
    const res = await api.get('/api/blogs')
    assert.strictEqual(res.body.length, initialBlogs.length)
})

after(async () => {
    await mongoose.connection.close()
})

