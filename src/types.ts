export interface Store {
  name: string
  email: string
  prefix: string[]
  projects: ProjectItem[]
}

export type StoreKey = keyof Store

export interface ProjectItem {
  name: string
  path: string
}
