export type SubCapability = {
  key: string
  name: string
  description: string
  requiresConsent?: boolean
  toolkits?: string[]
}

export type Capability = {
  key: string
  name: string
  description: string
  subCapabilities: SubCapability[]
}

export type CapabilitiesOntology = {
  capabilities: Capability[]
}

export const defaultCapabilities: CapabilitiesOntology = {
  capabilities: [
    {
      key: 'research',
      name: 'Research',
      description: 'Web research, scraping, and optional social signals.',
      subCapabilities: [
        { key: 'web_search', name: 'Web search', description: 'Search the web via internal search APIs' },
        { key: 'web_scrape', name: 'Web scrape', description: 'Fetch and parse pages with safety filters' },
        { key: 'social_signals', name: 'Social signals (optional)', description: 'Read LinkedIn/X for public signals (user-consented)', requiresConsent: true, toolkits: ['linkedin', 'x'] },
      ],
    },
    {
      key: 'repo_ci',
      name: 'Repo/CI',
      description: 'Repository operations and CI orchestration.',
      subCapabilities: [
        { key: 'create_repo', name: 'Create repo', description: 'Create repositories and seed defaults', requiresConsent: true, toolkits: ['github'] },
        { key: 'branches_prs', name: 'Branches & PRs', description: 'Open branches, commit changes, and file PRs', requiresConsent: true, toolkits: ['github'] },
        { key: 'trigger_ci', name: 'Trigger CI', description: 'Trigger CI pipelines and monitor runs', requiresConsent: true, toolkits: ['github'] },
        { key: 'fetch_artifacts', name: 'Fetch artifacts', description: 'Download build/test artifacts for analysis', requiresConsent: true, toolkits: ['github'] },
      ],
    },
    {
      key: 'deploy',
      name: 'Deploy',
      description: 'Provision environments, manage env vars, rollbacks, health checks.',
      subCapabilities: [
        { key: 'provision_envs', name: 'Provision envs', description: 'Create staging/prod targets', requiresConsent: true, toolkits: ['vercel', 'render', 'fly'] },
        { key: 'manage_env_vars', name: 'Manage env vars', description: 'Set and rotate environment variables', requiresConsent: true, toolkits: ['vercel', 'render', 'fly'] },
        { key: 'health_checks', name: 'Health checks', description: 'Run post-deploy health checks and roll back on failure', requiresConsent: true, toolkits: ['vercel', 'render', 'fly'] },
      ],
    },
    {
      key: 'database',
      name: 'Database',
      description: 'Database setup, migrations, seeds, secret rotation.',
      subCapabilities: [
        { key: 'create_db', name: 'Create DB', description: 'Provision databases for environments', requiresConsent: true },
        { key: 'migrations', name: 'Migrations', description: 'Create and run migrations via CI', toolkits: ['github'] },
        { key: 'seed_data', name: 'Seed data', description: 'Seed initial data and fixtures', toolkits: ['github'] },
        { key: 'rotate_secrets', name: 'Rotate secrets', description: 'Rotate DB credentials and connection strings', requiresConsent: true },
      ],
    },
    {
      key: 'qa',
      name: 'QA',
      description: 'End-to-end tests (Playwright) and performance checks.',
      subCapabilities: [
        { key: 'run_e2e', name: 'Run E2E', description: 'Execute Playwright E2E suites and collect results', toolkits: ['github'] },
        { key: 'perf_checks', name: 'Performance checks', description: 'Run perf checks and compare to baselines', toolkits: ['github'] },
      ],
    },
    {
      key: 'comms',
      name: 'Comms',
      description: 'Slack/Email notifications and calendar scheduling.',
      subCapabilities: [
        { key: 'send_updates', name: 'Send updates', description: 'Send updates via Slack and Email', requiresConsent: true, toolkits: ['slack', 'google'] },
        { key: 'calendar_scheduling', name: 'Calendar scheduling', description: 'Set up calendar events and reminders', requiresConsent: true, toolkits: ['google'] },
      ],
    },
    {
      key: 'content',
      name: 'Content',
      description: 'Generate README/landing/blog content.',
      subCapabilities: [
        { key: 'generate_readme', name: 'Generate README', description: 'Draft and update README docs' },
        { key: 'landing_copy', name: 'Landing copy', description: 'Create landing page copy' },
        { key: 'blog_posts', name: 'Blog posts', description: 'Write initial blog articles' },
      ],
    },
  ],
}


