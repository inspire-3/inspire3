import fs, { readFileSync, writeFileSync } from 'fs'
import { ENCRYPTED_ENVIRONMENT_FILENAME_TEMPLATE, ENVIRONMENT_FILENAME_TEMPLATE } from '../environment.mjs'
import path from 'path'
import Cryptr from 'cryptr'
import { resolveEncryptionKey } from '../support/resolveEncryptionKey.mjs'
import { Command } from 'commander'

export const doEncrypt = (environmentName, encryptionKey, config) => {
  const { projectRoot: rootPath } = config
  const sourceEnvironmentFilePath = [
    rootPath, ENVIRONMENT_FILENAME_TEMPLATE.replace('<environment>', environmentName)
  ].join(path.sep)
  const targetEnvironmentFilePath = [
    rootPath, ENCRYPTED_ENVIRONMENT_FILENAME_TEMPLATE.replace('<environment>', environmentName)
  ].join(path.sep)

  const resolvedEncryptionKey = resolveEncryptionKey(encryptionKey)
  if (!resolvedEncryptionKey) {
    throw new Error(`encryption key was not provided by option '--key' nor by 'ENVIRONMENT_ENCRYPTION_KEY'`)
  }

  if (!fs.existsSync(sourceEnvironmentFilePath)) {
    throw new Error(`'${environmentName}' environment definition missing`)
  }

  const fileContentBase64 = readFileSync(sourceEnvironmentFilePath).toString('base64')

  const encryptedFileContent = new Cryptr(resolvedEncryptionKey).encrypt(fileContentBase64)

  writeFileSync(targetEnvironmentFilePath, encryptedFileContent)
}

export const environmentEncryptCommand = (config) => {
  const encrypt = new Command('encrypt')
  encrypt
    .description(`encrypts an '${ENVIRONMENT_FILENAME_TEMPLATE}' by writing '${ENCRYPTED_ENVIRONMENT_FILENAME_TEMPLATE}'`)
    .argument('<environment>', 'name of environment that should be encrypted')
    .option('-k, --key [key]', 'optional encryption key')
    .action((environmentName, options) => {
      try {
        doEncrypt(environmentName, options.key, config)
      } catch (e) {
        console.log('❗️', e.message, ', encryption aborted')
        process.exit(1)
      }
      console.log(`✅ '${environmentName}' definition is encrypted`)
      process.exit(0)
    })
  return encrypt
}