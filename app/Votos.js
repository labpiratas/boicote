const ObjectID = require('mongodb').ObjectID
const isObjectID = _id => _id instanceof ObjectID
const isString = s => typeof s === 'string'

const Votos = module.exports = {

  db: null,
  colecaoUsuarios: 'usuarios',

  salva (topico_id, autor_id, voto) {
    // valida
    if (!topico_id) return Promise.resolve(new Error('Parâmetro topico_id não definido em Votos.item()'))
    if (!autor_id) return Promise.resolve(new Error('Parâmetro autor_id não definido em Votos.item()'))
    if (['1', '-1', '0'].indexOf(voto) === -1) return Promise.resolve(new Error('Parâmetro voto é inválido'))

    // ajustes
    if (!isObjectID(topico_id)) topico_id = new ObjectID(topico_id)
    if (!isObjectID(autor_id)) autor_id = new ObjectID(autor_id)
    if (voto === '1') voto = true
    if (voto === '-1') voto = false
    if (voto === '0') voto = 0

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      // procura pelo doc
      Votos.db.findOne({
        topico_id: topico_id,
        autor_id: autor_id
      }, (err, doc) => {
        if (err) return reject(err)

        const jaVotou = doc && (typeof doc.voto === 'boolean')
        const naoVotouAinda = !jaVotou

        // adiciona voto
        if (naoVotouAinda && voto !== 0) {
          Votos.db.insert(
            {voto, topico_id, autor_id, data_publicada: new Date()},
            err => {
              if (err) return reject(err)
              resolve(true)
            }
          )
        }
        // troca voto
        else if (jaVotou && voto !== 0 && doc.voto !== voto) {
          Votos.db.update(
            {topico_id, autor_id},
            {$set: {
              voto: voto,
              data_alterada: new Date()
            }},
            err => {
              if (err) return reject(err)
              resolve(true)
            }
          )
        }
        // remove voto
        else if (voto === 0 && jaVotou) {
          Votos.db.remove(
            {topico_id, autor_id},
            {justOne: true},
            (err, res) => {
              if (err) return reject(err)
              resolve(res)
            }
          )
        }
        else {
          resolve(false)
        }
      })
    })
  },

  doTopico (topico_id) {
    // valida
    if (!topico_id) return Promise.resolve(new Error('Parâmetro topico_id não definido em Votos.doTopico()'))

    // ajustes
    if (!isObjectID(topico_id)) topico_id = new ObjectID(topico_id)

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      db.collection(Votos.colecao).find({topico_id}).toArray(
        (err, votos) => {
          if (err) return reject(err)
          resolve(votos)
        }
      )
    })
  },

  doTopicoComAutor (topico_id) {
    // valida
    if (!topico_id) return Promise.resolve(new Error('Parâmetro topico_id não definido em Votos.doTopico()'))

    // ajustes
    if (!isObjectID(topico_id)) topico_id = new ObjectID(topico_id)

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      db.collection(Votos.colecao).aggregate([
        {$match: {topico_id: topico_id}},
        {$lookup: {
          'from': Votos.colecaoUsuarios,
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
      ], (err, votos) => {
        if (err) return reject(err)
        resolve(votos)
      })
    })
  }

}
