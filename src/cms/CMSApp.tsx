import { useEffect, useState, useRef } from 'react'
import './App.css'
import { supabase } from '../../services/supabaseClient'
import { Link, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { useI18n } from './lib/i18n'
import CMS from './pages/CMS'
import SuperAdmin from './pages/SuperAdmin'
import BunnyExplorer from './pages/BunnyExplorer'

function CMSApp() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showLogin, setShowLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const { t } = useI18n()

  console.log('[CMSApp] Rendering with state:', { isSignedIn, showLogin, location: location.pathname })

  useEffect(() => {
    let isMounted = true
    console.log('[CMSApp] Setting up auth listener')
    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return
      console.log('[CMSApp] Initial session check:', { data, error })
      if (error) {
        setError(error.message)
        return
      }
      setIsSignedIn(Boolean(data.session))
      setShowLogin(!Boolean(data.session))
      setUserEmail(data.session?.user?.email ?? null)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[CMSApp] Auth state changed:', { event: _event, session })
      setIsSignedIn(Boolean(session))
      setShowLogin(!Boolean(session))
      setUserEmail(session?.user?.email ?? null)
    })
    return () => {
      isMounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const superAdminEmail = (import.meta.env.VITE_SUPERADMIN_EMAIL as string | undefined)?.toLowerCase()
  const isSuperAdmin = !!userEmail && !!superAdminEmail && userEmail.toLowerCase() === superAdminEmail

  // Debug info
  console.log('[CMSApp] Environment check:', {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
    superAdminEmail: import.meta.env.VITE_SUPERADMIN_EMAIL,
    userEmail: userEmail,
    isSuperAdmin: isSuperAdmin,
    currentPath: location.pathname
  })

  return (
    <div className="cms-container">
      <div className="container">
        <header className="header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', flex: 1 }}>
          <h1 className="title" style={{ margin: 0 }}>{t('app_title')}</h1>
          {isSignedIn && isSuperAdmin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {location.pathname === '/login/bunny' ? (
                <Link to="/login/cms" className="open-btn">{t('nav_cms')}</Link>
              ) : location.pathname === '/login/superadmin' ? (
                <>
                  <Link to="/login/bunny" className="open-btn">{t('nav_modify_storage')}</Link>
                  <Link to="/login/cms" className="open-btn">{t('nav_cms')}</Link>
                </>
              ) : (
                <>
                  <Link to="/login/bunny" className="open-btn">{t('nav_modify_storage')}</Link>
                  <Link to="/login/superadmin" className="open-btn">{t('nav_dashboard')}</Link>
                </>
              )}
            </div>
          )}
        </div>
        <nav style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          {isSignedIn && location.pathname !== '/login/cms' && location.pathname !== '/login/bunny' && location.pathname !== '/login/superadmin' && (
            <Link to="/login/cms" className="open-btn">{t('nav_cms')}</Link>
          )}
          {isSignedIn ? (
            <button
              className="signin-btn"
              onClick={async () => {
                await supabase.auth.signOut()
              }}
              aria-label="Sign out"
            >
              {t('nav_sign_out')}
            </button>
          ) : null}
        </nav>
      </header>

      {error && (
        <div style={{ color: 'red', padding: '1rem', textAlign: 'center' }}>
          Error: {error}
        </div>
      )}
      {!isSignedIn && (
        <p className="subtitle">Please sign in to continue.</p>
      )}

      <Routes>
        <Route
          path="/"
          element={isSignedIn ? <Navigate to="/login/cms" replace /> : <></>}
        />
        <Route path="/cms" element={isSignedIn ? <CMS /> : <Navigate to="/" replace />} />
        <Route path="/superadmin" element={isSignedIn && isSuperAdmin ? <SuperAdmin /> : <Navigate to="/" replace />} />
        <Route path="/bunny" element={isSignedIn && isSuperAdmin ? <BunnyExplorer /> : <Navigate to="/" replace />} />
        <Route path="/login/cms" element={isSignedIn ? <CMS /> : <Navigate to="/" replace />} />
        <Route path="/login/superadmin" element={isSignedIn && isSuperAdmin ? <SuperAdmin /> : <Navigate to="/" replace />} />
        <Route path="/login/bunny" element={isSignedIn && isSuperAdmin ? <BunnyExplorer /> : <Navigate to="/" replace />} />
      </Routes>
      {showLogin && (
        <LoginModal
          onSuccess={() => {
            setShowLogin(false)
            // After login, navigate to CMS
            window.history.pushState({}, '', '/login/cms')
            window.dispatchEvent(new PopStateEvent('popstate'))
          }}
        />
      )}
      </div>
    </div>
  )
}

