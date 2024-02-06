import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import set from 'lodash.set'
import {environmentResolver } from '../support/environmentVariableResolver.mjs'
import { Command } from 'commander'

const ENVIRONMENT_JSON_TEMPLATE_FILE_PATH_SEGMENTS = ['environment.json.template']
const ENVIRONMENT_JSON_FILE_PATH_SEGMENTS = ['environment.json']

const defineEnvironmentJson = (rootPath) => {
  const source = [rootPath, ...ENVIRONMENT_JSON_TEMPLATE_FILE_PATH_SEGMENTS]
  const sourceContent = readFileSync(source.join(path.sep)).toString('utf-8')
  const environmentConfig = JSON.parse(sourceContent)

  const {environment, product, version, cicd} = environmentResolver()
  environmentConfig.environment = environment
  environmentConfig.product = product
  environmentConfig.version = version
  environmentConfig.cicd = cicd

  const targetContent = JSON.stringify(environmentConfig)
  const target = [rootPath, ...ENVIRONMENT_JSON_FILE_PATH_SEGMENTS]
  const targetPath = target.join(path.sep)

  writeFileSync(targetPath, targetContent)
  console.log(`ℹ️ '${targetPath}' written`)
}

export const environmentDefineCommand = (config) => {
  const define = new Command('define')
  define
    .description(`writes 'juno.json' and 'environment.json'`)
    .action(() => {
      // @info has to reflect the new docker image situation
      console.log('❗️', 'not implemented')
      process.exit(0)
      try {
        defineEnvironmentJson(config.projectRoot)
      } catch (e) {
        console.log('❗️', e.message, ', environment configuration definition aborted')
        process.exit(1)
      }
      console.log(`✅ environment configuration defined`)
      process.exit(0)
    })

  return define
}
