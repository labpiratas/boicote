const config = require('./config/index.js')
const express = require('express')
const helmet = require('helmet')
const session = require('express-session')
const bodyParser = require('body-parser')
const passport = require('passport')
const TwitterStrategy = require('passport-twitter').Strategy
const FacebookStrategy = require('passport-twitter').Strategy
const MongoClient = require('mongodb').MongoClient
const controller = (name) => require('./api/' + name + '.js')
const port = process.env.NODE_ENV === 'DEV' ? 8080 : config.server.port
const app = express()
const staticPage = function (staticFile) {
  return (req, res) => res.sendFile(require('path').resolve(__dirname) + '/public/' + staticFile)
}

// APP
const Helpers = require('./app/Helpers.js')
const Usuarios = require('./app/Usuarios.js')
const isLogged = Usuarios.isLogged
const Topicos = require('./app/Topicos.js')
const Comentarios = require('./app/Comentarios.js')
const Participantes = require('./app/Participantes.js')
const Notificacoes = require('./app/Notificacoes.js')
const Votos = require('./app/Votos.js')
const db = require('./config/db.js')

// conexão com banco de dados
db.setup(config, app).then((db) => {
  // configura coleções dos modulos
  Usuarios.db = db.collection('usuarios')
  Topicos.db = db.collection('topicos')
  Comentarios.db = db.collection('comentarios')
  Participantes.db = db.collection('participantes')
  Notificacoes.db = db.collection('notificacoes')
  Votos.db = db.collection('votos')

  // segurança
  app.use(helmet())
  // app.disable('x-powered-by')

  // configura sessões
  app.use(session(config.server.session))

  // configura autenticação
  app.use(passport.initialize())
  app.use(passport.session())

  // serve arquivos estáticos
  app.use(express.static('public', {
    index: 'index.html',
    extensions: ['html']
  }))

  // interpreta payload
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  // STATIC
  app.get('/tema/:slug', staticPage('topico.html'))
  app.get('/tema/:slug/editar', staticPage('topico-form.html'))

  // AUTH - LOCAL
  app.get('/auth/logout', config.passport.logout)
  app.post('/auth/login', config.passport.authenticate.local)

  // AUTH - FACEBOOK
  app.post('/auth/facebook', config.passport.authenticate.facebook)
  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
  }))

  // AUTH
  app.get('/api/credenciais', controller('usuario').credenciais)
  app.post('/api/cadastro', controller('usuario').cadastro)

  // TÓPICOS
  app.get('/api/topico/:slug', controller('topicos').consulta)
  app.get('/api/topicos', controller('topicos').ultimosCadastrados)
  app.post('/api/topicos', isLogged, controller('topicos').salva)
  app.post('/api/topicos/participar', isLogged, controller('topicos').participa)
  app.delete('/api/topicos', isLogged, controller('topicos').remove)

  // SUBTÓPICOS/FONTES
  app.get('/api/fontes/:topico_id', controller('fontes').consulta)
  app.post('/api/fontes', isLogged, controller('fontes').salva)
  app.post('/api/fonte/analisar', isLogged, controller('fontes').analisa)
  app.delete('/api/fontes', isLogged, controller('fontes').remove)

  // COMENTÁRIOS
  app.get('/api/comentarios/:topico_id', controller('comentarios').consulta)
  app.post('/api/comentarios', isLogged, controller('comentarios').salva)
  app.delete('/api/comentarios', isLogged, controller('comentarios').remove)

  // VOTOS
  app.post('/api/votos', isLogged, controller('votos').salva)

  // NOTIFICAÇÕES
  app.get('/api/notificacoes', isLogged, controller('notificacoes').consulta)

  // TESTES
  app.get('/api/ok', (req, res) => res.json({ok: 1}))

  app.listen(port)

  console.log('Servidor iniciado na porta ' + port)
})
