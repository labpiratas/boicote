const traceLog = console.log
const errorLog = console.error
const config = require('./settings.json')

const passport = {
  local: require('./passport.local.js'),
  facebook: require('./passport.facebook.js')
}

// DEV
if (process.env.NODE_ENV === 'DEV') {
  const notifier = require('node-notifier')
  global.console.log = function () {
    traceLog.apply(null, arguments)
    notifier.notify({
      'title': 'Server',
      'message': arguments[0]
    })
  }
  require('./dev.js')
}
// PRODUÇÃO
else {
  const log4js = require('log4js')
  log4js.configure({
    appenders: { server: { type: 'file', filename: 'server.log' } },
    categories: { default: { appenders: ['server'], level: 'error' } }
  })
  const logger = log4js.getLogger('server')

  global.console.log = function () {
    traceLog.apply(null, arguments)
    logger.trace(arguments)

  }

  global.console.error = function () {
    errorLog.apply(null, arguments)
    logger.error(arguments)
  }
}

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

process.on('uncaughtException', err => {
  console.error('Caught exception: ' + err)
  throw err
})

// adiciona funções de autenticação para o roteador
config.passport = { authenticate: passport }

// logout pela api
config.passport.logout = (req, res) => {
  req.session.user = { logged: 0 }
  req.logout()
  res.json({ ok: 1 })
}

module.exports = config
