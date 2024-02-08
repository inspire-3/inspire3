import fs from 'fs'
import * as process from 'process'

let junoConfig
try {
  const junoConfigJson = fs.readFileSync('./juno.template.json', { encoding: 'utf8', flag: 'r' })
  junoConfig = JSON.parse(junoConfigJson)

  // get environment
  const environment = process.env.APP_ENV
  if (!environment) {
    throw new Error(`'APP_ENV' env variable required`)
  }

  const satelliteId = process.env.JUNO_SATELLITE_ID
  if (!satelliteId) {
    throw new Error(`'JUNO_SATELLITE_ID' env variable required`)
  }

  if (fs.existsSync('./juno.json')) {
    fs.unlinkSync('./juno.json')
  }

  junoConfig.satellite.satelliteId = satelliteId
  fs.writeFileSync('./juno.json', JSON.stringify(junoConfig))
} catch (e) {
  console.error('❌  ', e.message)
  process.exit(1)
}

console.log('⚠️  ', `'JUNO_SATELLITE_ID' applied to 'juno.json'`)
