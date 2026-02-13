
import React, { useState, useEffect } from 'react';
import { ViewType, AutomationTask, AppConfig } from './types';
import { Icons, COLORS } from './constants';
import Dashboard from './views/Dashboard';
import AutomationHub from './views/AutomationHub';
import ProjectsView from './views/ProjectsView';
import SettingsView from './views/SettingsView';
import LocalManager from './views/LocalManager';
import TestSuite from './views/TestSuite';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [config, setConfig] = useState<AppConfig>({
    githubToken: '',
    githubUsername: '',
    defaultVisibility: 'public',
    aiModel: 'gemini-3-flash-preview',
    autoArchive: true,
    theme: 'dark',
    presets: []
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('gh-arm-config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    
    setTasks([
      {
        id: '1',
        projectName: 'viral-calc-engine',
        status: 'completed',
        progress: 100,
        logs: ['Deployment successful'],
        githubUrl: 'https://github.com/demo/viral-calc-engine'
      }
    ]);

    // Check if API key is selected as per guidelines for Gemini 3 Pro usage
    const checkApiKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        const has = await aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeySelector = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      await aistudio.openSelectKey();
      // Per guideline race condition: assume successful after triggering openSelectKey
      setHasApiKey(true);
    }
  };

  useEffect(() => {
    localStorage.setItem('gh-arm-config', JSON.stringify(config));
  }, [config]);

  const addTask = (task: AutomationTask) => {
    setTasks(prev => [task, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<AutomationTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const renderView = () => {
    switch (currentView) {
      case ViewType.DASHBOARD: return <Dashboard tasks={tasks} />;
      case ViewType.AUTOMATION: return <AutomationHub tasks={tasks} addTask={addTask} updateTask={updateTask} config={config} />;
      case ViewType.PROJECTS: return <ProjectsView tasks={tasks} />;
      case ViewType.LOCAL_STORAGE: return <LocalManager />;
      case ViewType.SETTINGS: return <SettingsView config={config} setConfig={setConfig} />;
      case ViewType.TESTS: return <TestSuite />;
      default: return <Dashboard tasks={tasks} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0d1117] text-[#c9d1d9] overflow-hidden selection:bg-[#238636]/40">
      {/* Mandatory API Key Selection Overlay for Gemini 3 Pro / Image models */}
      {!hasApiKey && (
        <div className="fixed inset-0 z-[100] bg-[#0d1117]/95 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-[2.5rem] p-12 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#238636]/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Icons.Zap className="w-10 h-10 text-[#238636]" />
            </div>
            <h2 className="text-3xl font-black mb-4 text-[#f0f6fc] tracking-tighter">Premium Synthesis</h2>
            <p className="text-[#8b949e] text-sm mb-10 leading-relaxed font-medium">
              High-quality media synthesis requires a <span className="text-[#f0f6fc]">Gemini 3 Pro</span> enabled API key from a paid project.
              <br /><br />
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#238636] hover:underline font-bold"
              >
                Billing Documentation
              </a>
            </p>
            <button 
              onClick={handleOpenKeySelector}
              className="w-full bg-[#238636] hover:bg-[#2ea043] py-5 rounded-2xl font-black text-sm text-white shadow-2xl shadow-[#238636]/20 transition-all transform active:scale-95"
            >
              CONFIGURE ACCESS KEY
            </button>
          </div>
        </div>
      )}

      <aside className="w-72 border-r border-[#30363d] flex flex-col bg-[#0d1117] z-20 shadow-2xl">
        <div className="p-8 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-[#238636] to-[#2ea043] rounded-2xl shadow-xl shadow-[#238636]/20">
            <Icons.Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl leading-tight text-[#f0f6fc] tracking-tighter">GITHUB ARM</h1>
            <p className="text-[10px] text-[#484f58] font-bold uppercase tracking-widest">Production v1.2</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          {[
            { id: ViewType.DASHBOARD, label: 'Control Center', icon: Icons.Layout },
            { id: ViewType.AUTOMATION, label: 'Viral Synthesis', icon: Icons.Zap },
            { id: ViewType.LOCAL_STORAGE, label: 'Workspaces', icon: Icons.Folder },
            { id: ViewType.PROJECTS, label: 'Production', icon: Icons.Github },
            { id: ViewType.TESTS, label: 'System Tests', icon: Icons.Activity },
            { id: ViewType.SETTINGS, label: 'Config Engine', icon: Icons.Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                currentView === item.id 
                  ? 'bg-[#161b22] text-[#f0f6fc] border border-[#30363d] shadow-lg' 
                  : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-500 ${currentView === item.id ? 'scale-110 text-[#238636]' : 'group-hover:scale-110'}`} />
              <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
           <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] font-black uppercase text-[#484f58]">Cloud Quota</span>
                 <span className="text-[10px] font-mono text-[#238636]">88%</span>
              </div>
              <div className="w-full bg-[#0d1117] h-1.5 rounded-full overflow-hidden">
                 <div className="bg-[#238636] h-full transition-all duration-1000" style={{ width: '88%' }}></div>
              </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#0d1117] relative">
        <header className="h-20 border-b border-[#30363d] flex items-center justify-between px-10 sticky top-0 bg-[#0d1117]/90 backdrop-blur-2xl z-10 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
             <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#484f58]">System Live • 0 ms latency</span>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-[#8b949e]">PROJECTS PUSHED</span>
                <span className="bg-[#238636]/10 text-[#238636] px-3 py-1 rounded-full text-xs font-black border border-[#238636]/20">{tasks.filter(t => t.status === 'completed').length}</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-[#30363d] border border-[#484f58] flex items-center justify-center text-[#f0f6fc] font-black text-xs">
                {config.githubUsername ? config.githubUsername[0].toUpperCase() : 'A'}
             </div>
          </div>
        </header>
        <div className="p-10 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
