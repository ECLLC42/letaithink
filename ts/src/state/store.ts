import { Artifact, Handoff, Project, Run, Session, Tool } from './models'

export class InMemoryStore {
  projects: Map<string, Project> = new Map()
  sessions: Map<string, Session> = new Map()
  runs: Map<string, Run> = new Map()
  artifacts: Map<string, Artifact> = new Map()
  handoffs: Map<string, Handoff> = new Map()
  tools: Map<string, Tool> = new Map()

  upsertProject(project: Project): void { this.projects.set(project.id, project) }
  upsertSession(session: Session): void { this.sessions.set(session.id, session) }
  upsertRun(run: Run): void { this.runs.set(run.id, run) }
  upsertArtifact(artifact: Artifact): void { this.artifacts.set(artifact.id, artifact) }
  upsertHandoff(h: Handoff): void { this.handoffs.set(h.id, h) }
  upsertTool(t: Tool): void { this.tools.set(t.name, t) }
}

export const store = new InMemoryStore()


