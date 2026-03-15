import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Editor from './pages/Editor.jsx';
import Settings from './pages/Settings.jsx';
import Billing from './pages/Billing.jsx';
import Help from './pages/Help.jsx';
import AdminPortal from './pages/AdminPortal.jsx';
import CreatorPortal from './pages/CreatorPortal.jsx';
import AuthSelection from './pages/AuthSelection.jsx';
import Download from './pages/Download.jsx';
import { SessionProvider } from './context/SessionContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';

function App() {
  try {
    return (
      <BrowserRouter>
        <ChatProvider>
          <SessionProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/help" element={<Help />} />
              <Route path="/auth-selection" element={<AuthSelection />} />
              <Route path="/download" element={<Download />} />
              <Route path="/admin" element={<AdminPortal />} />
              <Route path="/creator" element={<CreatorPortal />} />
            </Routes>
          </SessionProvider>
        </ChatProvider>
      </BrowserRouter>
    );
  } catch (err) {
    console.error('App Crash:', err);
    return (
      <div style={{ padding: '40px', background: '#0f1115', color: '#ff4444', height: '100vh' }}>
        <h2>⚠️ AetherForge Runtime Error</h2>
        <p>{err.message}</p>
        <button onClick={() => location.reload()}>Retry</button>
      </div>
    );
  }
}

export default App;
