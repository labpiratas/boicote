const { to, sanitize, isError } = require('../app/Helpers.js')
const config = require('./settings.json')
const Usuarios = require('../app/Usuarios.js')
const bcrypt = require('bcrypt')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy

passport.use(new FacebookStrategy(config.auth.facebook, function (accessToken, refreshToken, profile, done) {
  // User.findOrCreate(..., function(err, user) {
  //   if (err) return done(err)
  //   done(null, user)
  // })
  console.log({ accessToken, refreshToken, profile, done })
  done(null, { accessToken, refreshToken, profile, done })
}))

module.exports = function (req, res, next) {
  passport.authenticate('facebook', function (err, user, info, statusCode) {
    if (err) return res.json({ erro: err.message })
    if (info) return res.json({ erro: info.message })
    res.json({
      logado: 1,
      _id: user._id,
      nome: user.nome,
      nick: user.nick,
      avatar: user.avatar,
    })
  })(req, res, next)
}
