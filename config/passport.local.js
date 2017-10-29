const { to, sanitize, asserts, isError } = require('../app/Helpers.js')
const config = require('./settings.json')
const Usuarios = require('../app/Usuarios.js')
const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

passport.use(new LocalStrategy(config.auth.local, async function (req, email, password, done) {
  // limpeza
  const post = {
    email: sanitize.string(email, 'trim'),
    senha: sanitize.string(password),
    // lembrar: sanitize.boolean(req.body.remember, false)
  }

  // reset session
  req.session.user = {}

  // valida
  const validate = await asserts(post, [
    ['email', 'isNotEmpty', 'Informe seu email.'],
    ['email', 'isEmail', 'E-mail inválido'],
    ['senha', 'isNotEmpty', 'Informe sua senha.'],
    // ['lembrar', 'isBoolean', 'Opção lembrar não é válida.'],
  ], true)
  if (validate.fail) return erro(validate.error, validate.field)

  // procura por usuário
  const usuarios = await to(Usuarios.consulta({ email: post.email }))
  if (isError(usuarios)) return done(new Error('Ocorreu um erro no sistema.'))
  if (!usuarios[0]) return done(new Error('Usuário não encontrado.'))

  // senha incorreta
  if (!bcrypt.compareSync(post.senha, usuarios[0].senha)) {
    return done(new Error('Senha incorreta.'))
  }

  // atualiza session
  req.session.user = usuarios[0]

  // define usuario como logado
  req.session.user.logado = 1

  done(null, usuarios[0])
}))

module.exports = function (req, res, next) {
  passport.authenticate('local', function (err, user, info, statusCode) {
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
