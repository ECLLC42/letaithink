import React, { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'planning' | 'research' | 'architecture' | 'development' | 'testing' | 'deployment' | 'complete';
  progress: number;
  currentPhase: string;
  estimatedTime: string;
  agents: Array<{
    name: string;
    status: 'idle' | 'working' | 'complete' | 'error';
    currentTask: string;
  }>;
}

interface ProjectDashboardProps {
  projectId: string;
  onBack: () => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjectStatus = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/status`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else {
          throw new Error('Failed to fetch project status');
        }
      } catch (err) {
        console.error('Error fetching project status:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectStatus();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchProjectStatus, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={onBack} className="btn-primary">Go Back</button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
        <button onClick={onBack} className="btn-primary mt-4">Go Back</button>
      </div>
    );
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      case 'architecture': return 'bg-indigo-100 text-indigo-800';
      case 'development': return 'bg-yellow-100 text-yellow-800';
      case 'testing': return 'bg-orange-100 text-orange-800';
      case 'deployment': return 'bg-red-100 text-red-800';
      case 'complete': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-100 text-green-800';
      case 'complete': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Projects</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
          <p className="text-sm text-gray-500 mt-1">Est. {project.estimatedTime}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Project Progress</h2>
          <span className="text-2xl font-bold text-primary-600">{Math.round(project.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <p className="text-gray-600 text-center">{project.currentPhase}</p>
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {project.agents.map((agent, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAgentStatusColor(agent.status)}`}>
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600">{agent.currentTask}</p>
            
            {/* Agent-specific progress indicators */}
            {agent.status === 'working' && (
              <div className="mt-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Project Details */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Project Type</h3>
            <p className="text-gray-900">{project.type}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Project ID</h3>
            <p className="text-gray-900 font-mono text-sm">{project.id}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Current Phase</h3>
            <p className="text-gray-900">{project.currentPhase}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Estimated Completion</h3>
            <p className="text-gray-900">{project.estimatedTime}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {project.status === 'complete' && (
        <div className="text-center mt-8">
          <button className="btn-primary text-lg px-8 py-4 mr-4">
            🚀 Deploy to Production
          </button>
          <button className="btn-secondary text-lg px-8 py-4">
            📊 View Analytics
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectDashboard;
