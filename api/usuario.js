const { md5, sanitize, asserts } = require('../app/Helpers.js')
const bcrypt = require('bcrypt')
const config = require('../config/settings.json')
const ObjectID = require('mongodb').ObjectID
const Usuarios = require('../app/Usuarios.js')

module.exports = {

  async cadastro(req, res) {
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })

    // limpeza
    var post = {
      nome: sanitize.string(req.body.nome, 'trim'),
      nick: String(new ObjectID()).substring(0, 5),
      email: sanitize.string(req.body.email, 'trim'),
      senha: sanitize.string(req.body.senha),
    }

    // valida
    const validate = await asserts(post, [
      ['nome', 'isNotEmpty', 'Informe seu nome.'],
      ['nome', 'isLength', 'Seu nome está muito curto.', { min: 2 }],
      ['nome', 'isLength', 'Nome muito grande, tente reduzí-lo.', { max: 40 }],
      ['email', 'isNotEmpty', 'Informe seu email.'],
      ['email', 'isEmail', 'E-mail inválido'],
      ['senha', 'isNotEmpty', 'Informe sua senha.'],
      ['senha', 'isLength', 'Sua senha deve ter no mínimo 6 dígitos.', { min: 6 }],
      ['email', Usuarios.emailExiste, 'Este email já foi cadastrado.', false],
    ], true)
    if (validate.fail) return erro(validate.error, validate.field)

    // verifica se o nick existe
    while (await Usuarios.nickExiste(post.nick)) {
      post.nick = String(new ObjectID()).substring(0, 5)
    }

    // criptografa senha
    post.senha = bcrypt.hashSync(post.senha, config.server.salt)

    // adiciona gravatar
    post.avatar = 'http://www.gravatar.com/avatar/' + md5(post.email.toLowerCase())

    Usuarios.insert(post).then(err => {
      if (err) return erro('Ocorreu um erro no sistema.')
      res.json({
        ok: 1
      })
    })
  },

  credenciais(req, res) {
    let sessao = req.session

    if (req.session && req.session.user) {
      res.json([req.session.user].map(x => ({
        // email: x.email,
        // senha: x.senha,
        _id: x._id,
        avatar: x.avatar,
        logado: x.logado,
        nick: x.nick,
        nome: x.nome,
      }))[0])
    }
    else {
      res.json({ logado: 0 })
    }
  }

}
