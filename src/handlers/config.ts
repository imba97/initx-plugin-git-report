import type { InitxContext } from '@initx-plugin/core'
import type { Store } from '../types'
import { log } from '@initx-plugin/utils'

const NOT_SET = '(not set)'

export async function handleConfig(ctx: InitxContext<Store>, ...args: string[]) {
  const [action, key, value] = args

  if (action === 'list') {
    log.info('Current configuration:')
    console.log(`  name: ${ctx.store.name || NOT_SET}`)
    console.log(`  email: ${ctx.store.email || NOT_SET}`)
    console.log(`  prefix: ${ctx.store.prefix.length > 0 ? ctx.store.prefix.join(', ') : NOT_SET}`)
    return
  }

  if (action === 'set') {
    if (key === 'prefix')
      ctx.store.prefix = (value || '').split(',').map(p => p.trim()).filter(p => p)
    else if (key === 'name')
      ctx.store.name = value
    else if (key === 'email')
      ctx.store.email = value
    log.success(`Set ${key}: ${value}`)
    return
  }

  if (action === 'get') {
    const value = key === 'prefix'
      ? ctx.store.prefix.join(', ')
      : key === 'name'
        ? ctx.store.name
        : ctx.store.email
    console.log(value || NOT_SET)
  }
}
