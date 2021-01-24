import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as semver from 'semver'
import {SemVer} from 'semver'

import * as exec from './util/exec'

export interface VersionResult {
  success: boolean
  version: SemVer
}

export async function getVersion(
  pythonCommand: string
): Promise<VersionResult> {
  if (!pythonCommand.startsWith('python')) {
    throw new Error(`not a valid python command`)
  }

  const allPythonVersions = tc.findAllVersions('Python')
  core.info(`Versions of PyPy from tool-cache: ${allPythonVersions}`)

  const allPyPyVersions = tc.findAllVersions('PyPy')
  core.info(`Versions of PyPy from tool-cache: ${allPyPyVersions}`)

  const retval = await exec.exec(pythonCommand, ['--version'], true)
  const output = retval.stdout.split(' ')
  const version = semver.coerce(output[output.length - 1])

  core.info(`Detected version: ${version}`)

  return {
    success: retval.stderr === '' && retval.success,
    version: version as SemVer
  }
}

export async function hasModule(
  pythonCommand: string,
  module: string
): Promise<boolean> {
  if (
    (await exec.exec(pythonCommand, ['-c', `"import ${module}"`], true)).success
  ) {
    core.info(`found python module ${module}`)
    return true
  }

  return false
}
