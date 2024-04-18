const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.get('/', async (req, res) => {
  const allUsers = await User.find({}).populate('blogs', {user: 0})
  res.json(allUsers)
})

usersRouter.post('/', async (req, res, next) => {
  const { username, name, password } = req.body
  if (username === undefined || password === undefined) {
    return res.status(400).end()
  }
  if (username.length < 3 || password.length < 3) {
    return res.status(400).end()
  }
  try {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = new User({
      username,
      name,
      passwordHash
    })
    const savedUser = await user.save()
    res.status(201).json(savedUser)
  } catch (err) {
    next(err)
  }
})


module.exports = usersRouter