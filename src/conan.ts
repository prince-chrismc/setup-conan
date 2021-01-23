import * as core from '@actions/core'
import * as semver from 'semver'
import {SemVer} from 'semver'

import * as exec from './util/exec'

export interface AvailableResult {
  available: boolean
  version: SemVer
}

export async function isAvailable(): Promise<AvailableResult> {
  const retval = await exec.exec(`conan`, ['--version'], true)
  const output = retval.stdout.split(' ')
  const version = semver.coerce(output[output.length - 1])

  core.info(`Detected version: ${version}`)

  return {
    available: retval.stderr === '' && retval.success,
    version: version as SemVer
  }
}
