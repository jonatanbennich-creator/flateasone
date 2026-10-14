import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, User, ArrowLeft, Loader2, Mail } from 'lucide-react';

type Props = {
  onBack: () => void;
  onSuccess: () => void;
};

type Mode = 'login' | 'signup';

export default function AuthScreen({ onBack, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setError(null);
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    resetFields();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

      if (cleanUsername.length < 2) {
        setError('Användarnamnet måste vara minst 2 tecken ( bokstäver, siffror, bindestreck).');
        setLoading(false);
        return;
      }

      // Check if username is taken
      const { data: existing } = await supabase
        .from('members')
        .select('username')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (existing) {
        setError('Användarnamnet är redan taget. Välj ett annat.');
        setLoading(false);
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username: cleanUsername },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Manually insert member row in case the trigger hasn't fired yet
      if (signUpData.user) {
        await supabase.from('members').upsert({
          id: signUpData.user.id,
          username: cleanUsername,
          name: cleanUsername,
          email,
        }).eq('id', signUpData.user.id);
      }

      onSuccess();
      return;
    }

    // Login mode — try email first, then try username→email lookup
    let loginEmail = email;

    // If the input doesn't look like an email, try matching by username
    if (!email.includes('@')) {
      const cleanUsername = email.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      const { data: member } = await supabase
        .from('members')
        .select('email')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (member?.email) {
        loginEmail = member.email;
      } else {
        setError('Hittade ingen användare med det namnet.');
        setLoading(false);
        return;
      }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (signInError) {
      setError('Fel inloggningsuppgifter. Försök igen.');
      setLoading(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/20 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Tillbaka
        </button>

        <div className="glass rounded-3xl shadow-xl shadow-primary-900/5 p-8 animate-slide-up">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg mb-4">
              <Lock size={24} />
            </div>
            <h1 className="font-display font-bold text-xl text-slate-900">
              {mode === 'login' ? 'Logga in' : 'Skapa konto'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'login'
                ? 'Användarnamn eller e-post + lösenord'
                : 'Välj ett användarnamn och lösenord'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Användarnamn
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                    placeholder="t.ex. jonatan"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 pl-1">
                  Din sida blir flateas.com/användarnamn
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                {mode === 'login' ? 'Användarnamn eller e-post' : 'E-post'}
              </label>
              <div className="relative">
                {mode === 'signup' ? (
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                ) : (
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                )}
                <input
                  type={mode === 'signup' ? 'email' : 'text'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus={mode === 'login'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                  placeholder={mode === 'signup' ? 'din@email.com' : 'användarnamn eller e-post'}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Lösenord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
                placeholder="Minst 6 tecken"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {mode === 'login' ? 'Loggar in...' : 'Skapar konto...'}
                </>
              ) : (
                mode === 'login' ? 'Logga in' : 'Skapa konto'
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <>
                Saknar du konto?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  Skapa ett
                </button>
              </>
            ) : (
              <>
                Har du redan ett konto?{' '}
                <button
                  onClick={() => switchMode('login')}
                  className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  Logga in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
