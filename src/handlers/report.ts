import type { InitxContext } from '@initx-plugin/core'
import type { Store } from '../types'
import { execSync } from 'node:child_process'
import process from 'node:process'
import { c, loadingFunction, logger } from '@initx-plugin/utils'
import { displayCommits } from './display'
import { parseCommits } from './parser'
import { getDateDaysAgo } from './utils'

export interface ReportRange {
  displayDate: string
  startDate: string
  endDate: string | null
}

export interface GenerateReportOptions {
  projectPath?: string
  silent?: boolean
}

export interface ReportResult {
  displayDate: string
  commits: string[]
  projectPath: string
}

function getReportRange(days: number, date: string | null): ReportRange {
  let displayDate: string
  let startDate: string
  let endDate: string | null = null

  if (date) {
    startDate = date
    endDate = date
    displayDate = date
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

    startDate = getDateDaysAgo(effectiveDays)
    if (beforeEndOfDay) {
      endDate = startDate
    }
    displayDate = startDate
  }

  return {
    displayDate,
    startDate,
    endDate
  }
}

export async function generateReport(
  ctx: InitxContext<Store>,
  days: number,
  date: string | null,
  showTime: boolean = false,
  options: GenerateReportOptions = {}
): Promise<ReportResult | null> {
  const { name, email, prefix } = ctx.store
  const { projectPath = process.cwd(), silent = false } = options
  const { displayDate, startDate, endDate } = getReportRange(days, date)

  try {
    if (silent) {
      await c('git fetch', [], { cwd: projectPath })
    }
    else {
      await loadingFunction(
        'Fetching git data...',
        () => c('git fetch', [], { cwd: projectPath })
      )
    }
  }
  catch {
    logger.warn('git fetch failed, using local data')
  }

  const command = `git log --author="${name} <${email}>" --pretty=format:"%aI%x1F%s"`

  try {
    const result = execSync(command, {
      cwd: projectPath,
      encoding: 'utf-8'
    })

    const commits = parseCommits(result, prefix, showTime, startDate, endDate)
    if (!silent) {
      displayCommits(commits, displayDate)
    }

    return {
      displayDate,
      commits,
      projectPath
    }
  }
  catch {
    logger.error('Failed to get git log')
    return null
  }
}
