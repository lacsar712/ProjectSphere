import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, GraduationCap, LayoutDashboard, FolderOpen, Bell,
  CheckCircle, XCircle, FileText, RefreshCw, MessageSquare,
  Clock, Send, AlertCircle, Download, Calendar,
  Megaphone, Pin, Plus, X, Trash2, Users, Search,
  Filter, ChevronDown, ChevronUp, ExternalLink, User, BarChart2,
  Check, Menu
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import Sidebar from '../Components/Sidebar';
import HeaderNotificationBell from '../Components/HeaderNotificationBell';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const TABS = [
  { id: 'overview',      label: 'Overview',        icon: LayoutDashboard },
  { id: 'reviews',       label: 'Project Reviews', icon: Clock },
  { id: 'teams',         label: 'Assigned Teams',  icon: FolderOpen },
  { id: 'announcements', label: 'Announcements',   icon: Megaphone },
  { id: 'deadlines',     label: 'Deadlines',       icon: Calendar },
  { id: 'messages',      label: 'Messages',        icon: MessageSquare },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
  { id: 'analytics',     label: 'Reports & Analytics', icon: BarChart2 }
];

const STATUS_BADGE = {
  'Faculty Accepted': 'bg-green-50 text-green-700 border-green-200',
  'Faculty Assigned': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Submitted':        'bg-purple-50 text-purple-700 border-purple-200',
};

const DONUT_COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const STATUS_STEPS = [
  { key: 'Pending HOD Review',   label: 'Submitted',        icon: '📝' },
  { key: 'HOD Approved',         label: 'HOD Approved',     icon: '✅' },
  { key: 'Faculty Assigned',     label: 'Faculty Assigned', icon: '👨‍🏫' },
  { key: 'Faculty Accepted',     label: 'Active',           icon: '🚀' },
  { key: 'Submitted',            label: 'Final Submitted',  icon: '🏁' },
];

const getStepIndex = (status) => {
  const order = ['Pending HOD Review','HOD Approved','Faculty Assigned','Faculty Accepted','Submitted'];
  return order.indexOf(status);
};

