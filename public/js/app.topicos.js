app.topicos = {

  boicotar: function (_id, sair) {
    $.post('/api/topicos/participar', { topico_id: _id, sair: sair }, function (res) {
      if (res.erro) return app.mensagemDeErro(res.erro, '.modal-confirma .tingle-modal-box__content p')
      if (sair) {
        $('#btnBoicotes [type=boicotar]').show()
        $('#btnBoicotes [type=boicotando]').hide()
      }
      else {
        $('#btnBoicotes [type=boicotar]').hide()
        $('#btnBoicotes [type=boicotando]').show()
      }
    })
  },

  carregar: function (slug) {
    $.get('/api/topico/' + slug, function (topico) {
      var $article = $('article')
      var $sidebar = $('#sidebar p')

      app.cache.topico = topico

      topico.tagsFormatadas = function () {
        return app.formataTags(this.tags)
      }

      topico.dataFormatada = function () {
        return app.formataData(this.data_publicada)
      }

      topico.texto = escapeHTML(topico.texto)
      topico.texto = marked(topico.texto)

      topico.boicote = escapeHTML(topico.boicote)
      topico.boicote = marked(topico.boicote)

      topico.num_motivos = topico.motivos && topico.motivos.length || 0

      // adiciona indice
      var i = 0
      topico.motivos.map(function (item) {
        item.indice = ++i
        return item
      })

      $article.html(app.render($article.html(), topico))
      $article.show()

      $sidebar.html(topico.boicote)

      if (topico.participa) {
        $('#btnBoicotes [type=boicotar]').hide()
        $('#btnBoicotes [type=boicotando]').show()
      }

      $('#btnEditaTopico').fu_popover({
        content: `
        <ul layout="flat" class="popover-menu">
          <li onclick="app.go(location.href + '/editar')">Editar</li>
          <li>Copiar link</li>
          <li>Convidar pessoas</li>
          <li>Denunciar abuso</li>
          <li class="divisor"></li>
          <li>Remover publicação</li>
        </ul>
        `,
        placement: 'bottom',
        dismissable: true
      })

      // $('#btnEditaTopico').show()
    })
  },

  salvar: function (form, e) {
    e.preventDefault()

    var post = {
      _id: form.elements._id.value,
      titulo: form.elements.titulo.value,
      texto: form.elements.texto.value,
      boicote: form.elements.boicote.value,
      tags: form.elements.tags.value
    }

    if (!post.titulo.trim()) return app.mensagemDeErro('Informe o tema.', form.elements.titulo)
    if (post.titulo.trim().length < 40) return app.mensagemDeErro('Defina melhor seu tema, o título está muito curto.', form.elements.titulo)
    if (!post.texto.trim()) return app.mensagemDeErro('Descreva o tema a ser debatido.', form.elements.texto)
    if (post.texto.trim().length < 80) return app.mensagemDeErro('Descreva melhor o tema a ser debatido, o texto está muito curto.', form.elements.texto)
    if (!post.boicote.trim()) return app.mensagemDeErro('Descreva melhor como boicotar, o texto está muito curto.', form.elements.boicote)
    if (post.boicote.trim().length < 80) return app.mensagemDeErro('Descreva melhor o tema a ser debatido, o boicote está muito curto.', form.elements.boicote)
    if (!post.tags.trim()) return app.mensagemDeErro('Informe a quais tópicos está relacionado.', form.elements.tags)

    // A fuligem produzida num ambiente urbano pode contaminar o alimento produzido por hortas urbanas
    $.post('/api/topicos', post, function (res) {
      if (res.erro) return app.mensagemDeErro(res.erro, res.alvo ? form.elements[res.alvo] : null)
      app.go(res.url)
    })
  },

  analisaFonte: function (fonte) {
    $.post('/api/fonte/analisar', { fonte: fonte }, function (res) {
      if (res.erro) return false

      var form = document.querySelector('.tingle-modal form')

      if (res.dados.titulo) form.elements.titulo.value = res.dados.titulo
      if (res.dados.texto) form.elements.texto.value = res.dados.texto
    })
  },

  modalFonte: function (topico_id, tipo) {
    app.modal(app.template.carregando)
    $.get('/api/fontes/' + topico_id, function (fonte) {
      fonte.tipo = tipo
      app.cache.fonte = Object.assign({}, fonte)

      fonte.dataFormatada = function () {
        return app.formataData(this.data_publicada)
      }

      fonte.dataFormatadaHumana = function () {
        return app.formataData(this.data_publicada, 'humana')
      }

      fonte.votouSim = function () {
        if (!this.votos) return ''
        return this.votos.filter(function (x) {
          return x.autor_id === app.usuario._id && x.voto === true
        }).length ? 'selecionado' : ''
      }

      fonte.votouNao = function () {
        if (!this.votos) return ''
        return this.votos.filter(function (x) {
          return x.autor_id === app.usuario._id && x.voto === false
        }).length ? 'selecionado' : ''
      }

      // ajustes
      fonte.texto = escapeHTML(fonte.texto)
      fonte.texto = marked(fonte.texto)
      fonte.titulo = escapeHTML(fonte.titulo)
      fonte.titulo = marked(fonte.titulo)

      // popula usuario
      fonte.usuario = app.usuario

      $('.tingle-modal-box__content').html(app.render(app.template.modalFonte, fonte))

      $('#btnEditaFonte').fu_popover({
        content: `
        <ul layout="flat" class="popover-menu">
        <li onclick="app.topicos.modalFormFonte('editar')">Editar</li>
        <li>Copiar link</li>
        <li>Convidar pessoas</li>
        <li>Denunciar abuso</li>
        <li class="divisor"></li>
        <li onclick="app.confirma('Deseja remover esta fonte da discussão?')">Remover fonte</li>
        </ul>
        `,
        placement: 'bottom',
        dismissable: true
      })

      // popula comentários
      app.topicos.carregaComentarios(topico_id)
    })
  },

  modalFormFonte: function (tipo) {
    app._modal && app._modal.close()
    app.modal(app.template.modalFormFonte, ['button', 'escape'])

    if (tipo === 'editar') {
      $get('formFonte').populate(app.cache['fonte'])
      $('.escondeAoEditar').hide()
      $('.mostraAoEditar').show()
      $('#formFonte input[name=fonte]').attr('disabled', 'disabled')
      $('#formFonte input[name=titulo]').focus()
    }
    else {
      $('#modalFormFonteAvatar').attr('src', app.usuario.avatar)
      $('#formFonte input[name=fonte]').focus()
      $('#formFonte input[name=tipo]').val(tipo)
    }

    $('#btnEditaFonte').fu_popover('destroy')
  },

  salvarFonte: function (form, e) {
    e.preventDefault()

    var post = {
      vinculo_id: app.cache.topico._id,
      topico_id: form.elements._id.value,
      tipo: form.elements.tipo.value,
      fonte: form.elements.fonte.value,
      titulo: form.elements.titulo.value,
      texto: form.elements.texto.value,
      comentario: form.elements.comentario.value
    }

    if (!post.fonte.trim()) return app.mensagemDeErro('Você precisa indicar uma fonte.', form.elements.fonte)
    if (!post.titulo.trim()) return app.mensagemDeErro('A fonte precisa ter um título.', form.elements.titulo)
    if (!post.texto.trim()) return app.mensagemDeErro('A fonte precisa ter um resumo.', form.elements.texto)
    if (post.texto.trim().length < 100) return app.mensagemDeErro('Defina melhor o resumo da fonte, o texto está muito curto.', form.elements.texto)

    // A fuligem produzida num ambiente urbano pode contaminar o alimento produzido por hortas urbanas
    $.post('/api/fontes', post, function (res) {
      if (res.erro) return app.mensagemDeErro(res.erro, res.alvo ? form.elements[res.alvo] : form.elements['_id'])
      app.reload()
    })
  },

  removeFonte: function () {
    $.delete('/api/fontes', { topico_id: app.cache.fonte._id }, function (res) {
      if (res.erro) return app.mensagemDeErro(res.erro, '.modal-confirma .tingle-modal-box__content p')
      app._confirma.close()
      app._modal.close()
      app.reload()
    })
  },

  carregaComentarios: function (topico_id) {
    $.get('/api/comentarios/' + topico_id, function (comentarios) {
      var view = {
        comentarios: comentarios,
        dataFormatadaHumana: function () {
          return app.formataData(this.data_publicada, 'humana')
        },
        comentario: function () {
          return marked(escapeHTML(this.texto))
        },
        dataFormatada: function () {
          return app.formataData(this.data_publicada)
        },
        btnRemoveComentario: function () {
          return this.autor._id !== app.usuario._id ? 'hidden' : ''
        }
      }
      $('#comentariosDoModal').html(app.render(app.template.comentariosDoModal, view))
    })
  },

  enviaComentario: function (_null, comentario, event) {
    if (!comentario.trim()) return false

    // <enter>
    if (event.keyCode === 13) {
      event.preventDefault()
      var form = document.querySelector('.tingle-modal form')
      var post = {
        topico_id: app.cache.fonte._id,
        texto: comentario
      }

      $.post('/api/comentarios', post, function (res) {
        if (res.erro) return app.mensagemDeErro(res.erro, '#caixaDeComentario')

        var $comentariosDoModal = $get('comentariosDoModal')
        var tplComentario = $(app.template.modalFonte).filter('#comentariosDoModal').html()

        res.comentario.dataFormatadaHumana = function () {
          return app.formataData(this.data_publicada, 'humana')
        }

        // append
        $('#comentariosDoModal').append(app.render(tplComentario, {comentarios: [res.comentario]}))

        // reset
        $get('caixaDeComentario').value = ''
      })

      return false
    }
  },

  confirmaRemoverComentario: function (id) {
    // TODO
    app.confirma('Remover este comentário?', `
      <div class="rBox modal-footer" text="right">
        <button onclick="app.topicos.removeComentario('${id}')">Remover</button> &nbsp;
        <button type="cancelar" onclick="app.fechaConfirma()">Cancelar</button>
      </div>
    `)
  },

  removeComentario: function (id) {
    app.fechaConfirma()
    $.delete('/api/comentarios', {comentario_id: id}, function (res) {
      if (res.erro) return app.alert(res.erro)
      $('#comentario_' + id).slideUp(function () {
        $(this).remove()
      })
    })
  },

  votar: function (voto, btn) {
    var classList = btn.classList
    var btnSelecionado = btn.parentNode.querySelector('.selecionado')

    // gerencia classes dos botoes
    if (classList.contains('selecionado')) {
      classList.remove('selecionado')
      voto = 0
    }
    else {
      if (btnSelecionado) btnSelecionado.classList.remove('selecionado')
      classList.add('selecionado')
    }

    var post = {
      topico_id: app.cache.fonte._id,
      voto: voto
    }

    $.post('/api/votos', post, function (res) {
      if (res.erro) return app.alert(res.erro)
    })
  },

  editar: function (slug) {
    $.get('/api/topico/' + slug, function (pagina) {
      // var $main = $('main')
      // var template = $main.html()

      $get('formTopico').populate(pagina)
      $('main').show()
      $find('#formTopico input[name=titulo]').focus()

      if (pagina._id) {
        $('.escondeAoEditar').hide()
        $('.mostraAoEditar').show()
      }
    })
  }

}
