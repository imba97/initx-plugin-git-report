import type { InitxContext } from '@initx-plugin/core'
import type { Store, StoreKey } from '../types'
import { logger } from '@initx-plugin/utils'
import { DEFAULT_STORE, NOT_SET } from '../constants'

const SET_HANDLERS: Partial<Record<StoreKey, (store: Store, value: string) => void>> = {
  prefix: (store, value) => { store.prefix = value.split(',').map(p => p.trim()).filter(Boolean) }
}

const DISPLAY_FORMATTERS: Partial<Record<StoreKey, (value: any) => string>> = {
  prefix: value => (value as string[]).length > 0 ? (value as string[]).join(', ') : NOT_SET
}

export async function handleConfig(ctx: InitxContext<Store>, ...args: string[]) {
  const [action, key, value] = args
  const storeKey = key as StoreKey

  if (action === 'list') {
    logger.info('Current configuration:')
    for (const k of ['name', 'email', 'prefix'] as StoreKey[]) {
      const rawValue = ctx.store[k]
      const formatter = DISPLAY_FORMATTERS[k]
      const displayValue = formatter ? formatter(rawValue) : (rawValue || NOT_SET)
      console.log(`  ${k}: ${displayValue}`)
    }
    return
  }

  if (action === 'set' && storeKey in ctx.store) {
    const handler = SET_HANDLERS[storeKey]
    if (handler)
      handler(ctx.store, value || '')
    else
      (ctx.store[storeKey] as string) = value || ''
    logger.success(`Set ${key}: ${value}`)
    return
  }

  if (action === 'remove' && storeKey in ctx.store) {
    (ctx.store[storeKey] as any) = DEFAULT_STORE[storeKey]
    logger.success(`Removed ${key}, restored to default`)
    return
  }

  if (action === 'get' && storeKey in ctx.store) {
    const formatter = DISPLAY_FORMATTERS[storeKey]
    const rawValue = ctx.store[storeKey]
    const displayValue = formatter ? formatter(rawValue) : (rawValue || NOT_SET)
    console.log(displayValue)
  }
}
