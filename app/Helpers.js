const crypto = require('crypto')

module.exports = {

  to (promise) {
    return promise.then(data => data).catch(err => err)
  },

  awaitTo (promise) {
    return promise.then(data => data).catch(err => err)
  },

  getDomain (url) {
    var matches = url.match(/^https?\:\/\/(?!(?:www\.)?(?:youtube\.com|youtu\.be))([^\/:?#]+)(?:[\/:?#]|$)/i)
    return matches && matches[1]
  },

  isError (x) {
    if (x instanceof Error) {
      console.warn(x)
      return x
    }
    else {
      return false
    }
  },

  md5 (str) {
    return crypto.createHash('md5').update(String(str)).digest('hex')
  },

  mongoFields (arr) {
    var fields = {}
    for (var i = 0; i < arr.length; i++) {
      fields[arr[i]] = true
    }
    return fields
  },

  notify (msg) {
    let notifier = require('node-notifier')
    console.log(msg)
    return notifier.notify({
      'title': 'Server',
      'message': msg
    })
  },

  prefixObjectKeys (prefix, obj) {
    var newObj = {}
    for (let key of Object.keys(obj)) {
      newObj[prefix + key] = obj[key]
    }
    return newObj
  },

  static (fname, fn) {
    return fn ? require('../api/' + fname + '.js')[fn] : require('../api/' + fname + '.js')
  },

  sanitize: {

    string (str, fn = null) {
      if (!(typeof str === 'string')) return ''
      return fn ? str[fn]() : str
    },

    objectId (str, fn = null) {
      if (!(typeof str === 'string')) return ''
      return /^[0-9a-fA-F]{24}$/.test(str) ? str : ''
    },

    email (str, fn = null) {
      str = this.string(str, fn)
      str = str.replace(/,;/g, '.')
      str = str.replace(/ /g, '')
      str = str.replace(/\.\./g, '.')
      return str
    },

    bool (b, df = false) {
      return this.boolean(b, df)
    },

    boolean (b, df = false) {
      return typeof b === 'boolean' ? df : b
    },

    number (b, df = false) {
      return typeof b === 'number' ? df : b
    }

  },

  async asserts (data, rules, stopOnFirstError = false) {
    const validator = require('validator')
    var errors = []
    var fields = []

    validator.isNotEmpty = (x, y) => !validator.isEmpty(x, y)
    validator.isNotNull = (x) => (x !== null)
    validator.isBoolean = (x) => (typeof x === 'boolean')
    validator.isBool = (x) => (typeof x === 'boolean')
    validator.isIn = (x, y) => (y.indexOf(x) !== -1)

    for (let rule of rules) {
      var input = data[rule[0]]
      var customFunc = typeof rule[1] === 'function'
      var validate = customFunc ? rule[1] : validator[rule[1]]
      var error = rule[2]
      var options = rule[3]

      if (typeof validate !== 'function') {
        throw new Error('Helpers.asserts function not exists: ' + (customFunc? '[custom]' : rule[1]))
      }

      if (customFunc) {
        options = typeof options === 'undefined' ? true : options
        if (await validate(input) !== options) {
          errors.push(error)
          fields.push(rule[0])
        }
      }
      else if (validate(input, options) === false) {
        errors.push(error)
        fields.push(rule[0])
      }

      if (stopOnFirstError && errors.length > 0) {
        return { error: errors[0], fail: true, field: fields[0] }
      }
    }

    return errors.length > 0 ? { errors: errors, fail: true, fields: fields } : { fail: false }
  }

}
