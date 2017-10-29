// baseado em https://docs.mongoComentarios.db.com/ecosystem/use-cases/storing-comments/

const ObjectID = require('mongodb').ObjectID
const isObjectID = _id => _id instanceof ObjectID
const isString = s => typeof s === 'string'

const Comentarios = module.exports = {

  db: null,
  colecaoUsuarios: 'usuarios',

  adiciona (opt) {
    var { topico_id, autor_id, vinculo_id, texto } = opt

    // valida
    if (!topico_id) return Promise.resolve(new Error('Parâmetro topico_id não definido em Comentarios.adiciona()'))
    if (!autor_id) return Promise.resolve(new Error('Parâmetro autor_id não definido em Comentarios.adiciona()'))
    if (!texto) return Promise.resolve(new Error('Parâmetro texto não definido em Comentarios.adiciona()'))

    // ajustes
    if (!(isObjectID(topico_id))) topico_id = new ObjectID(topico_id)
    if (!(isObjectID(autor_id))) autor_id = new ObjectID(autor_id)
    vinculo_id = vinculo_id ? (!(isObjectID(vinculo_id)) ? new ObjectID(vinculo_id) : vinculo_id) : null

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      // adiciona comentário
      Comentarios.db.insert(
        {topico_id, autor_id, vinculo_id, texto, data_publicada: new Date()},
        (err, res) => {
          if (err) return reject(err)
          resolve(res)
        }
      )
    })
  },

  edita (opt) {
    var {comentario_id} = opt

    // valida
    if (!comentario_id) return Promise.resolve(new Error('Parâmetro comentario_id não definido em Comentarios.adiciona()'))

    // ajustes
    if (!(isObjectID(comentario_id))) comentario_id = new ObjectID(comentario_id)
    if (opt.vinculo_id) {
      opt.vinculo_id = !isObjectID(opt.vinculo_id) ? new ObjectID(opt.vinculo_id) : opt.vinculo_id
    }

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      Comentarios.db.update(
        {_id: comentario_id},
        {$set: opt},
        (err, res) => {
          if (err) return reject(err)
          resolve(res)
        }
      )
    })
  },

  remove (comentario_id) {
    // valida
    if (!comentario_id) return Promise.resolve(new Error('Parâmetro comentario_id não definido em Comentarios.adiciona()'))

    // ajustes
    if (!(isObjectID(comentario_id))) comentario_id = new ObjectID(comentario_id)

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      Comentarios.db.remove(
        {$or: [
          {_id: comentario_id}, // exclui comentario
          {vinculo_id: comentario_id} // exclui comentários relacionados
        ]},
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
    if (!Comentarios.db) return Promise.resolve(new Error('Banco não configurado em Comentarios.js'))

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      if (isObjectID(query) || isString(query)) {
        if (isString(query)) query = new ObjectID(query)
        Comentarios.db.findOne({_id: query}, Comentarios.projeto(campos), (err, comentarios) => {
          if (err) return reject(err)
          resolve(comentarios)
        })
      }
      else if (query[0]) {
        Comentarios.db.aggregate(query, (err, comentarios) => {
          if (err) return reject(err)
          resolve(comentarios)
        })
      }
      else {
        Comentarios.db.find(query, Comentarios.projeto(campos), opt).toArray((err, comentarios) => {
          if (err) return reject(err)
          resolve(comentarios)
        })
      }
    })
  },

  doTopico (topico_id) {
    // valida
    if (!topico_id) return Promise.resolve(new Error('Parâmetro topico_id não definido em Comentarios.doTopico()'))

    // ajustes
    if (!(isObjectID(topico_id))) topico_id = new ObjectID(topico_id)

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      Comentarios.db.aggregate([
        {$match: {topico_id: topico_id}},
        {$lookup: {
          'from': Comentarios.colecaoUsuarios,
          'localField': 'autor_id',
          'foreignField': '_id',
          'as': 'autor'
        }},
        {$unwind: '$autor'},
        {$project: {
          texto: 1,
          data_publicada: 1,
          data_alterada: 1,
          autor: {
            _id: 1,
            nome: 1,
            nick: 1,
            avatar: 1
          }
        }}
      ], (err, comentarios) => {
        if (err) return reject(err)
        resolve(comentarios)
      })
    })
  }

}
