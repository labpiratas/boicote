var app = {

  cache: {},
  template: {
    carregando: '<p>Carregando...</p>'
  },

  go: function (url) {
    location.href = url
  },

  alert: function (text) {
    alert(text)
  },

  goBack: function (e) {
    e && e.preventDefault()
    history.back()
  },

  reload: function (url) {
    location.reload()
  },

  render: function (tpl, view) {
    Mustache.parse(tpl, ['[[', ']]'])
    return Mustache.render(tpl, view)
  },

  modal: function (contents, closeMethods, maxWidth) {
    var modal = new tingle.modal({  // eslint-disable-line
      closeMethods: closeMethods || ['overlay', 'button', 'escape'],
      onOpen: function () {
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'
        document.querySelector('.tingle-modal').style.overflow = 'auto'
      },
      onClose: function () {
        document.body.style.overflow = 'auto'
        document.documentElement.style.overflow = 'auto'
      }
    })
    modal.setContent(contents)
    modal.open()
    this._modal = modal

    if (maxWidth) {
      $find('.tingle-modal-box').style.maxWidth = maxWidth + 'px'
    }

    var $input = $find('.tingle-modal-box form input[type=text]')
    if ($input) {
      $input.focus()
    }
  },

  fechaConfirma: function (contents) {
    app._confirma.close()
  },

  confirma: function (contents, botoesConfirma) {
    var modal = new tingle.modal({  // eslint-disable-line
      closeMethods: ['overlay', 'button', 'escape'],
      cssClass: ['modal-confirma'],
      onOpen: function () {
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'
        document.querySelector('.tingle-modal').style.overflow = 'auto'
      },
      onClose: function () {
        document.body.style.overflow = 'auto'
        document.documentElement.style.overflow = 'auto'
      }
    })

    // TODO
    if (!botoesConfirma) {
      botoesConfirma = `
      <div class="rBox modal-footer" text="right">
        <button onclick="app.topicos.removeFonte()">Remover</button> &nbsp;
        <button type="cancelar" onclick="app.fechaConfirma()">Cancelar</button>
      </div>
      `
    }

    modal.setContent('<p>' + contents + '</p>' + botoesConfirma)
    modal.open()
    this._confirma = modal
  },

  fechaModal: function (e) {
    e.preventDefault()
    this._modal.close()
  },

  slug: function () {
    var href = location.href.replace(/#.*$/, '')
    return href.replace(/^.*\/tema\/([^\/]+)([\/].*)?$/, '$1')
  },

  // https://stackoverflow.com/questions/7641791/javascript-library-for-human-friendly-relative-date-formatting
  formataData: function (date, tipo) {
    if (tipo === 'humana') {
      var delta = Math.round((+new Date() - new Date(date)) / 1000)
      var minute = 60
      var hour = minute * 60
      var day = hour * 24
      // var week = day * 7
      var fuzzy = ''

      if (delta < 30) {
        fuzzy = 'agora'
      } else if (delta < minute) {
        fuzzy = delta + ' segundos'
      } else if (delta < 2 * minute) {
        fuzzy = 'um minuto atrás'
      } else if (delta < hour) {
        fuzzy = Math.floor(delta / minute) + ' minutos'
      } else if (Math.floor(delta / hour) === 1) {
        fuzzy = '1 hora'
      } else if (delta < day) {
        fuzzy = Math.floor(delta / hour) + ' horas'
      } else if (delta < day * 2) {
        fuzzy = 'ontem'
      } else {
        fuzzy = this.formataData(date)
      }

      return fuzzy
    } else {
      var d = new Date(date)
      var dia = d.getDate()
      var mes = d.getMonth() + 1
      var ano = d.getFullYear()
      var h = d.getHours()
      var m = d.getMinutes()

      if (dia.toString().length === 1) dia = '0' + dia
      if (mes.toString().length === 1) mes = '0' + mes
      if (m.toString().length === 1) m = '0' + m
      if (h.toString().length === 1) h = '0' + h

      return dia + '/' + mes + '/' + ano + ' às ' + h + ':' + m
    }
  },

  formataTags: function (tags) {
    var spanTag = '<span class="tag">'
    tags = tags.split(/ *?, *?/)

    if (tags.length) return spanTag + tags.join('</span> ' + spanTag) + '</span>'
  },

  cadastro: function (form, e) {
    e.preventDefault()

    var post = {
      nome: form.elements.nome.value,
      email: form.elements.email.value,
      senha: form.elements.senha.value,
    }

    $.post('/api/cadastro', post, function (res) {
      if (res.erro) return app.mensagemDeErro(res.erro, res.alvo ? form.elements[res.alvo] : null)
      // TODO logar e redirecionar
    })
  },

  login: function (form, e) {
    e.preventDefault()

    var post = {
      email: form.elements.email.value,
      senha: form.elements.senha.value,
    }

    $.post('/auth/login', post, function (res) {
      if (res.erro) return app.mensagemDeErro(res.erro, form.elements['email'])
      app.credenciais()
      app.fechaModal(e)
    })
  },

  logout: function (e) {
    e.preventDefault()
    $.get('/auth/logout', function (res) {
      if (res.erro) return app.alert(res.erro)
      app.reload()
    })
  },

  credenciais: function () {
    $.get('/api/credenciais', function (sessao) {
      if (sessao.erro) app.alert(sessao.erro)
      if (sessao && sessao.logado) {
        app.usuario = sessao
        $get('areaDoVisitante').setAttribute('hidden', '')
        $get('areaDoUsuario').removeAttribute('hidden')
        $get('areaDoUsuario').innerHTML = app.render(app.template.areaDoUsuario, sessao)
      }
      else {
        app.usuario = {}
        $get('areaDoVisitante').removeAttribute('hidden')
      }
    })
  },

  mensagemDeErro: function (txt, alvo) {
    $('.erro').remove()
    $(alvo).before('<div class="erro">' + txt + '</div>')
    return false
  }

}

function escapeHTML (s) {
  var chars = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }
  return s.replace(/([&<>'"])/g, function (c) {
    return chars[c]
  })
}

var $get = function (id) {
  return document.getElementById(id)
}

var $find = function (q) {
  return document.querySelector(q)
}

HTMLFormElement.prototype.populate = function (o) { //eslint-disable-line
  var lst = this.elements
  Object.keys(o).forEach(function (key) {
    var e = lst[key]
    if (typeof e !== 'undefined') {
      // checkbox
      if (!e.type && e.length > 0 && o[key].length > 0) {
        for (var i = 0; i < e.length; i++) {
          if (o[key].indexOf(e[i].value) > -1) {
            e[i].checked = true
          }
        }
      } else if (e.type !== 'file') {
        e.value = o[key]
      }
    }
  })
  return this
}
