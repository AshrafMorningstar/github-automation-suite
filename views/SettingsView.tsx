
import React, { useState } from 'react';
import { AppConfig, ConfigPreset } from '../types';
import { Icons } from '../constants';

interface SettingsViewProps {
  config: AppConfig;
  setConfig: (config: AppConfig) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ config, setConfig }) => {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setConfig({
      ...config,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const applyPreset = (preset: ConfigPreset) => {
    setActivePreset(preset.id);
    setConfig({
      ...config,
      defaultVisibility: preset.visibility,
      aiModel: preset.model
    });
    triggerToast();
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const presets: ConfigPreset[] = [
    // Added required versioning property to resolve TypeScript errors on lines 39-40
    { id: 'p1', name: 'Open Source Viral', visibility: 'public', model: 'gemini-3-flash-preview', tagsPrefix: ['os', 'viral'], versioning: 'semantic' },
    { id: 'p2', name: 'Private Stealth', visibility: 'private', model: 'gemini-3-pro-preview', tagsPrefix: ['stealth', 'internal'], versioning: 'simple' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-5xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black mb-2 text-[#f0f6fc]">System Configuration</h2>
          <p className="text-[#8b949e] font-medium">Fine-tune the ARM viral engine and cloud integrations.</p>
        </div>
        {showToast && (
          <div className="bg-[#238636] text-white px-4 py-2 rounded-xl text-xs font-bold animate-bounce shadow-lg">
             CONFIG SYNCED SUCCESSFULLY
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-[#161b22] border border-[#30363d] rounded-[2rem] p-8 shadow-2xl">
            <h3 className="font-black text-lg mb-6 flex items-center gap-3">
              <Icons.Github className="w-6 h-6 text-[#f0f6fc]" /> GitHub Identity
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#484f58] mb-3">Personal Access Token (PAT)</label>
                <input
                  type="password"
                  name="githubToken"
                  value={config.githubToken}
                  onChange={handleChange}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl px-5 py-4 text-sm focus:border-[#238636] outline-none transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#484f58] mb-3">Primary Username</label>
                <input
                  type="text"
                  name="githubUsername"
                  value={config.githubUsername}
                  onChange={handleChange}
                  placeholder="e.g. arm-bot"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl px-5 py-4 text-sm focus:border-[#238636] outline-none transition-all font-mono"
                />
              </div>
            </div>
          </section>

          <section className="bg-[#161b22] border border-[#30363d] rounded-[2rem] p-8 shadow-2xl">
            <h3 className="font-black text-lg mb-6 flex items-center gap-3">
              <Icons.Zap className="w-6 h-6 text-[#238636]" /> AI Cognitive Suite
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#484f58] mb-3">Model Selection</label>
                <select
                  name="aiModel"
                  value={config.aiModel}
                  onChange={handleChange}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl px-5 py-4 text-sm focus:border-[#238636] outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="gemini-3-flash-preview">Gemini 3 Flash (Real-time Synthesis)</option>
                  <option value="gemini-3-pro-preview">Gemini 3 Pro (Deep Logical Reasoning)</option>
                </select>
              </div>
              <div className="p-6 bg-[#0d1117] rounded-2xl border border-[#30363d] flex items-center justify-between group hover:border-[#238636]/50 transition-colors">
                <div>
                  <h4 className="text-sm font-black text-[#f0f6fc] mb-1">Extended Documentation Mode</h4>
                  <p className="text-[10px] text-[#484f58] font-medium">Generate API References, Feature Matrix, and Migration Guides.</p>
                </div>
                <div className="w-12 h-6 bg-[#238636]/20 rounded-full relative p-1 cursor-pointer border border-[#238636]/30">
                   <div className="w-4 h-4 bg-[#238636] rounded-full shadow-[0_0_10px_#238636]" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-[#161b22] border border-[#30363d] rounded-[2rem] p-8 shadow-2xl">
            <h3 className="font-black text-[11px] uppercase tracking-widest text-[#484f58] mb-6">Workflow Presets</h3>
            <div className="space-y-4">
              {presets.map(p => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p)}
                  className={`w-full p-6 rounded-2xl border text-left transition-all relative overflow-hidden group ${activePreset === p.id ? 'bg-[#238636]/10 border-[#238636]' : 'bg-[#0d1117] border-[#161b22] hover:border-[#30363d]'}`}
                >
                  {activePreset === p.id && <div className="absolute top-0 right-0 p-2"><Icons.CheckCircle className="w-4 h-4 text-[#238636]" /></div>}
                  <div className="font-black text-sm mb-2 group-hover:text-[#238636] transition-colors">{p.name}</div>
                  <div className="text-[9px] text-[#484f58] uppercase font-black tracking-tighter flex gap-2">
                    <span className="px-1.5 py-0.5 bg-black rounded">{p.visibility}</span>
                    <span className="px-1.5 py-0.5 bg-black rounded">{p.model.split('-')[1]}</span>
                  </div>
                </button>
              ))}
              <button className="w-full py-4 border-2 border-dashed border-[#30363d] rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-[#484f58] hover:text-[#8b949e] hover:border-[#484f58] transition-all">
                + NEW CUSTOM PRESET
              </button>
            </div>
          </section>

          <div className="bg-gradient-to-br from-[#238636] to-[#2ea043] rounded-[2rem] p-10 text-white shadow-2xl shadow-[#238636]/20 relative overflow-hidden">
            <Icons.Zap className="absolute top-[-10%] right-[-10%] w-32 h-32 opacity-10 rotate-12" />
            <h3 className="font-black text-xl mb-4 relative z-10">Production Ready</h3>
            <p className="text-xs opacity-80 leading-relaxed mb-8 relative z-10 font-medium italic">"The best way to predict the future is to automate it."</p>
            <button className="w-full bg-white text-[#238636] py-4 rounded-2xl font-black text-sm relative z-10 shadow-lg hover:scale-105 active:scale-95 transition-all">
              SAVE GLOBAL CONFIG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
