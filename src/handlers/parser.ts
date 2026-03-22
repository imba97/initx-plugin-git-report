const TIME_REGEX = /(\d{2}:\d{2}):\d{2}/
const PREFIX_COLON_REGEX = /^[:：]\s*/

export function parseCommits(logOutput: string, prefixes: string[], showTime: boolean): string[] {
  const lines = logOutput.split('\n')
  const commits: string[] = []
  let currentTime = ''

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines, commit hash, author
    if (!trimmed || trimmed.startsWith('commit ') || trimmed.startsWith('Author:'))
      continue

    // Extract commit time
    if (trimmed.startsWith('Date:')) {
      const match = trimmed.match(TIME_REGEX)
      if (match && showTime)
        currentTime = match[1]
      continue
    }

    // Skip merge commits
    if (trimmed.startsWith('Merge')) {
      currentTime = ''
      continue
    }

    // Check prefix match if configured
    if (prefixes.length > 0) {
      const match = prefixes.find(p => trimmed.startsWith(p))
      if (match) {
        const content = trimmed.substring(match.length).replace(PREFIX_COLON_REGEX, '').trim()
        commits.push(showTime && currentTime ? `${currentTime} ${content}` : content)
      }
      currentTime = ''
      continue
    }

    // No prefix filter, show all commits
    commits.push(showTime && currentTime ? `${currentTime} ${trimmed}` : trimmed)
    currentTime = ''
  }

  return commits.reverse()
}
