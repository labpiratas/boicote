const ObjectID = require('mongodb').ObjectID
const isObjectID = _id => _id instanceof ObjectID
const isString = s => typeof s === 'string'
const isNumber = s => typeof s === 'number'

const Notificacoes = module.exports = {

  db: null,

  adiciona (opt) {
    var { autor_id, acionador_id, tipo, contador } = opt

    // valida
    if (!autor_id) return Promise.resolve(new Error('Parâmetro autor_id não definido em Notificacoes.adiciona()'))
    if (!acionador_id) return Promise.resolve(new Error('Parâmetro acionador_id não definido em Notificacoes.adiciona()'))
    if (!tipo) return Promise.resolve(new Error('Parâmetro tipo não definido em Notificacoes.adiciona()'))
    if (!isNumber(tipo)) return Promise.resolve(new Error('Parâmetro tipo inválido Notificacoes.adiciona()'))

    // ajustes
    if (!(isObjectID(topico_id))) topico_id = new ObjectID(topico_id)
    if (!(isObjectID(autor_id))) autor_id = new ObjectID(autor_id)
    opt.data_publicada = new Date()

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      // adiciona notificação
      Notificacoes.db.insert(opt, (err, res) => {
        if (err) return reject(err)
        resolve(res)
      })
    })
  },

  doAutor (autor_id, query = {}, campos = {}) {
    // valida
    if (!autor_id) return Promise.resolve(new Error('Parâmetro autor_id não definido em Notificacoes.doTopico()'))

    // ajustes
    if (!(isObjectID(autor_id))) autor_id = new ObjectID(autor_id)
    query.autor_id = autor_id

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      Notificacoes.db.find(query, campos) .toArray((err, notificacoes) => {
        if (err) return reject(err)
        resolve(notificacoes)
      })
    })
  }

}
