const ObjectID = require('mongodb').ObjectID
const isObjectID = _id => _id instanceof ObjectID
const isString = s => typeof s === 'string'

const Participantes = module.exports = {

  db: null,
  colecaoUsuarios: 'usuarios',

  // adiciona se não está na lista
  atualizaLista (opt) {
    var { topico_id, autor_id } = opt

    // valida
    if (!topico_id) return Promise.resolve(new Error('Parâmetro topico_id não definido em Participantes.adiciona()'))
    if (!autor_id) return Promise.resolve(new Error('Parâmetro autor_id não definido em Participantes.adiciona()'))

    // ajustes
    if (!(isObjectID(topico_id))) topico_id = new ObjectID(topico_id)
    if (!(isObjectID(autor_id))) autor_id = new ObjectID(autor_id)
    opt.data_publicada = new Date()
    opt.topico_id = topico_id
    opt.autor_id = autor_id

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      Participantes.db.findOne({topico_id, autor_id}, {_id: 1}, (err, jaParticipa) => {
        if (err) return reject(err)
        if (jaParticipa) {
          Participantes.atualiza(topico_id, autor_id, opt)
          return resolve(false)
        }

        // adiciona participante
        Participantes.db.insert(opt, (err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
      })
    })
  },

  atualiza (topico_id, autor_id, dados) {
    // valida
    if (!topico_id) return Promise.resolve(new Error('Parâmetro topico_id não definido em Participantes.atualiza()'))
    if (!autor_id) return Promise.resolve(new Error('Parâmetro autor_id não definido em Participantes.atualiza()'))

    // ajustes
    if (!(isObjectID(topico_id))) topico_id = new ObjectID(topico_id)
    if (!(isObjectID(autor_id))) autor_id = new ObjectID(autor_id)
    dados.data_alterada = new Date()

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      Participantes.db.update(
        {topico_id, autor_id},
        {$set: dados},
        (err, res) => {
          if (err) return reject(err)
          resolve(res)
        }
      )
    })
  },

  remove (topico_id, autor_id) {
    // valida
    if (!topico_id) return Promise.resolve(new Error('Parâmetro topico_id não definido em Participantes.remove()'))
    if (!autor_id) return Promise.resolve(new Error('Parâmetro autor_id não definido em Participantes.remove()'))

    // ajustes
    if (!(isObjectID(topico_id))) topico_id = new ObjectID(topico_id)
    if (!(isObjectID(autor_id))) autor_id = new ObjectID(autor_id)
    dados.data_alterada = new Date()

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      Participantes.db.remove(
        {topico_id, autor_id},
        {justOne: true},
        (err, res) => {
          if (err) return reject(err)
          resolve(res)
        }
      )
    })
  },

  projeto (campos) {
    let obj = {}
    if (isString(campos)) campos = []
    for (const campo of campos) obj[campo] = 1
    return obj
  },

  consulta (query, campos = {}, opt) {
    // valida
    if (!Participantes.db) return Promise.resolve(new Error('Banco não configurado em Participantes.js'))

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      if (isObjectID(query) || isString(query)) {
        if (isString(query)) query = new ObjectID(query)
        Participantes.db.findOne({_id: query}, Participantes.projeto(campos), (err, comentarios) => {
          if (err) return reject(err)
          resolve(comentarios)
        })
      }
      else if (query[0]) {
        Participantes.db.aggregate(query, (err, comentarios) => {
          if (err) return reject(err)
          resolve(comentarios)
        })
      }
      else {
        Participantes.db.find(query, Participantes.projeto(campos), opt).toArray((err, comentarios) => {
          if (err) return reject(err)
          resolve(comentarios)
        })
      }
    })
  },

  doTopico (topico_id, user_id) {
    // valida
    if (!topico_id) return Promise.resolve(new Error('Parâmetro topico_id não definido em Participantes.doTopico()'))

    // ajustes
    if (!(isObjectID(topico_id))) topico_id = new ObjectID(topico_id)
    if (!(isObjectID(user_id))) user_id = new ObjectID(user_id)

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      var match = { topico_id: topico_id }
      if (user_id) match.autor_id = user_id
      Participantes.db.aggregate([
        {$match: match},
        {$lookup: {
          'from': Participantes.colecaoUsuarios,
          'localField': 'autor_id',
          'foreignField': '_id',
          'as': 'autor'
        }},
        {$unwind: '$autor'}
      ], (err, participantes) => {
        if (err) return reject(err)
        resolve(participantes)
      })
    })
  }

}
