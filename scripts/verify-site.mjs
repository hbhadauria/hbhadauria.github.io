import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');

const REQUIRED_ARTIFACTS = [
  'index.html',
  '404.html',
  'about/index.html',
  'archives/index.html',
  'categories/index.html',
  'categories/ai/index.html',
  'categories/apps/index.html',
  'categories/updates/index.html',
  'tags/index.html',
  'series/index.html',
  'projects/index.html',
  'projects/calchub/index.html',
  'posts/welcome-to-hsb-learnings/index.html',
  'posts/from-idea-to-app-store-how-i-built-a-mobile-app-in-24-hours-without-coding/index.html',
  'posts/calchub-v3-redesign-with-ai/index.html',
  'feed.xml',
  'rss-style.xsl',
  'sitemap.xml',
  'sitemap-index.xml',
  'robots.txt',
  'og/default.png',
  'pagefind/pagefind.js',
  'sw.js',
  'manifest.webmanifest',
];

const BINARY_EXTS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.ico',
  '.woff',
  '.woff2',
]);

const DIST_TEXT_EXTS = new Set([
  '.html',
  '.js',
  '.mjs',
  '.css',
  '.xml',
  '.json',
  '.webmanifest',
  '.txt',
]);

const FORBIDDEN_FILE_RE = /(?:^|\/)\.env(?:\.|$)|\.(?:pem|key|p12|keystore|jks)$/i;

const PERSONAL_PATH_RE = new RegExp(
  `${['/', 'Users/'].join('')}|${['[A-Z]:', '\\\\', 'Users', '\\\\'].join('')}`,
);
const SECRET_PATTERNS = [
  {
    name: 'private key material',
    re: new RegExp(['BEGIN ', '(?:RSA |EC |OPENSSH |DSA )?', 'PRIVATE KEY'].join('')),
  },
  {
    name: 'AWS access key',
    re: new RegExp(['AK', 'IA[0-9A-Z]{16}'].join('')),
  },
  {
    name: 'GitHub token',
    re: new RegExp(
      `${['gh', 'p_[A-Za-z0-9]{20,}'].join('')}|${['github_', 'pat_[A-Za-z0-9_]{20,}'].join('')}`,
    ),
  },
  {
    name: 'Google API key',
    re: new RegExp(['AI', 'za[0-9A-Za-z_-]{35}'].join('')),
  },
  {
    name: 'API/Slack token',
    re: new RegExp(
      `${['\\bsk', '-[A-Za-z0-9]{20,}'].join('')}|${['\\bxo', 'x[baprs]-[A-Za-z0-9-]{10,}'].join('')}`,
    ),
  },
];

const errors = [];

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function getRepoFiles() {
  const raw = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: rootDir, encoding: 'buffer' },
  );
  return raw
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .filter((rel) => isFile(path.join(rootDir, rel)));
}

if (!fs.existsSync(distDir)) {
  console.error('verify: dist/ directory not found. Run `npm run build` first.');
  process.exit(1);
}

// 1. Required build artifacts & routes
for (const rel of REQUIRED_ARTIFACTS) {
  if (!isFile(path.join(distDir, rel))) {
    errors.push(`dist/${rel}: missing required build artifact`);
  }
}

// 2. Internal links/assets & external target="_blank" security in dist/**/*.html
const distFiles = walkFiles(distDir);
const htmlFiles = distFiles.filter((f) => f.endsWith('.html'));
const attrRe = /\b(?:href|src)\s*=\s*(?:"(\/[^"]*)"|'(\/[^']*)')/gi;
const anchorRe = /<a\b([^>]*)>/gi;

let internalLinksChecked = 0;
let externalBlankLinksChecked = 0;

