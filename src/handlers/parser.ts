const TIME_REGEX = /T(\d{2}:\d{2})/
const PREFIX_COLON_REGEX = /^[:：]\s*/
const FIELD_SEPARATOR = '\u001F'

function isDateInRange(authorDate: string, startDate: string, endDate: string | null): boolean {
  const commitDate = authorDate.slice(0, 10)

  if (endDate)
    return commitDate >= startDate && commitDate <= endDate

  return commitDate >= startDate
}

export function parseCommits(
  logOutput: string,
  prefixes: string[],
  showTime: boolean,
  startDate: string,
  endDate: string | null
): string[] {
  const lines = logOutput.split('\n')
  const commits: string[] = []

  for (const line of lines) {
    if (!line)
      continue

    const separatorIndex = line.indexOf(FIELD_SEPARATOR)
    if (separatorIndex === -1)
      continue

    const authorDate = line.slice(0, separatorIndex).trim()
    const subject = line.slice(separatorIndex + 1).trim()

    if (!authorDate || !subject)
      continue

    if (!isDateInRange(authorDate, startDate, endDate))
      continue

    if (subject.startsWith('Merge'))
      continue

    // Check prefix match if configured
    if (prefixes.length > 0) {
      const match = prefixes.find(p => subject.startsWith(p))
      if (match) {
        const content = subject.substring(match.length).replace(PREFIX_COLON_REGEX, '').trim()
        const timeMatch = authorDate.match(TIME_REGEX)
        const time = timeMatch ? timeMatch[1] : ''
        commits.push(showTime && time ? `${time} ${content}` : content)
      }
      continue
    }

    // No prefix filter, show all commits
    const timeMatch = authorDate.match(TIME_REGEX)
    const time = timeMatch ? timeMatch[1] : ''
    commits.push(showTime && time ? `${time} ${subject}` : subject)
  }

  return commits.reverse()
}
