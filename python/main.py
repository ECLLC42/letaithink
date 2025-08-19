import os, asyncio
from dotenv import load_dotenv

# External SDKs
from agents import Agent, Runner
from arcadepy import AsyncArcade
# Import agents_arcade only if available (requires Python 3.10+ per upstream typing)
try:
    from agents_arcade import get_arcade_tools
    from agents_arcade.errors import AuthorizationError
except Exception:
    get_arcade_tools = None  # type: ignore
    class AuthorizationError(Exception):
        ...

async def main():
    load_dotenv()
    # Arcade client will read ARCADE_API_KEY from environment by default
    client = AsyncArcade(api_key=os.environ["ARCADE_API_KEY"])
    if get_arcade_tools is None:
        raise RuntimeError("agents-arcade is not available on this Python version. Please use Python 3.10+.")
    github_tools = await get_arcade_tools(client, toolkits=['github'])
    coder = Agent(
        name='Coder',
        instructions=(
            """
Role: Senior Coder Agent.
Goal: Scaffold a new repository 'runner-habits' with a Next.js (App Router, TypeScript) frontend and FastAPI backend, seed CI, and open a PR.

Policies & constraints:
- Use only your granted tools (GitHub toolkit); operate with least privilege.
- Make all code changes via branches and PRs; do not force-push to default.
- Destructive actions (delete, revoke, rollback) require explicit approval. If needed, stop and ask.
- If a tool requires consent, surface the authorization link and pause.
- Keep outputs concise and action-focused; no internal chain-of-thought.

Process:
1) Produce a short, bulleted plan for the task.
2) Execute the plan using tools, opening a branch and PR.
3) Set up CI (e.g., GitHub Actions) for build/test.
4) Validate that CI has triggered successfully.

Return structured output as JSON in a fenced block with keys: plan, repo_url, pr_url, ci_status, changes_summary, next_steps.
            """
        ),
        model='gpt-4o-mini',
        tools=github_tools,
    )
    try:
        r1 = await Runner.run(starting_agent=coder, input="Create a new repo 'runner-habits' with Next.js + FastAPI skeleton, open PR.", context={'user_id': 'user-123'})
        print(r1.final_output)
    except AuthorizationError as e:
        authorize_url = getattr(e, 'authorize_url', None)
        if authorize_url:
            print('Authorization required. Visit this URL to authorize:', authorize_url)
        else:
            print('Authorization required:', e)

if __name__ == '__main__':
    asyncio.run(main())
