import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Member, MemberProject } from '@/lib/supabase';
import {
  ArrowLeft, Plus, Trash2, GripVertical, Save, Loader2, Check,
  Mail, Building2, Phone, Linkedin, Github, User, Image as ImageIcon,
} from 'lucide-react';

type Props = {
  member: Member;
  projects: MemberProject[];
  onClose: () => void;
  onSaved: () => void;
};

export default function AdminPanel({ member, projects, onClose, onSaved }: Props) {
  const [tab, setTab] = useState<'profile' | 'projects'>('profile');
  const [form, setForm] = useState<Member>(member);
  const [projectList, setProjectList] = useState<MemberProject[]>(projects);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase
      .from('members')
      .update({
        name: form.name,
        email: form.email,
        company: form.company,
        bio: form.bio,
        avatar_url: form.avatar_url,
        linkedin_url: form.linkedin_url,
        github_url: form.github_url,
        phone: form.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', member.id);

    setSaving(false);
    if (updateError) {
      setError('Kunde inte spara profilen.');
      return;
    }
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
    onSaved();
  };

  const handleSaveProjects = async () => {
    setSaving(true);
    setError(null);

    const existingIds = new Set(projectList.map((p) => p.id));
    const originalIds = new Set(projects.map((p) => p.id));
    const toDelete = projects.filter((p) => !existingIds.has(p.id));

    for (const proj of toDelete) {
      await supabase.from('member_projects').delete().eq('id', proj.id);
    }

    for (const proj of projectList) {
      const payload = {
        member_id: member.id,
        title: proj.title,
        slug: proj.slug,
        description: proj.description,
        project_url: proj.project_url,
        display_order: proj.display_order,
        updated_at: new Date().toISOString(),
      };

      if (originalIds.has(proj.id)) {
        await supabase.from('member_projects').update(payload).eq('id', proj.id);
      } else {
        await supabase.from('member_projects').insert(payload);
      }
    }

    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
    onSaved();
  };

  const addProject = () => {
    const newOrder = Math.max(0, ...projectList.map((p) => p.display_order)) + 1;
    setProjectList([
      ...projectList,
      {
        id: crypto.randomUUID(),
        member_id: member.id,
        title: '',
        slug: '',
        description: '',
        project_url: '',
        display_order: newOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  };

  const updateProject = (id: string, field: keyof MemberProject, value: string | number) => {
    setProjectList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const removeProject = (id: string) => {
    setProjectList((prev) => prev.filter((p) => p.id !== id));
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projectList.length) return;
    const updated = [...projectList];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setProjectList(updated.map((p, i) => ({ ...p, display_order: i + 1 })));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={16} />
              Tillbaka
            </button>
            <div className="h-5 w-px bg-slate-200" />
            <h1 className="font-display font-semibold text-lg text-slate-800">Redigera</h1>
          </div>
          {savedFlash && (
            <div className="flex items-center gap-1.5 text-sm text-green-600 animate-fade-in">
              <Check size={16} />
              Sparat!
            </div>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('profile')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Profil
          </button>
          <button
            onClick={() => setTab('projects')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'projects' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Projekt ({projectList.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-sm font-mono font-medium">
                /{member.username}
              </div>
              <span className="text-xs text-slate-400">Din URL — kan inte ändras</span>
            </div>

            <Field label="Namn" icon={<User size={15} />}>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            </Field>

            <Field label="E-post (visas på kortet)" icon={<Mail size={15} />}>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            </Field>

            <Field label="Företag" icon={<Building2 size={15} />}>
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" />
            </Field>

            <Field label="Kort beskrivning">
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="input-field resize-none" placeholder="Berätta kort om dig själv..." />
            </Field>

            <Field label="Profilbild URL" icon={<ImageIcon size={15} />}>
              <input type="url" value={form.avatar_url || ''} onChange={(e) => setForm({ ...form, avatar_url: e.target.value || null })} className="input-field" placeholder="https://..." />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Telefon" icon={<Phone size={15} />}>
                <input type="tel" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value || null })} className="input-field" />
              </Field>
              <Field label="LinkedIn URL" icon={<Linkedin size={15} />}>
                <input type="url" value={form.linkedin_url || ''} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value || null })} className="input-field" />
              </Field>
            </div>

            <Field label="GitHub URL" icon={<Github size={15} />}>
              <input type="url" value={form.github_url || ''} onChange={(e) => setForm({ ...form, github_url: e.target.value || null })} className="input-field" />
            </Field>

            <SaveButton onClick={handleSaveProfile} saving={saving} />
          </div>
        )}

        {/* Projects tab */}
        {tab === 'projects' && (
          <div className="space-y-4 animate-fade-in">
            {projectList.map((project, index) => (
              <div key={project.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-slate-300" />
                    <span className="text-xs font-medium text-slate-400">Projekt {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => moveProject(index, 'up')} disabled={index === 0} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs">↑</button>
                    <button onClick={() => moveProject(index, 'down')} disabled={index === projectList.length - 1} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs">↓</button>
                    <button onClick={() => removeProject(project.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Titel</label>
                    <input type="text" value={project.title} onChange={(e) => updateProject(project.id, 'title', e.target.value)} className="input-field" placeholder="Projektnamn" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">URL-slug</label>
                    <input type="text" value={project.slug} onChange={(e) => updateProject(project.id, 'slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="input-field" placeholder="subaqua" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Beskrivning</label>
                  <textarea value={project.description} onChange={(e) => updateProject(project.id, 'description', e.target.value)} rows={2} className="input-field resize-none" placeholder="Kort beskrivning av projektet" />
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Länk till projektet</label>
                  <input type="url" value={project.project_url || ''} onChange={(e) => updateProject(project.id, 'project_url', e.target.value)} className="input-field" placeholder="https://flateas.com/subaqua" />
                </div>
              </div>
            ))}

            <button onClick={addProject} className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/30 transition-all flex items-center justify-center gap-2">
              <Plus size={18} />
              Lägg till projekt
            </button>

            <SaveButton onClick={handleSaveProjects} saving={saving} />
          </div>
        )}
      </div>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.625rem;
          background: white;
          border: 1px solid rgb(226 232 240);
          font-size: 0.875rem;
          color: rgb(30 41 59);
          transition: all 0.15s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: rgb(54 169 246);
          box-shadow: 0 0 0 3px rgb(224 239 254);
        }
        .input-field::placeholder {
          color: rgb(148 163 184);
        }
      `}</style>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button onClick={onClick} disabled={saving} className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 mt-6">
      {saving ? (<><Loader2 size={16} className="animate-spin" /> Sparar...</>) : (<><Save size={16} /> Spara</>)}
    </button>
  );
}
