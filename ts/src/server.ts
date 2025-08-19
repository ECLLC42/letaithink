import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { runPipelineWithHandoffs } from './orchestrator/pipeline';
import Arcade from '@arcadeai/arcadejs';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// API Routes
app.post('/api/projects', async (req, res) => {
  try {
    const { name, type, description, userId } = req.body;
    
    if (!name || !userId) {
      return res.status(400).json({ error: 'Project name and userId are required' });
    }

    console.log(`🚀 Creating project: ${name} for user: ${userId}`);
    
    // Check if API key is available
    if (!process.env.ARCADE_API_KEY) {
      console.error('❌ ARCADE_API_KEY not found in environment');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing API key',
        details: 'ARCADE_API_KEY environment variable is not set'
      });
    }
    
    // Initialize Arcade client
    const client = new Arcade({ apiKey: process.env.ARCADE_API_KEY });
    
    // Run the actual pipeline with your agent system
    const result = await runPipelineWithHandoffs(client, userId, name);
    
    console.log(`✅ Project created successfully: ${result.sessionId}`);
    
    res.json({
      id: result.sessionId,
      name,
      type,
      description,
      status: result.status,
      sessionId: result.sessionId,
      message: 'Project created and pipeline started successfully!'
    });
    
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({ 
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get('/api/projects/:projectId/status', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // For now, return mock status - you can integrate with your actual state store
    const mockStatus = {
      id: projectId,
      name: 'Project in Progress',
      status: 'active',
      progress: Math.floor(Math.random() * 100),
      currentPhase: 'Development',
      agents: [
        { name: 'Orchestrator', status: 'working', currentTask: 'Coordinating project phases' },
        { name: 'Researcher', status: 'complete', currentTask: 'Research completed' },
        { name: 'Architect', status: 'working', currentTask: 'Designing system architecture' },
        { name: 'Coder', status: 'idle', currentTask: 'Waiting for architecture' },
        { name: 'QA', status: 'idle', currentTask: 'Waiting for development' },
        { name: 'Publisher', status: 'idle', currentTask: 'Waiting for testing' },
        { name: 'Marketer', status: 'idle', currentTask: 'Waiting for deployment' }
      ]
    };
    
    res.json(mockStatus);
    
  } catch (error) {
    console.error('❌ Error getting project status:', error);
    res.status(500).json({ error: 'Failed to get project status' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`🔑 ARCADE_API_KEY: ${process.env.ARCADE_API_KEY ? '✅ Set' : '❌ Missing'}`);
});
