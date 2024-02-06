import fs from 'fs'
import { Command } from 'commander'
import dotenv from 'dotenv'
import { parse, stringify } from 'yaml'
import path from 'path'
import set from 'lodash.set'

const validateFileExists = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File '${filePath}' does not exist`)
  }
}

const resolveFiles = (environment, rootPath) => {
  return {
    envFile: [rootPath, `.env.${environment}`].join(path.sep),
    appSpecTemplate: [rootPath, `app-spec.${environment}.template.yml`].join(path.sep),
    appSpecFile: [rootPath, `app-spec.${environment}.yml`].join(path.sep)
  }
}

const createEnvEntry = (key, value, isSecret = false, scope = 'RUN_AND_BUILD_TIME') => {
  const entry = {
    key,
    value: String(value),
    scope
  }

  if (isSecret) {
    entry['type'] = 'SECRET'
  }

  return entry
}

const resolveEnvs = (envDefinition, secretKeys) => {
  const envs = []
  for (const envKey in envDefinition) {
    envs.push(createEnvEntry(
        envKey,
        envDefinition[envKey],
        secretKeys.includes(envKey)
      )
    )
  }
  return envs
}

const applyVersion = (items = [], version = 'main') => {
  return items.map( item => {
    return set(item, 'image.tag', version)
  } )
}

export const appSpecInjectCommand = (config) => {
  const inject = new Command('inject')
  inject
    .description(`injects '.env' file variables into 'app-spec.*.yml' file`)
    .argument('<environment>', 'environment')
    .argument('<version>', 'app version')
    .option('--app-name <name>', 'DigitalOcean app name')
    .option('--app-domain <domain>', 'DigitalOcean app domain')
    .option('--app-domain-zone <zone>', 'DigitalOcean app domain zone')
    .option('--app-url <url>', 'app url')
    .option('--db-name <name>', 'db name')
    .option('--db-user <user>', 'db user name')
    .option('--db-password <password>', 'db password')
    .option('--app-exists <exists>', 'app already exits')
    .action((
      environment,
      version,
      options = {
        appName: undefined,
        appDomain: undefined,
        appDomainZone: undefined,
        appUrl: undefined,
        dbName: undefined,
        dbUser: undefined,
        dbPassword: undefined,
        appExists: undefined,
      }
    ) => {
      const { envFile, appSpecFile, appSpecTemplate } = resolveFiles(environment, config.projectRoot)
      validateFileExists(envFile)
      validateFileExists(appSpecTemplate)

      const envDefinition = {}

      dotenv.config({
        path: envFile,
        processEnv: envDefinition
      })

      // noinspection JSUnresolvedReference
      const secretKeys = envDefinition?.APP_SPEC_SECRET_ENVS.split(',') ?? []

      try {
        const appSpecTemplateYamlContent = parse(
          fs.readFileSync(appSpecTemplate, 'utf8')
        )

        // noinspection JSDeprecatedSymbols
        appSpecTemplateYamlContent.name = options.appName
        appSpecTemplateYamlContent.domains[0].domain = options.appDomain
        appSpecTemplateYamlContent.domains[0].zone = options.appDomainZone

        if (options.appDomainZone === 'null') {
          delete appSpecTemplateYamlContent.domains[0].zone
        }

        // noinspection JSPotentiallyInvalidTargetOfIndexedPropertyAccess
        appSpecTemplateYamlContent.databases[0].db_name = options.dbName
        // noinspection JSPotentiallyInvalidTargetOfIndexedPropertyAccess
        appSpecTemplateYamlContent.databases[0].db_user = options.dbUser

        envDefinition.DIGITALOCEAN_APP_NAME = options.appName
        envDefinition.DIGITALOCEAN_APP_DOMAIN = options.appDomain
        envDefinition.DIGITALOCEAN_APP_DOMAIN_ZONE = options.appDomainZone

        envDefinition.APP_URL = options.appUrl
        envDefinition.DB_DATABASE = options.dbName
        envDefinition.DB_USERNAME = options.dbUser
        envDefinition.DB_PASSWORD = options.dbPassword

        appSpecTemplateYamlContent.envs = resolveEnvs(envDefinition, secretKeys)
        appSpecTemplateYamlContent.jobs = applyVersion(appSpecTemplateYamlContent.jobs, version)
        appSpecTemplateYamlContent.services = applyVersion(appSpecTemplateYamlContent.services, version)
        appSpecTemplateYamlContent.workers = applyVersion(appSpecTemplateYamlContent.workers, version)

        // @info app platform does not have a clear defined way to handle service dependencies
        // so we have to bring up all services in a specific order so that the db firewall is in place
        // that queue worker, migration job and websockets are able to access the database
        switch (options.appExists) {
          case 'false':
            appSpecTemplateYamlContent.alerts = appSpecTemplateYamlContent.alerts.map( alert => {
              switch (alert.rule) {
                case 'DEPLOYMENT_FAILED':
                case 'DOMAIN_FAILED':
                  alert.disabled = true
                  break
                default:
                  break
              }
              return alert
            } )
            appSpecTemplateYamlContent.jobs = []
            appSpecTemplateYamlContent.services = appSpecTemplateYamlContent.services.filter( service => service.name === 'api' )
            appSpecTemplateYamlContent.services = appSpecTemplateYamlContent.services.map( service => {
              if ( service.name !== 'api' ) {
                return service
              }

              service.image.repository = 'tooling/sws'
              service.image.tag = 'latest'

              return service
            } )
            appSpecTemplateYamlContent.workers = []
            break
          default:
            break
        }

        fs.writeFileSync(
          appSpecFile,
          stringify(appSpecTemplateYamlContent),
          'utf8'
        )

      } catch (e) {
        console.log('❗️', e.message, ', activation aborted')
        process.exit(1)
      }

      console.log(`✅ '${appSpecFile}' is ready for deployment.`)
      console.log('')
      process.exit(0)
    })

  return inject
}
