import type { InitxContext } from '@initx-plugin/core'
import type { Store } from '../types'
import { execSync } from 'node:child_process'
import process from 'node:process'
import { c, loadingFunction, logger } from '@initx-plugin/utils'
import { displayCommits } from './display'
import { parseCommits } from './parser'
import { getDateDaysAgo } from './utils'

export async function generateReport(ctx: InitxContext<Store>, days: number, date: string | null, showTime: boolean = false) {
  const { name, email, prefix } = ctx.store
  const projectPath = process.cwd()

  try {
    await loadingFunction(
      'Fetching git data...',
      () => c('git fetch', [], { cwd: projectPath })
    )
  }
  catch {
    logger.warn('git fetch failed, using local data')
  }

  let command = `git log --author="${name} <${email}>" `

  if (date) {
    command += `--after="${date} 00:00:00" --before="${date} 23:59:59"`
  }
  else {
    let effectiveDays: number
    let beforeEndOfDay = false

    if (days < 0) {
      // Negative: -1 for yesterday, -2 for day before yesterday, etc.
      effectiveDays = Math.abs(days)
      beforeEndOfDay = true
    }
    else {
      // Zero, one, or positive days
      effectiveDays = days === 0 || days === 1 ? 0 : days - 1
      beforeEndOfDay = effectiveDays === 0
    }

    const startDate = getDateDaysAgo(effectiveDays)
    command += `--after="${startDate} 00:00:00"`
    if (beforeEndOfDay) {
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
