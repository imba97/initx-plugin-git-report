export interface Store {
  name: string
  email: string
  prefix: string[]
}

export type StoreKey = keyof Store
