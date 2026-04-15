import { basename } from 'node:path'
import { logger } from '@initx-plugin/utils'

export interface ProjectReportResult {
  name: string
  path: string
  commits: string[]
}

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

export function displayProjectReports(displayDate: string, reports: ProjectReportResult[]) {
  const matchedReports = reports.filter(report => report.commits.length > 0)

  if (matchedReports.length === 0) {
    logger.info('No matching commits found')
    return
  }

  console.log(`\n${displayDate}\n`)

  matchedReports.forEach((report) => {
    console.log(report.name || basename(report.path))
    report.commits.forEach((commit) => {
      console.log(`- ${commit}`)
    })

    console.log()
  })
}
