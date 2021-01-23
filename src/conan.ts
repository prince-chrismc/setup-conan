import * as core from '@actions/core'
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
  if (
    (await exec.exec(pythonCommand, ['-c', '"import conan"'], true)).success
  ) {
    return {available: false, version: semver.coerce('0.0.0') as SemVer}
  }

  const retval = await exec.exec(`conan`, ['--version'], true)
  const output = retval.stdout.split(' ')
  const version = semver.coerce(output[output.length - 1])

  core.info(`Detected version: ${version}`)

  return {
    available: retval.stderr === '' && retval.success,
    version: version as SemVer
  }
}
