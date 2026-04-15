# initx-plugin-git-report

`initx` plugin for generating daily git commit reports.

## Features

- Generate daily git reports based on author and date
- Filter commits by custom prefixes
- Support multiple query methods (days, date)
- Support multi-project report aggregation with `-p/--project`
- Manage project list with `list/add/remove` commands
- Persistent configuration storage

## Installation

```bash
npx initx plugin add git-report
```

## Usage

### Basic Commands

```bash
# Get today's report
ix gr

# Get report for specific days (7 days ago)
ix gr 7

# Get report for specific date
ix gr 2026-03-22

# Get report with commit time
ix gr --time

# Get report for configured projects
ix gr -p
# or
ix gr --project
```

**Note:** For days parameter: `0` or `1` = today, `2` = 2 days ago, `3` = 3 days ago, etc.

### Configuration

Before using the plugin, configure your git user information:

```bash
# Set your name
ix gr config set name "Your Name"

# Set your email
ix gr config set email "your.email@example.com"

# Set commit prefixes (comma-separated)
ix gr config set prefix "feat:,fix:,docs:"

# View all configuration
ix gr config list

# Get specific configuration
ix gr config get name
ix gr config get email
ix gr config get prefix
```

### Project Management

Use project list commands to manage multi-project report targets:

```bash
# List all configured projects
ix gr list

# Add a project by relative path (current directory)
ix gr add .

# Add a project by absolute path
ix gr add /Users/you/workspace/project-a

# Remove by path
ix gr remove /Users/you/workspace/project-a

# Remove interactively (checkbox prompt)
ix gr remove
```

Stored format in plugin store:

```json
[
  { "name": "project-a", "path": "/Users/you/workspace/project-a" }
]
```

### How It Works

The plugin:
1. Runs in your current git project directory
2. Fetches latest changes from remote
3. Filters commits by your configured name and email
4. Optionally filters by configured prefixes (e.g., `feat:`, `fix:`)
5. Displays formatted report with commit messages

### Example Output

```
2026-04-15

project-a
- Add new feature for user authentication
- Fix bug in login flow

project-b
- Update documentation for API
```

## Development

Run stub

```bash
pnpm stub
```

Install plugin from current directory

```bash
ix plugin add .
```

Enjoy your plugin development!

## Documentation

- [initx](https://github.com/initx-collective/initx)

## License

MIT
