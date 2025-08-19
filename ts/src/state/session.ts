import { Project, Session, Run, Artifact } from './models'
import { createCostTracker, CostTracker } from '../guardrails/costs'

export interface ProjectSession {
  id: string
  project: Project
  session: Session
  costTracker: CostTracker
  artifacts: Artifact[]
  currentPhase: 'intake' | 'research' | 'architecture' | 'build' | 'qa' | 'deploy' | 'marketing' | 'complete'
  status: 'active' | 'paused' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
  metadata: Record<string, any>
}

export class SessionManager {
  private sessions: Map<string, ProjectSession> = new Map()
  
  createSession(
    projectName: string,
    userId: string,
    model: string = 'gpt-4o-mini'
  ): ProjectSession {
    const sessionId = `session-${Date.now()}`
    const projectId = `project-${Date.now()}`
    
    const project: Project = {
      id: projectId,
      name: projectName,
      environments: ['staging', 'production']
    }
    
    const session: Session = {
      id: sessionId,
      projectId,
      transcript: [],
      budgetTokens: 100000
    }
    
    const costTracker = createCostTracker(sessionId, model)
    
    const projectSession: ProjectSession = {
      id: sessionId,
      project,
      session,
      costTracker,
      artifacts: [],
      currentPhase: 'intake',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        userId,
        model,
        constraints: {},
        preferences: {}
      }
    }
    
    this.sessions.set(sessionId, projectSession)
    return projectSession
  }
  
  getSession(sessionId: string): ProjectSession | undefined {
    return this.sessions.get(sessionId)
  }
  
  updateSession(
    sessionId: string, 
    updates: Partial<Pick<ProjectSession, 'currentPhase' | 'status' | 'metadata'>>
  ): ProjectSession | undefined {
    const session = this.sessions.get(sessionId)
    if (!session) return undefined
    
    Object.assign(session, updates, { updatedAt: new Date() })
    this.sessions.set(sessionId, session)
    return session
  }
  
  addTranscriptEntry(sessionId: string, agent: string, message: string): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    
    session.session.transcript.push(`${agent}: ${message}`)
    session.updatedAt = new Date()
  }
  
  addArtifact(sessionId: string, artifact: Omit<Artifact, 'id'>): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    
    const newArtifact: Artifact = {
      ...artifact,
      id: `artifact-${Date.now()}`
    }
    
    session.artifacts.push(newArtifact)
    session.updatedAt = new Date()
  }
  
  updateCosts(
    sessionId: string,
    inputTokens: number = 0,
    outputTokens: number = 0,
    toolCalls: number = 0
  ): void {
    const session = this.sessions.get(sessionId)
    if (!session) return
    
    session.costTracker = {
      ...session.costTracker,
      inputTokens: session.costTracker.inputTokens + inputTokens,
      outputTokens: session.costTracker.outputTokens + outputTokens,
      toolCalls: session.costTracker.toolCalls + toolCalls
    }
    
    // Recalculate estimated cost
    const { calculateCost } = require('../guardrails/costs')
    session.costTracker.estimatedCost = calculateCost(session.costTracker)
    
    session.updatedAt = new Date()
  }
  
  getActiveSessions(): ProjectSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active')
  }
  
  getSessionsByUser(userId: string): ProjectSession[] {
    return Array.from(this.sessions.values()).filter(s => s.metadata.userId === userId)
  }
  
  closeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    
    session.status = 'completed'
    session.updatedAt = new Date()
    this.sessions.set(sessionId, session)
    return true
  }
  
  getSessionSummary(sessionId: string): {
    id: string
    projectName: string
    currentPhase: string
    status: string
    cost: number
    artifactCount: number
    transcriptLength: number
    duration: number
  } | undefined {
    const session = this.sessions.get(sessionId)
    if (!session) return undefined
    
    const duration = session.updatedAt.getTime() - session.createdAt.getTime()
    
    return {
      id: session.id,
      projectName: session.project.name,
      currentPhase: session.currentPhase,
      status: session.status,
      cost: session.costTracker.estimatedCost,
      artifactCount: session.artifacts.length,
      transcriptLength: session.session.transcript.length,
      duration: Math.round(duration / 1000) // seconds
    }
  }
}

export const sessionManager = new SessionManager()
