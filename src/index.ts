import type { InitxContext, InitxMatcherRules } from '@initx-plugin/core'
import type { Store } from './types'
import { InitxPlugin } from '@initx-plugin/core'
import { log } from '@initx-plugin/utils'
import { handleConfig } from './handlers/config'
import { generateReport } from './handlers/report'

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export default class GitReportPlugin extends InitxPlugin<Store> {
  defaultStore = {
    name: '',
    email: '',
    prefix: ['fix', 'feat', 'perf', 'refactor']
  }

  rules: InitxMatcherRules = [
    {
      matching: 'gr',
      description: 'generate daily git report',
      optional: [
        undefined,
        'config',
        /^\d+$/,
        DATE_REGEX
      ],
      verify(_ctx, ...args) {
        if (args[0] === 'config') {
          if (args[1] === 'list')
            return true
          if (args[1] === 'set' && ['name', 'email', 'prefix'].includes(args[2]) && args[3])
            return true
          if (args[1] === 'get' && args[2])
            return true
          return false
        }
        if (args[0] === undefined)
          return true
        const days = Number(args[0])
        if (!Number.isNaN(days)) {
          if (days < 0) {
            log.error('Days cannot be negative')
            return false
          }
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

    if (!name || !email) {
      log.error('Please configure name and email: ix gr config set <key> <value>')
      return
    }

    const hasTime = ctx.cliOptions.time as boolean || false

    const days = args[0] === undefined ? 0 : Number(args[0])
    const date = DATE_REGEX.test(args[0]) ? args[0] : null

    await generateReport(ctx, days, date, hasTime)
  }
}
