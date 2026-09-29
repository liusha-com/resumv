import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import '../styles/github-link.css';

const repository = 'https://github.com/liusha-com/resumv';
const cacheKey = 'resumv:github-stars';
const ttl = 15 * 60 * 1000;
let pending: Promise<number | null> | undefined;

async function loadStars(): Promise<number | null> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
    if (cached && Number.isSafeInteger(cached.count) && cached.count >= 0 &&
        Number.isFinite(cached.time) && Date.now() - cached.time >= 0 && Date.now() - cached.time < ttl) {
      return cached.count;
    }
  } catch { /* Storage may be disabled. The link still works. */ }
  try {
    const response = await fetch('https://api.github.com/repos/liusha-com/resumv', {
      credentials: 'omit', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(5000),
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) return null;
    const { stargazers_count: count } = await response.json();
    if (!Number.isSafeInteger(count) || count < 0) return null;
    try { sessionStorage.setItem(cacheKey, JSON.stringify({ count, time: Date.now() })); } catch { /* Optional cache. */ }
    return count;
  } catch { return null; }
}

export default function GitHubLink() {
  const [stars, setStars] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    pending ??= loadStars().finally(() => { pending = undefined; });
    void pending.then(count => { if (active) setStars(count); });
    return () => { active = false; };
  }, []);
  const label = stars === null ? 'Resumv on GitHub (opens in a new tab)' : `Resumv on GitHub, ${stars} stars (opens in a new tab)`;
  return <a className="github-link" href={repository} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" /></svg>
    <span className="github-label">GitHub</span>
    <span className="github-stars"><Star size={13} aria-hidden="true" />{stars === null ? 'Star' : new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(stars)}</span>
  </a>;
}
