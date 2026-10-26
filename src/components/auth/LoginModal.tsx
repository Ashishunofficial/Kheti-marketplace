import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'hi' | 'en' | 'hinglish';
}

// ─── Localised Strings ────────────────────────────────────────────────────────

const labels = {
  hi: {
    title: 'खेती AI ऑथेंटिकेशन सिस्टम',
    subtitle: 'अपने खाते में सुरक्षित लॉगिन करें और सभी कृषि सेवाओं का लाभ उठाएं',
    emailLabel: 'ईमेल पता',
    emailPlaceholder: 'aapka@email.com',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: '••••••••',
    fullNameLabel: 'पूरा नाम',
    fullNamePlaceholder: 'जैसे: रामेश्वर सिंह',
    signIn: 'लॉगिन करें',
    signUp: 'खाता बनाएं',
    googleBtn: 'Google से जारी रखें',
    toggleToSignUp: 'नया खाता बनाएं',
    toggleToSignIn: 'पहले से खाता है? लॉगिन करें',
    or: 'या',
    mockNotice: 'ऑफलाइन मोड: डेमो खाते से चल रहा है।',
    close: 'बंद करें',
    loading: 'कृपया प्रतीक्षा करें...',
  },
  en: {
    title: 'KHETI AI Authentication System',
    subtitle: 'Sign in securely to your account to access all farming services',
    emailLabel: 'Email Address',
    emailPlaceholder: 'you@email.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'e.g. Rameshwar Singh',
    signIn: 'Sign In',
    signUp: 'Create Account',
    googleBtn: 'Continue with Google',
    toggleToSignUp: 'Create new account',
    toggleToSignIn: 'Already have an account? Sign In',
    or: 'OR',
    mockNotice: 'Running in offline demo mode.',
    close: 'Close',
    loading: 'Please wait...',
  },
  hinglish: {
    title: 'KHETI AI Authentication System',
    subtitle: 'Apne account me login karein aur sabhi Kheti AI services access karein',
    emailLabel: 'Email Address',
    emailPlaceholder: 'aapka@email.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    fullNameLabel: 'Poora Naam',
    fullNamePlaceholder: 'Jaise: Rameshwar Singh',
    signIn: 'Login Karein',
    signUp: 'Account Banayein',
    googleBtn: 'Google se Login',
    toggleToSignUp: 'Naya account banayein',
    toggleToSignIn: 'Pehle se account hai? Login karein',
    or: 'YA',
    mockNotice: 'Offline demo mode chal raha hai.',
    close: 'Band Karein',
    loading: 'Please wait...',
  },
};

// ─── Google Logo SVG ─────────────────────────────────────────────────────────

