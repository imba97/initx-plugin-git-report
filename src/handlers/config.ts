import type { InitxContext } from '@initx-plugin/core'
import type { Store } from '../types'
import { log } from '@initx-plugin/utils'

const NOT_SET = '(not set)'

type StoreKey = keyof Store

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
    log.info('Current configuration:')
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
    log.success(`Set ${key}: ${value}`)
    return
  }

  if (action === 'get' && storeKey in ctx.store) {
    const formatter = DISPLAY_FORMATTERS[storeKey]
    const rawValue = ctx.store[storeKey]
    const displayValue = formatter ? formatter(rawValue) : (rawValue || NOT_SET)
    console.log(displayValue)
  }
}
