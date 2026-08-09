import { useMemo, useState } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertCircle, ArrowUpRight, BarChart3, BookOpen, BookOpenCheck, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronRight, CircleUserRound, ClipboardCheck,
  Clock3, Download, FileText, Filter, GraduationCap, Grid2X2, LayoutDashboard, LibraryBig,
  ListFilter, LogOut, Mail, Menu, MoreHorizontal, Pencil, Plus, Search, Settings2,
  ShieldCheck, SlidersHorizontal, Star, Target, Trash2, TrendingUp, Upload,
  UsersRound, X, Bell, Building2, Layers3
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

type Role = 'student' | 'lecturer' | 'admin';
type AssignmentStatus = 'Not started' | 'In progress' | 'Submitted' | 'Marked';

type Assignment = {
  id: number; title: string; course: string; courseCode: string; due: string; points: number;
  status: AssignmentStatus; submissions: number; total: number; description: string;
};

const currentUser = {
  student: { name: 'Amara Okafor', initials: 'AO', role: 'Student', subtitle: 'Year 3 · BSc Information Systems' },
  lecturer: { name: 'Dr. Mateo Ndlovu', initials: 'MN', role: 'Lecturer', subtitle: 'School of Computing' },
  admin: { name: 'Nia Mensah', initials: 'NM', role: 'Administrator', subtitle: 'Academic Registry' },
};

const courses = [
  { code: 'CSE 301', name: 'Human-Computer Interaction', lecturer: 'Dr. L. Adebayo', progress: 78, color: 'teal', next: 'Heuristic evaluation' },
  { code: 'INF 312', name: 'Data & Society', lecturer: 'Prof. T. Mensah', progress: 64, color: 'coral', next: 'Policy brief workshop' },
  { code: 'CSE 326', name: 'Systems Analysis', lecturer: 'Dr. M. Ndlovu', progress: 51, color: 'gold', next: 'Use-case modelling' },
  { code: 'BUS 204', name: 'Digital Enterprise', lecturer: 'Ms. K. Owusu', progress: 89, color: 'blue', next: 'Pitch deck review' },
];

const initialAssignments: Assignment[] = [
  { id: 1, title: 'Heuristic Evaluation Report', course: 'Human-Computer Interaction', courseCode: 'CSE 301', due: 'Tomorrow, 23:59', points: 30, status: 'In progress', submissions: 0, total: 86, description: 'Evaluate a public service interface using Nielsen’s ten heuristics. Include annotated screens and three priority recommendations.' },
  { id: 2, title: 'Policy Brief: Data Dignity', course: 'Data & Society', courseCode: 'INF 312', due: '18 Oct 2024', points: 25, status: 'Not started', submissions: 0, total: 74, description: 'Write a concise policy brief exploring consent, ownership and the everyday cost of data extraction.' },
  { id: 3, title: 'Use-case Model v2', course: 'Systems Analysis', courseCode: 'CSE 326', due: '22 Oct 2024', points: 20, status: 'Submitted', submissions: 61, total: 82, description: 'Revise your domain model and use-case diagrams following the studio critique.' },
  { id: 4, title: 'Enterprise Pitch Deck', course: 'Digital Enterprise', courseCode: 'BUS 204', due: '29 Oct 2024', points: 40, status: 'Marked', submissions: 76, total: 79, description: 'Build a ten-slide pitch for a digital venture that solves a real local problem.' },
  { id: 5, title: 'Research Methods Reflection', course: 'Data & Society', courseCode: 'INF 312', due: '04 Nov 2024', points: 15, status: 'Not started', submissions: 0, total: 74, description: 'Reflect on sampling, positionality and how method shapes what can be known.' },
];

const activity = [
  { id: 1, title: 'Dr. Adebayo posted a new resource', detail: 'CSE 301 · Reading pack 04', time: '18 min ago', kind: 'resource' },
  { id: 2, title: 'Assignment due tomorrow', detail: 'Heuristic Evaluation Report', time: '2 hrs ago', kind: 'deadline' },
  { id: 3, title: 'You received feedback', detail: 'Enterprise Pitch Deck · 34/40', time: 'Yesterday', kind: 'feedback' },
  { id: 4, title: 'Course announcement', detail: 'INF 312 · Seminar moved to Room B14', time: 'Yesterday', kind: 'announcement' },
];

const notificationsSeed = [
  { id: 1, title: 'Assignment due tomorrow', detail: 'Heuristic Evaluation Report is due at 23:59.', date: 'Today', read: false, kind: 'deadline' },
  { id: 2, title: 'Feedback is ready', detail: 'Your Enterprise Pitch Deck has been marked by Ms. Owusu.', date: 'Yesterday', read: false, kind: 'grade' },
  { id: 3, title: 'New resource in CSE 301', detail: 'Reading pack 04 is now available in your library.', date: 'Yesterday', read: true, kind: 'resource' },
  { id: 4, title: 'Seminar room updated', detail: 'INF 312 now meets in Room B14 this Thursday.', date: 'Mon, 14 Oct', read: true, kind: 'calendar' },
];

const weeklyData = [
  { day: 'Mon', hours: 2.4 }, { day: 'Tue', hours: 3.6 }, { day: 'Wed', hours: 1.8 },
  { day: 'Thu', hours: 4.5 }, { day: 'Fri', hours: 3.1 }, { day: 'Sat', hours: 2.1 }, { day: 'Sun', hours: 1.2 },
];

const queryClient = new QueryClient();

function Avatar({ initials, size = 'md' }: { initials: string; size?: 'sm' | 'md' | 'lg' }) {
  return <div data-testid={`avatar-${initials}`} className={`avatar avatar-${size}`}>{initials}</div>;
}

function Logo() {
  return <Link href="/student/dashboard" data-testid="link-logo" className="flex items-center gap-2.5 group">
    <span className="logo-mark"><span /></span>
    <span className="font-display text-[19px] tracking-[-.04em] text-foreground">xcel<span className="text-primary">learn</span></span>
  </Link>;
}

