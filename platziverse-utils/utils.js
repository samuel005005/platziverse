function parsePayload(payload) {
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

function selectKeys(obj, keys) {
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
  
  function extend(obj, values) {
    const clone = Object.assign({}, obj)
    return Object.assign(clone, values)
  }
  
  function selectAttributes(array, attributes) {
    const selected = array.map(obj => selectKeys(obj, attributes))
    return selected
  }

  function bodyError(strings, ...keys) {
    return function (...values) {
      const result = [strings[0]]
      keys.forEach((key, i) => {
        result.push(values[key], strings[i + 1])
      })
      return { error: result.join('') }
    }
  }

  function pipe (source , target) {

    if( !source.emit || !target.emit ){
      throw TypeError(`Please pass EventEmitter's as argument`)
    }

    const emit = source._emit = source.emit

    source.emit = function () {
      emit.apply( source, arguments)
      target.emit.apply(target, arguments)
      return source;
    }
  }

module.exports = {
  parsePayload,
  extend,
  selectAttributes,
  bodyError,
  pipe
}