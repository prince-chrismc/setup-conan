import * as core from '@actions/core'
import * as python from './python'
import * as conan from './conan'

async function run(): Promise<void> {
  try {
    const py: string = core.getInput('python') || 'python3'
    core.debug(`Using ${py} for Conan...`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    core.startGroup(`👀 Looking up Python`)
    const pi = await python.getVersion(py)
    if (pi.success) {
      core.info(`Found a python version ${pi.version}`)
    } else {
      core.setFailed(`Did not find a suitable version of python!`)
      return
    }
    core.endGroup()

    core.startGroup(`👀 Looking up Conan`)
    const client = await conan.isAvailable(py)
    core.endGroup()

    if (!client) {
      core.startGroup(`👉 Installing Conan`)
      const version = core.getInput('version') || 'latest'
      await conan.install(version, py)
      core.endGroup()
    }

    conan.getVersion()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
