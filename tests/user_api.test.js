const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

describe('when creating new users', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passHash = await bcrypt.hash('root', 10)
    await new User({ username: 'root', passwordHash: passHash }).save()
  })

  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('creating new user succeeds if info is valid', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = {
      username: 'test_user',
      password: 'test_user'
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
  })

  describe('creating new user fails', () => {
    test('if username is too short', async () => {
      const usersAtStart = await helper.usersInDb()
      const newUser = {
        username: 'pe',
        password: 'pekka'
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('if password is too short', async () => {
      const usersAtStart = await helper.usersInDb()
      const newUser = {
        username: 'pekka',
        password: 'pe'
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('if username already exists', async () => {
      const usersAtStart = await helper.usersInDb()
      const newUser = {
        username: 'root',
        password: 'root'
      }
      const res = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()
      assert(res.body.error.includes('expected \'username\' to be unique'))
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('if username is not included', async () => {
      const usersAtStart = await helper.usersInDb()
      const newUser = {
        password: 'pekka'
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('if password is not included', async () => {
      const usersAtStart = await helper.usersInDb()
      const newUser = {
        username: 'pekka'
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
      const usersAtEnd = await helper.usersInDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})