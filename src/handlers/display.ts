import { log } from '@initx-plugin/utils'

export function displayCommits(projectPath: string, commits: string[]) {
  if (commits.length === 0) {
    log.info('No matching commits found')
    return
  }

  const projectName = projectPath.split('/').pop() || projectPath.split('\\').pop() || 'project'
  console.log(`\n${projectName}`)
  commits.forEach((commit) => {
    console.log(`- ${commit}`)
  })
  console.log()
}