for (const htmlFile of htmlFiles) {
  const relHtml = path.relative(rootDir, htmlFile);
  const content = fs.readFileSync(htmlFile, 'utf8');

  attrRe.lastIndex = 0;
  let match;
  while ((match = attrRe.exec(content)) !== null) {
    const rawTarget = match[1] ?? match[2] ?? '';
    if (!rawTarget || rawTarget.startsWith('//')) continue;

    internalLinksChecked += 1;
    const cleanTarget = rawTarget.split('#')[0].split('?')[0];
    let decoded;
    try {
      decoded = decodeURIComponent(cleanTarget);
    } catch {
      errors.push(`${relHtml}: malformed URL encoding in '${rawTarget}'`);
      continue;
    }

    if (decoded === '/' || decoded === '') {
      if (!isFile(path.join(distDir, 'index.html'))) {
        errors.push(`${relHtml}: broken root link '${rawTarget}'`);
      }
      continue;
    }

    const stripped = decoded.replace(/^\/+/, '').replace(/\/+$/, '');
    const candidateFile = path.resolve(distDir, stripped);
    if (!candidateFile.startsWith(distDir + path.sep)) {
      errors.push(`${relHtml}: escaping internal target '${rawTarget}'`);
      continue;
    }
    const candidateIndex = path.join(candidateFile, 'index.html');
    if (!isFile(candidateFile) && !isFile(candidateIndex)) {
      errors.push(`${relHtml}: broken internal target '${rawTarget}'`);
    }
  }

  anchorRe.lastIndex = 0;
  while ((match = anchorRe.exec(content)) !== null) {
    const attrs = match[1] ?? '';
    if (!/\btarget\s*=\s*(?:"_blank"|'_blank'|_blank\b)/i.test(attrs)) continue;
    externalBlankLinksChecked += 1;
    const relMatch = attrs.match(/\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const relVal = (relMatch?.[1] ?? relMatch?.[2] ?? relMatch?.[3] ?? '').toLowerCase();
    const tokens = relVal.split(/\s+/).filter(Boolean);
    if (!tokens.includes('noopener')) {
      errors.push(`${relHtml}: external target="_blank" link missing rel="noopener"`);
    }
  }
}

// 3. Built dist/ text scan for machine-local personal paths
for (const filePath of distFiles) {
  const ext = path.extname(filePath).toLowerCase();
  if (!DIST_TEXT_EXTS.has(ext)) continue;
  const content = fs.readFileSync(filePath, 'utf8');
  if (PERSONAL_PATH_RE.test(content)) {
    errors.push(`${path.relative(rootDir, filePath)}: leaked machine-local personal path`);
  }
}

// 4. Repository hygiene & security across tracked/non-ignored files
const repoFiles = getRepoFiles();
const srcAltExt = new Set(['.astro', '.md', '.mdx', '.html', '.tsx', '.jsx']);
const imgTagRe = new RegExp(['<', 'img\\b([\\s\\S]*?)>'].join(''), 'gi');

for (const rel of repoFiles) {
  if (FORBIDDEN_FILE_RE.test(rel)) {
    errors.push(`${rel}: forbidden secret or environment file in repository`);
    continue;
  }

  const ext = path.extname(rel).toLowerCase();
  if (BINARY_EXTS.has(ext) || rel === 'package-lock.json' || rel === 'scripts/verify-site.mjs') {
    continue;
  }

  const content = fs.readFileSync(path.join(rootDir, rel), 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    if (PERSONAL_PATH_RE.test(line)) {
      errors.push(`${rel}:${lineNo}: machine-local personal path`);
    }
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.re.test(line)) {
        errors.push(`${rel}:${lineNo}: possible ${pattern.name}`);
      }
    }
  });

  if (rel.startsWith('src/') && srcAltExt.has(ext)) {
    imgTagRe.lastIndex = 0;
    let imgMatch;
    while ((imgMatch = imgTagRe.exec(content)) !== null) {
      const attrs = imgMatch[1] ?? '';
      const staticAlt = attrs.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const exprAlt = attrs.match(/\balt\s*=\s*\{([^}]+)\}/i);
      const hasStatic = Boolean(staticAlt && (staticAlt[1] ?? staticAlt[2] ?? '').trim().length > 0);
      const hasExpr = Boolean(exprAlt && exprAlt[1].trim().length > 0);
      if (!hasStatic && !hasExpr) {
        errors.push(`${rel}: image element missing non-empty alt attribute`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`verify: ${errors.length} issue(s) found:`);
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log(
  `verify: ok (${REQUIRED_ARTIFACTS.length} required artifacts, ${htmlFiles.length} HTML files, ${internalLinksChecked} internal links, ${externalBlankLinksChecked} target=_blank links, ${repoFiles.length} repo files)`,
);