const GoogleLogo = () => (
  <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, lang = 'hinglish' }) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    setSessionFromUrlOrTokens, 
    user: currentUser, 
    profile, 
    signOut 
  } = useAuth();

  const t = labels[lang];
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'email' | 'google' | 'token' | null>(null);

  // Quick fix & OAuth helper state
  const [showOAuthHelp, setShowOAuthHelp] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState<'token' | 'config'>('token');
  const [pastedTokenOrUrl, setPastedTokenOrUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const supabaseProjectRef = 'nsbmlujnxwfnuhnidmap';
  const supabaseUrlConfigLink = `https://supabase.com/dashboard/project/${supabaseProjectRef}/auth/url-configuration`;

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setIsSignUp(false);
    setShowOAuthHelp(false);
    setPastedTokenOrUrl('');
    onClose();
  };

  const handleCopyOrigin = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(currentOrigin);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  const handleTokenPasteAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedTokenOrUrl.trim()) {
      setError('Please paste the URL or token from your address bar.');
      return;
    }
    setError(null);
    setLoadingAction('token');
    try {
      await setSessionFromUrlOrTokens(pastedTokenOrUrl);
      setSuccessMsg('Successfully authenticated! Closing...');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to authenticate with token. Please check the pasted URL.');
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoadingAction('email');
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName);
      } else {
        await signInWithEmail(email, password);
      }
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoadingAction('google');
    try {
      await signInWithGoogle();
      // Note: Google OAuth redirects the page, so we won't reach handleClose normally.
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Google sign-in failed. Please try again.');
      }
      setLoadingAction(null);
    }
  };

  const isLoading = loadingAction !== null;

  return (
    // ── Backdrop ──────────────────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      {/* ── Modal Card ───────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">

        {/* Top gradient bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-600 flex-shrink-0" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 z-10 cursor-pointer"
          aria-label={t.close}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ── Scrollable Content ───────────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 pt-7 overflow-y-auto space-y-5">

          {/* Brand logo / icon */}
          <div className="flex justify-center">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg p-3">
              <span className="text-2xl" role="img" aria-label="Kheti">🌾</span>
            </div>
          </div>

          {/* Headings */}
          <div className="text-center">
            <h2 className="text-xl font-extrabold text-stone-800 leading-tight">
              {t.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {t.subtitle}
            </p>
          </div>

          {/* Offline notice */}
          {!isSupabaseConfigured && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-800 text-xs">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{t.mockNotice}</span>
            </div>
          )}

          {/* Success message */}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 text-xs font-medium">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Active Session Card if user is currently logged in */}
          {currentUser && (
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Currently Signed In: {profile?.name || currentUser.email}</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  Role: <span className="font-semibold uppercase">{profile?.activeRole || 'User'}</span> · Account: <span className="font-mono text-[10px]">{currentUser.email || currentUser.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  setSuccessMsg('Logged out successfully.');
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-white border border-rose-300 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* ── Google sign-in button ──────────────────────────────────────────── */}
          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-stone-200 bg-white text-stone-700 font-medium text-sm hover:bg-stone-50 hover:border-stone-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              {loadingAction === 'google' ? (
                <svg className="animate-spin w-5 h-5 mr-2 text-emerald-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <GoogleLogo />
              )}
              {t.googleBtn}
            </button>

            {/* Helper toggle: fix redirect issue */}
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => setShowOAuthHelp((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 font-medium hover:underline transition"
              >
                <span>⚡ Got redirected to <code className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-mono text-[11px]">refused to connect</code>?</span>
                <span className="text-[10px]">{showOAuthHelp ? '▲ Hide' : '▼ Click to fix'}</span>
              </button>
            </div>

            {/* OAuth assistance drawer */}
            {showOAuthHelp && (
              <div className="mt-3 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-left space-y-3">
                <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveHelpTab('token')}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
                      activeHelpTab === 'token'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Quick Token Login (Instant)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHelpTab('config')}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
                      activeHelpTab === 'config'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Supabase Subdomain Fix
                  </button>
                </div>

                {activeHelpTab === 'token' ? (
                  <form onSubmit={handleTokenPasteAuth} className="space-y-2">
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      If you just logged in with Google and got redirected with token parameters, copy that entire URL from your address bar and paste it below:
                    </p>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={pastedTokenOrUrl}
                        onChange={(e) => setPastedTokenOrUrl(e.target.value)}
                        placeholder="Paste https://khetiai.developerbilaspur.in/#access_token=... here"
                        className="w-full text-xs px-3 py-2 border border-amber-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-stone-700"
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !pastedTokenOrUrl.trim()}
                        className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                      >
                        {loadingAction === 'token' ? 'Authenticating...' : 'Sign In With Pasted URL / Token'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2 text-[11px] text-amber-900">
                    <p>
                      Supabase redirected back because your subdomain <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">https://khetiai.developerbilaspur.in</code> needs to be in your Supabase project&apos;s allowed Redirect URLs.
                    </p>
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-700">Subdomain App URL:</span>
                        <button
                          type="button"
                          onClick={handleCopyOrigin}
                          className="px-2 py-0.5 text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded font-medium border border-stone-300 transition"
                        >
                          {copiedUrl ? 'Copied!' : 'Copy URL'}
                        </button>
                      </div>
                      <div className="font-mono text-[11px] text-stone-600 break-all select-all bg-stone-50 p-1.5 rounded border border-stone-200">
                        {currentOrigin || 'https://khetiai.developerbilaspur.in'}
                      </div>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                      <li>
                        Open your{' '}
                        <a
                          href={supabaseUrlConfigLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline text-emerald-700 hover:text-emerald-900"
                        >
                          Supabase URL Configuration ↗
                        </a>
                      </li>
                      <li>Set <strong>Site URL</strong> to: <code className="font-mono bg-amber-100 px-1 rounded">https://khetiai.developerbilaspur.in</code></li>
                      <li>In <strong>Redirect URLs</strong>, add:
                        <ul className="list-disc list-inside pl-3 mt-0.5 space-y-0.5 font-mono text-[10px] text-stone-700">
                          <li>https://khetiai.developerbilaspur.in/**</li>
                          <li>https://*.vercel.app/**</li>
                        </ul>
                      </li>
                      <li>Click <strong>Save</strong>. Google Login will then redirect seamlessly!</li>
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs font-semibold text-stone-400 tracking-wider">{t.or}</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* ── Email / Password form ──────────────────────────────────────────── */}
          <form onSubmit={handleEmailAuth} noValidate className="space-y-4">

            {/* Full name — only on sign up */}
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-stone-600 mb-1.5">
                  {t.fullNameLabel}
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  required={isSignUp}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:bg-stone-50 disabled:opacity-60"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-stone-600 mb-1.5">
                {t.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:bg-stone-50 disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-stone-600 mb-1.5">
                {t.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition disabled:bg-stone-50 disabled:opacity-60"
              />
            </div>

            {/* Error display */}
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3.5 py-3 text-red-700 text-xs">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loadingAction === 'email' ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t.loading}
                </>
              ) : (
                isSignUp ? t.signUp : t.signIn
              )}
            </button>
          </form>

          {/* ── Toggle sign-in / sign-up ───────────────────────────────────────── */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp((v) => !v); setError(null); }}
              disabled={isLoading}
              className="text-sm text-emerald-700 hover:text-emerald-900 font-medium hover:underline transition disabled:opacity-50 cursor-pointer"
            >
              {isSignUp ? t.toggleToSignIn : t.toggleToSignUp}
            </button>
          </div>

        </div>

        {/* Bottom trust bar */}
        <div className="px-8 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-center gap-2 text-stone-500">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">KHETI AI Authentication System · Secured & Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