const FacultyDashboard = () => {
  const [activeTab, setActiveTab]       = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [data, setData]                 = useState({ 
    profile: null, 
    activeProjects: [], 
    pendingProposals: [], 
    projectFiles: {}, 
    recentSubmissions: [], 
    deadlines: [], 
    notifications: [],
    analytics: {},
    extensionRequests: []
  });
  const [loading, setLoading]           = useState(true);
  
  // Real-time notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  // Existing states
  const [feedbackInput, setFeedbackInput] = useState({});
  const [submitting, setSubmitting]     = useState({});
  const [rejectModal, setRejectModal]   = useState({ id: null, reason: '', requiredCorrections: '', type: 'proposal' }); 
  const [deadlineModal, setDeadlineModal] = useState({ open: false, title: '', description: '', dueDate: '', targetProjects: [] });
  const [projectSearch, setProjectSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  
  // Announcements states
  const [announcements, setAnnouncements] = useState([]);
  const [annForm, setAnnForm]           = useState({ title: '', content: '', targetAudience: 'all', pinned: false });
  const [showAnnForm, setShowAnnForm]   = useState(false);
  const [annSubmitting, setAnnSubmitting] = useState(false);

  // Upgrade states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [timelineComment, setTimelineComment] = useState({});
  const [timelineSubmitting, setTimelineSubmitting] = useState({});
  const [extensionRemarks, setExtensionRemarks] = useState({});
  const [extensionResolving, setExtensionResolving] = useState({});

  // Private notes states
  const [privateNoteText, setPrivateNoteText] = useState('');
  const [savingPrivateNote, setSavingPrivateNote] = useState(false);

  // Messaging in detailed modal states
  const [modalMessages, setModalMessages] = useState([]);
  const [newModalMsg, setNewModalMsg] = useState('');
  const modalMessagesEndRef = useRef(null);

  // Main chat states
  const [activeChatProjectId, setActiveChatProjectId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMsg, setNewChatMsg] = useState('');
  const chatMessagesEndRef = useRef(null);

  const navigate = useNavigate();

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/login'); };

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/faculty/dashboard');
      setData(res.data);
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) handleLogout();
      else toast.error('Failed to load dashboard.');
    } finally { setLoading(false); }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
  }, []);

  useEffect(() => { 
    fetchDashboard(); 
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboard, fetchNotifications]);

  useEffect(() => {
    if (activeTab === 'announcements') {
      api.get('/announcements').then(r => setAnnouncements(r.data.announcements || [])).catch(() => {});
    }
  }, [activeTab]);

  // Polling for messaging inside detailed modal
  const fetchModalMessages = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      const res = await api.get(`/projects/${projectId}/messages`);
      setModalMessages(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    if (selectedStudent && selectedStudent.project?._id) {
      const projectId = selectedStudent.project._id;
      fetchModalMessages(projectId);
      const interval = setInterval(() => fetchModalMessages(projectId), 4000);
      return () => clearInterval(interval);
    }
  }, [selectedStudent, fetchModalMessages]);

  useEffect(() => {
    if (modalMessagesEndRef.current) {
      modalMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [modalMessages]);

  // Polling for main chat
  const fetchChatMessages = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      const res = await api.get(`/projects/${projectId}/messages`);
      setChatMessages(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    if (activeTab === 'messages' && activeChatProjectId) {
      fetchChatMessages(activeChatProjectId);
      const interval = setInterval(() => fetchChatMessages(activeChatProjectId), 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, activeChatProjectId, fetchChatMessages]);

  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const acceptProposal = async (id) => {
    try { 
      await api.put(`/faculty/proposals/${id}/accept`); 
      toast.success('Proposal accepted! Email sent to student.'); 
      fetchDashboard(); 
    } catch { 
      toast.error('Action failed'); 
    }
  };

  const rejectProposal = async () => {
    if (!rejectModal.reason || rejectModal.reason.trim().length < 20) return toast.error('Reason must be at least 20 characters');
    if (rejectModal.type === 'submission' && (!rejectModal.requiredCorrections || rejectModal.requiredCorrections.trim().length < 20)) {
      return toast.error('Required corrections must be at least 20 characters');
    }
    try {
      const endpoint = rejectModal.type === 'submission'
        ? `/faculty/proposals/${rejectModal.id}/reject-submission`
        : `/faculty/proposals/${rejectModal.id}/reject`;
      
      const payload = rejectModal.type === 'submission'
        ? { reason: rejectModal.reason, requiredCorrections: rejectModal.requiredCorrections }
        : { reason: rejectModal.reason };

      await api.put(endpoint, payload);
      toast.success(rejectModal.type === 'submission' ? 'Submission rejected. Student notified.' : 'Proposal rejected.');
      setRejectModal({ id: null, reason: '', requiredCorrections: '', type: 'proposal' });
      fetchDashboard();
    } catch (e) { toast.error(e.response?.data?.message || 'Action failed'); }
  };

  const approveFinalSubmission = async (id) => {
    try {
      await api.put(`/faculty/proposals/${id}/approve-submission`);
      toast.success('Final submission approved successfully!');
      fetchDashboard();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Approval failed');
    }
  };

  const submitFeedback = async (id) => {
    const message = feedbackInput[id];
    if (!message || message.trim().length < 5) return toast.error('Feedback must be at least 5 characters');
    setSubmitting(s => ({ ...s, [id]: true }));
    try {
      await api.post(`/faculty/proposals/${id}/feedback`, { message });
      toast.success('Feedback sent!');
      setFeedbackInput(f => ({ ...f, [id]: '' }));
      fetchDashboard();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    finally { setSubmitting(s => ({ ...s, [id]: false })); }
  };

  const submitTargetedDeadline = async (e) => {
    e.preventDefault();
    if (deadlineModal.targetProjects.length === 0) return toast.error('Select at least one project.');
    try {
      await api.post('/faculty/deadlines', { title: deadlineModal.title, description: deadlineModal.description, dueDate: deadlineModal.dueDate, targetProjects: deadlineModal.targetProjects });
      toast.success('Deadline assigned & students notified!');
      setDeadlineModal({ open: false, title: '', description: '', dueDate: '', targetProjects: [] });
      fetchDashboard();
    } catch { toast.error('Failed to assign deadline'); }
  };

  const handleTimelineCommentSubmit = async (proposalId, timelineId) => {
    const comment = timelineComment[`${proposalId}_${timelineId}`];
    if (!comment || comment.trim().length < 2) return toast.error('Comment must be at least 2 characters.');
    
    setTimelineSubmitting(prev => ({ ...prev, [`${proposalId}_${timelineId}`]: true }));
    try {
      const res = await api.post(`/faculty/proposals/${proposalId}/timeline/${timelineId}/comment`, { comment: comment.trim() });
      toast.success('Comment added successfully!');
      
      if (selectedStudent && selectedStudent.project._id === proposalId) {
        const updatedProject = res.data.proposal;
        setSelectedStudent(prev => ({
          ...prev,
          project: updatedProject
        }));
      }

      setTimelineComment(prev => ({ ...prev, [`${proposalId}_${timelineId}`]: '' }));
      fetchDashboard();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add comment');
    } finally {
      setTimelineSubmitting(prev => ({ ...prev, [`${proposalId}_${timelineId}`]: false }));
    }
  };

  const handleExtensionResolve = async (requestId, status) => {
    const remarks = extensionRemarks[requestId] || '';
    setExtensionResolving(prev => ({ ...prev, [requestId]: true }));
    try {
      await api.put(`/faculty/extensions/${requestId}/resolve`, { status, remarks });
      toast.success(`Extension request marked as ${status}!`);
      fetchDashboard();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
    } finally {
      setExtensionResolving(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleSavePrivateNotes = async (projectId) => {
    setSavingPrivateNote(true);
    try {
      await api.put(`/projects/${projectId}/private-notes`, { privateNotes: privateNoteText });
      toast.success('Private notes saved!');
      
      if (selectedStudent && selectedStudent.project._id === projectId) {
        setSelectedStudent(prev => ({
          ...prev,
          project: { ...prev.project, privateNotes: privateNoteText }
        }));
      }
      fetchDashboard();
    } catch (e) {
      toast.error('Failed to save private notes.');
    } finally {
      setSavingPrivateNote(false);
    }
  };

  const handleSendModalMessage = async (e, projectId) => {
    e.preventDefault();
    if (!newModalMsg.trim()) return;
    try {
      const res = await api.post(`/projects/${projectId}/messages`, { content: newModalMsg });
      setModalMessages(prev => [...prev, res.data]);
      setNewModalMsg('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const handleSendMainChatMessage = async (e) => {
    e.preventDefault();
    if (!newChatMsg.trim() || !activeChatProjectId) return;
    try {
      const res = await api.post(`/projects/${activeChatProjectId}/messages`, { content: newChatMsg });
      setChatMessages(prev => [...prev, res.data]);
      setNewChatMsg('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  // ── Project Health Score Logic ──
  const calculateHealthScore = (p) => {
    const completedTargets = p.targets?.filter(t => t.status === 'Completed').length || 0;
    const totalTargets = p.targets?.length || 0;
    const targetPct = totalTargets > 0 ? (completedTargets / totalTargets) * 100 : 100;
    const missedDeadlinesCount = p.deadlineSubmissions?.filter(d => d.status === 'Deadline Missed').length || 0;
    const penalty = missedDeadlinesCount * 15;
    const healthScore = Math.max(0, Math.min(100, Math.round((p.progress * 0.6) + (targetPct * 0.4) - penalty)));
    return healthScore;
  };

  const getHealthBadge = (score) => {
    if (score > 75) return { text: 'Good', color: 'bg-green-50 text-green-700 border-green-200' };
    if (score >= 50) return { text: 'Average', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    return { text: 'At Risk', color: 'bg-red-50 text-red-600 border-red-200' };
  };

  // ── CSV Export Logic ──
  const handleCSVExport = () => {
    const projects = data.activeProjects || [];
    if (projects.length === 0) return toast.error('No active projects to export.');
    
    const headers = ['Project Title', 'Department', 'Domain', 'Leader Name', 'Leader Email', 'Team Size', 'Progress %', 'Health Score', 'Status'];
    const rows = projects.map(p => {
      const health = calculateHealthScore(p);
      return [
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.department}"`,
        `"${p.domain || ''}"`,
        `"${p.studentId?.name || ''}"`,
        `"${p.studentId?.email || ''}"`,
        p.teamMembers?.length + 1 || 1,
        p.progress || 0,
        health,
        `"${p.status}"`
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Faculty_Assigned_Teams_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report exported!');
  };

  // Filtered lists
  const filteredActiveProjects = React.useMemo(() => {
    return (data.activeProjects || []).filter(p => {
      return !projectSearch || p.title.toLowerCase().includes(projectSearch.toLowerCase()) || p.studentId?.name?.toLowerCase().includes(projectSearch.toLowerCase());
    });
  }, [data.activeProjects, projectSearch]);

  const filteredPendingProposals = React.useMemo(() => {
    return (data.pendingProposals || []).filter(p => {
      return p.title.toLowerCase().includes(projectSearch.toLowerCase()) || p.studentId?.name?.toLowerCase().includes(projectSearch.toLowerCase());
    });
  }, [data.pendingProposals, projectSearch]);

  const analyticsProgressData = React.useMemo(() => {
    return data.analytics?.progressData || [];
  }, [data.analytics?.progressData]);

  const analyticsDeptData = React.useMemo(() => {
    return data.analytics?.deptData || [];
  }, [data.analytics?.deptData]);

  if (loading) return (
    <div className="flex min-h-screen bg-slate-50 font-sans animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-4 space-y-6 shrink-0 h-screen">
        <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="space-y-3 pt-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-9 bg-gray-100 rounded-xl"></div>)}
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center shrink-0">
          <div className="space-y-1.5">
            <div className="h-5 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-150 rounded w-16"></div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
          </div>
        </header>
        
        <div className="p-8 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2 h-20">
                <div className="h-3 bg-gray-100 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-8"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-72"></div>
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-72"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const totalAssignedStudents = (data.activeProjects || []).reduce((sum, p) => sum + 1 + (p.teamMembers?.length || 0), 0);
  const facultyCapacity = data.profile?.maxStudents || 60;
  const facultyAvailableSlots = Math.max(0, facultyCapacity - totalAssignedStudents);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        navItems={TABS.map(tab => {
          if (tab.id === 'reviews') return { ...tab, badge: data.pendingProposals?.length };
          if (tab.id === 'notifications') return { ...tab, badge: unreadCount };
          return tab;
        })} 
        user={data.profile} 
        role="faculty" 
        onLogout={handleLogout}
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 overflow-auto flex flex-col h-screen">
        <header className="bg-white border-b border-gray-100 shadow-sm px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl md:hidden transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-gray-900 capitalize">{TABS.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-[10px] md:text-xs text-gray-400 font-medium">Faculty Management Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HeaderNotificationBell 
              notifications={notifications} 
              unreadCount={unreadCount} 
              onMarkRead={handleMarkRead} 
              onMarkAllRead={handleMarkAllRead} 
            />
            <button onClick={() => { fetchDashboard(); fetchNotifications(); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-gray-200 transition-all cursor-pointer">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="w-full">
              
              {/* ── Tab: Overview ── */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Supervisor Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Projects</p>
                      <p className="text-3xl font-extrabold mt-1 text-indigo-600">{(data.activeProjects || []).length}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Students Supervised</p>
                      <p className="text-3xl font-extrabold mt-1 text-blue-600">{totalAssignedStudents}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Capacity Limit</p>
                      <p className="text-3xl font-extrabold mt-1 text-purple-600">{facultyCapacity}</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Available Slots</p>
                      <p className="text-3xl font-extrabold mt-1 text-green-600">{facultyAvailableSlots}</p>
                    </div>
                  </div>

                  {/* Workload Progress Ring / Bar */}
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-base font-extrabold text-gray-900">Faculty Supervision Workload</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Maximum supervision capacity: {facultyCapacity} students.</p>
                      </div>
                      <span className="text-lg font-black text-indigo-600">
                        {Math.min(100, Math.round((totalAssignedStudents / facultyCapacity) * 100))}% Load
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-700 ${
                          (totalAssignedStudents / facultyCapacity) > 0.8 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-blue-600'
                        }`} 
                        style={{ width: `${Math.min(100, (totalAssignedStudents / facultyCapacity) * 100)}%` }}
                      ></div>
                    </div>
                    {totalAssignedStudents >= facultyCapacity && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0" /> You have reached your maximum supervision workload capacity.
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel: Assigned Teams List */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Users className="w-4 h-4 text-indigo-500" /> Active Teams Overview</h3>
                      <div className="space-y-4">
                        {(data.activeProjects || []).slice(0, 3).map(p => {
                          const health = calculateHealthScore(p);
                          const hb = getHealthBadge(health);
                          return (
                            <div key={p._id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center flex-wrap gap-4">
                              <div>
                                <h4 className="text-xs font-bold text-gray-900">{p.title}</h4>
                                <p className="text-[10px] text-gray-500 mt-1">Leader: {p.studentId?.name} • Members: {p.teamMembers?.length || 0}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${hb.color}`}>Health: {hb.text}</span>
                                <span className="text-xs font-extrabold text-indigo-600">{p.progress}% Progress</span>
                              </div>
                            </div>
                          );
                        })}
                        {(data.activeProjects || []).length === 0 && (
                          <p className="text-xs text-gray-400 italic text-center py-6">No active project teams.</p>
                        )}
                        {(data.activeProjects || []).length > 3 && (
                          <button onClick={() => setActiveTab('teams')} className="w-full text-center text-xs font-bold text-indigo-600 hover:underline">View all {(data.activeProjects || []).length} teams</button>
                        )}
                      </div>
                    </div>

                    {/* Right Panel: Pending Reviews */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Clock className="w-4 h-4 text-purple-500" /> Pending Tasks</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center justify-between">
                            <span className="text-xs text-purple-900 font-bold">Proposal Requests</span>
                            <span className="text-xs font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{(data.pendingProposals || []).length}</span>
                          </div>
                          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between">
                            <span className="text-xs text-blue-900 font-bold">Extension Requests</span>
                            <span className="text-xs font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{(data.extensionRequests || []).filter(e => e.status === 'Pending').length}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('reviews')} className="mt-6 w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all">Go to Reviews</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: Project Reviews ── */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Pending Project Proposals */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-500" /> Pending Supervisor Approvals ({(data.pendingProposals || []).length})</h3>
                    <div className="divide-y divide-gray-100">
                      {(data.pendingProposals || []).map(p => (
                        <div key={p._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 leading-tight">{p.title}</h4>
                              <p className="text-xs text-gray-500 mt-1">Submitted by: <span className="font-semibold text-gray-700">{p.studentId?.name}</span> ({p.studentId?.email})</p>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{p.description}</p>
                            <div className="flex gap-2">
                              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md">Domain: {p.domain || 'N/A'}</span>
                              <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md">Team Size: {p.teamMembers?.length + 1}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-start md:self-center">
                            <button onClick={() => acceptProposal(p._id)} className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer">Accept</button>
                            <button onClick={() => setRejectModal({ id: p._id, reason: '', requiredCorrections: '', type: 'proposal' })} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer">Reject</button>
                          </div>
                        </div>
                      ))}
                      {(data.pendingProposals || []).length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-8">No pending supervisor request approvals.</p>
                      )}
                    </div>
                  </div>

                  {/* Submission Evaluations */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><FileText className="w-4 h-4 text-purple-500" /> Final Deliverables Evaluative Reviews</h3>
                    <div className="divide-y divide-gray-100">
                      {(data.activeProjects || []).filter(p => p.finalSubmission?.status === 'Under Faculty Review').map(p => (
                        <div key={p._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-900">{p.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 font-semibold">Leader: {p.studentId?.name}</p>
                            <div className="text-xs text-gray-500 mt-2 space-y-1">
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                <span><strong>GitHub:</strong> <a href={p.finalSubmission.githubLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{p.finalSubmission.githubLink}</a></span>
                                {p.finalSubmission.liveLink && <span><strong>Live Link:</strong> <a href={p.finalSubmission.liveLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{p.finalSubmission.liveLink}</a></span>}
                                {p.finalSubmission.linkedinLink && <span><strong>LinkedIn:</strong> <a href={p.finalSubmission.linkedinLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{p.finalSubmission.linkedinLink}</a></span>}
                              </div>
                              {/* Uploaded Files */}
                              {data.projectFiles?.[p._id] && data.projectFiles[p._id].length > 0 && (
                                <div className="mt-2.5 border-t border-gray-100 pt-2">
                                  <p className="font-bold text-gray-700 mb-1">Uploaded Deliverables:</p>
                                  <div className="flex flex-wrap gap-2 mt-1.5">
                                    {data.projectFiles[p._id].map(file => (
                                      <a
                                        key={file._id}
                                        href={file.cloudinaryUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span className="capitalize">[{file.fileType}]</span> {file.fileName}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => approveFinalSubmission(p._id)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">Approve</button>
                            <button onClick={() => setRejectModal({ id: p._id, reason: '', requiredCorrections: '', type: 'submission' })} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition cursor-pointer">Reject</button>
                          </div>
                        </div>
                      ))}
                      {(data.activeProjects || []).filter(p => p.finalSubmission?.status === 'Under Faculty Review').length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-8">No deliverables awaiting evaluation.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: Assigned Teams ── */}
              {activeTab === 'teams' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search by title or leader..." 
                        className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        value={projectSearch} 
                        onChange={e => setProjectSearch(e.target.value)} 
                      />
                    </div>
                    <button 
                      onClick={handleCSVExport}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Export CSV Report
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredActiveProjects.map(p => {
                      const health = calculateHealthScore(p);
                      const hb = getHealthBadge(health);
                      return (
                        <div key={p._id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md uppercase border border-indigo-100">{p.domain || 'General'}</span>
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${hb.color}`}>Health: {hb.text}</span>
                            </div>
                            {p.finalSubmission?.status === 'Accepted' && (
                              <div className="mb-3">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-xl border border-emerald-600 shadow-sm uppercase tracking-wider animate-pulse">
                                  ✓ Project Approved & Submitted
                                </span>
                              </div>
                            )}
                            <h4 className="font-extrabold text-gray-900 leading-snug line-clamp-2 mb-2">{p.title}</h4>
                            <p className="text-xs text-gray-500 mb-4">Leader: {p.studentId?.name} • Members: {p.teamMembers?.length || 0}</p>
                            
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-4">
                              <div className="flex justify-between items-center mb-1 text-xs">
                                <span className="text-gray-400">Progress</span>
                                <span className="font-black text-indigo-600">{p.progress || 0}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }}></div>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => { setSelectedStudent({ name: p.studentId?.name || 'Leader', role: 'Team Leader', email: p.studentId?.email, section: p.studentId?.section, mobileNumber: p.studentId?.mobileNumber, project: p }); setPrivateNoteText(p.privateNotes || ''); }}
                            className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Users className="w-4 h-4" /> View Details & Discussion
                          </button>
                        </div>
                      );
                    })}
                    {filteredActiveProjects.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100 font-medium">No assigned teams found matching search.</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Tab: Announcements ── */}
              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-gray-900 font-bold text-base">Announcements ({announcements.length})</h2>
                    <button onClick={() => setShowAnnForm(p => !p)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-indigo-500/10 cursor-pointer">
                      <Plus className="w-4 h-4" /> New Announcement
                    </button>
                  </div>
                  
                  {showAnnForm && (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><Megaphone className="w-4 h-4 text-indigo-500" /> Create Announcement</h3>
                        <button onClick={() => setShowAnnForm(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={async (e) => {
                        e.preventDefault(); if (!annForm.title || !annForm.content) return;
                        setAnnSubmitting(true);
                        try {
                          await api.post('/announcements', annForm);
                          toast.success('Announcement published!');
                          setAnnForm({ title: '', content: '', targetAudience: 'all', pinned: false });
                          setShowAnnForm(false);
                          const r = await api.get('/announcements'); setAnnouncements(r.data.announcements || []);
                        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
                        finally { setAnnSubmitting(false); }
                      }} className="p-5 space-y-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Title *</label>
                          <input required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none" value={annForm.title} onChange={e => setAnnForm(p => ({...p, title: e.target.value}))} />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Content *</label>
                          <textarea required rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none" value={annForm.content} onChange={e => setAnnForm(p => ({...p, content: e.target.value}))} />
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Target</label>
                            <select className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" value={annForm.targetAudience} onChange={e => setAnnForm(p => ({...p, targetAudience: e.target.value}))}>
                              <option value="all">Everyone</option>
                              <option value="student">Students</option>
                              <option value="faculty">Faculty</option>
                            </select>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer mt-5 text-sm text-gray-700">
                            <input type="checkbox" checked={annForm.pinned} onChange={e => setAnnForm(p => ({...p, pinned: e.target.checked}))} /> Pin to top
                          </label>
                        </div>
                        <div className="flex justify-end gap-3">
                          <button type="button" onClick={() => setShowAnnForm(false)} className="px-4 py-2 text-xs font-bold text-gray-500 border border-gray-200 rounded-xl cursor-pointer">Cancel</button>
                          <button type="submit" disabled={annSubmitting} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer">{annSubmitting ? 'Publishing…' : 'Publish'}</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="space-y-3">
                    {announcements.map(ann => (
                      <div key={ann._id} className={`bg-white rounded-3xl border p-6 ${ann.pinned ? 'border-indigo-200 bg-indigo-50/20' : 'border-gray-100'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              {ann.pinned && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Pin className="w-3 h-3" /> Pinned</span>}
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">{ann.targetAudience === 'all' ? 'All Users' : ann.targetAudience}</span>
                            </div>
                            <h3 className="text-gray-900 font-extrabold text-sm">{ann.title}</h3>
                            <p className="text-gray-500 text-xs mt-1.5 leading-relaxed font-medium">{ann.content}</p>
                            <p className="text-gray-400 text-[10px] font-bold mt-3">By <span className="font-semibold capitalize">{ann.createdByName}</span> · {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          {ann.createdBy === data.profile?._id && (
                            <button onClick={async () => { if(!window.confirm('Delete?')) return; await api.delete(`/announcements/${ann._id}`); const r = await api.get('/announcements'); setAnnouncements(r.data.announcements || []); }}
                              className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                      <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center text-gray-400">No announcements yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Tab: Deadlines & Extensions ── */}
              {activeTab === 'deadlines' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-gray-900 font-bold text-base">Extensions & Milestones</h2>
                    <button onClick={() => setDeadlineModal({ open: true, title: '', description: '', dueDate: '', targetProjects: [] })} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer">
                      <Plus className="w-4 h-4" /> Targeted Milestone
                    </button>
                  </div>

                  {/* Extension requests */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500" /> Pending Extension Requests</h3>
                    <div className="space-y-4">
                      {(data.extensionRequests || []).map(req => {
                        const isPending = req.status === 'Pending';
                        return (
                          <div key={req._id} className={`p-5 rounded-2xl border ${isPending ? 'bg-amber-50/10 border-amber-200' : 'bg-gray-50 border-gray-100'} shadow-sm`}>
                            <div className="flex justify-between items-start flex-wrap gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                                    req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                    req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>{req.status}</span>
                                  <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{req.deadlineId?.title}</span>
                                </div>
                                <h4 className="text-xs font-bold text-gray-900 leading-snug">{req.projectId?.title}</h4>
                                <p className="text-[10px] text-gray-500">Student: {req.studentId?.name} • Reason: <span className="font-semibold text-gray-700">"{req.reason}"</span></p>
                                <p className="text-[10px] text-rose-600 font-bold">Requested Extension Date: {new Date(req.requestedDate).toLocaleString()}</p>
                              </div>
                              
                              {isPending && (
                                <div className="space-y-2">
                                  {req.projectId?.finalSubmission?.status === 'Accepted' ? (
                                    <span className="text-[10px] text-gray-400 font-bold italic">Actions locked (Project Approved)</span>
                                  ) : (
                                    <>
                                      <input 
                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none" 
                                        placeholder="Supervisor feedback remarks..." 
                                        value={extensionRemarks[req._id] || ''} 
                                        onChange={e => setExtensionRemarks({ ...extensionRemarks, [req._id]: e.target.value })} 
                                      />
                                      <div className="flex gap-2">
                                        <button onClick={() => handleExtensionResolve(req._id, 'Approved')} disabled={extensionResolving[req._id]} className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded-xl transition cursor-pointer">Accept</button>
                                        <button onClick={() => handleExtensionResolve(req._id, 'Rejected')} disabled={extensionResolving[req._id]} className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-xl transition cursor-pointer">Deny</button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(data.extensionRequests || []).length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-6">No extension requests.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tab: Messages (Split Chat Pane) ── */}
              {activeTab === 'messages' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm h-[70vh] overflow-hidden flex flex-col md:flex-row">
                  {/* Left panel: project list */}
                  <div className="w-full md:w-80 border-r border-gray-100 flex flex-col overflow-y-auto shrink-0 bg-slate-50/50 p-4">
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-indigo-500" /> Active Chats</h3>
                    <div className="space-y-2">
                      {(data.activeProjects || []).map(p => (
                        <button
                          key={p._id}
                          onClick={() => { setActiveChatProjectId(p._id); setChatMessages([]); }}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer ${
                            activeChatProjectId === p._id
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                              : 'bg-white text-gray-800 border-gray-200/60 hover:bg-gray-50'
                          }`}
                        >
                          <span className={`text-[9px] font-black uppercase ${activeChatProjectId === p._id ? 'text-indigo-200' : 'text-gray-400'}`}>{p.domain || 'General'}</span>
                          <span className="text-xs font-bold truncate block">{p.title}</span>
                          <span className={`text-[10px] mt-1 ${activeChatProjectId === p._id ? 'text-white/80' : 'text-gray-500'}`}>Leader: {p.studentId?.name}</span>
                        </button>
                      ))}
                      {(data.activeProjects || []).length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-8">No active project teams.</p>
                      )}
                    </div>
                  </div>

                  {/* Right panel: Chat messages */}
                  <div className="flex-1 flex flex-col h-full bg-slate-50/20">
                    {activeChatProjectId ? (
                      <>
                        <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
                          <div>
                            <h4 className="text-sm font-extrabold text-gray-900 truncate">
                              {(data.activeProjects || []).find(p => p._id === activeChatProjectId)?.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">Team discussion channel</p>
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {chatMessages.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-xs italic">No messages yet. Send a message to start discussion!</div>
                          ) : (
                            chatMessages.map(msg => {
                              const isMe = msg.senderId === data.profile?._id;
                              const roleLabel = msg.senderModel === 'Student' ? 'Student' : msg.senderModel === 'Faculty' ? 'Faculty' : 'HOD';
                              return (
                                <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <span className="text-[10px] font-black text-gray-500">{msg.senderName}</span>
                                    <span className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase border ${
                                      msg.senderModel === 'Faculty' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' :
                                      msg.senderModel === 'Hod' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                      'bg-blue-50 text-blue-600 border-blue-200'
                                    }`}>{roleLabel}</span>
                                  </div>
                                  <div className={`p-3 rounded-2xl max-w-lg text-xs leading-normal shadow-sm ${
                                    isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                  }`}>
                                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                                  </div>
                                  <span className="text-[8px] text-gray-400 font-bold mt-1 px-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                              );
                            })
                          )}
                          <div ref={chatMessagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMainChatMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                          <input 
                            type="text" 
                            placeholder="Type your message here..." 
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none" 
                            value={newChatMsg} 
                            onChange={e => setNewChatMsg(e.target.value)} 
                          />
                          <button type="submit" disabled={!newChatMsg.trim()} className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"><Send className="w-3.5 h-3.5" /> Send</button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                        <MessageSquare className="w-12 h-12 text-gray-200 mb-2 animate-bounce" />
                        <p className="text-sm font-semibold">Select a project chat from the left side panel.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Tab: Notifications ── */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Bell className="w-4 h-4 text-indigo-500" /> Notifications Log</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">Mark all as read</button>
                    )}
                  </div>
                  <div className="divide-y divide-gray-50">
                    {notifications.map(n => (
                      <div key={n._id} className={`py-4 flex justify-between items-center gap-4 ${!n.isRead ? 'bg-indigo-50/10 px-3 rounded-xl border-l-4 border-l-indigo-600' : ''}`}>
                        <div>
                          <p className="text-xs text-gray-800 font-semibold">{n.message}</p>
                          <span className="text-[9px] text-gray-400 font-bold block mt-1">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        {!n.isRead && (
                          <button onClick={() => handleMarkRead(n._id)} className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"><Check className="w-4 h-4" /></button>
                        )}
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-xs text-gray-400 italic text-center py-8">No notifications logged.</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Tab: Reports & Analytics ── */}
              {activeTab === 'analytics' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Progress Chart */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-80">
                      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">Project Progress Distribution</h3>
                      <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={analyticsProgressData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 100]} />
                          <RechartsTooltip />
                          <Bar dataKey="progress" fill="#6366F1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Department Distribution */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-80 flex flex-col justify-between">
                      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2">Department Branch Breakdown</h3>
                      <div className="flex-1 flex justify-center items-center">
                        {analyticsDeptData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                              <Pie data={analyticsDeptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" label={{ fontSize: 10 }}>
                                {analyticsDeptData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                                ))}
                              </Pie>
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No branch data logged.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{rejectModal.type === 'submission' ? 'Reject Final Submission' : 'Reject Proposal'}</h2>
              <button onClick={() => setRejectModal({ id: null, reason: '', requiredCorrections: '', type: 'proposal' })} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Reason (min 20 characters) *</label>
                <textarea rows={3} placeholder="Provide a clear reason..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none resize-none" value={rejectModal.reason} onChange={e => setRejectModal(r => ({ ...r, reason: e.target.value }))} />
              </div>
              {rejectModal.type === 'submission' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Required Corrections (min 20 characters) *</label>
                  <textarea rows={3} placeholder="Detail corrections..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none resize-none" value={rejectModal.requiredCorrections} onChange={e => setRejectModal(r => ({ ...r, requiredCorrections: e.target.value }))} />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button onClick={() => setRejectModal({ id: null, reason: '', requiredCorrections: '', type: 'proposal' })} className="px-4 py-2 text-xs font-bold bg-gray-100 text-gray-600 rounded-xl cursor-pointer">Cancel</button>
                <button onClick={rejectProposal} className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl cursor-pointer">Confirm Reject</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Targeted Deadline Modal */}
      {deadlineModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Assign Targeted Milestone</h2>
              <button onClick={() => setDeadlineModal({ ...deadlineModal, open: false })} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={submitTargetedDeadline} className="p-5 space-y-4">
              <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Title *</label><input required className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none" value={deadlineModal.title} onChange={e => setDeadlineModal({...deadlineModal, title: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label><textarea className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs resize-none focus:outline-none" rows={2} value={deadlineModal.description} onChange={e => setDeadlineModal({...deadlineModal, description: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Due Date *</label><input required type="datetime-local" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none" value={deadlineModal.dueDate} onChange={e => setDeadlineModal({...deadlineModal, dueDate: e.target.value})} /></div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Target Projects</label>
                <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-3 bg-gray-50">
                  {data.activeProjects.filter(p => p.finalSubmission?.status !== 'Accepted').map(p => (
                    <label key={p._id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 text-xs font-bold">
                      <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        checked={deadlineModal.targetProjects.includes(p._id)}
                        onChange={(e) => { const newT = e.target.checked ? [...deadlineModal.targetProjects, p._id] : deadlineModal.targetProjects.filter(id => id !== p._id); setDeadlineModal({...deadlineModal, targetProjects: newT}); }} />
                      <span>{p.title} <span className="text-gray-400">— {p.studentId?.name}</span></span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer">Assign Deadline</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* ── DETAILED TEAM MODAL ── */}
      {selectedStudent && (() => {
        const student = selectedStudent;
        const project = student.project;
        const projectFilesArr = data.projectFiles?.[project._id] || [];
        const isSubmitted = project.status === 'Submitted';
        const isProjectApproved = project.finalSubmission?.status === 'Accepted';
        const health = calculateHealthScore(project);
        const hb = getHealthBadge(health);
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col border border-gray-100"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 p-6 text-white shrink-0 flex justify-between items-center">
                <div>
                  <div className="flex gap-2 items-center mb-1">
                    <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2.5 py-1 rounded-full uppercase tracking-wider block w-fit">{project.domain}</span>
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full border ${hb.color}`}>Health: {hb.text} ({health}%)</span>
                  </div>
                  <h2 className="font-extrabold text-xl leading-tight truncate max-w-2xl">{project.title}</h2>
                  <p className="text-indigo-200/80 text-xs mt-0.5">Leader: <span className="font-semibold text-white">{project.studentId?.name}</span> • {project.studentId?.course} {project.studentId?.branch}</p>
                </div>
                <button 
                  onClick={() => { setSelectedStudent(null); setTimelineComment({}); }} 
                  className="p-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-2xl transition-all border border-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                
                {/* Left Panel: Profile & Team Details */}
                <div className="w-full md:w-80 border-r border-gray-100 overflow-y-auto p-5 shrink-0 bg-slate-50/50 space-y-5 flex flex-col justify-between">
                  <div>
                    {/* Team Details */}
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Team Members ({1 + (project.teamMembers?.length || 0)})</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 p-2 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-700 shrink-0">L</div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{project.studentId?.name} (Leader)</p>
                            <p className="text-[10px] text-gray-400 truncate">{project.studentId?.email}</p>
                          </div>
                        </div>
                        {(project.teamMembers || []).map((m, i) => (
                          <div key={i} className="flex items-center gap-2.5 p-2 bg-white border border-gray-100 rounded-xl">
                            <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">{i+1}</div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{m.name}</p>
                              <p className="text-[10px] text-gray-400 truncate">{m.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Private Notes Editor */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Private Notes (Supervisor/HOD)</p>
                    <textarea 
                      rows={4}
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-medium text-gray-700 disabled:opacity-50"
                      placeholder={isProjectApproved ? "Private notes are locked (Project Completed)" : "Add private remarks about this team..."}
                      value={privateNoteText}
                      onChange={e => setPrivateNoteText(e.target.value)}
                      disabled={isProjectApproved}
                    />
                    <button
                      onClick={() => handleSavePrivateNotes(project._id)}
                      disabled={savingPrivateNote || isProjectApproved}
                      className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                    >
                      {savingPrivateNote ? 'Saving...' : 'Save Private Notes'}
                    </button>
                  </div>
                </div>

                {/* Center Panel: Project Info, Deliverables, Stepper */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-gray-100">
                  {/* Abstract */}
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Project Abstract</p>
                    <p className="text-xs text-gray-600 border-l-4 border-indigo-200 pl-3 leading-relaxed font-semibold bg-slate-50 p-3.5 rounded-xl">{project.description}</p>
                  </div>

                  {/* Stepper Timeline & Comments */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress Timeline Stepper</p>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">{project.progress || 0}% Completed</span>
                    </div>

                    {!project.timeline || project.timeline.length === 0 ? (
                      <p className="text-xs text-gray-400 italic bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">Student has not logged progress updates yet.</p>
                    ) : (
                      <div className="relative border-l-2 border-indigo-100 pl-5 ml-2.5 space-y-5">
                        {project.timeline.map((item) => (
                          <div key={item._id} className="relative">
                            <span className="absolute -left-[27px] top-1.5 w-3 h-3 bg-indigo-600 rounded-full ring-4 ring-indigo-50" />
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm">
                              <div className="flex justify-between items-start flex-wrap gap-2 mb-1.5">
                                <h5 className="font-bold text-gray-800 text-[10px] tracking-wide bg-indigo-100/50 text-indigo-700 px-2 py-0.5 rounded-md uppercase">{item.status}</h5>
                                <span className="text-[10px] text-gray-400 font-bold">{new Date(item.timestamp).toLocaleString()}</span>
                              </div>
                              {item.remarks && (
                                <p className="text-xs text-gray-600 leading-relaxed font-semibold italic">"{item.remarks}"</p>
                              )}
                              <div className="mt-3 border-t border-slate-200/50 pt-2.5 space-y-2">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Supervisor Comment</p>
                                {item.facultyComment ? (
                                  <p className="text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100 font-semibold">"{item.facultyComment}"</p>
                                ) : isProjectApproved ? (
                                  <span className="text-[10px] text-gray-400 italic">Comments locked (Project Completed)</span>
                                ) : (
                                  <div className="flex gap-2">
                                    <input 
                                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none" 
                                      placeholder="Leave comment..."
                                      value={timelineComment[`${project._id}_${item._id}`] || ''}
                                      onChange={e => setTimelineComment(prev => ({ ...prev, [`${project._id}_${item._id}`]: e.target.value }))}
                                    />
                                    <button 
                                      onClick={() => handleTimelineCommentSubmit(project._id, item._id)}
                                      disabled={timelineSubmitting[`${project._id}_${item._id}`]}
                                      className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-xl flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      Comment
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Uploaded Deliverables */}
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Uploaded Deliverables</p>
                    {projectFilesArr.length === 0 ? (
                      <p className="text-xs text-gray-400 italic bg-gray-50 border border-gray-100 p-4 rounded-xl text-center">No uploads logged.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {projectFilesArr.map(f => (
                          <div key={f._id} className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{f.fileName}</p>
                                <p className="text-[10px] text-gray-400">{f.fileType} • v{f.version}</p>
                              </div>
                            </div>
                            <a href={f.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 rounded-xl transition-all shrink-0"><Download className="w-3.5 h-3.5" /></a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel: Inline Team Chat */}
                <div className="w-full md:w-80 flex flex-col h-full bg-slate-50/30 overflow-hidden shrink-0">
                  <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-1.5 shrink-0">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-gray-800">Team Messaging Channel</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {modalMessages.length === 0 ? (
                      <p className="text-[10px] text-gray-400 italic text-center py-8">No messages. Type below to start chat.</p>
                    ) : (
                      modalMessages.map(msg => {
                        const isMe = msg.senderId === data.profile?._id;
                        return (
                          <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <span className="text-[9px] font-black text-gray-500 mb-0.5">{msg.senderName}</span>
                            <div className={`p-2.5 rounded-2xl max-w-[220px] text-[11px] leading-normal shadow-sm ${
                              isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                            }`}>
                              <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                            </div>
                            <span className="text-[8px] text-gray-400 font-bold mt-1 px-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        );
                      })
                    )}
                    <div ref={modalMessagesEndRef} />
                  </div>

                  <form onSubmit={(e) => handleSendModalMessage(e, project._id)} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                    <input 
                      type="text" 
                      placeholder="Message team..." 
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none" 
                      value={newModalMsg} 
                      onChange={e => setNewModalMsg(e.target.value)} 
                    />
                    <button type="submit" disabled={!newModalMsg.trim()} className="px-3 bg-indigo-600 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"><Send className="w-3 h-3" /></button>
                  </form>
                </div>

              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* Floating Action Button for mobile announcements */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setActiveTab('announcements');
            setShowAnnForm(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer animate-pulse"
          title="Create Announcement"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default FacultyDashboard;
