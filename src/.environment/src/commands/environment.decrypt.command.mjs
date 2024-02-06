import fs, { readFileSync, writeFileSync } from 'fs'
import { ENCRYPTED_ENVIRONMENT_FILENAME_TEMPLATE, ENVIRONMENT_FILENAME_TEMPLATE } from '../environment.mjs'
import path from 'path'
import Cryptr from 'cryptr'
import { resolveEncryptionKey } from '../support/resolveEncryptionKey.mjs'
import { Command } from 'commander'

export const doDecrypt = (environmentName, encryptionKey, config) => {
  const { projectRoot: rootPath } = config
  const encryptedEnvironmentFile = [
    rootPath, ENCRYPTED_ENVIRONMENT_FILENAME_TEMPLATE.replace('<environment>', environmentName)
  ].join(path.sep)

  const plainTextEnvironmentFile = [
    rootPath, ENVIRONMENT_FILENAME_TEMPLATE.replace('<environment>', environmentName)
  ].join(path.sep)

  const resolvedEncryptionKey = resolveEncryptionKey(encryptionKey)
  if (!resolvedEncryptionKey) {
    throw new Error(`encryption key was not provided by option '--key' nor by 'ENVIRONMENT_ENCRYPTION_KEY'`)
  }

  if (!fs.existsSync(encryptedEnvironmentFile)) {
    throw new Error(`encrypted '${environmentName}' environment file missing`)
  }

  const fileContentUtf8 = readFileSync(encryptedEnvironmentFile).toString('utf-8')

  const decryptedFileContentBase64 = new Cryptr(resolvedEncryptionKey).decrypt(fileContentUtf8)

  const decryptedFileContentUtf8 = Buffer
    .from(decryptedFileContentBase64, 'base64')
    .toString('utf-8')

  writeFileSync(plainTextEnvironmentFile, decryptedFileContentUtf8)
}

export const environmentDecryptCommand = (config) => {
  const decrypt = new Command('decrypt')
  decrypt
    .description(`decrypts an '${ENCRYPTED_ENVIRONMENT_FILENAME_TEMPLATE}' by writing '${ENVIRONMENT_FILENAME_TEMPLATE}'`)
    .argument('<environment>', 'name of environment that should be decrypted')
    .option('-k, --key [key]', 'optional encryption key')
    .action((environmentName, options) => {
      try {
        doDecrypt(environmentName, options.key, config)
      } catch (e) {
        console.log('❗️', e.message, ', decryption aborted')
        process.exit(1)
      }
      console.log(`✅ '${environmentName}' definition is decrypted`)
      process.exit(0)
    })
  return decrypt
}