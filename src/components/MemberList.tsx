import type { Member } from '@/lib/supabase';
import { ArrowUpRight, Lock, Home } from 'lucide-react';

type Props = {
  members: Member[];
  onLogin: () => void;
};

export default function MemberList({ members, onLogin }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/20 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent-200/20 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 px-6 sm:px-10 py-6 flex items-center justify-between">
        <div className="font-display font-semibold text-lg text-slate-800 tracking-tight">
          flateas<span className="text-primary-500">.com</span>
        </div>
        <button
          onClick={onLogin}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-500 text-sm font-medium hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <Lock size={15} />
          Logga in
        </button>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 pb-20">
        <div className="text-center mt-8 mb-12 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg mb-5">
            <Home size={28} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900">
            Välj ett visitkort
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            Klicka på en person för att se deras digitala visitkort
          </p>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">
              Inga visitkort skapade ännu. Logga in för att skapa det första.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {members.map((member, index) => {
              const initials = (member.name || member.username)
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <a
                  key={member.id}
                  href={`#/${member.username}`}
                  className="group glass rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg hover:shadow-primary-900/8 hover:border-primary-300/50 transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="shrink-0">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} className="w-14 h-14 rounded-xl object-cover shadow-md" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-lg shadow-md">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-base text-slate-900 group-hover:text-primary-600 transition-colors truncate">
                      {member.name || member.username}
                    </h3>
                    {member.company && (
                      <p className="text-sm text-slate-500 truncate">{member.company}</p>
                    )}
                    <p className="text-xs text-slate-400 font-mono mt-0.5">/{member.username}</p>
                  </div>
                  <div className="shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
