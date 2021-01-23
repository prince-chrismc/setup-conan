import * as core from '@actions/core'
import {wait} from './wait'
import * as python from './python'

async function run(): Promise<void> {
  try {
    core.startGroup(`👀 Looking up Python`)
    const available = await python.isAvailable()
    if (available.available) {
      core.info(`Found a python version ${available.version}`)
    } else {
      core.setFailed(`Did not find a suitable version of python!`)
      return
    }
    core.endGroup()

    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    core.debug(new Date().toTimeString())
    await wait(+ms)
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
