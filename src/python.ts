import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {ExecOptions} from '@actions/exec'
import * as semver from 'semver'
import {SemVer} from 'semver'

export interface AvailableResult {
  available: boolean
  version: SemVer
}

export async function isAvailable(): Promise<AvailableResult> {
  let stdout = ''
  let stderr = ''
  const options: ExecOptions = {
    silent: true,
    ignoreReturnCode: true
  }
  options.listeners = {
    stdout: (data: Buffer) => {
      stdout += data.toString()
    },
    stderr: (data: Buffer) => {
      stderr += data.toString()
    }
  }

  const returnCode: number = await exec.exec(`python`, ['--version'], options)

  stderr.trim() // Shutup linter!
  const version = semver.coerce(stdout.trim().split(' ')[-1])

  core.info(`Version check output: ${stdout}`)

  return {
    available: returnCode === 0,
    version: version as SemVer
  }
}
