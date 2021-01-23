import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {ExecOptions} from '@actions/exec'
import * as tc from '@actions/tool-cache'
import * as semver from 'semver'
import {SemVer} from 'semver'

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

  const allPythonVersions = tc.findAllVersions('PyPy')
  core.info(`Versions of PyPy from tool-cache: ${allPythonVersions}`)

  const returnCode: number = await exec.exec(
    pythonCommand,
    ['--version'],
    options
  )
  const output = stdout.trim().split(' ')
  const version = semver.coerce(output[output.length - 1])

  core.info(`Version check output: ${stdout}`)

  return {
    available: stderr === '' && returnCode === 0,
    version: version as SemVer
  }
}
