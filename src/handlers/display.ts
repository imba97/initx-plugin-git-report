import { logger } from '@initx-plugin/utils'

export function displayCommits(projectPath: string, commits: string[], displayDate: string) {
  if (commits.length === 0) {
    logger.info('No matching commits found')
    return
  }

  console.log(`\n${displayDate}`)
  commits.forEach((commit) => {
    console.log(`- ${commit}`)
  })
  console.log()
}
