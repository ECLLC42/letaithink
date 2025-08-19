import React, { useState } from 'react';

interface ProjectCreatorProps {
  onProjectCreated: (projectId: string) => void;
}

const ProjectCreator: React.FC<ProjectCreatorProps> = ({ onProjectCreated }) => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('web-app');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const projectTypes = [
    { value: 'web-app', label: 'Web Application', icon: '🌐' },
    { value: 'mobile-app', label: 'Mobile App', icon: '📱' },
    { value: 'api-service', label: 'API Service', icon: '🔌' },
    { value: 'data-pipeline', label: 'Data Pipeline', icon: '📊' },
    { value: 'ai-tool', label: 'AI Tool', icon: '🤖' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      // Call the real backend API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          type: projectType,
          description,
          userId: 'demo-user-123'
        }),
      });

      if (response.ok) {
        const project = await response.json();
        console.log('✅ Project created:', project);
        onProjectCreated(project.id);
        
        // Reset form
        setProjectName('');
        setProjectType('web-app');
        setDescription('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }
    } catch (err) {
      console.error('❌ Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Start Your New Project
        </h2>
        <p className="text-gray-600">
          Let our AI agents build your MVP from idea to deployment
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            placeholder="e.g., runner-habits, task-manager, ai-chatbot"
            required
          />
        </div>

        {/* Project Type */}
        <div>
          <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 mb-2">
            Project Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                  projectType === type.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="projectType"
                  value={type.value}
                  checked={projectType === type.value}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{type.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                </div>
                {projectType === type.value && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Describe what you want to build..."
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isCreating}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
            isCreating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 transform hover:scale-105'
          }`}
        >
          {isCreating ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creating Project...</span>
            </div>
          ) : (
            '🚀 Create Project & Start Building'
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-white text-xs">ℹ</span>
          </div>
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">What happens next?</p>
            <p>Our AI agents will automatically:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Research market and competitors</li>
              <li>Design system architecture</li>
              <li>Set up repository and CI/CD</li>
              <li>Deploy to staging environment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreator;
