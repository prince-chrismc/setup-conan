import * as core from '@actions/core'
import * as python from './python'
import * as conan from './conan'

async function run(): Promise<void> {
  try {
    const py: string = core.getInput('python') || 'python3'
    core.debug(`Using ${py} for Conan...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    core.startGroup(`👀 Looking up Python`)
    const available = await python.isAvailable(py)
    if (available.available) {
      core.info(`Found a python version ${available.version}`)
    } else {
      core.setFailed(`Did not find a suitable version of python!`)
      return
    }
    core.endGroup()

    core.startGroup(`👀 Looking up Conan`)
    const client = await conan.isAvailable(py)
    if (client.available) {
      core.info(`Found conan ${client.version}`)
    } else {
      core.setFailed(`Did not find a suitable version of conan!`)
      return
    }
    core.endGroup()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
