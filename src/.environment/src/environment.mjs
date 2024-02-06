#!/usr/bin/env node
import colors from 'colors'
import { resolveRootPath } from './support/resolve-project-root.mjs'
import { Command } from 'commander'
import * as dotenv from 'dotenv'

import { environmentActivateCommand } from './commands/environment.activate.command.mjs'
import { environmentEncryptCommand } from './commands/environment.encrypt.command.mjs'
import { environmentDecryptCommand } from './commands/environment.decrypt.command.mjs'
import { environmentDefineCommand } from './commands/environment.define.command.mjs'
import { appSpecInjectCommand } from './commands/appSpec.inject.command.mjs'

dotenv.config()

const _config = {
  projectRoot: undefined
}

export const ACTIVE_ENVIRONMENT_FILENAME = '.env'
export const ENVIRONMENT_FILENAME_TEMPLATE = '.env.<environment>'
export const ENCRYPTED_ENVIRONMENT_FILENAME_TEMPLATE = '.env.<environment>.encrypted'

const initialize = async () => {
  // noinspection JSUnresolvedReference
  _config.projectRoot = await resolveRootPath(
    process.cwd(),
    process.env?.IS_ROOT_KEY_PATH ?? 'project.isRoot'
  )
  return _config
}

try {
  const config = await initialize()

  const environment = new Command()
  environment
    .name('environment')
    .description(`activate, encrypt & decrypt ${ACTIVE_ENVIRONMENT_FILENAME} files`)

  environment.addCommand(environmentActivateCommand(config))
  environment.addCommand(environmentEncryptCommand(config))
  environment.addCommand(environmentDecryptCommand(config))
  environment.addCommand(environmentDefineCommand(config))
  // environment.addCommand(environmentInjectCommand(config)) // @todo has to be reworked
  const appSpec = new Command()
  appSpec
    .name('app-spec')
    .description('work with DigitalOcean AppSpec files')
  appSpec.addCommand(appSpecInjectCommand(config))
  // appSpec.addCommand(appSpecDefineServiceVersionCommand(config))

  environment.addCommand(appSpec)

  environment.parse()
  process.exit(0)
} catch (e) {
  console.error(
    `${colors.red('ERROR:')} ${e?.message ?? 'Unknown error appeared'}`
  )
  process.exit(1)
}
