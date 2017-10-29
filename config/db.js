const MongoClient = require('mongodb').MongoClient

module.exports = {

  setup (config, app) {
    const mongoString = process.env.NODE_ENV === 'DEV' ? 'mongodb://localhost:27017/local' : config.server.mongo

    return new Promise((resolve, reject) => {
      MongoClient.connect(mongoString, function (err, db) {
        if (err) {
          console.error(err)
          return reject(err)
        }

        global.db = db

        resolve(db)
      })
    })
  }

}
