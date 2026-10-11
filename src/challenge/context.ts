import fs from 'node:fs';
import path from 'node:path';
import { getRepositoryName } from '../git/repository.js';

export interface ProjectContextSummary {
  repositoryName: string;
  projectDescription: string;
  category: 'web' | 'ml' | 'systems' | 'gamedev' | 'audio' | 'general';
  detectedKeywords: string[];
}

export function extractProjectContext(repoRoot: string): ProjectContextSummary {
  const repoName = getRepositoryName(repoRoot);
  let description = '';
  const detectedKeywords: string[] = [];

  // Check package.json
  const pkgPath = path.join(repoRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.description) description = pkg.description;
      if (Array.isArray(pkg.keywords)) {
        detectedKeywords.push(...pkg.keywords);
      }
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      const depKeys = Object.keys(deps);
      if (depKeys.some((k) => k.includes('react') || k.includes('vue') || k.includes('svelte') || k.includes('next') || k.includes('html') || k.includes('css'))) {
        detectedKeywords.push('web', 'frontend');
      }
      if (depKeys.some((k) => k.includes('torch') || k.includes('tensorflow') || k.includes('onnx') || k.includes('langchain') || k.includes('ai'))) {
        detectedKeywords.push('ml', 'ai');
      }
      if (depKeys.some((k) => k.includes('three') || k.includes('phaser') || k.includes('pixi') || k.includes('canvas'))) {
        detectedKeywords.push('gamedev', 'graphics');
      }
      if (depKeys.some((k) => k.includes('howler') || k.includes('tone') || k.includes('audio') || k.includes('sound'))) {
        detectedKeywords.push('audio');
      }
    } catch {
      // ignore
    }
  }

  // Check README.md snippet
  const readmePaths = ['README.md', 'readme.md', 'README'];
  for (const rName of readmePaths) {
    const fullPath = path.join(repoRoot, rName);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        // Grab first ~500 chars of non-empty prose
        const lines = content
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0 && !l.startsWith('#') && !l.startsWith('!'));
        const snippet = lines.slice(0, 3).join(' ');
        if (!description && snippet) {
          description = snippet.slice(0, 280);
        }
        break;
      } catch {
        // ignore
      }
    }
  }

  // Scan repository files & extensions to detect exact project contents
  try {
    const entries = fs.readdirSync(repoRoot, { withFileTypes: true });
    const fileNames: string[] = [];
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
      fileNames.push(entry.name);
      const ext = path.extname(entry.name).toLowerCase();
      if (['.html', '.css', '.jsx', '.tsx', '.vue', '.svelte'].includes(ext)) detectedKeywords.push('web', 'frontend-ui');
      if (['.py', '.ipynb', '.pt', '.onnx'].includes(ext)) detectedKeywords.push('python', 'ml');
      if (['.rs', '.go', '.c', '.cpp', '.dockerfile', '.sh'].includes(ext)) detectedKeywords.push('systems', 'backend');
      if (['.unity', '.godot', '.glsl', '.hlsl', '.obj'].includes(ext)) detectedKeywords.push('gamedev', '3d-graphics');
      if (['.wav', '.mp3', '.ogg', '.dsp'].includes(ext)) detectedKeywords.push('audio', 'signal-processing');
    }
    if (fileNames.length > 0) {
      detectedKeywords.push(...fileNames.slice(0, 5));
    }
  } catch {
    // ignore
  }

  // Fallback description
  if (!description) {
    description = `${repoName} (${detectedKeywords.slice(0, 4).join(', ') || 'software project'})`;
  }

  // Deduce category
  const lowerDesc = `${repoName} ${description} ${detectedKeywords.join(' ')}`.toLowerCase();
  let category: ProjectContextSummary['category'] = 'general';

  if (lowerDesc.includes('game') || lowerDesc.includes('unity') || lowerDesc.includes('godot') || lowerDesc.includes('graphics') || lowerDesc.includes('canvas')) {
    category = 'gamedev';
  } else if (lowerDesc.includes('audio') || lowerDesc.includes('sound') || lowerDesc.includes('dsp') || lowerDesc.includes('music')) {
    category = 'audio';
  } else if (lowerDesc.includes('machine learning') || lowerDesc.includes('ai') || lowerDesc.includes('model') || lowerDesc.includes('data science') || lowerDesc.includes('neural') || lowerDesc.includes('python')) {
    category = 'ml';
  } else if (lowerDesc.includes('web') || lowerDesc.includes('frontend') || lowerDesc.includes('ui') || lowerDesc.includes('css') || lowerDesc.includes('html') || lowerDesc.includes('browser') || lowerDesc.includes('react')) {
    category = 'web';
  } else if (lowerDesc.includes('backend') || lowerDesc.includes('cli') || lowerDesc.includes('system') || lowerDesc.includes('docker') || lowerDesc.includes('cloud') || lowerDesc.includes('database') || lowerDesc.includes('api')) {
    category = 'systems';
  }

  return {
    repositoryName: repoName,
    projectDescription: description,
    category,
    detectedKeywords: Array.from(new Set(detectedKeywords))
  };
}
