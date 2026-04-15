import type { Store } from './types'

export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export const NOT_SET = '(not set)'

export const DEFAULT_STORE: Store = {
  name: '',
  email: '',
  prefix: [],
  projects: []
}
