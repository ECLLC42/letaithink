# LetAIThink environment setup

## Prereqs
- Python 3.9+ and Node 18+
- Arcade API key in `.env`

## Quickstart

### Python
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r python/requirements.txt
python python/main.py
```

### TypeScript
```bash
cd ts
npm install
npm run build
ARCADE_API_KEY=... node dist/index.js
```

### Env
Edit `.env` and set:
- ARCADE_API_KEY
- OPENAI_API_KEY

### Python version
- agents-arcade currently requires Python 3.10+ due to modern typing usage. If you are on Python 3.9, either upgrade to 3.10+ or skip Python execution and use the TS example.

## Ontologies

- Capabilities schema: `ontologies/capabilities.schema.json`
- Example: `ontologies/capabilities.example.json`
- Python loader: `python/capabilities.py` (uses `CAPABILITIES_FILE` if set, else falls back to embedded defaults)
- TypeScript types/defaults: `ts/src/ontologies/capabilities.ts`
- Tool policies example: `ontologies/tool_policies.example.json`
- Tools ontology example: `ontologies/tools.example.json`

Optionally set a custom capabilities file path:
```bash
export CAPABILITIES_FILE="/absolute/path/to/your/capabilities.json"
```

## Orchestration
- Role agents and approval gates are wired in TS. Run the pipeline after setting env:
```bash
cd ts && npm run build && node dist/index.js
```

