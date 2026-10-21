import React from 'react';
import { ScholarshipProvider, useScholarship } from './context/ScholarshipContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScholarshipDetailModal from './components/ScholarshipDetailModal';
import SopModal from './components/SopModal';

// Pages
import Home from './pages/Home';
import Discovery from './pages/Discovery';
import Matches from './pages/Matches';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import AssistantPage from './pages/AssistantPage';

function AppContent() {
  const { currentView } = useScholarship();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home />;
      case 'discovery':
        return <Discovery />;
      case 'matches':
        return <Matches />;
      case 'profile':
        return <Profile />;
      case 'saved':
        return <Saved />;
      case 'assistant':
        return <AssistantPage />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {renderView()}
      </main>
      <Footer />
      {/* Global Modals */}
      <ScholarshipDetailModal />
      <SopModal />
    </div>
  );
}

export default function App() {
  return (
    <ScholarshipProvider>
      <AppContent />
    </ScholarshipProvider>
  );
}
