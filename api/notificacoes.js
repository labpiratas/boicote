const { sanitize, asserts, isError, to } = require('../app/Helpers.js')
const Notificacoes = require('../app/Notificacoes.js')
const slugify = require('slugify')

module.exports = {

  async consulta () {
    const autor_id = Usuarios.loggedId(req)

    // procura pelo tópico
    const notificacoes = await to(Notificacoes.doAutor(autor_id))
    if (isError(notificacoes)) return erro('Ocorreu um erro no sistema (1).')

    // retorna
    res.json({ ok: 1, notificacoes: notificacoes })
  }

}
