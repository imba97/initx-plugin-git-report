import type { InitxContext } from '@initx-plugin/core'
import type { ProjectItem, Store } from '../types'
import { stat } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import { logger } from '@initx-plugin/utils'
import { checkbox, input } from '@inquirer/prompts'

function resolveProjectPath(rawPath: string | undefined): string {
  return resolve(process.cwd(), rawPath || '.')
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const status = await stat(path)
    return status.isDirectory()
  }
  catch {
    return false
  }
}

function listProjects(projects: ProjectItem[]) {
  if (projects.length === 0) {
    logger.info('No projects configured')
    return
  }

  logger.info('Current projects:')
  projects.forEach((project, index) => {
    console.log(`  [${index + 1}] ${project.name} - ${project.path}`)
  })
}

async function addProject(ctx: InitxContext<Store>, rawPath: string | undefined) {
  const projectPath = resolveProjectPath(rawPath)
  if (!(await isDirectory(projectPath))) {
    logger.error(`Directory not found: ${projectPath}`)
    return
  }

  if (ctx.store.projects.some(project => project.path === projectPath)) {
    logger.warn(`Project already exists: ${projectPath}`)
    return
  }

  const defaultName = basename(projectPath)
  const projectName = (await input({
    message: 'Project name:',
    default: defaultName,
    validate(value) {
      return value.trim().length > 0 ? true : 'Project name cannot be empty'
    }
  })).trim()

  ctx.store.projects.push({
    name: projectName,
    path: projectPath
  })

  logger.success(`Added project: ${projectName}`)
}

function removeProjectByPath(ctx: InitxContext<Store>, rawPath: string) {
  const projectPath = resolveProjectPath(rawPath)
  const index = ctx.store.projects.findIndex(project => project.path === projectPath)
  if (index === -1) {
    logger.warn(`Project path not found: ${projectPath}`)
    return
  }

  const [removed] = ctx.store.projects.splice(index, 1)
  logger.success(`Removed project: ${removed.name}`)
}

async function removeProjectsByPrompt(ctx: InitxContext<Store>) {
  if (ctx.store.projects.length === 0) {
    logger.info('No projects configured')
    return
  }

  const selectedPaths = await checkbox<string>({
    message: 'Select projects to remove:',
    choices: ctx.store.projects.map(project => ({
      name: `${project.name} (${project.path})`,
      value: project.path
    }))
  })

  if (selectedPaths.length === 0) {
    logger.info('No project selected')
    return
  }

  const selectedSet = new Set(selectedPaths)
  const removeCount = ctx.store.projects.filter(project => selectedSet.has(project.path)).length
  ctx.store.projects = ctx.store.projects.filter(project => !selectedSet.has(project.path))
  logger.success(`Removed ${removeCount} project(s)`)
}

export async function handleProject(ctx: InitxContext<Store>, ...args: string[]) {
  const [action = 'list', path] = args

  if (action === 'list') {
    listProjects(ctx.store.projects)
    return
  }

  if (action === 'add') {
    await addProject(ctx, path)
    return
  }

  if (action === 'remove') {
    if (path) {
      removeProjectByPath(ctx, path)
      return
    }

    await removeProjectsByPrompt(ctx)
    return
  }

  logger.warn('Invalid command. Use: ix gr [list|add|remove] [path]')
}
