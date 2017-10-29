const ObjectID = require('mongodb').ObjectID
const isObjectID = _id => _id instanceof ObjectID
const isString = s => typeof s === 'string'

const Usuarios = module.exports = {

  db: null,

  projeto (campos) {
    let obj = {}
    if (isString(campos)) campos = []
    for (const campo of campos) obj[campo] = 1
    return obj
  },

  consulta (query, campos = [], opt) {
    // valida
    if (!Usuarios.db) return Promise.resolve(new Error('Banco não configurado em Usuarios.js'))

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      if (isObjectID(query) || isString(query)) {
        if (isString(query)) query = new ObjectID(query)
        Usuarios.db.findOne({_id: query}, Usuarios.projeto(campos), (err, topicos) => {
          if (err) return reject(err)
          resolve(topicos)
        })
      }
      else if (query[0]) {
        Usuarios.db.aggregate(query, (err, topicos) => {
          if (err) return reject(err)
          resolve(topicos)
        })
      }
      else {
        Usuarios.db.find(query, Usuarios.projeto(campos), opt).toArray((err, topicos) => {
          if (err) return reject(err)
          resolve(topicos)
        })
      }
    })
  },

  emailExiste (email) {
    return new Promise(function (resolve) {
      Usuarios.db.findOne({ 'email': email }, (err, usuario) => {
        if (err) return resolve(true)
        return (usuario) ? resolve(true) : resolve(false)
      })
    })
  },

  nickExiste (nick) {
    return new Promise(function (resolve) {
      Usuarios.db.findOne({ 'nick': nick }, (err, usuario) => {
        if (err) return resolve(true)
        return (usuario) ? resolve(true) : resolve(false)
      })
    })
  },

  usuarioExiste (usuario) {
    return new Promise(function (resolve) {
      Usuarios.db.findOne({ 'user': usuario }, (err, usuario) => {
        if (err) return resolve(true)
        return (usuario) ? resolve(true) : resolve(false)
      })
    })
  },

  isLogged (req, res, next) {

    if (req.isAuthenticated()) {
      next()
    }
    else {
      res.status(200).json({ erro: 'Você precisa estar logado.' })
    }

    // if (req.session && req.session.user && req.session.user.logado) {
    //   next()
    // }
    // else {
    //   res.status(200).json({ erro: 'Você precisa estar logado.' })
    // }
  },

  loggedId (req) {
    return req.session && req.session.user ? new ObjectID(req.session.user._id) : null
  },

  credenciais (sessaoId, ip) {
  }

}
