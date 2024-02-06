import path from 'path'
import fs from 'fs'
import get from 'lodash.get'
import { readFile } from 'fs/promises';

export const ROOT_INDICATOR_FILE_NAME = 'package.json'
export const isRoot = async (pathSegments = [], packageJsonKeyPath = 'project.isRoot') => {
  const joinedPathSegments = pathSegments.join(path.sep)
  const packageJsonPathToCheck = `${joinedPathSegments}${path.sep}${ROOT_INDICATOR_FILE_NAME}`

  if (!fs.existsSync(packageJsonPathToCheck)) {
    return false
  }

  const packageJsonContent = await readFile(packageJsonPathToCheck)
  const packageJson = JSON.parse(packageJsonContent.toString())

  return get(packageJson, packageJsonKeyPath, false) === true
}

export const resolveRootPath = async (initialCurrentPath, packageJsonKeyPath = 'project.isRoot') => {
  if (!initialCurrentPath) {
    throw new Error(`'initialCurrentPath' is missing but required`)
  }

  if (!fs.existsSync(initialCurrentPath)) {
    throw new Error(`'initialCurrentPath' does not exist`)
  }

  const pathSegments = initialCurrentPath.split(path.sep)
  while (pathSegments.length > 0) {
    if (await isRoot(pathSegments, packageJsonKeyPath)) {
      return pathSegments.join(path.sep)
    }

    if (pathSegments.length > 0) {
      pathSegments.pop()
    }
  }

  throw new Error(`Could not find root of project indicated by '${ROOT_INDICATOR_FILE_NAME}'`)
}
