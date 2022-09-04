'use strict'
const debug = require('debug')('platziverse:db:setup')
const inquirer = require('inquirer')
const db = require('./')
const { configuration, handleFatalError } = require('platziverse-utils')

const prompt = inquirer.createPromptModule()
const argv = require('yargs').option(
  'force', {
    alias: 'f',
    type: 'boolean',
    default: false,
    description: 'Not question!  destroy database',
    demandOption: false
  }).argv

async function setup () {
  if (!argv.force) {
    const answer = await prompt([
      {
        type: 'confirm',
        name: 'setup',
        message: 'This will destroy your database, are you sure?'
      }
    ])
    
    if (!answer.setup) {
      return console.log('Nothing happened :)')
    }
  }

  const config = configuration(true, 'postgres', s => debug(s))
 

  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

setup()