export default CMSApp

function LoginModal({ onSuccess }: { onSuccess: () => void }) {
  const { t, lang, setLang } = useI18n()
  const [email, setEmail] = useState('')
  const emailInputRef = useRef<HTMLInputElement | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsBtnRef = useRef<HTMLButtonElement | null>(null)
  const settingsPanelRef = useRef<HTMLDivElement | null>(null)

  const tLocal = {
    en: {
      emailPlaceholder: 'you@balasabha.com',
      useSuggestion: (s: string) => s,
    },
    ml: {
      emailPlaceholder: 'you@balasabha.com',
      useSuggestion: (s: string) => s,
    }
  }[lang]

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!settingsOpen) return
      const btn = settingsBtnRef.current
      const panel = settingsPanelRef.current
      const target = e.target as Node
      if (btn && btn.contains(target)) return
      if (panel && panel.contains(target)) return
      setSettingsOpen(false)
    }
    window.addEventListener('click', onClickOutside, { capture: true })
    return () => {
      window.removeEventListener('click', onClickOutside, { capture: true } as any)
    }
  }, [settingsOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const domain = '@balasabha.com'
      const emailToUse = email.includes('@') ? email : (email.trim() ? `${email.trim()}${domain}` : '')
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      })
      if (signInError) throw signInError
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <button
          type="button"
          className="settings-btn top-right"
          aria-label={t('settings')}
          onClick={() => setSettingsOpen((v) => !v)}
          ref={settingsBtnRef}
        >
          <span style={{ color: '#000' }}>{t('language')}</span>
        </button>
        {settingsOpen && (
          <div className="settings-panel" role="dialog" aria-label={t('settings')} ref={settingsPanelRef}>
            <label className="field" style={{ margin: 0 }}>
              <span>{t('language')}</span>
              <select value={lang} onChange={(e) => { setLang(e.target.value as 'en' | 'ml'); setSettingsOpen(false) }}>
                <option value="en">{t('english')}</option>
                <option value="ml">{t('malayalam')}</option>
              </select>
            </label>
          </div>
        )}
        <form className="modal-body" onSubmit={handleSubmit}>
          <img src="/kudumbasree.png" alt="Kudumbashree" className="login-logo" />
          <h2 className="modal-title">{t('login_title')}</h2>
          <label className="field">
            <span>{t('login_email')}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              ref={emailInputRef}
              placeholder={tLocal.emailPlaceholder}
            />
            {!email.includes('@') && email.trim() && (
              <button
                type="button"
                className="email-suggestion"
                onClick={() => {
                  const suggestion = `${email.trim()}@balasabha.com`
                  setEmail(suggestion)
                  setTimeout(() => emailInputRef.current?.focus(), 0)
                }}
                aria-label={tLocal.useSuggestion(`${email.trim()}@balasabha.com`)}
              >
                {tLocal.useSuggestion(`${email.trim()}@balasabha.com`)}
              </button>
            )}
          </label>
          <label className="field password-field">
            <span>{t('login_password')}</span>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="toggle-visibility"
                aria-label={showPassword ? t('hide_password') : t('show_password')}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 3l18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M17.94 17.94C16.2 19.21 14.18 20 12 20c-5 0-9-4-10-8 0 0 1.02-3.64 4.36-6.02M9.9 4.24C10.58 4.08 11.28 4 12 4c5 0 9 4 10 8 0 0-.33 1.18-1.3 2.6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9.88 9.88a3 3 0 004.24 4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                  </svg>
                )}
              </button>
            </div>
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit" className="primary" disabled={loading}>
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('login_signing_in')}
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {t('login_signin')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
