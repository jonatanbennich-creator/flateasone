import { useState } from 'react';
import type { Member, MemberProject } from '@/lib/supabase';
import {
  Mail, Building2, Linkedin, Github, Phone, ArrowUpRight,
  Lock, Edit3, ExternalLink, Home,
} from 'lucide-react';

type Props = {
  member: Member;
  projects: MemberProject[];
  isAdmin: boolean;
  onEdit: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onHome: () => void;
};

export default function BusinessCard({
  member, projects, isAdmin, onEdit, onLogin, onLogout, onHome,
}: Props) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  const initials = member.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/20 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 px-6 sm:px-10 py-6 flex items-center justify-between">
        <button
          onClick={onHome}
          className="font-display font-semibold text-lg text-slate-800 tracking-tight hover:text-primary-600 transition-colors"
        >
          flateas<span className="text-primary-500">.com</span>/{member.username}
        </button>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <Edit3 size={16} />
                Redigera
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Logga ut
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-slate-500 text-sm font-medium hover:bg-slate-100 hover:text-slate-700 transition-colors"
              title="Logga in"
            >
              <Lock size={15} />
              Logga in
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 sm:px-10 pb-20">
        {/* Business card */}
        <div className="glass rounded-3xl shadow-xl shadow-primary-900/5 p-8 sm:p-12 mt-6 animate-slide-up">
          {/* Avatar + Name */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              {member.avatar_url ? (
                <img
                  src={member.avatar_url}
                  alt={member.name}
                  className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-display font-bold text-3xl shadow-lg">
                  {initials || member.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white shadow-sm" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 leading-tight">
                {member.name || member.username}
              </h1>
              {member.company && (
                <p className="text-slate-500 mt-1 text-base flex items-center gap-2">
                  <Building2 size={16} className="text-primary-500" />
                  {member.company}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {member.bio && (
            <p className="mt-6 text-slate-600 leading-relaxed text-[15px] max-w-xl">
              {member.bio}
            </p>
          )}

          {/* Contact info */}
          <div className="mt-8 flex flex-wrap gap-3">
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary-300 hover:shadow-md hover:shadow-primary-900/5 transition-all group"
              >
                <Mail size={18} className="text-primary-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700">{member.email}</span>
              </a>
            )}
            {member.phone && (
              <a
                href={`tel:${member.phone}`}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary-300 hover:shadow-md hover:shadow-primary-900/5 transition-all group"
              >
                <Phone size={18} className="text-primary-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700">{member.phone}</span>
              </a>
            )}
            {member.linkedin_url && (
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary-300 hover:shadow-md hover:shadow-primary-900/5 transition-all group"
              >
                <Linkedin size={18} className="text-primary-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700">LinkedIn</span>
              </a>
            )}
            {member.github_url && (
              <a
                href={member.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-primary-300 hover:shadow-md hover:shadow-primary-900/5 transition-all group"
              >
                <Github size={18} className="text-primary-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700">GitHub</span>
              </a>
            )}
          </div>
        </div>

        {/* Projects section */}
        <div className="mt-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 mb-5 px-1">
            <h2 className="font-display font-semibold text-xl text-slate-800">Projekt</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
            <span className="text-xs text-slate-400 font-medium">{projects.length} st</span>
          </div>

          {projects.length === 0 ? (
            <p className="text-slate-400 text-sm px-1">Inga projekt tillagda ännu.</p>
          ) : (
            <div className="grid gap-4">
              {projects.map((project, index) => (
                <a
                  key={project.id}
                  href={project.project_url || `https://flateas.com/${project.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                  className="group glass rounded-2xl p-5 sm:p-6 flex items-start justify-between gap-4 hover:shadow-lg hover:shadow-primary-900/8 hover:border-primary-300/50 transition-all duration-300 cursor-pointer animate-slide-in"
                  style={{ animationDelay: `${0.15 + index * 0.08}s` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-semibold text-lg text-slate-900 group-hover:text-primary-600 transition-colors">
                        {project.title}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        /{project.slug}
                      </span>
                    </div>
                    {project.description && (
                      <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        hoveredProject === project.id
                          ? 'bg-primary-500 text-white rotate-0 scale-110'
                          : 'bg-slate-100 text-slate-400 -rotate-12'
                      }`}
                    >
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            <ExternalLink size={13} />
            <button onClick={onHome} className="hover:text-slate-600 transition-colors flex items-center gap-1">
              <Home size={13} />
              flateas.com
            </button>
            <span>·</span>
            <span>© {new Date().getFullYear()} {member.name || member.username}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
