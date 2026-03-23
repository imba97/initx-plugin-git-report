import type { InitxContext } from '@initx-plugin/core'
import type { Store } from '../types'
import { execSync } from 'node:child_process'
import process from 'node:process'
import { logger } from '@initx-plugin/utils'
import { displayCommits } from './display'
import { parseCommits } from './parser'
import { getDateDaysAgo } from './utils'

export async function generateReport(ctx: InitxContext<Store>, days: number, date: string | null, showTime: boolean = false) {
  const { name, email, prefix } = ctx.store
  const projectPath = process.cwd()

  try {
    execSync('git fetch', { cwd: projectPath, stdio: 'ignore' })
  }
  catch {
    logger.warn('git fetch failed, using local data')
  }

  let command = `git log --author="${name} <${email}>" `

  if (date) {
    command += `--after="${date} 00:00:00" --before="${date} 23:59:59"`
  }
  else {
    const effectiveDays = days === 0 || days === 1 ? 0 : days - 1
    const startDate = getDateDaysAgo(effectiveDays)
    command += `--after="${startDate} 00:00:00"`
    if (effectiveDays === 0) {
      command += ` --before="${startDate} 23:59:59"`
    }
  }

  try {
    const result = execSync(command, {
      cwd: projectPath,
      encoding: 'utf-8'
    })

    const commits = parseCommits(result, prefix, showTime)
    displayCommits(projectPath, commits)
  }
  catch {
    logger.error('Failed to get git log')
  }
}
