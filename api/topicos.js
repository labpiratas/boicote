const { sanitize, asserts, isError, to } = require('../app/Helpers.js')
const Topicos = require('../app/Topicos.js')
const Participantes = require('../app/Participantes.js')
const slugify = require('slugify')

module.exports = {

  consulta (req, res) {
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })
    const slug = slugify(sanitize.string(req.params.slug)) // sanitize
    const autor_id = require('../app/Usuarios.js').loggedId(req)

    // valida
    if (!slug) return erro('Página não encontrada.') // TODO 404

    Topicos.consulta([
      {$match: { slug: slug }},
      {$lookup: {
        'from': 'usuarios',
        'localField': 'autor_id',
        'foreignField': '_id',
        'as': 'autor'
      }},
      {$unwind: '$autor'},
      {$lookup: {
        'from': 'topicos',
        'localField': '_id',
        'foreignField': 'vinculo_id',
        'as': 'subtopicos'
      }},
      {$project: {
        titulo: 1,
        texto: 1,
        boicote: 1,
        tags: 1,
        fontes: 1,
        motivos: {$filter: {
          input: '$subtopicos',
          as: 'item',
          cond: {$eq: [ '$$item.tipo', 'motivos' ]}
        }},
        // 'motivos.titulo': 1,
        'autor.avatar': 1,
        'autor.nick': 1,
        'autor.nome': 1,
        data_publicada: 1
      }}
    ]).then(async topico => {
      if (isError(topico)) return erro('Ocorreu um erro no sistema.')
      if (!topico[0]) return erro('Página não encontrada.') // TODO 404

      // verifica participação no tópico
      if (autor_id) {
        const participantes = await Participantes.doTopico(topico[0]._id, autor_id)
        if (isError(participantes)) return erro('Ocorreu um erro no sistema (2).')
        topico[0].participa = Boolean(participantes[0] && participantes[0].ativo)
        topico[0].vacilo = 123
      }

      // retorna
      res.json(topico[0])
    })

  },

  async participa (req, res) {
    const Usuarios = require('../app/Usuarios.js')
    const autor_id = Usuarios.loggedId(req)
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })

    const post = {
      topico_id: sanitize.objectId(req.body.topico_id),
      sair: sanitize.boolean(req.body.sair, false)
    }

    // valida
    const validate = await asserts(post, [
      ['topico_id', 'isNotEmpty', 'Especifique o ID do tópico.'],
    ], true)

    // remove participante
    if (post.sair) {
      const op = await to(Participantes.atualiza(post.topico_id, autor_id, {ativo: false}))
      if (isError(op)) return erro('Ocorreu um erro no sistema (3).')
    }
    // adiciona participante
    else {
      const op = await to(Participantes.atualizaLista({ topico_id: post.topico_id, autor_id, ativo: true }))
      if (isError(op)) return erro('Ocorreu um erro no sistema (4).')
    }

    // retorna
    res.json({ok: 1})
  },

  async salva (req, res) {
    const Usuarios = require('../app/Usuarios.js')
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })
    const topico_id = sanitize.objectId(req.body._id)
    const autor_id = Usuarios.loggedId(req)

    const post = {
      titulo: sanitize.string(req.body.titulo, 'trim'),
      slug: slugify(sanitize.string(req.body.titulo, 'toLowerCase').trim()),
      texto: sanitize.string(req.body.texto, 'trim'),
      boicote: sanitize.string(req.body.boicote, 'trim'),
      tags: sanitize.string(req.body.tags, 'trim'),
      autor_id: autor_id
    }

    // valida
    const validate = await asserts(post, [
      ['titulo', 'isNotEmpty', 'Informe o título.'],
      ['titulo', 'isLength', 'Defina melhor o tema, o título está muito curto.', { min: 40 }],
      ['texto', 'isNotEmpty', 'Descreva o tema a ser debatido.'],
      ['boicote', 'isNotEmpty', 'Descreva como deve ser realizado o boicote.'],
      ['texto', 'isLength', 'Descreva melhor o tema a ser debatido, o texto está muito curto.', { min: 80 }],
      ['boicote', 'isLength', 'Descreva melhor como boicotar, o texto está muito curto.', { min: 80 }],
      ['tags', 'isNotEmpty', 'Informe a quais tópicos está relacionado.'],
    ], true)
    if (validate.fail) return erro(validate.error, validate.field)

    // atualiza
    if (topico_id) {

      // procura pelo tópico
      const topico = await to(Topicos.consulta(topico_id, 'autor_id'))
      if (isError(topico)) return erro('Ocorreu um erro no sistema (1).')
      if (!topico) return erro('Tópico não encontrado.')

      // verifica se é autor
      const autorDoTopico = (topico.autor_id.equals(autor_id))
      if (!autorDoTopico) return erro('Você precisa ser o autor deste tópico.')

      // atualiza
      const op = await to(Topicos.atualiza({
        topico_id: topico_id,
        titulo: post.titulo,
        slug: slugify(post.titulo).toLowerCase(),
        texto: post.texto,
        boicote: post.boicote,
        tags: post.tags
      }))
      if (isError(op)) return erro('Ocorreu um erro no sistema (2).')

      // adiciona participante
      const op2 = await to(Participantes.atualizaLista({ topico_id, autor_id }))
      if (isError(op2)) return erro('Ocorreu um erro no sistema (3).')

      // retorna
      res.json({
        'ok': 1,
        'url': '/tema/' + post.slug
      })
    }
    // cadastra
    else {
      const op = await to(Topicos.adiciona(post))
      if (isError(op)) return erro('Ocorreu um erro no sistema (2).')

      // retorna
      res.json({ ok: 1, url: '/tema/' + post.slug })
    }
  },

  async remove (req, res) {
    const Usuarios = require('../app/Usuarios.js')
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })
    const autor_id = Usuarios.loggedId(req)
    const topico_id = sanitize.objectId(req.body.topico_id)

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

  ultimosCadastrados (req, res) {
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })
    const campos = ['titulo', 'slug', 'data_publicada', 'data_alterada', 'num_motivos', 'num_usuarios', 'num_votos_sim', 'num_votos_nao', 'tags']

    Topicos.consulta({vinculo_id: null}, campos, {limit: 20}).then(topicos => {
      if (isError(topicos)) return erro('Ocorreu um erro no sistema.')
      res.json(topicos)
    })
  },

}
