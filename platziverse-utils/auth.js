const jwt = require('jsonwebtoken')

function sign (payload, secret, callback) {
  jwt.sign(payload, secret, callback)
}

function verify (payload, secret, callback) {
  jwt.sign(payload, secret, callback)
}

module.exports = {
  sign, verify
}
