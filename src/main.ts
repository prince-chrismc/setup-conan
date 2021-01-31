import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as exec from '@actions/exec'
import * as os from 'os'
import * as path from 'path'

async function run(): Promise<void> {
  try {
    const version = '1.33.0'

    const downloadUrl = `https://github.com/conan-io/conan/archive/${version}.tar.gz`
    const downloaded = await tc.downloadTool(downloadUrl)
    core.info(`successfully downloaded ${downloadUrl}`)

    const destination = path.join(os.tmpdir(), 'source')
    core.info(`Install destination is ${destination}`)

    const extractedPath = await tc.extractTar(downloaded, destination)
    core.info(`Successfully extracted ${downloaded} to ${extractedPath}`)
    const sourcePath = path.join(extractedPath, `conan-${version}`)

    const requirementsPath = path.join(sourcePath, 'requirements.txt')
    exec.exec('pip', ['install', '-r', `${requirementsPath}`])

    os.tmpdir()
    const installPath = path.join(os.tmpdir(), 'conan')
    /*const returnCode: number = await*/ exec.exec('pip', [
      'install',
      '-v',
      '--disable-pip-version-check',
      '--root',
      `${installPath}`,
      `${sourcePath}`
    ])

    const binPath = path.join(installPath, 'bin')
    core.addPath(binPath)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
