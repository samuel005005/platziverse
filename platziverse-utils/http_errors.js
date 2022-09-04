class DomainError extends Error {
  constructor (message) {
    super(message)
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name
    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    //  @see Node.js reference (bottom)
    Error.captureStackTrace(this, this.constructor)
  }
}

class Unauthorized extends DomainError {
  constructor (resource, query) {
    super(`Resource ${resource} Unauthorized.`)
    this.data = { resource, query }
  }
}
class ResourceNotFoundError extends DomainError {
  constructor (resource, query) {
    super(`Resource ${resource} was not found.`)
    this.data = { resource, query }
  }
}

class InternalError extends DomainError {
  constructor (error) {
    super(error.message)
    this.data = { error }
  }
}

module.exports = {
  Unauthorized,
  ResourceNotFoundError,
  InternalError
}
