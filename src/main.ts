import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import {wait} from './wait'
import {isAvailable} from './python'

async function run(): Promise<void> {
  try {
    const allPythonVersions = tc.findAllVersions('python')
    core.info(`Versions of python available: ${allPythonVersions}`)

    const available = await isAvailable()
    if (available) {
      core.info(`Found a python version`)
    } else {
      core.setFailed(`Did not find a suitable version of python!`)
    }

    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
