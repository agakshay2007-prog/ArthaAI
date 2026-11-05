import React from 'react';
import { Database, Server, Layout, ShieldAlert } from 'lucide-react';

export const ArchitectureOverview: React.FC = () => {
  const pillars = [
    {
      title: 'Frontend Tier',
      tech: 'React 18 + TypeScript + Vite',
      description: 'Single-page application powered by Vite, typed components, and Tailwind CSS styling.',
      icon: Layout,
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400',
    },
    {
      title: 'Backend Gateway',
      tech: 'Node.js + Express + TypeScript',
      description: 'Clean REST API server with Helmet security, CORS configuration, and Morgan logging.',
      icon: Server,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Data Tier Foundation',
      tech: 'MongoDB Atlas + Mongoose',
      description: 'Production-ready Mongoose connection foundation with connection lifecycle and reconnection handling.',
      icon: Database,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    },
    {
      title: 'Resilience & Error Handling',
      tech: 'Centralized AppError Pipeline',
      description: 'Global error interceptor managing operational errors, validation failures, and 404 boundaries.',
      icon: ShieldAlert,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
    },
  ];

  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Phase 1 Architecture Stack</h2>
        <p className="text-sm text-slate-400">Core foundational infrastructure and decoupled full-stack design.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br border mb-3 ${pillar.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white text-sm">{pillar.title}</h3>
              <div className="text-xs font-mono text-indigo-400 mt-1 mb-2">{pillar.tech}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{pillar.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

