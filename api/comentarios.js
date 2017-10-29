const { sanitize, asserts, to, isError } = require('../app/Helpers.js')
const Comentarios = require('../app/Comentarios.js')
const Topicos = require('../app/Topicos.js')
const Usuarios = require('../app/Usuarios.js')
const Participantes = require('../app/Participantes.js')

module.exports = {

  async consulta (req, res) {
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })
    const topico_id = sanitize.objectId(req.params.topico_id)

    // valida
    if (!topico_id) return erro('Comentário não encontrado.')

    const comentarios = await to(Comentarios.doTopico(topico_id))
    if (isError(comentarios)) return erro('Ocorreu um erro no sistema.')

    res.json(comentarios)
  },

  async salva (req, res) {
    const autor_id = Usuarios.loggedId(req)
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })

    const post = {
      topico_id: sanitize.objectId(req.body.topico_id),
      texto: sanitize.string(req.body.texto, 'trim'),
      autor_id: autor_id
    }

    // valida
    if (!post.texto) return erro('Escreva seu comentário.', 'texto')

    // verifica se o tópico existe
    const topico = await to(Topicos.consulta(post.topico_id, ''))
    if (isError(topico)) return erro('Ocorreu um erro no sistema (1).')
    if (!topico) return erro('Falhou, pois este tópico não existe mais.')

    // adiciona comentário
    const op = await to(Comentarios.adiciona(post))
    if (isError(op)) return erro('Ocorreu um erro no sistema (2).')

    // adiciona participante
    const op2 = await to(Participantes.atualizaLista({
      topico_id: vinculo_id,
      autor_id: autor_id
    }))
    if (isError(op2)) return erro('Ocorreu um erro no sistema (3).')

    // retorna
    res.json({
      ok: 1,
      comentario: op.ops[0]
    })
  },

  async remove (req, res) {
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })
    const comentario_id = sanitize.objectId(req.body.comentario_id)
    const autor_id = Usuarios.loggedId(req)

    // valida
    if (!comentario_id) return erro('Informe o comentário.')

    // procura pelo comentário
    const topico = await to(Comentarios.consulta(comentario_id, 'autor_id'))
    if (isError(topico)) return erro('Ocorreu um erro no sistema (1).')
    if (!topico) return erro('Tópico não encontrado.')

    // verifica se é autor
    const autorDoComenatio = topico.autor_id.equals(autor_id)
    if (!autorDoComenatio) return erro('Você precisa ser o autor deste comentário.')

    // remove
    const op = await to(Comentarios.remove(comentario_id))
    if (isError(op)) return erro('Ocorreu um erro no sistema (2).')

    // retorna
    res.json({'ok': 1})
  }

}
