
import React, { useState, useRef, useEffect } from 'react';
import { AutomationTask, AppConfig, ProjectAnalysis } from '../types';
import { Icons } from '../constants';
import { analyzeProject, generateProjectPreviewImage } from '../services/geminiService';
import { createGithubRepo, createGithubFile, createGithubRelease } from '../services/githubService';

interface AutomationHubProps {
  tasks: AutomationTask[];
  addTask: (task: AutomationTask) => void;
  updateTask: (id: string, updates: Partial<AutomationTask>) => void;
  config: AppConfig;
}

const CodeEditor: React.FC<{ code: string; title: string; onSave: (val: string) => void }> = ({ code, title, onSave }) => {
  const [val, setVal] = useState(code);
  useEffect(() => setVal(code), [code]);

  return (
    <div className="bg-[#010409] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full group focus-within:border-[#238636]/50 transition-all">
      <div className="bg-[#161b22] px-4 py-2 border-b border-[#30363d] flex items-center justify-between shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="text-[10px] font-mono text-[#8b949e] tracking-tight">{title}</span>
        <button onClick={() => onSave(val)} className="text-[8px] font-black uppercase text-[#238636] hover:underline">Apply Edits</button>
      </div>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full h-full bg-transparent p-6 font-mono text-[11px] text-[#c9d1d9] outline-none resize-none leading-relaxed selection:bg-[#238636]/30"
        spellCheck={false}
      />
    </div>
  );
};

const PipelineVisualizer: React.FC<{ status: string; progress: number }> = ({ status, progress }) => {
  const stages = [
    { id: 'lint', name: 'Lint', threshold: 15 },
    { id: 'test', name: 'Tests', threshold: 35 },
    { id: 'build', name: 'Build', threshold: 55 },
    { id: 'seo', name: 'SEO', threshold: 75 },
    { id: 'docs', name: 'Docs', threshold: 90 },
    { id: 'media', name: 'Assets', threshold: 100 },
  ];

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex justify-between items-center px-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b949e]">Production Pipeline</h4>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-green-500 uppercase">{status}</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
      <div className="flex gap-2">
        {stages.map((s, i) => (
          <div key={s.id} className="flex-1 group relative">
            <div className={`h-2 rounded-full transition-all duration-700 ${progress >= s.threshold ? 'bg-[#238636] shadow-[0_0_10px_#238636]/40' : 'bg-[#30363d]'}`} />
            <div className={`text-[8px] font-black mt-2 text-center transition-colors uppercase ${progress >= s.threshold ? 'text-[#f0f6fc]' : 'text-[#484f58]'}`}>{s.name}</div>
            {progress >= s.threshold && <Icons.CheckCircle className="w-3 h-3 text-[#238636] absolute top-[-10px] right-0" />}
          </div>
        ))}
      </div>
    </div>
  );
};

