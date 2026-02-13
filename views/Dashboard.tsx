
import React from 'react';
import { AutomationTask } from '../types';
import { Icons } from '../constants';

interface DashboardProps {
  tasks: AutomationTask[];
}

const StatCard: React.FC<{ label: string; value: string | number; icon: any; trend?: string }> = ({ label, value, icon: Icon, trend }) => (
  <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-[#238636]/10 rounded-lg">
        <Icon className="w-6 h-6 text-[#238636]" />
      </div>
      {trend && <span className="text-xs font-medium text-green-500 flex items-center gap-1">
        <Icons.TrendingUp className="w-3 h-3" /> {trend}
      </span>}
    </div>
    <h3 className="text-[#8b949e] text-sm font-medium mb-1 uppercase tracking-wider">{label}</h3>
    <p className="text-3xl font-bold text-[#f0f6fc]">{value}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ tasks }) => {
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalStarsSim = completedCount * 12; // Simulated
  const avgSeoScore = 92;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">System Overview</h2>
        <p className="text-[#8b949e]">Real-time automation performance and repository metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Repos" value={completedCount} icon={Icons.Github} trend="+12%" />
        <StatCard label="Time Saved" value={`${completedCount * 30} min`} icon={Icons.Activity} trend="+45m" />
        <StatCard label="Avg SEO Score" value={`${avgSeoScore}%`} icon={Icons.Zap} trend="+2%" />
        <StatCard label="Task Success" value="100%" icon={Icons.CheckCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#30363d] flex justify-between items-center">
              <h3 className="font-semibold text-lg">Recent Automations</h3>
              <button className="text-sm text-[#238636] hover:underline font-medium">View all</button>
            </div>
            <div className="divide-y divide-[#30363d]">
              {tasks.length > 0 ? tasks.slice(0, 5).map((task) => (
                <div key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#0d1117] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${task.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {task.status === 'completed' ? <Icons.CheckCircle className="w-5 h-5" /> : <Icons.Loader className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-[#f0f6fc]">{task.projectName}</h4>
                      <p className="text-xs text-[#8b949e]">{task.logs[task.logs.length - 1]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono text-[#238636]">100%</div>
                    <div className="text-[10px] text-[#8b949e] uppercase">Success</div>
                  </div>
                </div>
              )) : (
                <div className="px-6 py-12 text-center text-[#8b949e]">No tasks found. Start your first automation!</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">Quick Stats</h3>
            <div className="space-y-4">
               <div>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-[#8b949e]">AI Token Usage</span>
                   <span className="text-[#f0f6fc]">4.2k / 10k</span>
                 </div>
                 <div className="w-full bg-[#30363d] h-2 rounded-full overflow-hidden">
                   <div className="bg-[#238636] h-full" style={{ width: '42%' }}></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-sm mb-1">
                   <span className="text-[#8b949e]">GitHub Rate Limit</span>
                   <span className="text-[#f0f6fc]">4,950 / 5,000</span>
                 </div>
                 <div className="w-full bg-[#30363d] h-2 rounded-full overflow-hidden">
                   <div className="bg-blue-500 h-full" style={{ width: '99%' }}></div>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#238636] to-[#2ea043] rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Icons.Zap className="w-6 h-6" />
              <h3 className="font-bold">Upgrade Pro</h3>
            </div>
            <p className="text-sm opacity-90 mb-4">Unlock advanced analytics, custom AI prompts, and automated social media sharing.</p>
            <button className="w-full bg-white text-[#238636] py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
