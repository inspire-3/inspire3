import { sep as pathSeparator } from 'path'
import fg from 'fast-glob'
import { replaceKey, replaceTemplate, searchString } from '../support/environmentJsonPlaceholder.mjs'
import { environmentResolver } from '../support/environmentVariableResolver.mjs'
import { encode } from 'js-base64'
import { readFileSync, writeFileSync } from 'fs'
import { Command } from 'commander'

export const doInject = (config) => {
  const { projectRoot: rootPath } = config

  const allHtmlFiles = fg.sync(
    [rootPath, 'src', 'frontend', '.output', '**', '*.html'].join(pathSeparator)
  )

  const environment = environmentResolver()
  const environmentJson = JSON.stringify(environment)
  const environmentJsonAsBase64 = encode(environmentJson)
  const targetContent = replaceTemplate.replace(replaceKey, environmentJsonAsBase64)

  allHtmlFiles.forEach((filePath) => {
    const htmlFile = readFileSync(filePath)
    let fileContent = htmlFile.toString('utf-8')
    fileContent = fileContent.replace(searchString, targetContent)
    writeFileSync(filePath, fileContent)
  })

  const allJsFiles = fg.sync(
    [rootPath, 'src', 'frontend', '.output', 'public', '_nuxt', '*.js'].join(pathSeparator)
  )

  allJsFiles.forEach((filePath) => {
    const jsFile = readFileSync(filePath)
    let fileContent = jsFile.toString('utf-8')
    fileContent = fileContent.replace(searchString, targetContent)
    writeFileSync(filePath, fileContent)
  })

}

export const environmentInjectCommand = (config) => {
  const inject = new Command('inject')
  inject
    .description(`injects configuration into '*.html'`)
    .action(() => {
      try {
        doInject(config)
      } catch (e) {
        console.log('❗️', e.message, ', environment configuration injection aborted')
        process.exit(1)
      }
      console.log(`✅ environment configuration injected`)
      process.exit(0)
    })

  return inject
}
