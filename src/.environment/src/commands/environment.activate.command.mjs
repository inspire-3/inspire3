import fs from 'fs'
import path from 'path'
import { ACTIVE_ENVIRONMENT_FILENAME, ENVIRONMENT_FILENAME_TEMPLATE } from '../environment.mjs'
import { Command } from 'commander'

const activateEnvironmentFile = (environmentName, rootPath) => {
  const sourceEnvironmentFilePath = [rootPath, ACTIVE_ENVIRONMENT_FILENAME + '.' + environmentName].join(path.sep)
  const targetEnvironmentFilePath = [rootPath, ACTIVE_ENVIRONMENT_FILENAME].join(path.sep)

  if (!fs.existsSync(sourceEnvironmentFilePath)) {
    throw new Error(`'${environmentName}' environment definition missing`)
  }

  if (fs.existsSync(targetEnvironmentFilePath)) {
    fs.unlinkSync(targetEnvironmentFilePath)
  }

  fs.copyFileSync(sourceEnvironmentFilePath, targetEnvironmentFilePath)
}

export const environmentActivateCommand = (config) => {
  const activate = new Command('activate')
  activate
    .description(`activates the specified environment by copying '${ENVIRONMENT_FILENAME_TEMPLATE}' to '${ACTIVE_ENVIRONMENT_FILENAME}'`)
    .argument('<environment>', 'name of environment that should be activated')
    .action((environmentName) => {
      try {
        activateEnvironmentFile(environmentName, config.projectRoot)
      } catch (e) {
        console.log('❗️', e.message, ', activation aborted')
        process.exit(1)
      }
      console.log(`✅ '${environmentName}' environment is activated.`)
      console.log('')
      console.log(`⚠️  Run 'direnv allow' to refresh environment variables accordingly`)
      console.log('')
      process.exit(0)
    })

  return activate
}