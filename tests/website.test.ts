import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('git-grass public website and mobile UX integrity', () => {
  const projectRoot = process.cwd();
  const siteDir = path.join(projectRoot, 'site');
  const webDir = path.join(projectRoot, 'web');

  const requiredSitePages = [
    'index.html',
    '404.html',
    'styles.css',
    'app.js',
    path.join('docs', 'index.html'),
    path.join('architecture', 'index.html'),
    path.join('challenges', 'index.html'),
    path.join('privacy', 'index.html'),
    path.join('roadmap', 'index.html'),
    path.join('changelog', 'index.html'),
    path.join('contributing', 'index.html'),
    path.join('license', 'index.html'),
    path.join('contact', 'index.html')
  ];

  it('contains every required static website page and stylesheet', () => {
    for (const relPath of requiredSitePages) {
      const fullPath = path.join(siteDir, relPath);
      expect(fs.existsSync(fullPath), `Expected file to exist: site/${relPath}`).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(100);
    }
  });

  it('guarantees zero API keys or secrets in website or client-side assets', () => {
    const allSiteFiles = requiredSitePages.map((p) => path.join(siteDir, p));
    const allWebFiles = ['index.html', 'styles.css', 'app.js'].map((p) => path.join(webDir, p));

    const checkFiles = [...allSiteFiles, ...allWebFiles];

    for (const filePath of checkFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
      expect(content).not.toMatch(/bb_[a-zA-Z0-9]{20,}/);
      expect(content).not.toMatch(/BACKBOARD_API_KEY\s*=\s*['"][a-zA-Z0-9]/);
      expect(content).not.toMatch(/TINKER_API_KEY\s*=\s*['"][a-zA-Z0-9]/);
    }
  });

  it('verifies essential metadata and semantic tags on home and doc pages', () => {
    const homeHtml = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
    expect(homeHtml).toContain('<title>git-grass');
    expect(homeHtml).toContain('name="description"');
    expect(homeHtml).toContain('property="og:title"');
    expect(homeHtml).toContain('property="og:description"');
    expect(homeHtml).toContain('id="interactiveTerminal"');
    expect(homeHtml).toContain('class="mobile-toggle"');
    expect(homeHtml).toContain('class="mobile-drawer"');

    const docsHtml = fs.readFileSync(path.join(siteDir, 'docs', 'index.html'), 'utf8');
    expect(docsHtml).toContain('<h1>git-grass Developer Documentation</h1>');
    expect(docsHtml).toContain('id="prerequisites"');
    expect(docsHtml).toContain('id="hosted-ai"');
    expect(docsHtml).toContain('id="staged-protection"');
  });

  it('verifies architecture documentation details local vs cloud boundaries', () => {
    const archHtml = fs.readFileSync(path.join(siteDir, 'architecture', 'index.html'), 'utf8');
    expect(archHtml).toContain('Trust Zone A');
    expect(archHtml).toContain('git write-tree');
    expect(archHtml).toContain('timingSafeEqual');
    expect(archHtml).toContain('execFile');
  });

  it('verifies challenge showcase defines all core categories and Zod schema', () => {
    const challHtml = fs.readFileSync(path.join(siteDir, 'challenges', 'index.html'), 'utf8');
    expect(challHtml).toContain('data-category="systems"');
    expect(challHtml).toContain('data-category="web"');
    expect(challHtml).toContain('data-category="gamedev"');
    expect(challHtml).toContain('data-category="ml"');
    expect(challHtml).toContain('data-category="audio"');
    expect(challHtml).toContain('OutdoorChallengeSchema = z.object');
  });

  it('verifies mobile session app in web/ contains safe share action and completion summary', () => {
    const mobileIndex = fs.readFileSync(path.join(webDir, 'index.html'), 'utf8');
    expect(mobileIndex).toContain('id="receiptBreakDuration"');
    expect(mobileIndex).toContain('id="btnShareProduct"');
    expect(mobileIndex).toContain('class="next-step-box"');

    const mobileAppJs = fs.readFileSync(path.join(webDir, 'app.js'), 'utf8');
    expect(mobileAppJs).toContain('btnShareProduct');
    // Ensure share text never includes private session tokens or commit messages
    expect(mobileAppJs).not.toContain('text: `${currentSession.commitMessage}`');
    expect(mobileAppJs).not.toContain('token=${token}');
  });

  it('guarantees zero emojis anywhere on the public website', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const allSiteFiles = requiredSitePages.map((p) => path.join(siteDir, p));

    for (const filePath of allSiteFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(new RegExp(emojiRegex, 'gu'));
      expect(matches, `Expected zero emojis in ${path.relative(projectRoot, filePath)}, found: ${matches}`).toBeNull();
    }
  });

  it('verifies minimal monochrome design system and Lucide SVG icons in site/styles.css and index.html', () => {
    const css = fs.readFileSync(path.join(siteDir, 'styles.css'), 'utf8');
    expect(css).toContain('--bg-page: #FFFFFF');
    expect(css).toContain('--bg-subtle: #FAFAF9');
    expect(css).toContain('--text-primary: #171717');
    expect(css).toContain('--text-secondary: #737373');
    expect(css).toContain('--border-subtle: #E5E5E5');
    expect(css).toContain('--terminal-bg: #171717');
    expect(css).toContain('--terminal-text: #F5F5F5');
    expect(css).toContain('--font-serif');
    expect(css).toContain('lucide-icon');

    const homeHtml = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
    expect(homeHtml).toContain('class="lucide-icon');
    expect(homeHtml).toContain('Step outside.<br>\n              Then commit.');
    expect(homeHtml).toContain('class="terminal-compact"');
  });
});

