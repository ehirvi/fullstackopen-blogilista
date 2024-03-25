const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
    await User.deleteMany({})
    await new User({username: '123', name: '123', passwordHash: '123'}).save()
})

test('users are returned as json', async () => {
    await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('user can be succesfully added', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
        username: 'test_user',
        name: 'Pekka',
        password: 'PEKKA123!'
    }
    await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
})

after(async () => {
    await mongoose.connection.close()
})