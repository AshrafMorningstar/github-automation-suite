
import React, { useState } from 'react';
import { LocalProject } from '../types';
import { Icons } from '../constants';
import { downloadRepoFromUrl } from '../services/githubService';

const LocalManager: React.FC = () => {
  const [projects, setProjects] = useState<LocalProject[]>([
    { id: 'l1', name: 'Alpha Core Engine', path: '/dev/alpha-core', status: 'synced', filesCount: 156, lastSync: '12m ago' },
    { id: 'l2', name: 'Legacy Widget', path: '/old/widget-v1', status: 'error', filesCount: 12, lastSync: '2d ago' },
  ]);
  const [isLinking, setIsLinking] = useState(false);
  const [linkProgress, setLinkProgress] = useState(0);
  const [repoUrl, setRepoUrl] = useState('');

  const handleLinkFolder = async () => {
    // @ts-ignore
    if (typeof window.showDirectoryPicker !== 'function') {
      alert("File System Access API is not supported in this browser. Please use a modern desktop browser.");
      return;
    }

    try {
      setIsLinking(true);
      setLinkProgress(10);
      
      // @ts-ignore
      const handle = await window.showDirectoryPicker();
      setLinkProgress(40);
      
      // Background worker simulation
      await new Promise(r => setTimeout(r, 800));
      setLinkProgress(70);
      
      const newProject: LocalProject = {
        id: Math.random().toString(36).substr(2, 9),
        name: handle.name,
        path: `fs-root://${handle.name}`,
        status: 'synced',
        filesCount: Math.floor(Math.random() * 500) + 1,
        lastSync: 'Now',
        handle
      };

      setProjects(prev => [newProject, ...prev]);
      setLinkProgress(100);
      setTimeout(() => { setIsLinking(false); setLinkProgress(0); }, 500);
    } catch (err) {
      console.error(err);
      setIsLinking(false);
    }
  };

  const handleSync = async (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'syncing' } : p));
    // Simulate sync operation
    await new Promise(r => setTimeout(r, 2000));
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'synced', lastSync: 'Just now' } : p));
  };

  const handleArchive = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'archived' ? 'active' : 'archived' } : p));
  };

  const handleUrlDownload = () => {
    if (!repoUrl) return;
    downloadRepoFromUrl(repoUrl);
    setRepoUrl('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'syncing': return 'text-blue-500';
      case 'synced': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'archived': return 'text-gray-500';
      default: return 'text-[#8b949e]';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black mb-2 text-[#f0f6fc]">Local Workspaces</h2>
          <p className="text-[#8b949e] font-medium">Manage multiple codebases and sync with GitHub automated pipelines.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-inner group transition-all focus-within:border-[#238636]">
            <input 
              type="text" 
              placeholder="Repo URL to ZIP..." 
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="bg-transparent px-4 py-2 text-xs outline-none w-48 font-mono placeholder:text-[#484f58]"
            />
            <button 
              onClick={handleUrlDownload}
              className="bg-[#30363d] hover:bg-[#484f58] p-2 transition-colors border-l border-[#30363d]"
              title="Download ZIP from URL"
            >
              <Icons.FileZip className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={handleLinkFolder}
            disabled={isLinking}
            className="flex items-center gap-2 bg-[#238636] hover:bg-[#2ea043] px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-xl shadow-[#238636]/10 disabled:opacity-50 active:scale-95"
          >
            {isLinking ? <Icons.Loader className="w-5 h-5" /> : <Icons.Folder className="w-5 h-5" />}
            {isLinking ? `LINKING... ${linkProgress}%` : 'LINK FOLDER'}
          </button>
        </div>
      </div>

      {isLinking && (
        <div className="w-full bg-[#161b22] h-2 rounded-full overflow-hidden shadow-inner border border-[#30363d]">
          <div 
            className="bg-[#238636] h-full transition-all duration-300 shadow-[0_0_15px_#238636]" 
            style={{ width: `${linkProgress}%` }} 
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {projects.map((p) => (
          <div 
            key={p.id} 
            className={`bg-[#161b22] border border-[#30363d] rounded-[2rem] p-8 shadow-2xl transition-all relative overflow-hidden flex flex-col group ${p.status === 'archived' ? 'opacity-40 grayscale' : 'hover:border-[#238636]/50'}`}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl shadow-inner transition-colors ${getStatusColor(p.status).replace('text-', 'bg-').split('-')[0]}-500/10 ${getStatusColor(p.status)}`}>
                  <Icons.Folder className={`w-8 h-8 ${p.status === 'syncing' ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                  <h3 className="font-black text-[#f0f6fc] text-xl leading-tight mb-1">{p.name}</h3>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[#484f58]">
                    <span className="bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">{p.path}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSync(p.id)}
                  disabled={p.status === 'syncing' || p.status === 'archived'}
                  className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl hover:text-[#238636] transition-all disabled:opacity-20"
                >
                  <Icons.Refresh className={`w-5 h-5 ${p.status === 'syncing' ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => handleArchive(p.id)}
                  className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl hover:text-red-400 transition-all"
                >
                  <Icons.Archive className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#0d1117] p-4 rounded-2xl border border-[#30363d] text-center shadow-inner">
                <div className="text-[10px] uppercase font-black text-[#484f58] mb-1 tracking-widest">Items</div>
                <div className="font-bold text-sm text-[#f0f6fc]">{p.filesCount}</div>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-2xl border border-[#30363d] text-center shadow-inner">
                <div className="text-[10px] uppercase font-black text-[#484f58] mb-1 tracking-widest">Health</div>
                <div className={`text-[10px] font-black uppercase ${getStatusColor(p.status)}`}>
                  {p.status}
                </div>
              </div>
              <div className="bg-[#0d1117] p-4 rounded-2xl border border-[#30363d] text-center shadow-inner">
                <div className="text-[10px] uppercase font-black text-[#484f58] mb-1 tracking-widest">Last Sync</div>
                <div className="font-bold text-[10px] text-[#f0f6fc]">{p.lastSync}</div>
              </div>
            </div>

            <div className="flex gap-3 mt-auto">
              <button 
                onClick={() => alert("Packaging files into encrypted ZIP...")}
                className="flex-1 py-4 bg-[#0d1117] border border-[#30363d] hover:border-[#238636] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#8b949e] hover:text-[#f0f6fc] transition-all flex items-center justify-center gap-2"
              >
                <Icons.FileZip className="w-4 h-4" /> Package Release
              </button>
              <button className="flex-1 py-4 bg-[#238636] hover:bg-[#2ea043] rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-[#238636]/10 transform active:scale-95">
                Push Update to Main
              </button>
            </div>
          </div>
        ))}
        
        {projects.length === 0 && (
          <div className="col-span-full py-32 border-4 border-dashed border-[#161b22] rounded-[3rem] flex flex-col items-center justify-center text-[#484f58] group hover:border-[#238636]/20 transition-all">
            <Icons.Folder className="w-16 h-16 mb-4 group-hover:scale-110 transition-transform" />
            <p className="font-black uppercase tracking-[0.4em]">No Workspaces Connected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalManager;
