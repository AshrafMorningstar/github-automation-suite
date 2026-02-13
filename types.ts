
export interface ProjectAnalysis {
  nameSuggestions: Array<{
    name: string;
    type: 'Descriptive' | 'Branded' | 'Hybrid';
    seoScore: number;
    reasoning: string;
  }>;
  description: {
    short: string;
    extended: string;
    seoKeywords: string[];
  };
  tags: string[];
  readme: string;
  techStack: string[];
  viralHooks: string[];
  review: string;
  versioningStrategy: string;
  documentation: {
    apiReference: string;
    usageExamples: string;
    installationGuide: string;
  };
  gitignore: string;
}

export interface LocalProject {
  id: string;
  path: string;
  name: string;
  lastSync?: string;
  status: 'active' | 'archived' | 'syncing' | 'synced' | 'error';
  filesCount: number;
  handle?: FileSystemDirectoryHandle;
}

export interface ConfigPreset {
  id: string;
  name: string;
  visibility: 'public' | 'private';
  model: string;
  tagsPrefix: string[];
  versioning: 'semantic' | 'calver' | 'simple';
}

export interface AutomationTask {
  id: string;
  projectName: string;
  status: 'pending' | 'analyzing' | 'reviewing' | 'generating_media' | 'packaging' | 'testing' | 'publishing' | 'completed' | 'failed';
  progress: number;
  logs: string[];
  output?: ProjectAnalysis;
  githubUrl?: string;
  previewImageUrl?: string;
  zipUrl?: string;
  error?: string;
}

export interface AppConfig {
  githubToken: string;
  githubUsername: string;
  defaultVisibility: 'public' | 'private';
  aiModel: string;
  autoArchive: boolean;
  theme: 'dark' | 'light';
  presets: ConfigPreset[];
  activePresetId?: string;
}

export enum ViewType {
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  AUTOMATION = 'AUTOMATION',
  LOCAL_STORAGE = 'LOCAL_STORAGE',
  SETTINGS = 'SETTINGS',
  TESTS = 'TESTS'
}
