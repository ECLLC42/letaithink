from __future__ import annotations

import json
import os
from typing import List, Optional

from pydantic import BaseModel, Field


class SubCapability(BaseModel):
    key: str
    name: str
    description: str
    requiresConsent: bool = False
    toolkits: List[str] = Field(default_factory=list)


class Capability(BaseModel):
    key: str
    name: str
    description: str
    subCapabilities: List[SubCapability] = Field(default_factory=list)


class CapabilitiesOntology(BaseModel):
    capabilities: List[Capability]


DEFAULT_CAPABILITIES: CapabilitiesOntology = CapabilitiesOntology(
    capabilities=[
        Capability(
            key="research",
            name="Research",
            description="Web research, scraping, and optional social signals.",
            subCapabilities=[
                SubCapability(key="web_search", name="Web search", description="Search the web via internal search APIs"),
                SubCapability(key="web_scrape", name="Web scrape", description="Fetch and parse pages with safety filters"),
                SubCapability(key="social_signals", name="Social signals (optional)", description="Read LinkedIn/X for public signals (user-consented)", requiresConsent=True, toolkits=["linkedin", "x"]),
            ],
        ),
        Capability(
            key="repo_ci",
            name="Repo/CI",
            description="Repository operations and CI orchestration.",
            subCapabilities=[
                SubCapability(key="create_repo", name="Create repo", description="Create repositories and seed defaults", requiresConsent=True, toolkits=["github"]),
                SubCapability(key="branches_prs", name="Branches & PRs", description="Open branches, commit changes, and file PRs", requiresConsent=True, toolkits=["github"]),
                SubCapability(key="trigger_ci", name="Trigger CI", description="Trigger CI pipelines and monitor runs", requiresConsent=True, toolkits=["github"]),
                SubCapability(key="fetch_artifacts", name="Fetch artifacts", description="Download build/test artifacts for analysis", requiresConsent=True, toolkits=["github"]),
            ],
        ),
        Capability(
            key="deploy",
            name="Deploy",
            description="Provision environments, manage env vars, rollbacks, health checks.",
            subCapabilities=[
                SubCapability(key="provision_envs", name="Provision envs", description="Create staging/prod targets", requiresConsent=True, toolkits=["vercel", "render", "fly"]),
                SubCapability(key="manage_env_vars", name="Manage env vars", description="Set and rotate environment variables", requiresConsent=True, toolkits=["vercel", "render", "fly"]),
                SubCapability(key="health_checks", name="Health checks", description="Run post-deploy health checks and roll back on failure", requiresConsent=True, toolkits=["vercel", "render", "fly"]),
            ],
        ),
        Capability(
            key="database",
            name="Database",
            description="Database setup, migrations, seeds, secret rotation.",
            subCapabilities=[
                SubCapability(key="create_db", name="Create DB", description="Provision databases for environments", requiresConsent=True),
                SubCapability(key="migrations", name="Migrations", description="Create and run migrations via CI", toolkits=["github"]),
                SubCapability(key="seed_data", name="Seed data", description="Seed initial data and fixtures", toolkits=["github"]),
                SubCapability(key="rotate_secrets", name="Rotate secrets", description="Rotate DB credentials and connection strings", requiresConsent=True),
            ],
        ),
        Capability(
            key="qa",
            name="QA",
            description="End-to-end tests (Playwright) and performance checks.",
            subCapabilities=[
                SubCapability(key="run_e2e", name="Run E2E", description="Execute Playwright E2E suites and collect results", toolkits=["github"]),
                SubCapability(key="perf_checks", name="Performance checks", description="Run perf checks and compare to baselines", toolkits=["github"]),
            ],
        ),
        Capability(
            key="comms",
            name="Comms",
            description="Slack/Email notifications and calendar scheduling.",
            subCapabilities=[
                SubCapability(key="send_updates", name="Send updates", description="Send updates via Slack and Email", requiresConsent=True, toolkits=["slack", "google"]),
                SubCapability(key="calendar_scheduling", name="Calendar scheduling", description="Set up calendar events and reminders", requiresConsent=True, toolkits=["google"]),
            ],
        ),
        Capability(
            key="content",
            name="Content",
            description="Generate README/landing/blog content.",
            subCapabilities=[
                SubCapability(key="generate_readme", name="Generate README", description="Draft and update README docs"),
                SubCapability(key="landing_copy", name="Landing copy", description="Create landing page copy"),
                SubCapability(key="blog_posts", name="Blog posts", description="Write initial blog articles"),
            ],
        ),
    ]
)


def load_capabilities_from_file(path: Optional[str] = None) -> CapabilitiesOntology:
    """Load capabilities ontology from JSON file.

    If no path is supplied and the CAPABILITIES_FILE env var is not set or
    points to a non-existent file, the embedded DEFAULT_CAPABILITIES is used.
    """
    file_path = path or os.environ.get("CAPABILITIES_FILE")
    if file_path and os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        return CapabilitiesOntology.model_validate(data)
    return DEFAULT_CAPABILITIES


