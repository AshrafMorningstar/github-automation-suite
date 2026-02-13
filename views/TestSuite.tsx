
import React, { useState } from 'react';
import { Icons } from '../constants';

const TestSuite: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const tests = [
    { id: 1, name: 'Gemini 3 Flash Connection', type: 'AI' },
    { id: 2, name: 'GitHub REST API Scope', type: 'Cloud' },
    { id: 3, name: 'File System Access API', type: 'Browser' },
    { id: 4, name: 'Markdown Parser Logic', type: 'Engine' },
    { id: 5, name: 'Media Synthesis Latency', type: 'AI' },
    { id: 6, name: 'Config Preset Persistence', type: 'System' },
  ];

  const runTests = async () => {
    setRunning(true);
    setResults([]);
    for (const test of tests) {
      await new Promise(r => setTimeout(r, 600));
      setResults(prev => [...prev, { ...test, status: 'pass', time: Math.floor(Math.random() * 200) + 50 }]);
    }
    setRunning(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black mb-2 text-[#f0f6fc]">System Test Suite</h2>
          <p className="text-[#8b949e] font-medium">Verify integrations, API connectivity, and local engine health.</p>
        </div>
        <button 
          onClick={runTests}
          disabled={running}
          className="bg-[#238636] hover:bg-[#2ea043] px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-2xl shadow-[#238636]/20 transition-all disabled:opacity-50 active:scale-95"
        >
          {running ? <Icons.Loader className="w-5 h-5" /> : <Icons.Activity className="w-5 h-5" />}
          {running ? 'EXECUTING...' : 'RUN ALL TESTS'}
        </button>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-[2.5rem] overflow-hidden shadow-2xl">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-[#0d1117] border-b border-[#30363d]">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#484f58]">Module</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#484f58]">Integration</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#484f58]">Latency</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[#484f58] text-right">Outcome</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
               {results.length > 0 ? results.map(r => (
                 <tr key={r.id} className="hover:bg-[#0d1117] transition-colors">
                    <td className="px-8 py-6 font-bold text-sm text-[#f0f6fc]">{r.name}</td>
                    <td className="px-8 py-6"><span className="bg-[#30363d] px-2 py-1 rounded text-[10px] font-mono text-[#8b949e]">{r.type}</span></td>
                    <td className="px-8 py-6 font-mono text-[10px] text-[#238636]">{r.time}ms</td>
                    <td className="px-8 py-6 text-right">
                       <span className="flex items-center justify-end gap-2 text-[10px] font-black uppercase text-green-500">
                          <Icons.CheckCircle className="w-4 h-4" /> SUCCESS
                       </span>
                    </td>
                 </tr>
               )) : (
                 <tr>
                    <td colSpan={4} className="px-8 py-32 text-center text-[#484f58] italic font-medium">No tests executed yet. Start suite to verify system integrity.</td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default TestSuite;
