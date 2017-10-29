const { sanitize, asserts, getDomain, isError, to } = require('../app/Helpers.js')
const ObjectID = require('mongodb').ObjectID
const Comentarios = require('../app/Comentarios.js')
const Topicos = require('../app/Topicos.js')
const Usuarios = require('../app/Usuarios.js')
const Participantes = require('../app/Participantes.js')

module.exports = {

  analisa (req, res) {
    const MetaInspector = require('node-metainspector')
    const client = new MetaInspector(req.body.fonte, { timeout: 5000 })

    client.on('fetch', () => {
      var dados = {
        titulo: client.ogTitle || client.title || '',
        texto: client.ogDescription || client.description || '',
        imagem: client.image || ''
        // url: client.url || '',
        // scheme: client.scheme || '',
        // host: client.host || '',
        // rootUrl: client.rootUrl,
        // links: client.links,
        // author: client.author || '',
        // keywords: client.keywords,
        // charset: client.charset,
        // images: client.images,
        // feeds: client.feeds,
        // ogTitle: client.ogTitle || '',
        // ogDescription: client.ogDescription || '',
        // ogType: client.ogType || '',
        // ogUpdatedTime: client.ogUpdatedTime || '',
        // ogLocale: client.ogLocale || ''
      }

      res.json({ ok: 1, dados: dados })
    })

    client.on('error', () => {
      res.json({ erro: 1 })
    })

    client.fetch()
  },

  consulta (req, res) {
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })
    const topico_id = sanitize.string(req.params.topico_id) // sanitize

    Topicos.consulta([
      {$match: { _id: new ObjectID(topico_id) }},
      {$lookup: {
        'from': 'usuarios',
        'localField': 'autor_id',
        'foreignField': '_id',
        'as': 'autor'
      }},
      {$unwind: '$autor'},
      {$lookup: {
        'from': 'votos',
        'localField': '_id',
        'foreignField': 'topico_id',
        'as': 'votos'
      }},
      {$lookup: {
        'from': 'comentarios',
        'localField': '_id',
        'foreignField': 'topico_id',
        'as': 'comentarios'
      }},
      {$project: {
        titulo: 1,
        fonte: 1,
        texto: 1,
        votos: 1,
        'autor._id': 1,
        'autor.nick': 1,
        'autor.nome': 1,
        'autor.avatar': 1,
        'num_comentarios': {$size: '$comentarios'},
        resumo: 1,
        data_publicada: 1,
        data_alterada: 1
      }}
    ]).then(topico => {
      if (isError(topico)) return erro('Ocorreu um erro no sistema.')
      if (!topico[0]) return erro('Página não encontrada.') // TODO 404

      // retorna
      res.json(topico[0])
    })
  },

  async salva (req, res) {
    const erro = (err, alvo, errCompleto) => res.json({ erro: err, alvo: alvo })
    const autor_id = Usuarios.loggedId(req)
    const topico_id = sanitize.string(req.body.topico_id)
    const comentario = sanitize.string(req.body.comentario)

    const post = {
      vinculo_id: sanitize.objectId(req.body.vinculo_id),
      fonte: sanitize.string(req.body.fonte), // TODO sanitize.url
      dominio: getDomain(sanitize.string(req.body.fonte)).replace(/^www./, ''),
      tipo: 'motivos',
      titulo: sanitize.string(req.body.titulo),
      texto: sanitize.string(req.body.texto),
      autor_id: autor_id
    }

    // valida
    const validate = await asserts(post, [
      ['titulo', 'isNotEmpty', 'A fonte precisa ter um título.'],
      ['fonte', 'isNotEmpty', 'Você precisa indicar uma fonte.'],
      ['fonte', 'isURL', 'A fonte que você indicou não parece ser um link válido.'],
      ['texto', 'isNotEmpty', 'A fonte precisa ter um resumo.'],
      ['texto', 'isLength', 'Defina melhor o resumo da fonte, o texto está muito curto.', { min: 100 }]
    ], true)
    if (validate.fail) return erro(validate.error, validate.field)

    // atualiza
    if (topico_id) {
      // procura pelo tópico
      const topico = await to(Topicos.consulta(topico_id, 'autor_id'))
      if (isError(topico)) return erro('Ocorreu um erro no sistema (1).')
      if (!topico) return erro('Tópico não encontrado.')

      // verifica se é autor
      const autorDoTopico = topico.autor_id.equals(autor_id)
      if (!autorDoTopico) return erro('Você precisa ser o autor deste tópico.')

      // atualiza
      const op = await to(Topicos.atualiza(Object.assign({topico_id}, post)))
      if (isError(op)) return erro('Ocorreu um erro no sistema (2).')

      // retorna
      res.json({ ok: 1 })
    }
    // cadastra
    else {
      const op = await to(Topicos.adiciona(post))
      if (isError(op)) return erro('Ocorreu um erro no sistema (2).')

      // adiciona participante
      const op2 = await to(Participantes.atualizaLista({
        topico_id: post.vinculo_id,
        autor_id: autor_id
      }))
      if (isError(op2)) return erro('Ocorreu um erro no sistema (3).')

      // adiciona comentario
      if (comentario) {
        const op3 = await to(Comentarios.adiciona({
          topico_id: op.ops[0]._id,
          autor_id: autor_id,
          texto: comentario
        }))
        if (isError(op3)) return erro('Ocorreu um erro no sistema (4).')
      }

      // retorna
      res.json({ ok: 1 })
    }
  },

  async remove (req, res) {
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })
    const topico_id = sanitize.objectId(req.body.topico_id)
    const autor_id = Usuarios.loggedId(req)

    // valida
    if (!topico_id) return erro('Informe o tópico.')

    // procura pelo tópico
    const topico = await to(Topicos.consulta(topico_id, 'autor_id'))
    if (isError(topico)) return erro('Ocorreu um erro no sistema (1).')
    if (!topico) return erro('Tópico não encontrado.')

    // verifica se é autor
    const autorDoTopico = topico.autor_id.equals(autor_id)
    if (!autorDoTopico) return erro('Você precisa ser o autor deste tópico.')

    // remove
    const op = await to(Topicos.remove(topico_id))
    if (isError(op)) return erro('Ocorreu um erro no sistema (2).')

    // retorna
    res.json({'ok': 1})
  },

}
