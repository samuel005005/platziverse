const chalk = require('chalk')

function handleFatalError (err) {
  console.error(`${chalk.red('[fatal error]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

function handleError (err) {
  console.error(`${chalk.red('[Error]')} ${err.message}`)
  console.error(err.stack)
}

function configDB (setup, dialect, logging) {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'swagga',
    host: process.env.DB_HOST || 'localhost',
    dialect,
    logging,
    setup
  }
  return config
}
function parsePayload (payload) {
  if (payload instanceof Buffer) {
    payload = payload.toString('utf8')
  }

  try {
    payload = JSON.parse(payload)
  } catch (error) {
    payload = null
  }
  return payload
}

function selectKeys (obj, keys) {
  // Validando si la key tiene el objeto
  const keysObj = Object.keys(obj)
  const selectedKeys = keys.filter(key => keysObj.includes(key))
  // Construyendo el objeto de respuesta
  const objResult = {}
  selectedKeys.forEach(key => {
    objResult[key] = obj[key]
  })
  return objResult
}

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

function selectAttributes (array, attributes) {
  const selected = array.map(obj => selectKeys(obj, attributes))
  return selected
}

function bodyError (strings, ...keys) {
  return function (...values) {
    const result = [strings[0]]
    keys.forEach((key, i) => {
      result.push(values[key], strings[i + 1])
    })
    return { error: result.join('') }
  }
}

class DomainError extends Error {
  constructor(message) {
    super(message);
   // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
   // This clips the constructor invocation from the stack trace.
   // It's not absolutely essential, but it does make the stack trace a little nicer.
   //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor);
  }
}


class Unauthorized extends DomainError {
  constructor(resource, query) {
    super(`Resource ${resource} Unauthorized.`);
    this.data = { resource, query };
  }
}
class ResourceNotFoundError extends DomainError {
  constructor(resource, query) {
    super(`Resource ${resource} was not found.`);
    this.data = { resource, query };
  }
}

class InternalError extends DomainError {
  constructor(error) {
    super(error.message);
    this.data = { error };
  }
}
module.exports = {
  handleFatalError,
  handleError,
  configDB,
  parsePayload,
  extend,
  selectAttributes,
  bodyError
}
