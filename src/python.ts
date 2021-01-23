import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as semver from 'semver'
import {SemVer} from 'semver'

import * as exec from './util/exec'

export interface AvailableResult {
  available: boolean
  version: SemVer
}

export async function isAvailable(
  pythonCommand: string
): Promise<AvailableResult> {
  if (!pythonCommand.startsWith('python')) {
    throw new Error(`not a valid python command`)
  }

  const allPythonVersions = tc.findAllVersions('PyPy')
  core.info(`Versions of PyPy from tool-cache: ${allPythonVersions}`)

  const retval = await exec.exec(pythonCommand, ['--version'], true)
  const output = retval.stdout.split(' ')
  const version = semver.coerce(output[output.length - 1])

  core.info(`Detected version: ${version}`)

  return {
    available: retval.stderr === '' && retval.success,
    version: version as SemVer
  }
}