const AutomationHub: React.FC<AutomationHubProps> = ({ tasks, addTask, updateTask, config }) => {
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nameIdx, setNameIdx] = useState(0);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [versionType, setVersionType] = useState('semantic');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tasks]);

  const runPipeline = async () => {
    if (!input.trim() || isBusy) return;

    const taskId = Math.random().toString(36).substr(2, 9);
    setActiveId(taskId);
    setIsBusy(true);

    const task: AutomationTask = {
      id: taskId,
      projectName: 'Awaiting Synthesis...',
      status: 'analyzing',
      progress: 5,
      logs: ['[INIT] Initializing Background Engine...', '[AI] Engaging Analysis Model (Gemini 3 Flash)...'],
    };

    addTask(task);

    try {
      updateTask(taskId, { progress: 20, logs: [...task.logs, '[AI] Extracting technical nuances and SEO patterns...'] });
      const result = await analyzeProject(input);
      
      updateTask(taskId, { status: 'testing', progress: 45, logs: [...task.logs, '[CI] Running unit test simulation...', '[CI] Generating high-performance .gitignore...'] });
      await new Promise(r => setTimeout(r, 1500));
      
      updateTask(taskId, { status: 'generating_media', progress: 75, logs: [...task.logs, '[AI] Constructing high-resolution social media preview...'] });
      const img = await generateProjectPreviewImage(result, { resolution: '1K' });
      setPreviewImg(img);

      setAnalysis(result);
      updateTask(taskId, {
        projectName: result.nameSuggestions[0].name,
        status: 'reviewing',
        progress: 90,
        output: result,
        previewImageUrl: img,
        logs: [...task.logs, '[SUCCESS] Pipeline stages completed.', '[SYSTEM] Assets ready for final deployment review.']
      });
    } catch (err: any) {
      updateTask(taskId, { status: 'failed', logs: [`[ERROR] Pipeline Aborted: ${err.message}`], error: err.message });
    } finally {
      setIsBusy(false);
    }
  };

  const deploy = async () => {
    if (!analysis || !activeId) return;
    if (!config.githubToken) return alert("GitHub Token missing in Settings.");

    const task = tasks.find(t => t.id === activeId);
    if (!task) return;

    const selectedName = analysis.nameSuggestions[nameIdx].name;

    try {
      updateTask(activeId, { status: 'publishing', progress: 92, logs: [...task.logs, `[GITHUB] Provisioning repository: ${selectedName}...`] });
      const repo = await createGithubRepo(config.githubToken, {
        name: selectedName,
        description: analysis.description.short,
        private: config.defaultVisibility === 'private',
        topics: analysis.tags
      });

      const fullReadme = `${analysis.readme}\n\n## 📋 Detailed Documentation\n\n### ⚙️ API Reference\n${analysis.documentation.apiReference}\n\n### 🚀 Usage\n${analysis.documentation.usageExamples}\n\n### 🤖 AI Insight\n> ${analysis.review}`;

      updateTask(activeId, { progress: 95, logs: [...task.logs, '[GITHUB] Committing system files and documentation...'] });
      await createGithubFile(config.githubToken, repo.owner.login, repo.name, 'README.md', fullReadme, 'initial: ARM documentation engine');
      await createGithubFile(config.githubToken, repo.owner.login, repo.name, '.gitignore', analysis.gitignore, 'chore: automated .gitignore');

      const tag = versionType === 'semantic' ? 'v1.0.0' : new Date().toISOString().split('T')[0];
      updateTask(activeId, { progress: 98, logs: [...task.logs, `[GITHUB] tagging release ${tag}...`] });
      await createGithubRelease(config.githubToken, repo.owner.login, repo.name, tag, `${tag} Initial Launch`, analysis.versioningStrategy);

      updateTask(activeId, { status: 'completed', progress: 100, githubUrl: repo.html_url, logs: [...task.logs, '[SUCCESS] Production deployment live. STAR THE REPO!'] });
      setAnalysis(null);
      setPreviewImg(null);
      setActiveId(null);
    } catch (err: any) {
      updateTask(activeId, { status: 'failed', logs: [...task.logs, `[ERROR] Deployment failed: ${err.message}`] });
    }
  };

  const sharePreview = () => {
    const text = `Launched a new project with GitHub ARM: ${analysis?.nameSuggestions[nameIdx].name}! 🔥`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black mb-2 tracking-tighter text-[#f0f6fc]">Viral Synthesis Engine</h2>
          <p className="text-[#8b949e] text-lg font-medium">Engineer high-impact repositories from raw concept to viral launch.</p>
        </div>
        {activeId && (
          <div className="w-full md:w-80">
            <PipelineVisualizer 
              status={tasks.find(t => t.id === activeId)?.status || 'idle'} 
              progress={tasks.find(t => t.id === activeId)?.progress || 0} 
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div className="bg-[#161b22] border border-[#30363d] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#238636] opacity-5 blur-3xl group-hover:opacity-10 transition-all duration-1000" />
            <h3 className="font-bold text-xl mb-6 flex items-center gap-4">
              <Icons.Terminal className="w-6 h-6 text-[#238636]" />
              Project Blueprint
            </h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste code snippet, feature list, or a raw project description..."
              className="w-full bg-[#0d1117] border-2 border-[#30363d] rounded-[2rem] p-8 h-80 text-sm font-mono focus:ring-8 focus:ring-[#238636]/5 focus:border-[#238636]/40 transition-all outline-none resize-none placeholder:text-[#30363d]"
            />
            <button
              onClick={runPipeline}
              disabled={isBusy || !input.trim()}
              className="w-full mt-10 py-6 rounded-[2rem] font-black text-xl bg-[#238636] hover:bg-[#2ea043] flex items-center justify-center gap-4 text-white shadow-2xl shadow-[#238636]/20 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {isBusy ? <Icons.Loader className="w-7 h-7" /> : <Icons.Zap className="w-7 h-7" />}
              {isBusy ? 'SYNTHESIZING...' : 'START PRODUCTION PIPELINE'}
            </button>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] rounded-[2.5rem] p-8 shadow-inner">
             <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-xs font-black uppercase text-[#484f58] tracking-[0.3em]">Execution Stream</h3>
                <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <div className="w-2 h-2 rounded-full bg-green-500/30" />
                </div>
             </div>
             <div className="space-y-3 max-h-60 overflow-y-auto font-mono text-[11px] p-6 bg-[#010409] rounded-3xl border border-[#161b22]">
               {tasks.length > 0 ? tasks[0].logs.map((log, i) => (
                 <div key={i} className="flex gap-4 leading-relaxed group">
                   <span className="text-[#30363d] select-none opacity-40 group-hover:opacity-100">{String(i+1).padStart(2, '0')}</span> 
                   <span className={log.includes('[ERROR]') ? 'text-red-400 font-bold' : log.includes('[SUCCESS]') ? 'text-green-400' : 'text-[#8b949e]'}>
                     {log}
                   </span>
                 </div>
               )) : <div className="text-[#30363d] italic text-center py-4">Terminal ready for input.</div>}
               <div ref={logEndRef} />
             </div>
          </div>
        </div>

        <div className="space-y-8 h-full">
          {analysis ? (
            <div className="bg-[#161b22] border border-[#30363d] rounded-[2.5rem] p-10 space-y-10 animate-in zoom-in-95 duration-500 shadow-2xl relative flex flex-col h-full">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-black text-2xl text-[#f0f6fc] mb-1">Staged Assets</h3>
                  <p className="text-xs text-[#8b949e] font-bold tracking-widest uppercase">Optimization Tier: S-Class</p>
                </div>
                <button onClick={sharePreview} className="p-3 bg-[#0d1117] border border-[#30363d] rounded-2xl hover:text-[#238636] transition-all shadow-lg" title="Social Share Preview">
                  <Icons.TrendingUp className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <div className="h-64">
                   <CodeEditor title=".gitignore (Auto-Gen)" code={analysis.gitignore} onSave={(val) => setAnalysis({...analysis, gitignore: val})} />
                </div>
                <div className="h-64">
                   <CodeEditor title="api-reference.md" code={analysis.documentation.apiReference} onSave={(val) => setAnalysis({...analysis, documentation: {...analysis.documentation, apiReference: val}})} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] text-[#484f58] uppercase font-black tracking-widest block px-1">Repository Name Selection</label>
                  <div className="grid grid-cols-1 gap-3">
                    {analysis.nameSuggestions.map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => setNameIdx(i)}
                        className={`w-full p-5 rounded-3xl border text-left transition-all ${nameIdx === i ? 'bg-[#238636]/10 border-[#238636] ring-4 ring-[#238636]/5' : 'bg-[#0d1117] border-[#30363d] hover:border-[#484f58]'}`}
                      >
                        <div className="flex justify-between items-center font-black text-sm mb-1">
                          <span className={nameIdx === i ? 'text-[#238636]' : 'text-[#f0f6fc]'}>{s.name}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#161b22] border border-[#30363d] text-[#8b949e]">{s.seoScore}% SEO</span>
                        </div>
                        <p className="text-[10px] text-[#484f58] font-medium italic">{s.reasoning}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-[#0d1117] p-6 rounded-3xl border border-[#30363d] space-y-4">
                      <h4 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">Viral Media Card</h4>
                      {previewImg && (
                        <div className="relative group rounded-xl overflow-hidden border border-[#30363d]">
                           <img src={previewImg} className="w-full h-auto shadow-2xl transition-transform duration-700 group-hover:scale-110" />
                        </div>
                      )}
                   </div>
                   <div className="bg-[#0d1117] p-6 rounded-3xl border border-[#30363d] space-y-4">
                      <h4 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest">Version Control</h4>
                      <select 
                        value={versionType}
                        onChange={(e) => setVersionType(e.target.value)}
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-xl px-4 py-3 text-[10px] font-black outline-none focus:border-[#238636]"
                      >
                         <option value="semantic">Semantic (v1.0.0)</option>
                         <option value="calver">Calendar (2025-05-20)</option>
                         <option value="simple">Simple (1.0)</option>
                      </select>
                      <p className="text-[9px] text-[#484f58] leading-tight">Automated tagging and release notes based on AI synthesis.</p>
                   </div>
                </div>
                
                <button 
                  onClick={deploy}
                  className="w-full bg-[#238636] hover:bg-[#2ea043] py-6 rounded-3xl font-black flex items-center justify-center gap-4 text-white text-2xl shadow-2xl shadow-[#238636]/30 transition-all transform hover:scale-[1.01] active:scale-95"
                >
                  <Icons.Github className="w-8 h-8" /> PUSH TO GITHUB
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#161b22] border-2 border-dashed border-[#30363d] rounded-[4rem] p-24 text-center flex flex-col items-center justify-center h-full transition-all hover:bg-[#161b22]/70 group">
              <div className="p-12 bg-[#0d1117] rounded-full mb-12 group-hover:scale-110 transition-transform shadow-2xl border border-[#161b22]">
                <Icons.Activity className="w-24 h-24 text-[#30363d] animate-pulse" />
              </div>
              <h3 className="font-black text-4xl mb-6 text-[#f0f6fc] tracking-tighter">System Idle</h3>
              <p className="text-[#8b949e] max-w-sm font-medium leading-relaxed text-lg">Blueprint your project on the left to activate AI-driven synthesis and media generation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutomationHub;
