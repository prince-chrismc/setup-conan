import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as io from '@actions/io'
import * as semver from 'semver'
import {SemVer} from 'semver'

import * as exec from './util/exec'
import {ExecResult} from './util/exec'
import * as python from './python'

export interface VersionResult {
  success: boolean
  version: SemVer
}

export async function isAvailable(pythonCommand: string): Promise<boolean> {
  if (python.hasModule(pythonCommand, 'conan')) {
    try {
      const conanInPath: string = await io.which('conan', true)
      core.info(`Found tool in PATH: ${conanInPath}`)

      return true
    } catch (error) {
      core.info('conan python module exists but exe is missing')
    }
  }

  return false
}

export async function getVersion(): Promise<VersionResult> {
  const retval = await exec.exec(`conan`, ['--version'], true)
  const output = retval.stdout.split(' ')
  const version = semver.coerce(output[output.length - 1])

  core.info(`Detected version: ${version}`)

  return {
    success: retval.stderr === '' && retval.success,
    version: version as SemVer
  }
}

export async function setup(pythonCommand: string): Promise<boolean> {
  if (!python.hasModule(pythonCommand, 'setuptools')) {
    core.info(`Commencing the installation for 'setuptools'`)
    const retval = await exec.exec(
      pythonCommand,
      ['-m', 'pip', 'install', 'setuptools'],
      false
    )

    return retval.success
  }

  return true
}

export async function install(
  inputVersion: string,
  pythonCommand: string
): Promise<string> {
  // TODO: verify input version against published releases

  setup(pythonCommand)

  // tc.downloadFile https://files.pythonhosted.org/packages/cf/3b/7fc6030e64609ef6ddf9a3f88c297794d59d89fd2ab13989a9aee47cad02/conan-1.33.0.tar.gz

  let retval: ExecResult
  if (inputVersion === 'latest') {
    core.info(`Processing to install the newest client version`)
    retval = await exec.exec(
      pythonCommand,
      ['-m', 'pip', 'install', '--upgrade', 'setuptools', 'conan'],
      false
    )
  } else {
    core.info(`Processing to install version: ${inputVersion}`)
    retval = await exec.exec(
      pythonCommand,
      ['-m', 'pip', 'install', `conan==${inputVersion}`],
      false
    )
  }

  if (!retval.success) {
    throw new Error('failed to install conan')
  }

  retval = await exec.exec(
    pythonCommand,
    ['-c', '"import conan as _; print(_.__path__[0])"'],
    false
  )
  if (!retval.success) {
    throw new Error('failed to get install location of conan')
  }
  const installDir = retval.stdout

  retval = await exec.exec(
    pythonCommand,
    ['-c', '"from conans import __version__ ; print(__version__)"'],
    false
  )
  if (!retval.success) {
    throw new Error('failed to get install versoion of conan')
  }
  const installVersion = retval.stdout

  return await tc.cacheDir(installDir, 'conan', installVersion)
}
