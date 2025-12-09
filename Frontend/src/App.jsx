import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { apiRequest, getApiBaseUrl } from './api.js';

function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast((current) =>
        current && current.id === toast?.id ? null : current,
      );
    }, 3500);
  };

  return { toast, showToast, clearToast: () => setToast(null) };
}

function App() {
  const apiBase = useMemo(() => getApiBaseUrl(), []);
  const [target, setTarget] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [urls, setUrls] = useState([]);
  const [urlsLoading, setUrlsLoading] = useState(false);
  const [urlsError, setUrlsError] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [formError, setFormError] = useState('');

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authError, setAuthError] = useState('');
  const [signedInEmail, setSignedInEmail] = useState('');

  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    const storedEmail = localStorage.getItem('url_shortener_email');
    if (storedEmail) {
      setSignedInEmail(storedEmail);
    }
  }, []);

  const fetchUrls = async () => {
    const token = localStorage.getItem('url_shortener_token');
    if (!token) {
      setUrls([]);
      setUrlsError('');
      return;
    }

    setUrlsLoading(true);
    setUrlsError('');
    try {
      const data = await apiRequest('/urls');
      setUrls(data);
    } catch (err) {
      setUrlsError(err.message || 'Failed to load URLs');
    } finally {
      setUrlsLoading(false);
    }
  };

  useEffect(() => {
    // Load URLs only for a signed-in user
    if (signedInEmail) {
      fetchUrls();
    } else {
      setUrls([]);
      setUrlsError('');
    }
  }, [signedInEmail]);

  const handleShorten = async (e) => {
    e.preventDefault();
    setFormError('');
    setShortUrl('');

    const trimmedTarget = target.trim();
    const trimmedSlug = customSlug.trim();

    if (!trimmedTarget) {
      setFormError('Please paste a URL to shorten.');
      return;
    }

    setCreating(true);
    try {
      const data = await apiRequest('/urls', {
        method: 'POST',
        body: JSON.stringify({
          target: trimmedTarget,
          customSlug: trimmedSlug || undefined,
        }),
      });
      setShortUrl(data.shortUrl);
      setTarget('');
      setCustomSlug('');
      showToast('URL shortened successfully!', 'success');
      fetchUrls();
    } catch (err) {
      setFormError(err.message || 'Failed to create short URL');
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      showToast('Short URL copied to clipboard.', 'success');
    } catch {
      showToast('Unable to copy to clipboard.', 'error');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const email = authEmail.trim();
    const password = authPassword;

    if (!email || !password) {
      setAuthError('Email and password are required.');
      return;
    }

    setAuthLoading(true);
    try {
      const path =
        authMode === 'login' ? '/auth/login' : '/auth/register';
      const data = await apiRequest(path, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (authMode === 'login') {
        if (data.token) {
          localStorage.setItem('url_shortener_token', data.token);
          localStorage.setItem('url_shortener_email', email);
          setSignedInEmail(email);
          showToast('Signed in successfully.', 'success');
        }
      } else {
        showToast('Account created. You can now sign in.', 'success');
        setAuthMode('login');
      }
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('url_shortener_token');
    localStorage.removeItem('url_shortener_email');
    setSignedInEmail('');
    showToast('Signed out.', 'info');
  };

  const makeFullShortUrl = (slug) => {
    if (!slug) return '';
    return `${apiBase.replace(/\/api$/, '')}/${slug}`;
  };

  return (
    <div className="app-root">
      <div className="app-background" />

      {toast && (
        <div
          className={`toast toast-${toast.type}`}
          role="status"
          onClick={clearToast}
        >
          {toast.message}
        </div>
      )}

      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">∥</span>
          <span className="brand-text">Ichigo Short</span>
        </div>

        <div className="auth-summary">
          {signedInEmail ? (
            <>
              <span className="auth-user-email">{signedInEmail}</span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <span className="auth-hint">
              Optional sign-in to prepare for private links.
            </span>
          )}
        </div>
      </header>

      <main className="app-main">
        <section className="hero">
          <h1>Shorten links that feel effortless.</h1>
          <p>
            Paste any long URL, choose a custom slug if you like, and get a
            clean, shareable link powered by your backend.
          </p>
        </section>

        <section className="layout-grid">
          <div className="card card-primary">
            <h2>Create a short link</h2>
            <form className="form" onSubmit={handleShorten}>
              <label className="field">
                <span className="field-label">Destination URL</span>
                <input
                  type="url"
                  placeholder="https://example.com/very/long/link"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  required
                />
              </label>

              <div className="field-row">
                <label className="field flex-2">
                  <span className="field-label">
                    Custom slug <span className="field-optional">(optional)</span>
                  </span>
                  <div className="field-inline">
                    <span className="field-prefix">
                      {apiBase.replace(/\/api$/, '')}/
                    </span>
                    <input
                      type="text"
                      placeholder="my-alias"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                    />
                  </div>
                </label>
              </div>

              {formError && (
                <div className="form-error" role="alert">
                  {formError}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating…' : 'Shorten URL'}
                </button>
              </div>
            </form>

            {shortUrl && (
              <div className="result">
                <span className="field-label">Your short link</span>
                <div className="result-row">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="result-link"
                  >
                    {shortUrl}
                  </a>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={handleCopy}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="side-column">
            <div className="card card-soft">
              <div className="card-header-row">
                <h2>Recent links</h2>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={fetchUrls}
                  disabled={urlsLoading}
                >
                  {urlsLoading ? 'Refreshing…' : 'Refresh'}
                </button>
              </div>

              {!signedInEmail && (
                <p className="muted">
                  Sign in with your email (e.g. Gmail) to see the links you&apos;ve shortened.
                </p>
              )}

              {urlsError && (
                <div className="form-error" role="alert">
                  {urlsError}
                </div>
              )}

              {urlsLoading && urls.length === 0 && (
                <p className="muted">Loading URLs…</p>
              )}

              {signedInEmail && !urlsLoading && urls.length === 0 && !urlsError && (
                <p className="muted">
                  Once you create links, they&apos;ll appear here.
                </p>
              )}

              {urls.length > 0 && (
                <ul className="url-list">
                  {urls.map((u) => (
                    <li key={u._id || u.slug} className="url-item">
                      <div className="url-main">
                        <a
                          href={makeFullShortUrl(u.slug)}
                          target="_blank"
                          rel="noreferrer"
                          className="url-slug"
                        >
                          {makeFullShortUrl(u.slug)}
                        </a>
                        <div className="url-target" title={u.target}>
                          {u.target}
                        </div>
                      </div>
                      <div className="url-meta">
                        {u.createdAt && (
                          <span>
                            {new Date(u.createdAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card card-soft auth-card">
              <div className="card-header-row">
                <h2>{authMode === 'login' ? 'Sign in' : 'Create account'}</h2>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    setAuthMode((mode) =>
                      mode === 'login' ? 'register' : 'login',
                    )
                  }
                >
                  {authMode === 'login'
                    ? 'Need an account?'
                    : 'Have an account?'}
                </button>
              </div>

              <p className="muted small">
                Auth endpoints are wired to your backend so you&apos;re ready
                when you want private links or analytics.
              </p>

              <form className="form" onSubmit={handleAuthSubmit}>
                <label className="field">
                  <span className="field-label">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="field">
                  <span className="field-label">Password</span>
                  <input
                    type="password"
                    autoComplete={
                      authMode === 'login'
                        ? 'current-password'
                        : 'new-password'
                    }
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </label>

                {authError && (
                  <div className="form-error" role="alert">
                    {authError}
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-outline"
                    disabled={authLoading}
                  >
                    {authLoading
                      ? authMode === 'login'
                        ? 'Signing in…'
                        : 'Creating account…'
                      : authMode === 'login'
                      ? 'Sign in'
                      : 'Create account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <span className="muted small">
          Backend: <code>{apiBase}</code>
        </span>
      </footer>
    </div>
  );
}

export default App;

