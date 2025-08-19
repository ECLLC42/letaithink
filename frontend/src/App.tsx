import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Features from './components/Features';
import Demo from './components/Demo';
import ProjectCreator from './components/ProjectCreator';
import ProjectDashboard from './components/ProjectDashboard';
import Footer from './components/Footer';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'create' | 'dashboard'>('home');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const handleProjectCreated = (projectId: string) => {
    setCurrentProjectId(projectId);
    setCurrentView('dashboard');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentProjectId(null);
  };

  const handleStartBuilding = () => {
    setCurrentView('create');
  };

  if (currentView === 'create') {
    return (
      <div className="App">
        <Navigation />
        <main className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
          <ProjectCreator onProjectCreated={handleProjectCreated} />
        </main>
        <Footer />
      </div>
    );
  }

  if (currentView === 'dashboard' && currentProjectId) {
    return (
      <div className="App">
        <Navigation />
        <main className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
          <ProjectDashboard projectId={currentProjectId} onBack={handleBackToHome} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App">
      <Navigation />
      <main>
        <Hero onStartBuilding={handleStartBuilding} />
        <div id="features">
          <Features />
        </div>
        <div id="demo">
          <Demo onStartBuilding={handleStartBuilding} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
