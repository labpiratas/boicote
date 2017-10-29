const { sanitize, asserts, isError, to } = require('../app/Helpers.js')
const Votos = require('../app/Votos.js')
const Usuarios = require('../app/Usuarios.js')

module.exports = {

  async salva (req, res) {
    const autor_id = Usuarios.loggedId(req)
    const erro = (err, alvo) => res.json({ erro: err, alvo: alvo })

    const post = {
      topico_id: sanitize.objectId(req.body.topico_id),
      voto: sanitize.number(req.body.voto)
    }

    // valida
    const validate = await asserts(post, [
      ['topico_id', 'isNotEmpty', 'Especifique o ID do tópico.'],
      ['voto', 'isIn', 'Voto não identificado.', ['1', '-1', '0']]
    ], true)

    const op = await to(Votos.salva(post.topico_id, autor_id, post.voto))
    if (isError(op)) return erro('Ocorreu um erro no sistema (1).')

    // retorna
    res.json({'ok': 1})
  }

}
