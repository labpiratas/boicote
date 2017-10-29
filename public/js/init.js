/* global $ app __init */

// métodos PUT/DELETE para jquery
jQuery.each( [ "put", "delete" ], function( i, method ) {
  jQuery[ method ] = function( url, data, callback, type ) {
    if ( jQuery.isFunction( data ) ) {
      type = type || callback
      callback = data
      data = undefined
    }

    return jQuery.ajax({
      url: url,
      type: method,
      dataType: type,
      data: data,
      success: callback
    })
  }
})

$(function () {
  $('[data-template]').each(function (i, el) {
    var id = el.getAttribute('id')

    app.template[id] = el.innerHTML

    // remove tags de modais do body
    if (id.indexOf('modal') === 0) {
      el.parentNode.removeChild(el)
    }
  })

  app.credenciais()

  if (typeof __init === 'function') __init()
})
