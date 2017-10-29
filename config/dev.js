const fs = require('fs')
const config = require('../config/settings.json')
const mustache = require('mustache')

fs.watch('./theme-boicote', { interval: 200 }, (event, filename) => {
  let scope = { app: config }
  let partials = {
    header: fs.readFileSync(`${config.theme}/_header.tpl`, 'utf8'),
    metas: fs.readFileSync(`${config.theme}/_metas.tpl`, 'utf8'),
    footer: fs.readFileSync(`${config.theme}/_footer.tpl`, 'utf8'),
    'modal-fonte': fs.readFileSync(`${config.theme}/modal-fonte.tpl`, 'utf8'),
    'modal-form-fonte': fs.readFileSync(`${config.theme}/modal-form-fonte.tpl`, 'utf8'),
    'modal-cadastro': fs.readFileSync(`${config.theme}/modal-cadastro.tpl`, 'utf8'),
    'modal-login': fs.readFileSync(`${config.theme}/modal-login.tpl`, 'utf8'),
  }

  for (let template of config.server.frontend) {
    let tpl = fs.readFileSync(`${config.theme}/${template[0]}.tpl`, 'utf8')
    let htmlFile = template[1]
    let contents = mustache.render(tpl, scope, partials)

    fs.writeFileSync(`./public/${htmlFile}`, contents)
  }

  console.log('Template renderizado!')
})
