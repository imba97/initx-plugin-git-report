import type { InitxContext, InitxMatcherRules } from '@initx-plugin/core'
import type { ProjectReportResult } from './handlers/display'
import type { Store } from './types'
import { InitxPlugin } from '@initx-plugin/core'
import { logger } from '@initx-plugin/utils'
import { DATE_REGEX, DEFAULT_STORE } from './constants'
import { handleConfig } from './handlers/config'
import { displayProjectReports } from './handlers/display'
import { handleProject } from './handlers/project'
import { generateReport } from './handlers/report'

export default class GitReportPlugin extends InitxPlugin<Store> {
  defaultStore = DEFAULT_STORE

  rules: InitxMatcherRules = [
    {
      matching: 'gr',
      description: 'generate daily git report',
      optional: [
        undefined,
        'config',
        'list',
        'add',
        'remove',
        /^\d+$/,
        DATE_REGEX
      ],
      verify(_ctx, ...args) {
        if (args[0] === 'config') {
          if (args[1] === 'list')
            return true
          if (args[1] === 'set' && ['name', 'email', 'prefix'].includes(args[2]) && args[3])
            return true
          if (args[1] === 'remove' && ['name', 'email', 'prefix'].includes(args[2]))
            return true
          if (args[1] === 'get' && args[2])
            return true
          return false
        }
        if (['list', 'add', 'remove'].includes(args[0]))
          return true
        if (args[0] === undefined)
          return true
        const days = Number(args[0])
        if (!Number.isNaN(days)) {
          return true
        }
        return DATE_REGEX.test(args[0])
      }
    }
  ]

  async handle(ctx: InitxContext<Store>, ...args: string[]) {
    const { name, email } = ctx.store

    if (args[0] === 'config') {
      await handleConfig(ctx, ...args.slice(1))
      return
    }

    if (['list', 'add', 'remove'].includes(args[0])) {
      await handleProject(ctx, ...args)
      return
    }

    if (!name || !email) {
      logger.error('Please configure name and email: ix gr config set <key> <value>')
      return
    }

    const hasTime = ctx.cliOptions.time as boolean || false

    let days = 0
    let date: string | null = null

    if (ctx.cliOptions.ago) {
      // ix gr --ago 4 → -4 (4 days ago)
      days = -Number(ctx.cliOptions.ago)
    }
    else if (DATE_REGEX.test(args[0])) {
      date = args[0]
    }
    else {
      days = args[0] === undefined ? 0 : Number(args[0])
    }

    if (ctx.cliOptions.project || ctx.cliOptions.p) {
      if (ctx.store.projects.length === 0) {
        logger.warn('No projects configured. Use: ix gr add <path>')
        return
      }

      const reports: ProjectReportResult[] = []
      let displayDate = ''

      for (const project of ctx.store.projects) {
        const result = await generateReport(ctx, days, date, hasTime, {
          projectPath: project.path,
          silent: true
        })

        if (!result) {
          logger.warn(`Skipped project: ${project.name} (${project.path})`)
          continue
        }

        displayDate = displayDate || result.displayDate
        reports.push({
          name: project.name,
          path: project.path,
          commits: result.commits
        })
      }

      if (!displayDate) {
        logger.error('Failed to generate project reports')
        return
      }

      displayProjectReports(displayDate, reports)
      return
    }

    await generateReport(ctx, days, date, hasTime)
  }
}
