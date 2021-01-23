import * as exec from '@actions/exec'
import {ExecOptions} from '@actions/exec'

export async function isAvailable(): Promise<Boolean> {
  const options: ExecOptions = {
    silent: true,
    ignoreReturnCode: true
  }
  const returnCode: number = await exec.exec(`python`, ['--version'], options)
  return returnCode === 0
}
