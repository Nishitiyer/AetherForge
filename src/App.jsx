import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import Help from './pages/Help';
import AdminPortal from './pages/AdminPortal';
import CreatorPortal from './pages/CreatorPortal';
import { SessionProvider } from './context/SessionContext';
import { ChatProvider } from './context/ChatContext';

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
