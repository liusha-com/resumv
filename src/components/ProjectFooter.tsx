import { useEffect, useState } from 'react';
import '../styles/project-footer.css';

const repository = 'https://github.com/liusha-com/resumv';
const cacheKey = 'resumv:latest-commit';
const ttl = 15 * 60 * 1000;
const validSha = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);

async function latestCommit(): Promise<string | null> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
    if (cached && validSha(cached.sha) && Number.isFinite(cached.time) &&
        Date.now() - cached.time >= 0 && Date.now() - cached.time < ttl) return cached.sha;
  } catch { /* Session storage is optional. */ }
  try {
    const response = await fetch('https://api.github.com/repos/liusha-com/resumv/commits/main', {
      credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(5000),
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) return null;
    const { sha } = await response.json();
    if (!validSha(sha)) return null;
    try { sessionStorage.setItem(cacheKey, JSON.stringify({ sha, time: Date.now() })); } catch { /* Optional cache. */ }
    return sha;
  } catch { return null; }
}

export default function ProjectFooter() {
  const [sha, setSha] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void latestCommit().then(value => { if (active) setSha(value); });
    return () => { active = false; };
  }, []);
  return <footer className="project-footer" aria-label="Project information">
    <span>Powered By <a href="https://resumv.com" target="_blank" rel="noopener noreferrer">Resumv.com</a></span>
    <a href={sha ? `${repository}/commit/${sha}` : `${repository}/commits/main/`}
      target="_blank" rel="noopener noreferrer" title={sha ? `Latest GitHub commit on main: ${sha}` : 'View the latest commits on GitHub'}>
      Latest commit <code>{sha ? sha.slice(0, 7) : 'GitHub ↗'}</code>
    </a>
  </footer>;
}