function IconBadge({ kind }: { kind: string }) {
  const Icon = kind === 'deadline' ? Clock3 : kind === 'grade' ? CheckCircle2 : kind === 'resource' ? BookOpen : CalendarDays;
  return <span className={`icon-badge ${kind}`}><Icon size={16} /></span>;
}

function Button({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, testId }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'quiet' | 'outline' | 'danger' | 'ghost';
  className?: string; type?: 'button' | 'submit'; disabled?: boolean; testId?: string;
}) {
  return <button type={type} onClick={onClick} disabled={disabled} data-testid={testId} className={`btn btn-${variant} ${className}`}>{children}</button>;
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="page-title">
    <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>
    {action}
  </div>;
}

function StatCard({ label, value, detail, icon: Icon, tone = 'teal' }: { label: string; value: string; detail: string; icon: typeof TrendingUp; tone?: string }) {
  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`stat-card tone-${tone}`}>
    <div className="flex items-start justify-between"><div className="stat-label">{label}</div><span className="stat-icon"><Icon size={17} /></span></div>
    <div className="stat-value">{value}</div><div className="stat-detail">{detail}</div>
  </motion.div>;
}

function ProgressBar({ value, tone = 'teal' }: { value: number; tone?: string }) {
  return <div className="progress-track"><div className={`progress-fill ${tone}`} style={{ width: `${value}%` }} /></div>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.currentTarget === e.target) onClose(); }}>
    <motion.div initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="modal">
      <div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} data-testid="button-close-modal"><X size={18} /></button></div>
      {children}
    </motion.div>
  </div>;
}

