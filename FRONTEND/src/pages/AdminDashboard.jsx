import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, UserCheck, FolderOpen, Megaphone,
  Settings, Search, Trash2, PowerOff, ChevronDown, ChevronUp,
  Eye, EyeOff, ExternalLink, Pin, PinOff, Plus, X, Shield,
  AlertCircle, CheckCircle, Clock, TrendingUp, FileText,
  Download, RefreshCw, Bell, BarChart3, Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import Sidebar from '../Components/Sidebar';
import useDebounce from '../hooks/useDebounce';

// ─── Nav items ────────────────────────────────────────────────────────────────
const ADMIN_NAV = (newReqs = 0) => [
  { id: 'overview',       label: 'Overview',       icon: LayoutDashboard },
  { id: 'announcements',  label: 'Announcements',  icon: Megaphone },
  { id: 'students',       label: 'Students',       icon: Users },
  { id: 'faculty',        label: 'Faculty',        icon: UserCheck },
  { id: 'projects',       label: 'Projects',       icon: FolderOpen },
  { id: 'system',         label: 'System',         icon: Settings,  badge: newReqs },
];

// ─── Design tokens (Spatial Dark) ────────────────────────────────────────────
const CARD = 'bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm rounded-2xl';
const CARD_HEADER = 'px-6 py-4 border-b border-slate-700/50 flex items-center gap-3';
const TABLE_HEAD = 'text-xs font-bold uppercase tracking-wider text-slate-400 py-3 px-4 text-left';
const TABLE_ROW  = 'border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors';
const TABLE_CELL = 'py-3.5 px-4 text-sm text-slate-300';
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30';
const BTN_GHOST = 'flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-lg transition-all border border-slate-700/50';
const INPUT = 'w-full bg-slate-700/50 border border-slate-600/40 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all';
const SELECT = 'bg-slate-700/50 border border-slate-600/40 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/60 transition-all';

const PIE_COLORS = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a78bfa', '#f97316'];

