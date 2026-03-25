import { logger } from '@initx-plugin/utils'

function getTodayDate(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function displayCommits(projectPath: string, commits: string[]) {
  if (commits.length === 0) {
    logger.info('No matching commits found')
    return
  }

  console.log(`\n${getTodayDate()}`)
  commits.forEach((commit) => {
    console.log(`- ${commit}`)
  })
  console.log()
}
