function configuration (setup, dialect, logging) {
  const config = {
    db: {
      database: process.env.DB_NAME || 'platziverse',
      username: process.env.DB_USER || 'platzi',
      password: process.env.DB_PASS || 'swagga',
      host: process.env.DB_HOST || 'localhost',
      dialect,
      logging,
      setup
    },
    auth: {
      secret: process.env.SECRET || 'platzi',
      algorithms: ['HS256'],
      requestProperty: 'auth'
    }
  }
  return config
}

module.exports = configuration
