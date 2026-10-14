import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Member, MemberProject } from '@/lib/supabase';
import BusinessCard from '@/components/BusinessCard';
import AuthScreen from '@/components/AuthScreen';
import AdminPanel from '@/components/AdminPanel';
import MemberList from '@/components/MemberList';
import { Loader2 } from 'lucide-react';

type View = 'list' | 'card' | 'auth' | 'admin';
type Session = { user: { id: string } } | null;

function getCurrentPath(): string {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return hash;
}

function navigate(path: string) {
  window.location.hash = path ? `/${path}` : '';
}

export default function App() {
  const [view, setView] = useState<View>('list');
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [session, setSession] = useState<Session>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [projects, setProjects] = useState<MemberProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMembers(data as Member[]);
    }
  }, []);

  const fetchMemberData = useCallback(async (username: string) => {
    const { data: memberData, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (memberError || !memberData) {
      setCurrentMember(null);
      setProjects([]);
      return;
    }

    setCurrentMember(memberData as Member);

    const { data: projectData } = await supabase
      .from('member_projects')
      .select('*')
      .eq('member_id', (memberData as Member).id)
      .order('display_order', { ascending: true });

    setProjects((projectData as MemberProject[]) || []);
  }, []);

  // Handle routing from URL hash
  const handleRoute = useCallback(() => {
    const path = getCurrentPath();
    if (path) {
      setCurrentUsername(path);
      setView('card');
    } else {
      setCurrentUsername(null);
      setView('list');
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session as Session);
      await fetchMembers();
      handleRoute();
      setLoading(false);
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession as Session);
    });

    window.addEventListener('hashchange', handleRoute);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('hashchange', handleRoute);
    };
  }, [fetchMembers, handleRoute]);

  // Fetch member data when viewing a card
  useEffect(() => {
    if (view === 'card' && currentUsername) {
      fetchMemberData(currentUsername);
    }
  }, [view, currentUsername, fetchMemberData]);

  const refreshData = useCallback(async () => {
    await fetchMembers();
    if (currentUsername) {
      await fetchMemberData(currentUsername);
    }
  }, [fetchMembers, fetchMemberData, currentUsername]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView(currentUsername ? 'card' : 'list');
  };

  const handleLoginSuccess = () => {
    // After login, go to admin if we're on the logged-in user's page,
    // otherwise go to their page first
    if (session?.user?.id && currentMember?.id === session.user.id) {
      setView('admin');
    } else {
      // Just go back to wherever we were — the admin button will appear
      // if they navigate to their own page
      setView(currentUsername ? 'card' : 'list');
    }
  };

  // When session changes (login), check if current page is the user's own
  useEffect(() => {
    if (session?.user?.id && currentMember?.id === session.user.id && view === 'auth') {
      setView('admin');
    }
  }, [session, currentMember, view]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  // Auth screen
  if (view === 'auth') {
    return <AuthScreen onBack={() => setView(currentUsername ? 'card' : 'list')} onSuccess={handleLoginSuccess} />;
  }

  // Admin panel (only if logged in)
  if (view === 'admin' && session && currentMember) {
    // Only allow editing your own page
    if (currentMember.id !== session.user.id) {
      // Find the current user's member record
      const myMember = members.find((m) => m.id === session.user.id);
      if (myMember) {
        navigate(myMember.username);
        setCurrentUsername(myMember.username);
        setView('card');
        return null;
      }
    }
    return <AdminPanel member={currentMember} projects={projects} onClose={() => setView('card')} onSaved={refreshData} />;
  }

  // Business card for a specific member
  if (view === 'card' && currentMember) {
    const isAdmin = session?.user?.id === currentMember.id;
    return (
      <BusinessCard
        member={currentMember}
        projects={projects}
        isAdmin={isAdmin}
        onEdit={() => setView('admin')}
        onLogin={() => setView('auth')}
        onLogout={handleLogout}
        onHome={() => { navigate(''); setView('list'); }}
      />
    );
  }

  // Member not found while on card view
  if (view === 'card' && !currentMember && currentUsername) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/20 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display font-bold text-2xl text-slate-800 mb-2">Hittades inte</h1>
          <p className="text-slate-500 text-sm mb-6">
            Det finns inget visitkort på <span className="font-mono">/{currentUsername}</span>
          </p>
          <button
            onClick={() => { navigate(''); setView('list'); }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Till startsidan
          </button>
        </div>
      </div>
    );
  }

  // Member list (landing page)
  return <MemberList members={members} onLogin={() => setView('auth')} />;
}