const STATUS_BADGE = {
  'Pending HOD Review': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'HOD Approved':       'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Faculty Assigned':   'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  'Faculty Accepted':   'bg-green-500/15 text-green-400 border-green-500/30',
  'Rejected (HOD)':     'bg-red-500/15 text-red-400 border-red-500/30',
  'Rejected (Faculty)': 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Submitted':          'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

const fadeIn = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab]         = useState('overview');
  const [isMobileOpen, setIsMobileOpen]   = useState(false);
  const [stats, setStats]                 = useState(null);
  const [students, setStudents]           = useState([]);
  const [faculty, setFaculty]             = useState([]);
  const [projects, setProjects]           = useState([]);
  const [systemData, setSystemData]       = useState({ recentLogins: [], recentUploads: [], allUsers: [] });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);

  // Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentBranch, setStudentBranch] = useState('');
  const [studentYear, setStudentYear]     = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [projectStatus, setProjectStatus] = useState('all');

  // Debounced search terms
  const debouncedStudentSearch = useDebounce(studentSearch, 400);
  const debouncedFacultySearch = useDebounce(facultySearch, 400);

  // Expanded rows
  const [expandedStudents, setExpandedStudents] = useState({});
  const [expandedFaculty, setExpandedFaculty]   = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [showPasswords, setShowPasswords]       = useState({});

  // Announcement form
  const [annForm, setAnnForm] = useState({ title: '', content: '', targetAudience: 'all', pinned: false });
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annSubmitting, setAnnSubmitting] = useState(false);

  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/login'); };

  // ── Data fetchers ────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const r = await api.get('/admin/stats');
      setStats(r.data);
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) handleLogout();
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const r = await api.get('/announcements');
      setAnnouncements(r.data.announcements || []);
    } catch {}
  }, []);

  const fetchStudents = useCallback(async () => {
    setSectionLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedStudentSearch) params.set('search', debouncedStudentSearch);
      if (studentBranch) params.set('branch', studentBranch);
      if (studentYear)   params.set('year', studentYear);
      const r = await api.get(`/admin/students?${params}`);
      setStudents(r.data.students || []);
    } catch {} finally { setSectionLoading(false); }
  }, [debouncedStudentSearch, studentBranch, studentYear]);

  const fetchFaculty = useCallback(async () => {
    setSectionLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedFacultySearch) params.set('search', debouncedFacultySearch);
      const r = await api.get(`/admin/faculty?${params}`);
      setFaculty(r.data.faculty || []);
    } catch {} finally { setSectionLoading(false); }
  }, [debouncedFacultySearch]);

  const fetchProjects = useCallback(async () => {
    setSectionLoading(true);
    try {
      const r = await api.get(`/admin/projects/full?status=${projectStatus}`);
      setProjects(r.data.projects || []);
    } catch {} finally { setSectionLoading(false); }
  }, [projectStatus]);

  const fetchSystem = useCallback(async () => {
    setSectionLoading(true);
    try {
      const r = await api.get('/admin/system');
      setSystemData(r.data);
    } catch {} finally { setSectionLoading(false); }
  }, []);

  // Initial load
  useEffect(() => {
    Promise.all([fetchStats(), fetchAnnouncements()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (activeTab === 'students')      fetchStudents();     }, [activeTab, fetchStudents]);
  useEffect(() => { if (activeTab === 'faculty')       fetchFaculty();      }, [activeTab, fetchFaculty]);
  useEffect(() => { if (activeTab === 'projects')      fetchProjects();     }, [activeTab, fetchProjects]);
  useEffect(() => { if (activeTab === 'system')        fetchSystem();       }, [activeTab, fetchSystem]);
  useEffect(() => { if (activeTab === 'announcements') fetchAnnouncements();}, [activeTab, fetchAnnouncements]);

  // Re-fetch when filters change
  useEffect(() => { if (activeTab === 'students') fetchStudents(); }, [debouncedStudentSearch, studentBranch, studentYear]);
  useEffect(() => { if (activeTab === 'faculty')  fetchFaculty();  }, [debouncedFacultySearch]);
  useEffect(() => { if (activeTab === 'projects') fetchProjects(); }, [projectStatus]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleDeactivate = async (id) => {
    try {
      await api.put(`/admin/users/${id}/deactivate`);
      toast.success('User access toggled');
      if (activeTab === 'system') fetchSystem();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      if (activeTab === 'system') fetchSystem();
    } catch { toast.error('Failed'); }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch { toast.error('Failed'); }
  };

  const handlePinAnnouncement = async (id) => {
    try {
      await api.patch(`/announcements/${id}/pin`);
      fetchAnnouncements();
    } catch { toast.error('Failed'); }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) return toast.error('Title and content required');
    setAnnSubmitting(true);
    try {
      await api.post('/announcements', annForm);
      toast.success('Announcement published!');
      setAnnForm({ title: '', content: '', targetAudience: 'all', pinned: false });
      setShowAnnForm(false);
      fetchAnnouncements();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed');
    } finally { setAnnSubmitting(false); }
  };

  const toggleRow = (setFn, id) => setFn(prev => ({ ...prev, [id]: !prev[id] }));

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ background: '#040a14' }} className="flex min-h-screen font-sans text-slate-300 animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-6 shrink-0 h-screen">
        <div className="h-10 bg-slate-800/80 rounded-xl w-32"></div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800"></div>
          <div className="h-4 bg-slate-800 rounded w-24"></div>
        </div>
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-9 bg-slate-800/40 rounded-xl"></div>)}
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-slate-900 border-b border-slate-800 px-8 py-5 flex justify-between items-center shrink-0">
          <div className="space-y-1.5">
            <div className="h-5 bg-slate-800 rounded w-24"></div>
            <div className="h-3 bg-slate-805 rounded w-16"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800"></div>
            <div className="w-8 h-8 rounded-full bg-slate-800"></div>
          </div>
        </header>
        
        <div className="p-8 space-y-6 max-w-screen-2xl mx-auto w-full overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800/50 shadow-sm space-y-2 h-24">
                <div className="h-3 bg-slate-700/50 rounded w-16"></div>
                <div className="h-6 bg-slate-700 rounded w-8"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-slate-800/40 rounded-3xl p-8 border border-slate-800/50 shadow-sm h-72"></div>
            <div className="lg:col-span-3 bg-slate-800/40 rounded-3xl p-6 border border-slate-800/50 shadow-sm h-72"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const navItems = ADMIN_NAV(stats?.newRequests || 0);

  // ── Chart data ───────────────────────────────────────────────────────────────
  const statusPieData = React.useMemo(() => {
    return stats ? [
      { name: 'Pending HOD',      value: stats.pendingHOD      || 0 },
      { name: 'HOD Approved',     value: stats.hodApproved     || 0 },
      { name: 'Faculty Assigned', value: stats.facultyAssigned || 0 },
      { name: 'Active',           value: stats.active          || 0 },
      { name: 'Submitted',        value: stats.submitted       || 0 },
      { name: 'Rejected (HOD)',   value: stats.rejectedHOD     || 0 },
      { name: 'Rej. Faculty',     value: stats.rejectedFaculty || 0 },
    ].filter(d => d.value > 0) : [];
  }, [stats]);

  const branchBarData = React.useMemo(() => {
    return stats?.branchStats?.map(b => ({ branch: b._id || 'N/A', count: b.count })) || [];
  }, [stats]);

  const overviewCards = React.useMemo(() => {
    return stats ? [
      { label: 'Total Students',    value: stats.totalStudents,    color: 'cyan',   icon: Users },
      { label: 'Total Faculty',     value: stats.totalFaculty,     color: 'indigo', icon: UserCheck },
      { label: 'Total Projects',    value: stats.totalProposals,   color: 'purple', icon: FolderOpen },
      { label: 'Active Projects',   value: stats.active,           color: 'green',  icon: TrendingUp },
      { label: 'Submitted',         value: stats.submitted,        color: 'teal',   icon: CheckCircle },
      { label: 'Pending Review',    value: stats.pendingHOD,       color: 'yellow', icon: Clock },
      { label: 'New (7 days)',       value: stats.newRequests,      color: 'orange', icon: Bell },
      { label: 'Files Stored',      value: stats.totalFiles,       color: 'rose',   icon: FileText },
    ] : [];
  }, [stats]);

  const ACCENT = {
    cyan:   'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    green:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    teal:   'text-teal-400 bg-teal-500/10 border-teal-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    rose:   'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div style={{ background: '#040a14' }} className="min-h-screen flex font-sans">
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        user={user}
        role="admin"
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl md:hidden transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white capitalize">{activeTab.replace(/([A-Z])/g, ' $1')}</h1>
              <p className="text-[10px] md:text-xs text-slate-500">ProjectSphere Admin Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { fetchStats(); fetchAnnouncements(); toast.success('Refreshed'); }}
              className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-cyan-400 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-rose-500/30">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-screen-2xl mx-auto">
          <AnimatePresence mode="wait">

            {/* ═══════════════════════════ OVERVIEW ═══════════════════════════ */}
            {activeTab === 'overview' && (
              <motion.div key="overview" {...fadeIn} transition={{ duration: 0.2 }}>
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {overviewCards.map(({ label, value, color, icon: Icon }) => (
                    <motion.div key={label}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className={`${CARD} p-5 hover:scale-[1.02] transition-transform`}>
                      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border mb-3 ${ACCENT[color]}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-3xl font-black text-white">{value ?? '—'}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                  {/* Project status pie */}
                  <motion.div className={`${CARD} lg:col-span-2`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <div className={CARD_HEADER}>
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      <h2 className="text-sm font-bold text-white">Project Status</h2>
                    </div>
                    <div className="p-4 h-64">
                      {statusPieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${value}`}>
                              {statusPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0', fontSize: 12 }} />
                            <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <div className="flex items-center justify-center h-full text-slate-500 text-sm">No project data yet</div>}
                    </div>
                  </motion.div>

                  {/* Branch distribution bar */}
                  <motion.div className={`${CARD} lg:col-span-3`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    <div className={CARD_HEADER}>
                      <Users className="w-4 h-4 text-indigo-400" />
                      <h2 className="text-sm font-bold text-white">Students by Branch</h2>
                    </div>
                    <div className="p-4 h-64">
                      {branchBarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={branchBarData} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="branch" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#e2e8f0', fontSize: 12 }} />
                            <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                              {branchBarData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <div className="flex items-center justify-center h-full text-slate-500 text-sm">No student data yet</div>}
                    </div>
                  </motion.div>
                </div>

                {/* Status breakdown cards */}
                {stats && (
                  <div className={`${CARD} p-6`}>
                    <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-rose-400" /> Project Pipeline Breakdown
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                      {[
                        { label: 'Pending HOD',    value: stats.pendingHOD,      dot: 'bg-yellow-500' },
                        { label: 'HOD Approved',   value: stats.hodApproved,     dot: 'bg-blue-500' },
                        { label: 'Fac. Assigned',  value: stats.facultyAssigned, dot: 'bg-indigo-500' },
                        { label: 'Active',         value: stats.active,          dot: 'bg-green-500' },
                        { label: 'Submitted',      value: stats.submitted,       dot: 'bg-purple-500' },
                        { label: 'Reject (HOD)',   value: stats.rejectedHOD,     dot: 'bg-red-500' },
                        { label: 'Reject (Fac.)',  value: stats.rejectedFaculty, dot: 'bg-orange-500' },
                      ].map(({ label, value, dot }) => (
                        <div key={label} className="bg-slate-700/40 rounded-xl p-3 text-center">
                          <div className={`w-2 h-2 rounded-full ${dot} mx-auto mb-1.5`} />
                          <p className="text-xl font-black text-white">{value || 0}</p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══════════════════════ ANNOUNCEMENTS ══════════════════════════ */}
            {activeTab === 'announcements' && (
              <motion.div key="announcements" {...fadeIn} transition={{ duration: 0.2 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-base">All Announcements ({announcements.length})</h2>
                  <button onClick={() => setShowAnnForm(p => !p)} className={BTN_PRIMARY}>
                    <Plus className="w-4 h-4" /> New Announcement
                  </button>
                </div>

                {/* Create form */}
                <AnimatePresence>
                  {showAnnForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className={`${CARD} mb-6 overflow-hidden`}>
                      <div className={CARD_HEADER}>
                        <Megaphone className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-bold text-white">Create Announcement</h3>
                        <button onClick={() => setShowAnnForm(false)} className="ml-auto text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
                        <div>
                          <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Title *</label>
                          <input className={INPUT} placeholder="Announcement title…"
                            value={annForm.title} onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Content *</label>
                          <textarea rows={4} className={INPUT + ' resize-none'} placeholder="Write the announcement content here…"
                            value={annForm.content} onChange={e => setAnnForm(p => ({ ...p, content: e.target.value }))} />
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div>
                            <label className="text-xs text-slate-400 font-semibold mb-1.5 block">Target Audience</label>
                            <select className={SELECT} value={annForm.targetAudience}
                              onChange={e => setAnnForm(p => ({ ...p, targetAudience: e.target.value }))}>
                              <option value="all">Everyone</option>
                              <option value="student">Students Only</option>
                              <option value="faculty">Faculty Only</option>
                            </select>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer mt-5">
                            <input type="checkbox" className="w-4 h-4 accent-cyan-500" checked={annForm.pinned}
                              onChange={e => setAnnForm(p => ({ ...p, pinned: e.target.checked }))} />
                            <span className="text-sm text-slate-300">Pin to top</span>
                          </label>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button type="button" onClick={() => setShowAnnForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-600 rounded-xl transition-all">Cancel</button>
                          <button type="submit" disabled={annSubmitting} className={BTN_PRIMARY + ' disabled:opacity-50'}>
                            {annSubmitting ? 'Publishing…' : 'Publish'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* List */}
                <div className="space-y-3">
                  {announcements.length === 0 && (
                    <div className={`${CARD} p-12 text-center text-slate-500 text-sm`}>No announcements yet. Create one above.</div>
                  )}
                  {announcements.map((ann) => (
                    <motion.div key={ann._id} layout
                      className={`${CARD} p-5 ${ann.pinned ? 'border-cyan-500/40 bg-cyan-500/5' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {ann.pinned && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full"><Pin className="w-3 h-3" /> Pinned</span>}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              ann.targetAudience === 'all' ? 'text-slate-400 bg-slate-700/60 border-slate-600/40' :
                              ann.targetAudience === 'student' ? 'text-blue-400 bg-blue-500/15 border-blue-500/30' :
                              'text-indigo-400 bg-indigo-500/15 border-indigo-500/30'
                            }`}>{ann.targetAudience === 'all' ? 'All Users' : ann.targetAudience === 'student' ? 'Students' : 'Faculty'}</span>
                          </div>
                          <h3 className="text-white font-bold text-sm">{ann.title}</h3>
                          <p className="text-slate-400 text-sm mt-1 leading-relaxed">{ann.content}</p>
                          <p className="text-slate-500 text-xs mt-2">
                            By <span className="text-slate-400 font-semibold capitalize">{ann.createdByName}</span>
                            <span className="mx-1.5">·</span>
                            <span className="capitalize">{ann.createdByRole}</span>
                            <span className="mx-1.5">·</span>
                            {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button onClick={() => handlePinAnnouncement(ann._id)} title={ann.pinned ? 'Unpin' : 'Pin'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all">
                            {ann.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDeleteAnnouncement(ann._id)} title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ════════════════════════════ STUDENTS ══════════════════════════ */}
            {activeTab === 'students' && (
              <motion.div key="students" {...fadeIn} transition={{ duration: 0.2 }}>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input className={INPUT + ' pl-10'} placeholder="Search by name…"
                      value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                  </div>
                  <select className={SELECT} value={studentBranch} onChange={e => setStudentBranch(e.target.value)}>
                    <option value="">All Branches</option>
                    {['CSE','IT','ECE','ME','CE'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <select className={SELECT} value={studentYear} onChange={e => setStudentYear(e.target.value)}>
                    <option value="">All Years</option>
                    {['1','2','3','4'].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                  <span className="text-slate-400 text-sm">{students.length} results</span>
                </div>

                {sectionLoading ? (
                  <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin" /></div>
                ) : (
                  <div className={`${CARD} overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-800/80">
                          <tr>
                            {['Student','Email / Login','Mobile','Course / Branch','Year / Sec','Status','Project',''].map(h => (
                              <th key={h} className={TABLE_HEAD}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {students.length === 0 && (
                            <tr><td colSpan={8} className="text-center py-12 text-slate-500 text-sm">No students found.</td></tr>
                          )}
                          {students.map((s) => (
                            <React.Fragment key={s._id}>
                              <tr className={TABLE_ROW}>
                                {/* Name + photo */}
                                <td className={TABLE_CELL}>
                                  <div className="flex items-center gap-3">
                                    {s.profilePhoto?.url
                                      ? <img src={s.profilePhoto.url} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-700" />
                                      : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{s.name?.[0]?.toUpperCase()}</div>
                                    }
                                    <div>
                                      <p className="text-white font-semibold text-sm">{s.name}</p>
                                      {s.enrollmentNumber && <p className="text-slate-500 text-[10px]">{s.enrollmentNumber}</p>}
                                    </div>
                                  </div>
                                </td>
                                {/* Email/Login credential */}
                                <td className={TABLE_CELL}>
                                  <div className="flex items-center gap-2 group">
                                    <span className="text-cyan-400 font-mono text-xs">{s.email}</span>
                                    <div className="relative">
                                      <button onClick={() => toggleRow(setShowPasswords, s._id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-slate-500 hover:text-slate-300">
                                        {showPasswords[s._id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>
                                  {showPasswords[s._id] && (
                                    <div className="mt-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1 font-mono">
                                      ⚠ Password is stored hashed — not viewable
                                    </div>
                                  )}
                                </td>
                                <td className={TABLE_CELL}><span className="text-slate-400 text-xs">{s.mobileNumber || '—'}</span></td>
                                <td className={TABLE_CELL}><span className="text-xs">{s.course} / {s.branch}</span></td>
                                <td className={TABLE_CELL}><span className="text-xs">Yr {s.year} / Sec {s.section}</span></td>
                                {/* Status */}
                                <td className={TABLE_CELL}>
                                  {s.isBanned
                                    ? <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">Banned</span>
                                    : s.isEmailVerified
                                      ? <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">Active</span>
                                      : <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">Pending</span>}
                                </td>
                                {/* Project summary */}
                                <td className={TABLE_CELL}>
                                  {s.proposal
                                    ? <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_BADGE[s.proposal.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>{s.proposal.status}</span>
                                    : <span className="text-slate-600 text-xs">No proposal</span>}
                                </td>
                                {/* Expand */}
                                <td className={TABLE_CELL}>
                                  <button onClick={() => toggleRow(setExpandedStudents, s._id)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all">
                                    {expandedStudents[s._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </td>
                              </tr>

                              {/* Expanded row */}
                              {expandedStudents[s._id] && (
                                <tr className="bg-slate-800/40">
                                  <td colSpan={8} className="px-6 py-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                      {/* Profile links */}
                                      <div className="bg-slate-700/40 rounded-xl p-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Profile Links</p>
                                        <div className="space-y-2">
                                          {s.githubId    && <a href={`https://github.com/${s.githubId}`}   target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-cyan-400 hover:underline"><ExternalLink className="w-3 h-3" /> GitHub</a>}
                                          {s.linkedinId  && <a href={`https://linkedin.com/in/${s.linkedinId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-cyan-400 hover:underline"><ExternalLink className="w-3 h-3" /> LinkedIn</a>}
                                          {s.portfolioLink && <a href={s.portfolioLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-cyan-400 hover:underline"><ExternalLink className="w-3 h-3" /> Portfolio</a>}
                                          {s.resume?.url && <a href={s.resume.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-cyan-400 hover:underline"><Download className="w-3 h-3" /> Resume</a>}
                                          {!s.githubId && !s.linkedinId && !s.portfolioLink && !s.resume?.url && <p className="text-slate-500 text-xs">No links added yet.</p>}
                                        </div>
                                      </div>

                                      {/* Project info */}
                                      {s.proposal && (
                                        <div className="bg-slate-700/40 rounded-xl p-4">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Project</p>
                                          <p className="text-white text-sm font-semibold mb-1">{s.proposal.title}</p>
                                          <p className="text-slate-500 text-xs mb-2">{s.proposal.domain}</p>
                                          <p className="text-slate-400 text-xs">Team: {s.proposal.teamSize} member{s.proposal.teamSize > 1 ? 's' : ''}</p>
                                          {s.proposal.assignedFaculty && (
                                            <p className="text-slate-400 text-xs mt-1">👨‍🏫 {s.proposal.assignedFaculty.name}</p>
                                          )}
                                          {s.proposal.finalSubmission?.liveLink && (
                                            <a href={s.proposal.finalSubmission.liveLink} target="_blank" rel="noopener noreferrer"
                                              className="flex items-center gap-1 text-xs text-emerald-400 hover:underline mt-2"><ExternalLink className="w-3 h-3" /> Live Demo</a>
                                          )}
                                          {s.proposal.finalSubmission?.githubLink && (
                                            <a href={s.proposal.finalSubmission.githubLink} target="_blank" rel="noopener noreferrer"
                                              className="flex items-center gap-1 text-xs text-cyan-400 hover:underline mt-1"><ExternalLink className="w-3 h-3" /> GitHub</a>
                                          )}
                                        </div>
                                      )}

                                      {/* Uploaded files */}
                                      {s.files?.length > 0 && (
                                        <div className="bg-slate-700/40 rounded-xl p-4">
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Uploaded Files ({s.files.length})</p>
                                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                            {s.files.map(f => (
                                              <a key={f._id} href={f.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs text-slate-300 hover:text-cyan-400 hover:underline">
                                                <Download className="w-3 h-3 shrink-0" />
                                                <span className="truncate">{f.fileName}</span>
                                                <span className="shrink-0 text-slate-500">v{f.version}</span>
                                              </a>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ════════════════════════════ FACULTY ═══════════════════════════ */}
            {activeTab === 'faculty' && (
              <motion.div key="faculty" {...fadeIn} transition={{ duration: 0.2 }}>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input className={INPUT + ' pl-10'} placeholder="Search faculty by name…"
                      value={facultySearch} onChange={e => setFacultySearch(e.target.value)} />
                  </div>
                  <span className="text-slate-400 text-sm">{faculty.length} results</span>
                </div>

                {sectionLoading ? (
                  <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" /></div>
                ) : (
                  <div className={`${CARD} overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-800/80">
                          <tr>
                            {['Faculty','Email / Login','Mobile','Department','Designation','Approval','Projects',''].map(h => (
                              <th key={h} className={TABLE_HEAD}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {faculty.length === 0 && (
                            <tr><td colSpan={8} className="text-center py-12 text-slate-500 text-sm">No faculty found.</td></tr>
                          )}
                          {faculty.map((f) => (
                            <React.Fragment key={f._id}>
                              <tr className={TABLE_ROW}>
                                <td className={TABLE_CELL}>
                                  <div className="flex items-center gap-3">
                                    {f.profilePhoto?.url
                                      ? <img src={f.profilePhoto.url} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-700" />
                                      : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{f.name?.[0]?.toUpperCase()}</div>
                                    }
                                    <div>
                                      <p className="text-white font-semibold text-sm">{f.name}</p>
                                      {f.employeeId && <p className="text-slate-500 text-[10px]">EMP: {f.employeeId}</p>}
                                    </div>
                                  </div>
                                </td>
                                <td className={TABLE_CELL}><span className="text-indigo-400 font-mono text-xs">{f.email}</span></td>
                                <td className={TABLE_CELL}><span className="text-slate-400 text-xs">{f.mobileNumber || '—'}</span></td>
                                <td className={TABLE_CELL}><span className="text-xs">{f.department}</span></td>
                                <td className={TABLE_CELL}><span className="text-xs text-slate-400">{f.designation || '—'}</span></td>
                                <td className={TABLE_CELL}>
                                  {f.isApproved
                                    ? <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">Approved</span>
                                    : <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">Pending</span>}
                                </td>
                                <td className={TABLE_CELL}>
                                  <span className="text-white font-bold">{f.projects?.length || 0}</span>
                                  <span className="text-slate-500 text-xs"> / {f.maxStudents || 5}</span>
                                </td>
                                <td className={TABLE_CELL}>
                                  <button onClick={() => toggleRow(setExpandedFaculty, f._id)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                                    {expandedFaculty[f._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </td>
                              </tr>

                              {/* Expanded faculty row */}
                              {expandedFaculty[f._id] && (
                                <tr className="bg-slate-800/40">
                                  <td colSpan={8} className="px-6 py-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Details */}
                                      <div className="bg-slate-700/40 rounded-xl p-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Details</p>
                                        <div className="space-y-1">
                                          {f.specialization && <p className="text-slate-300 text-xs">🎓 Specialization: {f.specialization}</p>}
                                          <p className="text-slate-300 text-xs">👥 Max Students: {f.maxStudents || 5}</p>
                                          <p className="text-slate-300 text-xs">📋 Active Projects: {f.projects?.filter(p => ['Faculty Accepted', 'Faculty Assigned', 'Submitted'].includes(p.status)).length || 0}</p>
                                        </div>
                                      </div>
                                      {/* Supervised projects */}
                                      <div className="bg-slate-700/40 rounded-xl p-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Supervised Projects ({f.projects?.length || 0})</p>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                          {(f.projects || []).length === 0 && <p className="text-slate-500 text-xs">No projects assigned.</p>}
                                          {(f.projects || []).map(p => (
                                            <div key={p._id} className="flex items-center justify-between">
                                              <div>
                                                <p className="text-white text-xs font-semibold">{p.title}</p>
                                                <p className="text-slate-500 text-[10px]">{p.studentId?.name} · {p.studentId?.branch}</p>
                                              </div>
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ml-2 ${STATUS_BADGE[p.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>{p.status}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ════════════════════════════ PROJECTS ══════════════════════════ */}
            {activeTab === 'projects' && (
              <motion.div key="projects" {...fadeIn} transition={{ duration: 0.2 }}>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <select className={SELECT} value={projectStatus} onChange={e => setProjectStatus(e.target.value)}>
                    <option value="all">All Statuses</option>
                    <option value="Pending HOD Review">Pending HOD Review</option>
                    <option value="HOD Approved">HOD Approved</option>
                    <option value="Faculty Assigned">Faculty Assigned</option>
                    <option value="Faculty Accepted">Faculty Accepted (Active)</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Rejected (HOD)">Rejected (HOD)</option>
                    <option value="Rejected (Faculty)">Rejected (Faculty)</option>
                  </select>
                  <span className="text-slate-400 text-sm">{projects.length} projects</span>
                </div>

                {sectionLoading ? (
                  <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin" /></div>
                ) : (
                  <div className={`${CARD} overflow-hidden`}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-800/80">
                          <tr>
                            {['Project Title','Domain','Status','Student','Faculty','Files',''].map(h => (
                              <th key={h} className={TABLE_HEAD}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {projects.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-12 text-slate-500 text-sm">No projects found.</td></tr>
                          )}
                          {projects.map((p) => (
                            <React.Fragment key={p._id}>
                              <tr className={TABLE_ROW}>
                                <td className={TABLE_CELL}>
                                  <p className="text-white font-semibold text-sm max-w-[200px] truncate">{p.title}</p>
                                </td>
                                <td className={TABLE_CELL}><span className="text-slate-400 text-xs">{p.domain}</span></td>
                                <td className={TABLE_CELL}>
                                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_BADGE[p.status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>{p.status}</span>
                                </td>
                                <td className={TABLE_CELL}>
                                  <div>
                                    <p className="text-white text-xs font-semibold">{p.studentId?.name || '—'}</p>
                                    <p className="text-slate-500 text-[10px]">{p.studentId?.branch} · {p.studentId?.course}</p>
                                  </div>
                                </td>
                                <td className={TABLE_CELL}>
                                  {p.assignedFaculty
                                    ? <div>
                                        <p className="text-white text-xs font-semibold">{p.assignedFaculty.name}</p>
                                        <p className="text-slate-500 text-[10px]">{p.assignedFaculty.department}</p>
                                      </div>
                                    : <span className="text-slate-600 text-xs">Unassigned</span>}
                                </td>
                                <td className={TABLE_CELL}>
                                  <span className="text-white font-bold text-sm">{p.files?.length || 0}</span>
                                </td>
                                <td className={TABLE_CELL}>
                                  <button onClick={() => toggleRow(setExpandedProjects, p._id)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all">
                                    {expandedProjects[p._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </td>
                              </tr>

                              {/* Expanded project row */}
                              {expandedProjects[p._id] && (
                                <tr className="bg-slate-800/40">
                                  <td colSpan={7} className="px-6 py-5">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="bg-slate-700/40 rounded-xl p-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                                        <p className="text-slate-300 text-xs leading-relaxed line-clamp-4">{p.description}</p>
                                        {p.teamMembers?.length > 0 && (
                                          <div className="mt-3">
                                            <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Team Members</p>
                                            {p.teamMembers.map((m, i) => (
                                              <p key={i} className="text-slate-300 text-xs">{m.name} — {m.email}</p>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      <div className="bg-slate-700/40 rounded-xl p-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Milestones ({p.targets?.length || 0})</p>
                                        {(p.targets || []).length === 0 && <p className="text-slate-500 text-xs">No targets set.</p>}
                                        <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                          {(p.targets || []).map(t => (
                                            <div key={t._id} className="flex items-start gap-2">
                                              <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${t.status === 'Completed' ? 'bg-green-500' : t.status === 'Ongoing' ? 'bg-cyan-500' : 'bg-slate-600'}`} />
                                              <div>
                                                <p className="text-slate-300 text-xs leading-tight">{t.title}</p>
                                                <p className="text-slate-500 text-[10px] capitalize">{t.status}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                        {p.finalSubmission?.submittedAt && (
                                          <div className="mt-3 pt-3 border-t border-slate-600/40">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Final Submission</p>
                                            {p.finalSubmission.liveLink && <a href={p.finalSubmission.liveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-400 hover:underline"><ExternalLink className="w-3 h-3" /> Live</a>}
                                            {p.finalSubmission.githubLink && <a href={p.finalSubmission.githubLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"><ExternalLink className="w-3 h-3" /> GitHub</a>}
                                          </div>
                                        )}
                                      </div>

                                      <div className="bg-slate-700/40 rounded-xl p-4">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Uploaded Files ({p.files?.length || 0})</p>
                                        {(!p.files || p.files.length === 0) && <p className="text-slate-500 text-xs">No files uploaded.</p>}
                                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                          {(p.files || []).map(f => (
                                            <a key={f._id} href={f.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                                              className="flex items-center gap-2 text-xs text-slate-300 hover:text-cyan-400 transition-colors">
                                              <Download className="w-3 h-3 shrink-0 text-slate-500" />
                                              <span className="truncate">{f.fileName}</span>
                                              <span className="shrink-0 text-slate-500 capitalize">({f.fileType}) v{f.version}</span>
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ════════════════════════════ SYSTEM ════════════════════════════ */}
            {activeTab === 'system' && (
              <motion.div key="system" {...fadeIn} transition={{ duration: 0.2 }}>
                {sectionLoading ? (
                  <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-slate-700 border-t-rose-500 rounded-full animate-spin" /></div>
                ) : (
                  <div className="space-y-6">
                    {/* All users management */}
                    <div className={`${CARD} overflow-hidden`}>
                      <div className={CARD_HEADER}>
                        <Shield className="w-4 h-4 text-rose-400" />
                        <h2 className="text-sm font-bold text-white">User Management</h2>
                        <span className="ml-auto text-xs text-slate-500">{systemData.allUsers?.length || 0} users</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-800/80">
                            <tr>
                              {['Name','Role','Email','Joined','Status','Actions'].map(h => (
                                <th key={h} className={TABLE_HEAD}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(systemData.allUsers || []).length === 0 && (
                              <tr><td colSpan={6} className="text-center py-12 text-slate-500 text-sm">No users.</td></tr>
                            )}
                            {(systemData.allUsers || []).map(u => (
                              <tr key={u._id} className={TABLE_ROW}>
                                <td className={TABLE_CELL}><span className="text-white font-semibold">{u.name}</span></td>
                                <td className={TABLE_CELL}>
                                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                                    u.role === 'student' ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' :
                                    u.role === 'faculty' ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' :
                                    'bg-purple-500/15 text-purple-400 border-purple-500/30'}`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className={TABLE_CELL}><span className="text-slate-400 text-xs font-mono">{u.email}</span></td>
                                <td className={TABLE_CELL}><span className="text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</span></td>
                                <td className={TABLE_CELL}>
                                  {u.isBanned
                                    ? <span className="text-[10px] font-bold text-red-400">Banned</span>
                                    : u.isEmailVerified
                                      ? <span className="text-[10px] font-bold text-green-400">Active</span>
                                      : <span className="text-[10px] font-bold text-yellow-400">Unverified</span>}
                                </td>
                                <td className={TABLE_CELL}>
                                  <div className="flex items-center gap-1.5">
                                    <button onClick={() => handleDeactivate(u._id)} title="Toggle access"
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20">
                                      <PowerOff className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(u._id)} title="Delete user"
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Recent activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className={CARD}>
                        <div className={CARD_HEADER}>
                          <AlertCircle className="w-4 h-4 text-cyan-400" />
                          <h2 className="text-sm font-bold text-white">Recent Auth Events</h2>
                        </div>
                        <div className="p-4 space-y-2">
                          {(systemData.recentLogins || []).length === 0 && <p className="text-slate-500 text-sm text-center py-4">No events.</p>}
                          {(systemData.recentLogins || []).map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-700/40 border border-slate-700/30">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">{log.name?.[0]?.toUpperCase()}</div>
                                <div>
                                  <p className="text-white text-xs font-semibold">{log.name}</p>
                                  <p className="text-slate-500 text-[10px] uppercase">{log.role} · {log.email}</p>
                                </div>
                              </div>
                              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={CARD}>
                        <div className={CARD_HEADER}>
                          <FileText className="w-4 h-4 text-purple-400" />
                          <h2 className="text-sm font-bold text-white">Recent File Uploads</h2>
                        </div>
                        <div className="p-4 space-y-2">
                          {(systemData.recentUploads || []).length === 0 && <p className="text-slate-500 text-sm text-center py-4">No uploads.</p>}
                          {(systemData.recentUploads || []).map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-700/40 border border-slate-700/30">
                              <div>
                                <p className="text-white text-xs font-semibold truncate max-w-[200px]">{f.fileName}</p>
                                <p className="text-slate-500 text-[10px]">{f.studentId?.name} · {f.projectId?.title?.slice(0, 30)}…</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">v{f.version}</span>
                                <a href={f.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                                  className="p-1 rounded text-slate-500 hover:text-cyan-400 transition-colors">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