function Shell({ role, children, onLogout }: { role: Role; children: React.ReactNode; onLogout: () => void }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const profile = currentUser[role];
  const nav = role === 'admin' ? [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: UsersRound },
    { href: '/admin/departments', label: 'Departments', icon: Building2 },
    { href: '/admin/faculties', label: 'Faculties', icon: Layers3 },
    { href: '/admin/courses', label: 'Courses', icon: BookOpen },
    { href: '/admin/assignments', label: 'Assignments', icon: ClipboardCheck },
    { href: '/admin/activity', label: 'Activity log', icon: Activity },
  ] : role === 'student' ? [
    { href: '/student/library', label: 'Library', icon: LibraryBig },
    { href: '/student/assignments', label: 'Assignments', icon: ClipboardCheck },
    { href: '/notifications', label: 'Notifications', icon: Bell, count: 2 },
    { href: '/student/profile', label: 'Profile', icon: CircleUserRound },
  ] : [
    { href: '/lecturer/assignments', label: 'Assignments', icon: ClipboardCheck },
    { href: '/lecturer/submissions', label: 'Submissions', icon: CheckCircle2 },
    { href: '/notifications', label: 'Notifications', icon: Bell, count: 2 },
    { href: '/lecturer/profile', label: 'Profile', icon: CircleUserRound },
  ];
  const home = role === 'student' ? '/student/dashboard' : role === 'lecturer' ? '/lecturer/dashboard' : '/admin/dashboard';
  const isAdmin = role === 'admin';
  if (isAdmin) {
    return <div className="original-app-frame">
      <button className="original-mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} data-testid="button-open-menu">{mobileOpen ? <X size={24} /> : <Menu size={24} />}</button>
      <aside className={`original-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="original-sidebar-brand"><strong>XcelLearn</strong><span>by XEStudioz</span></div>
        <nav className="original-sidebar-nav">{nav.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={location === item.href ? 'active' : ''} data-testid={`link-${item.label.toLowerCase().replaceAll(' ', '-')}`}><item.icon size={18} />{item.label}</Link>)}</nav>
        <div className="original-sidebar-profile"><div className="original-avatar">{profile.initials}</div><div><strong>{profile.name}</strong><span>{profile.role}</span></div></div>
        <button className="original-logout" onClick={onLogout} data-testid="button-logout"><LogOut size={16} /> Logout</button>
      </aside>
      {mobileOpen && <button className="original-sidebar-overlay" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
      <main className="original-main"><div className="original-page">{children}</div></main>
    </div>;
  }
  return <div className="original-role-frame">
    <header className="original-role-header"><div><strong>XcelLearn</strong><span>by XEStudioz</span></div><Link href="/notifications" className="original-bell" data-testid="link-topbar-notifications"><Bell size={20} />{(nav.find(n => n.label === 'Notifications') as any)?.count > 0 && <b>2</b>}</Link></header>
    <main className="original-role-main"><div className="original-role-page">{children}</div></main>
    <nav className="original-bottom-nav">{nav.map((item) => { const active = location === item.href || location.startsWith(item.href + '/'); return <Link key={item.href} href={item.href} className={active ? 'active' : ''} data-testid={`nav-tab-${item.label.toLowerCase()}`}><span className="original-nav-icon"><item.icon size={22} strokeWidth={active ? 2.5 : 1.8} />{item.count && <b>{item.count}</b>}</span><small>{item.label}</small>{active && <i />}</Link>; })}</nav>
  </div>;
}

function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [role, setRole] = useState<Role>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const fillDemo = (nextRole: Role) => { setRole(nextRole); setUsername(nextRole === 'student' ? 'student1' : nextRole === 'lecturer' ? 'lect1' : 'admin'); setPassword(nextRole === 'admin' ? 'admin123' : 'pass123'); };
  return <div className="original-login-page"><div className="original-login-wrap"><div className="original-login-brand"><h1>XcelLearn</h1><p>by XEStudioz</p></div><section className="original-login-card"><div className="original-login-card-head"><h2>Welcome back</h2><p>Select your role to sign in</p></div><div className="original-role-tabs">{(['student', 'lecturer', 'admin'] as Role[]).map((item) => <button key={item} onClick={() => fillDemo(item)} className={role === item ? 'selected' : ''} data-testid={`button-role-${item}`}>{item === 'admin' ? 'Admin' : item[0].toUpperCase() + item.slice(1)}</button>)}</div><form className="original-login-form" onSubmit={(e) => { e.preventDefault(); onLogin(role); }}><label>Username<input value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" data-testid="input-username" /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" data-testid="input-password" /></label><Button type="submit" className="w-full" testId="button-submit">Sign In</Button></form><div className="original-demo-credentials"><strong>Demo Credentials</strong><button onClick={() => fillDemo('admin')}>Admin: admin / admin123</button><button onClick={() => fillDemo('student')}>Student: student1 / pass123</button><button onClick={() => fillDemo('lecturer')}>Lecturer: lect1 / pass123</button></div></section></div></div>;
}

function StudentDashboard() {
  const due = initialAssignments.filter(a => a.status !== 'Marked').slice(0, 3);
  return <div className="original-dashboard-stack">
    <div className="original-simple-title"><h1>Welcome back, Amara</h1><p>Here is your progress overview.</p></div>
    <div className="original-stat-grid">
      <div className="original-stat-card"><span>Enrolled Courses</span><strong>4</strong><BookOpen size={16} /></div>
      <div className="original-stat-card"><span>Assignments Progress</span><strong>14 / 19</strong><FileText size={16} /></div>
      <div className="original-stat-card"><span>Quizzes Completed</span><strong>6 / 8</strong><CheckCircle2 size={16} /></div>
      <div className="original-stat-card primary"><span>Upcoming Deadlines</span><strong>{due.length}</strong><Clock3 size={16} /></div>
    </div>
    <div className="original-dashboard-columns">
      <section className="original-simple-card"><h2>Approaching Deadlines</h2><div className="original-deadline-list">{due.map(a => <div key={a.id}><div><strong>{a.title}</strong><small>Due: {a.due}</small></div><Link href="/student/assignments">View</Link></div>)}</div></section>
      <section className="original-simple-card"><h2>Course progress</h2>{courses.slice(0, 3).map(c => <div className="original-course-line" key={c.code}><div><span>{c.code}</span><b>{c.progress}%</b></div><ProgressBar value={c.progress} tone="teal" /></div>)}</section>
    </div>
  </div>;
}

function AssignmentRow({ assignment, lecturer = false, onOpen }: { assignment: Assignment; lecturer?: boolean; onOpen?: (a: Assignment) => void }) {
  const tone = assignment.status === 'Marked' ? 'success' : assignment.status === 'Submitted' ? 'submitted' : assignment.status === 'In progress' ? 'progress' : 'neutral';
  return <div className="assignment-row" data-testid={`row-assignment-${assignment.id}`}><div className="assignment-symbol"><FileText size={17} /></div><div className="min-w-0 flex-1"><div className="assignment-row-title">{assignment.title}</div><div className="assignment-row-meta">{assignment.courseCode} <span>·</span> {lecturer ? `${assignment.submissions}/${assignment.total} submitted` : `Due ${assignment.due}`}</div></div>{lecturer ? <div className="submission-meter hidden sm:block"><span>{assignment.submissions}/{assignment.total}</span><ProgressBar value={(assignment.submissions / assignment.total) * 100} tone="teal" /></div> : <><span className={`status-pill ${tone}`}>{assignment.status}</span><span className="row-arrow"><ChevronRight size={16} /></span></>}</div>;
}

function StudentAssignments({ assignments, setAssignments }: { assignments: Assignment[]; setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>> }) {
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('All'); const [open, setOpen] = useState<Assignment | null>(null);
  const visible = assignments.filter(a => (filter === 'All' || a.status === filter) && `${a.title} ${a.course}`.toLowerCase().includes(query.toLowerCase()));
  return <div><PageTitle eyebrow="Coursework" title="Assignments" description="A clear view of what’s due, what’s moving, and what’s done." action={<Button onClick={() => setFilter('All')} variant="quiet" testId="button-reset-filters"><ListFilter size={16} /> {assignments.filter(a => a.status !== 'Marked').length} active</Button>} /><div className="toolbar card-shell"><div className="search-field"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search assignments..." data-testid="input-search-assignments" /></div><div className="filter-tabs">{['All', 'Not started', 'In progress', 'Submitted', 'Marked'].map(s => <button key={s} className={filter === s ? 'selected' : ''} onClick={() => setFilter(s)} data-testid={`button-filter-${s.toLowerCase().replaceAll(' ', '-')}`}>{s}</button>)}</div></div><div className="assignment-board"><div className="board-summary"><span>{visible.length} assignments</span><span className="text-muted-foreground">Sorted by due date <ChevronDown size={13} /></span></div>{visible.length ? visible.map(a => <button className="assignment-card" key={a.id} onClick={() => setOpen(a)} data-testid={`button-open-assignment-${a.id}`}><div className={`assignment-card-accent ${a.status === 'In progress' ? 'coral' : a.status === 'Marked' ? 'blue' : 'teal'}`} /><div className="assignment-card-main"><div className="flex items-start justify-between gap-3"><div><div className="course-kicker">{a.courseCode} · {a.course}</div><h3>{a.title}</h3></div><span className={`status-pill ${a.status === 'Marked' ? 'success' : a.status === 'Submitted' ? 'submitted' : a.status === 'In progress' ? 'progress' : 'neutral'}`}>{a.status}</span></div><p>{a.description}</p><div className="assignment-card-foot"><span><Clock3 size={14} /> {a.due}</span><span><Star size={14} /> {a.points} points</span><span className="open-label">Open details <ArrowUpRight size={14} /></span></div></div></button>) : <EmptyState icon={Search} title="No work found" detail="Try a different search or status filter." action={<Button variant="quiet" onClick={() => { setQuery(''); setFilter('All'); }}>Clear filters</Button>} />}</div>{open && <SubmissionModal assignment={open} onClose={() => setOpen(null)} onSubmit={() => { setAssignments(prev => prev.map(a => a.id === open.id ? { ...a, status: 'Submitted' } : a)); setOpen(null); }} />}</div>;
}

function SubmissionModal({ assignment, onClose, onSubmit }: { assignment: Assignment; onClose: () => void; onSubmit: () => void }) {
  const [file, setFile] = useState(''); const [note, setNote] = useState('');
  return <Modal title={assignment.title} onClose={onClose}><div className="modal-course">{assignment.courseCode} · {assignment.course}<span className="status-pill progress">{assignment.points} points</span></div><p className="modal-description">{assignment.description}</p><div className="submission-callout"><Clock3 size={17} /><div><strong>Due {assignment.due}</strong><span>Late submissions are accepted with a note to your lecturer.</span></div></div><label className="field-label">Your submission</label><button className="upload-zone" onClick={() => setFile(file ? '' : 'heuristic-evaluation-report.pdf')} data-testid="button-upload-file"><Upload size={20} /><span>{file || 'Choose a file from your device'}</span><small>PDF, DOCX up to 20 MB</small></button><label className="field-label mt-4">Note to lecturer <span>optional</span></label><textarea className="field-input textarea" value={note} onChange={e => setNote(e.target.value)} placeholder="Add context for your submission..." data-testid="input-submission-note" /><div className="modal-actions"><Button variant="quiet" onClick={onClose} testId="button-cancel-submission">Save for later</Button><Button onClick={onSubmit} disabled={!file} testId="button-submit-assignment"><Check size={16} /> Submit assignment</Button></div></Modal>;
}

function StudentLibrary() {
  const [query, setQuery] = useState(''); const [selected, setSelected] = useState('All resources');
  const resources = [
    { title: 'Reading pack 04 — Evaluating interfaces', type: 'Reading pack', course: 'CSE 301', meta: '12 pages · Added 18 min ago', icon: FileText },
    { title: 'Workshop slides: data dignity', type: 'Slides', course: 'INF 312', meta: '34 slides · Added yesterday', icon: Layers3 },
    { title: 'Use-case modelling studio guide', type: 'Guide', course: 'CSE 326', meta: 'PDF · Added 12 Oct', icon: BookOpenCheck },
    { title: 'Digital venture canvas', type: 'Template', course: 'BUS 204', meta: 'Editable template · Added 08 Oct', icon: Grid2X2 },
    { title: 'Research methods glossary', type: 'Reference', course: 'INF 312', meta: '98 terms · Added 03 Oct', icon: LibraryBig },
  ];
  const shown = resources.filter(r => `${r.title} ${r.course}`.toLowerCase().includes(query.toLowerCase()) && (selected === 'All resources' || r.type === selected));
  return <div><PageTitle eyebrow="Course library" title="Resources" description="Your reading, studio notes, references and useful things — together." action={<Button variant="quiet" onClick={() => alert('Library export prepared.')} testId="button-export-library"><Download size={16} /> Export library</Button>} /><div className="library-feature"><div className="feature-copy"><div className="eyebrow text-primary">Continue reading</div><h2>The design of<br /><span>everyday trust.</span></h2><p>Chapter 3 from your CSE 301 reading pack. You’re 64% through this resource.</p><div className="feature-progress"><ProgressBar value={64} /><span>8 min left</span></div><Button onClick={() => alert('Opening reading pack…')} testId="button-continue-reading">Continue reading <ArrowUpRight size={16} /></Button></div><div className="feature-visual"><div className="book-shape"><span>HCI</span><strong>the<br />quiet<br />interface</strong><small>reading pack 04</small></div></div></div><div className="toolbar card-shell mt-6"><div className="search-field"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your library..." data-testid="input-search-library" /></div><div className="filter-tabs">{['All resources', 'Reading pack', 'Slides', 'Guide'].map(s => <button key={s} className={selected === s ? 'selected' : ''} onClick={() => setSelected(s)} data-testid={`button-library-filter-${s.toLowerCase().replaceAll(' ', '-')}`}>{s}</button>)}</div></div><div className="resource-grid">{shown.map((r, i) => <div className="resource-card" key={r.title} data-testid={`card-resource-${i}`}><div className={`resource-icon resource-${i % 3}`}><r.icon size={20} /></div><div className="resource-type">{r.type} · {r.course}</div><h3>{r.title}</h3><p>{r.meta}</p><div className="resource-actions"><Button variant="ghost" onClick={() => alert(`Opening ${r.title}`)}>Open <ArrowUpRight size={14} /></Button><button className="icon-button" onClick={() => alert('Resource saved to your bookmarks.')} data-testid={`button-bookmark-resource-${i}`}><Star size={16} /></button></div></div>)}</div></div>;
}

function ProfilePage({ role }: { role: Role }) {
  const user = currentUser[role]; const [editing, setEditing] = useState(false); const [name, setName] = useState(user.name); const [saved, setSaved] = useState(false);
  return <div><PageTitle eyebrow="Your workspace" title="Profile" description="The details your academic community sees." action={<Button onClick={() => { setEditing(!editing); setSaved(false); }} variant={editing ? 'quiet' : 'primary'} testId="button-edit-profile">{editing ? 'Cancel editing' : <><Pencil size={15} /> Edit profile</>}</Button>} /><div className="profile-layout"><section className="card-shell profile-card"><div className="profile-cover"><div className="profile-pattern" /></div><div className="profile-avatar-wrap"><Avatar initials={user.initials} size="lg" /></div><div className="profile-card-body">{editing ? <input className="field-input" value={name} onChange={e => setName(e.target.value)} data-testid="input-profile-name" /> : <h2 data-testid="text-profile-name">{name}</h2>}<p>{user.subtitle}</p><div className="profile-tags"><span>Active this term</span><span>Joined Sep 2022</span></div><div className="profile-details"><div><span>University email</span><strong>{role === 'student' ? 'amara.okafor' : role === 'lecturer' ? 'mateo.ndlovu' : 'nia.mensah'}@university.edu</strong></div><div><span>Department</span><strong>{role === 'student' ? 'Information Systems' : role === 'lecturer' ? 'Computer Science' : 'Academic Registry'}</strong></div><div><span>Location</span><strong>Accra campus · Main block</strong></div></div>{editing && <Button className="w-full mt-4" onClick={() => { setEditing(false); setSaved(true); }} testId="button-save-profile"><Check size={16} /> Save changes</Button>}{saved && <div className="saved-note"><CheckCircle2 size={15} /> Profile updated just now</div>}</div></section>{role === 'student' ? <section className="card-shell panel"><div className="panel-head"><div><h3>Academic progress</h3><p>How your degree is taking shape.</p></div><GraduationCap size={20} className="text-primary" /></div><div className="degree-progress"><div><strong>Year 3</strong><span>of 4</span></div><ProgressBar value={72} tone="teal" /><small>72% of programme credits complete</small></div><div className="profile-stat-row"><div><strong>3.62</strong><span>current GPA</span></div><div><strong>18</strong><span>credits this term</span></div><div><strong>42</strong><span>credits remaining</span></div></div><div className="milestone"><span className="milestone-dot"><Check size={13} /></span><div><strong>Next milestone</strong><span>Complete your capstone proposal by March 2025.</span></div></div></section> : <section className="card-shell panel"><div className="panel-head"><div><h3>Class activity</h3><p>Your teaching footprint this term.</p></div><Activity size={20} className="text-primary" /></div><div className="profile-stat-row lecturer"><div><strong>4</strong><span>active courses</span></div><div><strong>186</strong><span>students taught</span></div><div><strong>92%</strong><span>marked on time</span></div></div><div className="mini-list">{['CSE 326 · Systems Analysis', 'CSE 402 · Product Studio', 'INF 210 · Digital Ethics'].map(x => <div key={x}><span className="course-dot teal" /><strong>{x}</strong><ChevronRight size={15} /></div>)}</div></section>}</div></div>;
}

function LecturerDashboard({ assignments }: { assignments: Assignment[] }) {
  return <div className="original-dashboard-stack">
    <div className="original-simple-title"><h1>Welcome, Mateo</h1><p>Here is your lecturer overview.</p></div>
    <div className="original-stat-grid lecturer">
      <div className="original-stat-card"><span>Courses Taught</span><strong>4</strong><UsersRound size={16} /></div>
      <div className="original-stat-card"><span>Assignments Posted</span><strong>{assignments.length}</strong><FileText size={16} /></div>
      <div className="original-stat-card primary"><span>Pending Submissions</span><strong>18</strong><CheckCircle2 size={16} /></div>
    </div>
    <section className="original-simple-card original-recent-card"><h2><Activity size={18} /> Recent Submissions</h2>{assignments.slice(0, 3).map(a => <div className="original-submission-line" key={a.id}><span>New submission to grade</span><Link href="/lecturer/submissions">Review</Link></div>)}</section>
  </div>;
}

function LecturerAssignments({ assignments, setAssignments }: { assignments: Assignment[]; setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>> }) {
  const [modal, setModal] = useState(false); const [query, setQuery] = useState('');
  const shown = assignments.filter(a => `${a.title} ${a.course}`.toLowerCase().includes(query.toLowerCase()));
  return <div><PageTitle eyebrow="Teaching desk" title="Assignments" description="Create clear briefs, track the work, and close the loop." action={<Button onClick={() => setModal(true)} testId="button-create-assignment"><Plus size={17} /> New assignment</Button>} /><div className="toolbar card-shell"><div className="search-field"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your assignments..." data-testid="input-search-lecturer-assignments" /></div><Button variant="quiet" onClick={() => setQuery('')} testId="button-filter-lecturer-assignments"><Filter size={15} /> Filter</Button></div><section className="card-shell panel mt-5"><div className="panel-head"><div><h3>All assignments</h3><p>5 active briefs across your teaching load.</p></div><span className="period-chip">Current term <ChevronDown size={13} /></span></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Assignment</th><th>Due</th><th>Submissions</th><th>Status</th><th /></tr></thead><tbody>{shown.map(a => <tr key={a.id}><td><div className="table-title"><span className="table-file"><FileText size={15} /></span><div><strong>{a.title}</strong><small>{a.courseCode} · {a.points} points</small></div></div></td><td>{a.due}</td><td><div className="table-submissions"><span>{a.submissions} / {a.total}</span><ProgressBar value={(a.submissions / a.total) * 100} /></div></td><td><span className={`status-pill ${a.submissions === a.total ? 'success' : 'progress'}`}>{a.submissions === a.total ? 'Complete' : 'Collecting'}</span></td><td><button className="icon-button" onClick={() => { if (confirm(`Delete ${a.title}?`)) setAssignments(prev => prev.filter(x => x.id !== a.id)); }} data-testid={`button-delete-assignment-${a.id}`}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div></section>{modal && <CreateAssignmentModal onClose={() => setModal(false)} onCreate={(a) => { setAssignments(prev => [{ ...a, id: Date.now(), submissions: 0, total: 86, status: 'Not started' }, ...prev]); setModal(false); }} />}</div>;
}

function CreateAssignmentModal({ onClose, onCreate }: { onClose: () => void; onCreate: (a: Omit<Assignment, 'id' | 'submissions' | 'total' | 'status'>) => void }) {
  const [title, setTitle] = useState(''); const [course, setCourse] = useState('CSE 326 · Systems Analysis'); const [due, setDue] = useState('12 Nov 2024'); const [points, setPoints] = useState('25');
  return <Modal title="New assignment" onClose={onClose}><p className="modal-description">Give your students a brief they can act on.</p><label className="field-label">Assignment title</label><input className="field-input" autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Critical response memo" data-testid="input-new-assignment-title" /><label className="field-label mt-4">Course</label><select className="field-input" value={course} onChange={e => setCourse(e.target.value)} data-testid="select-new-assignment-course"><option>CSE 326 · Systems Analysis</option><option>CSE 301 · Human-Computer Interaction</option><option>INF 312 · Data & Society</option></select><div className="form-two"><div><label className="field-label">Due date</label><input className="field-input" value={due} onChange={e => setDue(e.target.value)} data-testid="input-new-assignment-due" /></div><div><label className="field-label">Points</label><input className="field-input" value={points} onChange={e => setPoints(e.target.value)} data-testid="input-new-assignment-points" /></div></div><div className="modal-actions"><Button variant="quiet" onClick={onClose}>Cancel</Button><Button onClick={() => title && onCreate({ title, course: course.split(' · ')[1], courseCode: course.split(' · ')[0], due, points: Number(points), description: 'New assignment brief. Add details for your students.' })} disabled={!title} testId="button-save-assignment"><Plus size={16} /> Create assignment</Button></div></Modal>;
}

function LecturerSubmissions() {
  const [selected, setSelected] = useState<number | null>(null); const [graded, setGraded] = useState<number[]>([]); const [score, setScore] = useState('32');
  const submissions = [{ id: 1, name: 'Amara Okafor', initials: 'AO', assignment: 'Use-case Model v2', course: 'CSE 326', submitted: 'Today, 08:42', status: 'To review', score: '—' }, { id: 2, name: 'Kwame Boateng', initials: 'KB', assignment: 'Heuristic Evaluation Report', course: 'CSE 301', submitted: 'Yesterday, 19:14', status: 'To review', score: '—' }, { id: 3, name: 'Sofia Mensimah', initials: 'SM', assignment: 'Use-case Model v2', course: 'CSE 326', submitted: 'Yesterday, 16:22', status: 'To review', score: '—' }, { id: 4, name: 'Daniel Tetteh', initials: 'DT', assignment: 'Enterprise Pitch Deck', course: 'BUS 204', submitted: 'Mon, 14 Oct', status: 'Marked', score: '36/40' }, { id: 5, name: 'Esi Addo', initials: 'EA', assignment: 'Enterprise Pitch Deck', course: 'BUS 204', submitted: 'Mon, 14 Oct', status: 'Marked', score: '31/40' }];
  return <div><PageTitle eyebrow="Teaching desk" title="Submission queue" description="Thoughtful feedback, one student at a time." action={<Button variant="quiet" onClick={() => alert('Queue exported as CSV.')} testId="button-export-submissions"><Download size={16} /> Export queue</Button>} /><div className="submission-layout"><section className="card-shell panel"><div className="panel-head"><div><h3>{submissions.filter(s => s.status === 'To review' && !graded.includes(s.id)).length} to review</h3><p>Oldest first · keep the loop moving.</p></div><span className="period-chip"><SlidersHorizontal size={13} /> All courses</span></div><div className="submission-list">{submissions.map(s => <button key={s.id} onClick={() => setSelected(s.id)} className={`submission-row ${selected === s.id ? 'selected' : ''}`} data-testid={`button-submission-${s.id}`}><Avatar initials={s.initials} size="sm" /><div className="min-w-0 flex-1 text-left"><strong>{s.name}</strong><span>{s.assignment} · {s.course}</span></div><div className="submission-right"><small>{s.submitted}</small><span className={`status-pill ${s.status === 'Marked' || graded.includes(s.id) ? 'success' : 'progress'}`}>{graded.includes(s.id) ? 'Marked' : s.status}</span></div><ChevronRight size={16} /></button>)}</div></section><section className="card-shell panel grading-panel">{selected ? (() => { const s = submissions.find(x => x.id === selected)!; return <><div className="grading-head"><div><div className="eyebrow">Reviewing submission</div><h2>{s.name}</h2><p>{s.assignment} · {s.course}</p></div><Avatar initials={s.initials} size="md" /></div><div className="document-preview"><FileText size={30} /><strong>{s.assignment.toLowerCase().replaceAll(' ', '-')}.pdf</strong><span>Submitted {s.submitted}</span><Button variant="quiet" onClick={() => alert('Preview opened in a new viewer.')} testId="button-preview-document">Preview document <ArrowUpRight size={14} /></Button></div><label className="field-label">Score out of 40</label><div className="score-input"><input value={score} onChange={e => setScore(e.target.value)} data-testid="input-grade-score" /><span>/ 40</span></div><label className="field-label mt-4">Feedback</label><textarea className="field-input textarea" defaultValue="A clear and considered model. Your actor boundaries are especially strong. For the next iteration, make the relationship between the alternate flows more explicit." data-testid="input-grade-feedback" /><Button className="w-full mt-4" onClick={() => { setGraded(prev => [...prev, s.id]); setSelected(null); }} testId="button-save-grade"><CheckCircle2 size={16} /> Save mark & feedback</Button></>; })() : <EmptyState icon={ClipboardCheck} title="Select a submission" detail="Choose a student from the queue to begin reviewing." />}</section></div></div>;
}

function AdminDashboard() {
  return <div className="original-dashboard-stack">
    <h1 className="original-dashboard-heading">Dashboard Overview</h1>
    <div className="original-stat-grid">
      <div className="original-stat-card"><span>Total Users</span><strong>2,486</strong><UsersRound size={16} /></div>
      <div className="original-stat-card"><span>Departments</span><strong>12</strong><Building2 size={16} /></div>
      <div className="original-stat-card"><span>Courses</span><strong>84</strong><BookOpen size={16} /></div>
      <div className="original-stat-card"><span>Assignments</span><strong>312</strong><FileText size={16} /></div>
    </div>
  </div>;
}

type AdminEntity = { id: number; name: string; sub: string; meta: string; status?: string };
function AdminTablePage({ type }: { type: 'users' | 'departments' | 'faculties' | 'courses' | 'assignments' | 'activity' }) {
  const config = {
    users: { title: 'Users', eyebrow: 'Institutional directory', desc: 'People, roles and access across XcelLearn.', icon: UsersRound, action: 'Add user', columns: ['Name', 'Role', 'Department', 'Last active', 'Status'], rows: [{ name: 'Amara Okafor', sub: 'amara.okafor@university.edu', meta: 'Information Systems', status: 'Student' }, { name: 'Dr. Mateo Ndlovu', sub: 'mateo.ndlovu@university.edu', meta: 'Computer Science', status: 'Lecturer' }, { name: 'Kwame Boateng', sub: 'kwame.boateng@university.edu', meta: 'Systems Engineering', status: 'Student' }, { name: 'Nia Mensah', sub: 'nia.mensah@university.edu', meta: 'Academic Registry', status: 'Admin' }] },
    departments: { title: 'Departments', eyebrow: 'Academic structure', desc: 'Shape the schools and disciplines behind the term.', icon: Building2, action: 'Add department', columns: ['Department', 'Faculty', 'Courses', 'Students', 'Status'], rows: [{ name: 'Computer Science', sub: 'CSE', meta: 'Faculty of Computing', status: 'Active' }, { name: 'Information Systems', sub: 'INF', meta: 'Faculty of Computing', status: 'Active' }, { name: 'Business Administration', sub: 'BUS', meta: 'Faculty of Business', status: 'Active' }, { name: 'Mechanical Engineering', sub: 'MEC', meta: 'Faculty of Engineering', status: 'Review' }] },
    faculties: { title: 'Faculties', eyebrow: 'Academic structure', desc: 'The larger constellations of your institution.', icon: Layers3, action: 'Add faculty', columns: ['Faculty', 'Dean', 'Departments', 'Students', 'Status'], rows: [{ name: 'Faculty of Computing', sub: 'FOC', meta: 'Prof. Lydia Adebayo', status: 'Active' }, { name: 'Faculty of Business', sub: 'FOB', meta: 'Dr. Joseph Quartey', status: 'Active' }, { name: 'Faculty of Engineering', sub: 'FOE', meta: 'Prof. Ama Ofori', status: 'Active' }, { name: 'Faculty of Arts & Social Sci.', sub: 'FASS', meta: 'Dr. Evelyn Tetteh', status: 'Active' }] },
    courses: { title: 'Courses', eyebrow: 'Curriculum catalogue', desc: 'Courses currently available to the university.', icon: BookOpen, action: 'Add course', columns: ['Course', 'Department', 'Lecturer', 'Enrolled', 'Status'], rows: [{ name: 'Human-Computer Interaction', sub: 'CSE 301 · 15 credits', meta: 'Computer Science · Dr. Adebayo', status: 'Running' }, { name: 'Data & Society', sub: 'INF 312 · 15 credits', meta: 'Information Systems · Prof. Mensah', status: 'Running' }, { name: 'Systems Analysis', sub: 'CSE 326 · 20 credits', meta: 'Computer Science · Dr. Ndlovu', status: 'Running' }, { name: 'Responsible AI', sub: 'CSE 410 · 15 credits', meta: 'Computer Science · New', status: 'Draft' }] },
    assignments: { title: 'Assignment oversight', eyebrow: 'Academic operations', desc: 'A wide-angle view of briefs, submissions and marking.', icon: ClipboardCheck, action: 'Export report', columns: ['Assignment', 'Course', 'Submissions', 'Due', 'Status'], rows: initialAssignments.map(a => ({ name: a.title, sub: `${a.points} points`, meta: `${a.courseCode} · ${a.course}`, status: a.status === 'Marked' ? 'Closed' : 'Open' })) },
    activity: { title: 'Activity log', eyebrow: 'Institutional record', desc: 'A transparent trail of meaningful changes.', icon: Activity, action: 'Export log', columns: ['Activity', 'Actor', 'Area', 'Time', 'Status'], rows: [{ name: 'New course published', sub: 'CSE 410 · Responsible AI', meta: 'Nia Mensah', status: 'Completed' }, { name: 'Assignment threshold updated', sub: 'INF 312 · Policy Brief', meta: 'Dr. Mateo Ndlovu', status: 'Completed' }, { name: 'New student cohort imported', sub: 'Business School · 2024/25', meta: 'Registry bot', status: 'Completed' }, { name: 'Department data requested', sub: 'Mechanical Engineering', meta: 'Nia Mensah', status: 'Pending' }]} 
  }[type];
  const [query, setQuery] = useState(''); const [rows, setRows] = useState(config.rows); const [modal, setModal] = useState(false);
  const filtered = rows.filter(r => `${r.name} ${r.sub} ${r.meta}`.toLowerCase().includes(query.toLowerCase()));
  return <div><PageTitle eyebrow={config.eyebrow} title={config.title} description={config.desc} action={<Button onClick={() => type === 'activity' ? alert('Activity log exported.') : setModal(true)} testId={`button-${type}-primary-action`}><Plus size={16} /> {config.action}</Button>} /><div className="toolbar card-shell"><div className="search-field"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} data-testid={`input-search-${type}`} /></div><Button variant="quiet" onClick={() => setQuery('')} testId={`button-filter-${type}`}><Filter size={15} /> Filter</Button></div><section className="card-shell panel mt-5"><div className="panel-head"><div><h3>{filtered.length} {type === 'activity' ? 'recent events' : type}</h3><p>Updated moments ago</p></div><span className="period-chip">All records <ChevronDown size={13} /></span></div><div className="table-wrap"><table className="data-table"><thead><tr>{config.columns.map(c => <th key={c}>{c}</th>)}<th /></tr></thead><tbody>{filtered.map((r, i) => <tr key={`${r.name}-${i}`} data-testid={`row-${type}-${i}`}><td><div className="table-title"><span className={`table-file ${type}`}><config.icon size={15} /></span><div><strong>{r.name}</strong><small>{r.sub}</small></div></div></td><td>{r.meta}</td><td>{type === 'users' ? ['Today, 09:14', 'Today, 08:42', 'Yesterday', 'Just now'][i] : type === 'assignments' ? `${initialAssignments[i]?.submissions || 0} / ${initialAssignments[i]?.total || 86}` : type === 'activity' ? r.meta : ['6', '4', '9', '3'][i] || '—'}</td><td>{type === 'activity' ? ['12 min ago', '3 hrs ago', 'Yesterday', '2 days ago'][i] : type === 'assignments' ? initialAssignments[i]?.due : type === 'users' ? 'Active' : ['Active', 'Active', 'Active', 'Review'][i]}</td><td><span className={`status-pill ${(r.status === 'Active' || r.status === 'Running' || r.status === 'Completed' || r.status === 'Closed') ? 'success' : r.status === 'Draft' || r.status === 'Pending' || r.status === 'Review' ? 'progress' : 'neutral'}`}>{r.status}</span></td><td><button className="icon-button" onClick={() => { if (confirm(`Remove ${r.name}?`)) setRows(prev => prev.filter(x => x !== r)); }} data-testid={`button-delete-${type}-${i}`}><MoreHorizontal size={16} /></button></td></tr>)}</tbody></table></div></section>{modal && <GenericAdminModal title={`Add ${type.slice(0, -1)}`} onClose={() => setModal(false)} onCreate={(name) => { setRows(prev => [{ name, sub: 'New record', meta: 'Academic Registry', status: 'Active' }, ...prev]); setModal(false); }} />}</div>;
}

function GenericAdminModal({ title, onClose, onCreate }: { title: string; onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  return <Modal title={title} onClose={onClose}><p className="modal-description">Add a record to the academic workspace.</p><label className="field-label">Name</label><input className="field-input" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Enter a name" data-testid="input-admin-record-name" /><div className="modal-actions"><Button variant="quiet" onClick={onClose}>Cancel</Button><Button disabled={!name} onClick={() => onCreate(name)} testId="button-save-admin-record"><Plus size={16} /> Add record</Button></div></Modal>;
}

function Notifications() {
  const [items, setItems] = useState(notificationsSeed); const unread = items.filter(x => !x.read).length;
  return <div><PageTitle eyebrow="Your space" title="Notifications" description={`${unread} things worth your attention.`} action={<Button variant="quiet" onClick={() => setItems(prev => prev.map(x => ({ ...x, read: true })))} testId="button-mark-all-read"><Check size={16} /> Mark all read</Button>} /><div className="notification-layout"><section className="card-shell notification-card"><div className="notification-filter"><button className="selected">All <span>{items.length}</span></button><button>Unread <span>{unread}</span></button></div>{items.map(item => <button key={item.id} className={`notification-row ${item.read ? 'read' : ''}`} onClick={() => setItems(prev => prev.map(x => x.id === item.id ? { ...x, read: true } : x))} data-testid={`button-notification-${item.id}`}><IconBadge kind={item.kind} /><div className="min-w-0 text-left"><div className="flex items-center gap-2"><strong>{item.title}</strong>{!item.read && <span className="unread-dot" />}</div><p>{item.detail}</p><small>{item.date}</small></div><ChevronRight size={16} /></button>)}</section><aside className="notification-aside"><div className="aside-orb"><Bell size={22} /></div><h3>A little signal,<br /><em>at the right time.</em></h3><p>Notifications keep the academic noise useful — deadlines, feedback and the people you learn with.</p></aside></div></div>;
}

function EmptyState({ icon: Icon, title, detail, action }: { icon: typeof Search; title: string; detail: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span><Icon size={23} /></span><h3>{title}</h3><p>{detail}</p>{action}</div>;
}

function RoutedApp({ role, setRole, assignments, setAssignments, onLogout }: { role: Role; setRole: (r: Role) => void; assignments: Assignment[]; setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>; onLogout: () => void }) {
  return <Switch><Route path="/notifications"><Shell role={role} onLogout={onLogout}><Notifications /></Shell></Route><Route path="/student/dashboard"><Shell role="student" onLogout={onLogout}><StudentDashboard /></Shell></Route><Route path="/student/assignments"><Shell role="student" onLogout={onLogout}><StudentAssignments assignments={assignments} setAssignments={setAssignments} /></Shell></Route><Route path="/student/library"><Shell role="student" onLogout={onLogout}><StudentLibrary /></Shell></Route><Route path="/student/profile"><Shell role="student" onLogout={onLogout}><ProfilePage role="student" /></Shell></Route><Route path="/lecturer/dashboard"><Shell role="lecturer" onLogout={onLogout}><LecturerDashboard assignments={assignments} /></Shell></Route><Route path="/lecturer/assignments"><Shell role="lecturer" onLogout={onLogout}><LecturerAssignments assignments={assignments} setAssignments={setAssignments} /></Shell></Route><Route path="/lecturer/submissions"><Shell role="lecturer" onLogout={onLogout}><LecturerSubmissions /></Shell></Route><Route path="/lecturer/profile"><Shell role="lecturer" onLogout={onLogout}><ProfilePage role="lecturer" /></Shell></Route><Route path="/admin/dashboard"><Shell role="admin" onLogout={onLogout}><AdminDashboard /></Shell></Route>{(['users', 'departments', 'faculties', 'courses', 'assignments', 'activity'] as const).map(type => <Route key={type} path={`/admin/${type}`}><Shell role="admin" onLogout={onLogout}><AdminTablePage type={type} /></Shell></Route>)}<Route path="/"><Login onLogin={(r) => { setRole(r); window.location.href = r === 'student' ? '/student/dashboard' : r === 'lecturer' ? '/lecturer/dashboard' : '/admin/dashboard'; }} /></Route><Route component={NotFound} /></Switch>;
}

function App() {
  const [role, setRole] = useState<Role | null>(() => (localStorage.getItem('xcellearn-role') as Role | null) || null);
  const [assignments, setAssignments] = useState(initialAssignments);
  const onLogin = (r: Role) => { localStorage.setItem('xcellearn-role', r); setRole(r); window.location.href = r === 'student' ? '/student/dashboard' : r === 'lecturer' ? '/lecturer/dashboard' : '/admin/dashboard'; };
  const onLogout = () => { localStorage.removeItem('xcellearn-role'); setRole(null); window.location.href = '/'; };
  return <QueryClientProvider client={queryClient}><TooltipProvider>{role ? <RoutedApp role={role} setRole={setRole} assignments={assignments} setAssignments={setAssignments} onLogout={onLogout} /> : <Login onLogin={onLogin} />}<Toaster /></TooltipProvider></QueryClientProvider>;
}

export default function RootApp() {
  return <ErrorBoundary><App /></ErrorBoundary>;
}