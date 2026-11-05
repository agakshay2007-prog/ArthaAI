import React from 'react';
import { Navbar } from './components/Navbar';
import { ArchitectureOverview } from './components/ArchitectureOverview';
import { HealthMonitor } from './components/HealthMonitor';
import { Sparkles, Terminal } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Full-Stack Enterprise Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            ArthaAI Platform Core
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
            Cleanly decoupled architecture featuring a Vite + React + TypeScript frontend, 
            Node.js + Express backend, Mongoose database foundation, and centralized error handling.
          </p>
        </div>

        {/* Architecture Grid */}
        <ArchitectureOverview />

        {/* Live Health Check Monitor */}
        <HealthMonitor />

        {/* Commands & Scripts Reference */}
        <div className="mt-10 p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center space-x-2 mb-3 text-slate-300">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-semibold">Standard Workspace Commands</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 block mb-1"># Run Frontend Development</span>
              <span className="text-emerald-400">npm run dev:frontend</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 block mb-1"># Run Backend Development</span>
              <span className="text-indigo-400">npm run dev:backend</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 block mb-1"># Production Build Verification</span>
              <span className="text-cyan-400">npm run build</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>ArthaAI Engineering Architecture &copy; {new Date().getFullYear()}. All systems operational.</p>
      </footer>
    </div>
  );
};

export default App;

