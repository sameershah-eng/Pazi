import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastContainer } from './components/layout/ToastContainer';
import { AgentModal } from './components/agents/AgentModal';
import { JobModal } from './components/jobs/JobModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { AgentsPage } from './pages/AgentsPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { ScheduledWorkPage } from './pages/ScheduledWorkPage';
import { TaskRunsPage } from './pages/TaskRunsPage';
import { IntegrationsPage } from './pages/IntegrationsPage';
import { SlackPage } from './pages/SlackPage';
import { SettingsPage } from './pages/SettingsPage';

function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGlobalAgentModalOpen, setIsGlobalAgentModalOpen] = useState(false);
  const [isGlobalJobModalOpen, setIsGlobalJobModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#FAF8F5] overflow-hidden text-[#1C1917]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#1C1917]/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-[#FAF8F5] h-full shadow-2xl z-10 flex flex-col">
            <Sidebar
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenNewAgentModal={() => setIsGlobalAgentModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Scrollable Main Container */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  onOpenNewAgent={() => setIsGlobalAgentModalOpen(true)}
                  onOpenNewJob={() => setIsGlobalJobModalOpen(true)}
                />
              }
            />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/conversations" element={<ConversationsPage />} />
            <Route
              path="/jobs"
              element={
                <ScheduledWorkPage onOpenNewJob={() => setIsGlobalJobModalOpen(true)} />
              }
            />
            <Route path="/runs" element={<TaskRunsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/slack" element={<SlackPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenNewAgent={() => {
          setIsCommandPaletteOpen(false);
          setIsGlobalAgentModalOpen(true);
        }}
        onOpenNewJob={() => {
          setIsCommandPaletteOpen(false);
          setIsGlobalJobModalOpen(true);
        }}
      />

      {/* Global Modals */}
      <AgentModal
        isOpen={isGlobalAgentModalOpen}
        onClose={() => setIsGlobalAgentModalOpen(false)}
      />

      <JobModal
        isOpen={isGlobalJobModalOpen}
        onClose={() => setIsGlobalJobModalOpen(false)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </BrowserRouter>
  );
}
