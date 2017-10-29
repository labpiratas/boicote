const ObjectID = require('mongodb').ObjectID
const slugify = require('slugify')
const isObjectID = _id => _id instanceof ObjectID
const isString = s => typeof s === 'string'

const Topicos = module.exports = {

  db: null,

  adiciona (topico) {
    const { titulo, autor_id, vinculo_id, texto } = topico
    var slug = topico.slug
    var slugContador = 1

    // valida
    if (!Topicos.db) return Promise.resolve(new Error('Banco não configurado em Topicos.js'))
    if (!titulo) return Promise.resolve(new Error('Parâmetro titulo não definido em Topicos.adiciona()'))
    if (!autor_id) return Promise.resolve(new Error('Parâmetro autor_id não definido em Topicos.adiciona()'))
    if (!texto) return Promise.resolve(new Error('Parâmetro texto não definido em Topicos.adiciona()'))

    // ajustes
    if (!isObjectID(autor_id)) autor_id = new ObjectID(autor_id)
    topico.vinculo_id = vinculo_id ? (!isObjectID(vinculo_id) ? new ObjectID(vinculo_id) : vinculo_id) : null
    topico.slug = slug = slug ? slugify(slug) : slugify(titulo)
    topico.data_publicada = new Date()

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      const verificaSlug = () => {
        Topicos.db.findOne({ slug: topico.slug }, { _id: 1 }, (err, slugExiste) => {
          if (err) return reject(err)

          // se existe tenta novamente
          if (slugExiste) {
            slugContador += 1
            topico.slug = slug + '-' + slugContador
            verificaSlug()
          }
          else {
            // adiciona comentário
            Topicos.db.insert(topico, (err, res) => {
              if (err) return reject(err)
              resolve(res)
            })
          }
        })
      }

      // começa a verificar se o slug já existe
      verificaSlug()
    })
  },

  atualiza (topico) {
    const { topico_id, slug } = topico
    var slugContador = 0

    // valida
    if (!Topicos.db) return Promise.resolve(new Error('Banco não configurado em Topicos.js'))
    if (!topico_id) return Promise.resolve(new Error('Parâmetro topico_id não definido em Topicos.adiciona()'))

    // ajustes
    if (!isObjectID(topico_id)) topico.topico_id = new ObjectID(topico_id)
    if (topico.vinculo_id) {
      topico.vinculo_id = !isObjectID(topico.vinculo_id) ? new ObjectID(topico.vinculo_id) : topico.vinculo_id
    }
    topico.data_alterada = new Date()

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      const verificaSlug = () => {
        Topicos.db.findOne({ slug: topico.slug, _id: {$ne: topico.topico_id} }, { _id: 1 }, (err, slugExiste) => {
          if (err) return reject(err)

          // se existe tenta novamente
          if (slugExiste) {
            slugContador += 1
            topico.slug = slug + '-' + slugContador
            verificaSlug()
          }
          else {
            // adiciona comentário
            Topicos.db.update(
              {_id: topico.topico_id},
              {$set: topico},
              (err, res) => {
                if (err) return reject(err)
                resolve(res)
              }
            )
          }
        })
      }

      // começa a verificar se o slug já existe
      verificaSlug()
    })
  },

  remove (topico_id) {
    // valida
    if (!Topicos.db) return Promise.resolve(new Error('Banco não configurado em Topicos.js'))
    if (!topico_id) return Promise.resolve(new Error('Parâmetro topico_id não definido em Topicos.adiciona()'))

    // ajustes
    if (!isObjectID(topico_id)) topico_id = new ObjectID(topico_id)

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      Topicos.db.remove(
        {$or: [
          {_id: topico_id}, // exclui comentario
          {vinculo_id: topico_id} // exclui comentários relacionados
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
    if (!Topicos.db) return Promise.resolve(new Error('Banco não configurado em Topicos.js'))

    // retorna uma promessa, cruzem os dedos!
    return new Promise((resolve, reject) => {
      if (isObjectID(query) || isString(query)) {
        if (isString(query)) query = new ObjectID(query)
        Topicos.db.findOne({_id: query}, Topicos.projeto(campos), (err, topicos) => {
          if (err) return reject(err)
          resolve(topicos)
        })
      }
      else if (query[0]) {
        Topicos.db.aggregate(query, (err, topicos) => {
          if (err) return reject(err)
          resolve(topicos)
        })
      }
      else {
        Topicos.db.find(query, Topicos.projeto(campos), opt).toArray((err, topicos) => {
          if (err) return reject(err)
          resolve(topicos)
        })
      }
    })
  },

  doAutor (topico_id) {}

}
