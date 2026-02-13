
import React from 'react';
import { AutomationTask } from '../types';
import { Icons } from '../constants';
import { downloadRepoAsZip } from '../services/githubService';

interface ProjectsViewProps {
  tasks: AutomationTask[];
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ tasks }) => {
  const published = tasks.filter(t => t.status === 'completed');

  const handleDownload = (repoUrl: string) => {
    const parts = repoUrl.split('/');
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1];
    downloadRepoAsZip(owner, repo);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Global Repositories</h2>
          <p className="text-[#8b949e]">Viral projects synced with GitHub ARM.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {published.length > 0 ? published.map((repo) => (
          <div key={repo.id} className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 group hover:border-[#238636] transition-all flex flex-col">
            {repo.previewImageUrl && (
               <div className="mb-4 rounded-lg overflow-hidden border border-[#30363d]">
                 <img src={repo.previewImageUrl} alt="Preview" className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-all" />
               </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-[#f0f6fc] truncate mr-2">{repo.projectName}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDownload(repo.githubUrl!)}
                  className="p-1.5 bg-[#0d1117] rounded border border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]"
                  title="Download Source"
                >
                   <Icons.Folder className="w-4 h-4" />
                </button>
                <a 
                  href={repo.githubUrl} target="_blank" rel="noreferrer"
                  className="p-1.5 bg-[#0d1117] rounded border border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]"
                >
                  <Icons.Github className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <p className="text-xs text-[#8b949e] line-clamp-2 mb-4">
              {repo.output?.description.short || "No description."}
            </p>

            <div className="flex flex-wrap gap-1 mb-4">
              {repo.output?.tags.slice(0, 5).map((t, i) => (
                <span key={i} className="text-[10px] bg-[#238636]/10 text-[#238636] px-2 py-0.5 rounded">#{t}</span>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-[#30363d] flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#238636]">v1.0.0 LIVE</span>
              <span className="text-[10px] text-[#484f58]">SEO Score: {repo.output?.nameSuggestions[0].seoScore}%</span>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-[#30363d] rounded-3xl">
            <p className="text-[#8b949e]">No repositories found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsView;
