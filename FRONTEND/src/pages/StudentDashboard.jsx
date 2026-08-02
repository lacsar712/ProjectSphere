import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Users, Target, Send, Megaphone, User,
  Bell, Clock, RefreshCw, CheckCircle, XCircle, FileText, Paperclip,
  FolderOpen, Calendar, ChevronRight, TrendingUp, AlertTriangle, Play,
  Volume2, VolumeX, Sparkles, Upload, Info, MessageSquare, Download, Search, Mail, Lock,
  Menu, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api.js';
import Sidebar from '../Components/Sidebar';

const TABS = [
  { id: 'overview',      label: 'Overview',          icon: LayoutDashboard },
  { id: 'proposal',      label: 'Submit Proposal',   icon: BookOpen },
  { id: 'details',       label: 'Project Details',   icon: Target },
  { id: 'tracker',       label: 'Progress Tracker',  icon: TrendingUp },
  { id: 'messages',      label: 'Team Chat',         icon: MessageSquare },
  { id: 'submission',    label: 'Submission & Files', icon: Send },
  { id: 'announcements', label: 'Announcements',     icon: Megaphone },
  { id: 'deadlines',     label: 'Milestones & Deadlines', icon: Calendar },
  { id: 'profile',       label: 'My Profile',        icon: User },
];

const STATUS_META = {
  'Pending HOD Review': { color: 'yellow', label: 'Pending HOD Review', step: 1 },
  'Pending Faculty Assignment': { color: 'amber', label: 'Pending Mentor Assignment', step: 2 },
  'HOD Approved': { color: 'blue', label: 'HOD Approved', step: 2 },
  'Rejected (HOD)': { color: 'red', label: 'Rejected by HOD', step: 1 },
  'Faculty Assigned': { color: 'indigo', label: 'Faculty Assigned', step: 3 },
  'Faculty Accepted': { color: 'green', label: 'Faculty Accepted ✓', step: 4 },
  'Rejected (Faculty)': { color: 'orange', label: 'Rejected by Faculty', step: 3 },
  'Submitted': { color: 'purple', label: 'Project Submitted', step: 5 },
};

const FILE_TYPES = [
  { value: 'document', label: 'Document (PDF/Word)', icon: FileText },
  { value: 'presentation', label: 'Presentation (PPT)', icon: Paperclip },
  { value: 'code', label: 'Code (ZIP)', icon: FolderOpen },
  { value: 'paper', label: 'Research Paper', icon: BookOpen },
];

// Helper to synthesize a premium audio notification chime
const playChime = (soundEnabled) => {
  if (!soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Smooth dual-note chime (D5 to A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.12);
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.warn('Audio Context block:', e);
  }
};

const StudentDashboard = () => {
  const [activeTab, setActiveTab]       = useState('overview');
  const [data, setData]                 = useState({ profile: null, proposal: null, submissions: [], deadlines: [], notifications: [], unreadCount: 0 });
  const [loading, setLoading]           = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [files, setFiles]               = useState([]);
  
  // Extension & Rescheduling State
  const [extensions, setExtensions]     = useState([]);
  const [extensionModal, setExtensionModal] = useState({ open: false, deadline: null });
  const [extForm, setExtForm]           = useState({ requestedDate: '', reason: '', document: null });
  const [extSubmitting, setExtSubmitting] = useState(false);

  // Timeline State
  const [timelineStatus, setTimelineStatus] = useState('PROJECT STARTED');
  const [timelineRemarks, setTimelineRemarks] = useState('');
  const [timelineSubmitting, setTimelineSubmitting] = useState(false);

  // Smart Popups State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reminderPopup, setReminderPopup] = useState({ open: false, deadline: null, type: '' });

  // Proposal & profile state
  const [proposalForm, setProposalForm] = useState({ title: '', description: '', domain: '', teamSize: 1, teamMembers: [], referenceLinks: '', projectType: 'Application' });
  const [submitting, setSubmitting]     = useState(false);
  const [availableFaculty, setAvailableFaculty] = useState([]);
  const [facultySearch, setFacultySearch] = useState('');
  const [newTarget, setNewTarget]       = useState({ title: '', description: '' });
  const [finalForm, setFinalForm]       = useState({ liveLink: '', githubLink: '', linkedinLink: '' });
  const [profileForm, setProfileForm]   = useState({ githubId: '', linkedinId: '', portfolioLink: '' });
  const [resumeFile, setResumeFile]     = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const resumeRef = useRef(null);

  const [uploading, setUploading]       = useState(false);
  const [selectedFileType, setSelectedFileType] = useState('document');
  const [showNotifs, setShowNotifs]     = useState(false);

  // Memoized available faculty search
  const filteredAvailableFaculty = React.useMemo(() => {
    return availableFaculty.filter(f => f.name.toLowerCase().includes(facultySearch.toLowerCase()));
  }, [availableFaculty, facultySearch]);

  // Team Messaging State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/login'); };

  const fetchMessages = useCallback(async () => {
    if (!data.proposal) return;
    try {
      const res = await api.get(`/projects/${data.proposal._id}/messages`);
      setMessages(res.data);
    } catch {}
  }, [data.proposal]);

  useEffect(() => {
    if (activeTab === 'messages' && data.proposal) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, data.proposal, fetchMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !data.proposal) return;
    try {
      const res = await api.post(`/projects/${data.proposal._id}/messages`, { content: newMessage });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch {
      toast.error('Failed to send message.');
    }
  };

  const fetchExtensions = async () => {
    try {
      const res = await api.get('/student/extensions');
      setExtensions(res.data);
    } catch {}
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, filesRes, facultyRes] = await Promise.all([
        api.get('/student/dashboard'),
        api.get('/student/files'),
        api.get('/student/faculty/available')
      ]);
      setData(dashRes.data);
      setFiles(filesRes.data.files || []);
      setAvailableFaculty(facultyRes.data.faculty || []);
      
      if (dashRes.data.proposal) {
        const p = dashRes.data.proposal;
        setProposalForm({ 
          title: p.title || '', 
          description: p.description || '',
          domain: p.domain || '',
          teamSize: p.teamSize || 1,
          teamMembers: p.teamMembers || [],
          referenceLinks: (p.referenceLinks || []).join(', '),
          projectType: p.projectType || 'Application'
        });
        if (p.finalSubmission) {
          setFinalForm({
            liveLink: p.finalSubmission.liveLink || '',
            githubLink: p.finalSubmission.githubLink || '',
            linkedinLink: p.finalSubmission.linkedinLink || ''
          });
        }
      } else {
        setProposalForm(prev => ({...prev, teamMembers: [{ name: '', email: '', mobileNumber: '', course: 'B.Tech', branch: 'Computer Science', section: 'A' }]}));
      }

      if (dashRes.data.profile) {
        const pr = dashRes.data.profile;
        setProfileForm({ githubId: pr.githubId || '', linkedinId: pr.linkedinId || '', portfolioLink: pr.portfolioLink || '' });
      }
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) handleLogout();
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => {
    if (activeTab === 'details' || activeTab === 'overview') {
      fetchExtensions();
    }
  }, [activeTab]);

  // Smart Reminder Popup Trigger
  useEffect(() => {
    if (isApproved) return;
    if (data.deadlines && data.deadlines.length > 0) {
      const now = new Date();
      // Find the closest active deadline in the future or due today
      const upcoming = data.deadlines.filter(d => new Date(d.dueDate) >= now);
      if (upcoming.length === 0) return;

      const closest = upcoming[0];
      const due = new Date(closest.dueDate);
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let popupType = '';
      if (diffDays <= 0) {
        popupType = 'today';
      } else if (diffDays === 1) {
        popupType = 'urgent'; // 1 day left
      } else if (diffDays === 3) {
        popupType = 'motivational_3'; // 3 days left
      } else if (diffDays === 7) {
        popupType = 'motivational_7'; // 7 days left
      }

      if (popupType) {
        const key = `dismissed_${closest._id}_${popupType}`;
        const isDismissed = localStorage.getItem(key);
        if (!isDismissed) {
          // Play Synthesized sound alert chimes
          setTimeout(() => {
            playChime(soundEnabled);
          }, 600);
          setReminderPopup({ open: true, deadline: closest, type: popupType });
        }
      }
    }
  }, [data.deadlines, soundEnabled]);

  const dismissPopup = () => {
    if (reminderPopup.deadline) {
      const key = `dismissed_${reminderPopup.deadline._id}_${reminderPopup.type}`;
      localStorage.setItem(key, 'true');
    }
    setReminderPopup({ open: false, deadline: null, type: '' });
  };

  const getApproachingDeadline = () => {
    if (!data.deadlines || data.deadlines.length === 0) return null;
    const now = new Date();
    const upcoming = data.deadlines.filter(d => new Date(d.dueDate) >= now);
    if (upcoming.length === 0) return null;
    
    const closest = upcoming[0];
    const due = new Date(closest.dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if ([0, 1, 3, 7].includes(diffDays)) {
      return { deadline: closest, daysLeft: diffDays };
    }
    return null;
  };

  const handleTeamSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setProposalForm(prev => {
      let members = [...prev.teamMembers];
      if (size > members.length) {
        for (let i = members.length; i < size; i++) {
          members.push({ name: '', email: '', mobileNumber: '', course: prev.teamMembers[0]?.course || 'B.Tech', branch: prev.teamMembers[0]?.branch || 'Computer Science', section: prev.teamMembers[0]?.section || 'A' });
        }
      } else if (size < members.length) {
        members = members.slice(0, size);
      }
      return { ...prev, teamSize: size, teamMembers: members };
    });
  };

  const updateTeamMember = (index, field, value) => {
    setProposalForm(prev => {
      const members = [...prev.teamMembers];
      members[index] = { ...members[index], [field]: value };
      return { ...prev, teamMembers: members };
    });
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: proposalForm.title,
        description: proposalForm.description,
        domain: proposalForm.domain,
        teamSize: proposalForm.teamSize,
        teamMembers: proposalForm.teamMembers,
        projectType: proposalForm.projectType || 'Application',
        referenceLinks: proposalForm.referenceLinks ? proposalForm.referenceLinks.split(',').map(l => l.trim()).filter(Boolean) : []
      };

      if (data.proposal && (data.proposal.status === 'Rejected (HOD)' || data.proposal.status === 'Rejected (Faculty)')) {
        await api.put('/student/proposal', payload);
        toast.success('Proposal resubmitted for HOD review!');
      } else {
        await api.post('/student/proposal', payload);
        toast.success('Proposal submitted successfully!');
      }
      fetchDashboard();
      setActiveTab('overview');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const handleRequestSupervisor = async (facultyId) => {
    try {
      await api.post(`/student/faculty/request/${facultyId}`);
      toast.success('Supervisor requested successfully!');
      fetchDashboard();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to request supervisor');
    }
  };

  const handleAddTarget = async (e) => {
    e.preventDefault();
    try {
      await api.post('/student/targets', newTarget);
      toast.success('Target added!');
      setNewTarget({ title: '', description: '' });
      fetchDashboard();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add target');
    }
  };

  const updateTargetStatus = async (targetId, status) => {
    try {
      await api.put(`/student/targets/${targetId}`, { status });
      fetchDashboard();
    } catch (e) {
      toast.error('Failed to update target');
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/student/submit-final', finalForm);
      toast.success('Final project submitted successfully!');
      fetchDashboard();
      setActiveTab('overview');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Submission failed');
    }
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));
    formData.append('fileType', selectedFileType);
    setUploading(true);
    try {
      await api.post('/student/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Files uploaded successfully!');
      fetchDashboard();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); e.target.value = ''; }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('githubId', profileForm.githubId);
    formData.append('linkedinId', profileForm.linkedinId);
    formData.append('portfolioLink', profileForm.portfolioLink);
    if (resumeFile) formData.append('resume', resumeFile);

    setUpdatingProfile(true);
    try {
      const res = await api.put('/student/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Profile updated successfully!');
      setData(d => ({ ...d, profile: res.data.profile }));
      setResumeFile(null);
      if (resumeRef.current) resumeRef.current.value = '';
    } catch (e) {
      toast.error(e.response?.data?.message || 'Profile update failed');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleTimelineSubmit = async (e) => {
    e.preventDefault();
    setTimelineSubmitting(true);
    try {
      await api.post('/student/proposal/timeline', { status: timelineStatus, remarks: timelineRemarks });
      toast.success('Progress timeline updated successfully!');
      setTimelineRemarks('');
      fetchDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update timeline.');
    } finally {
      setTimelineSubmitting(false);
    }
  };

  const handleExtensionSubmit = async (e) => {
    e.preventDefault();
    if (!extForm.requestedDate || !extForm.reason || extForm.reason.length < 20) {
      return toast.error('Please enter a target date and details (min 20 chars)');
    }
    setExtSubmitting(true);
    const formData = new FormData();
    formData.append('deadlineId', extensionModal.deadline._id);
    formData.append('requestedDate', extForm.requestedDate);
    formData.append('reason', extForm.reason);
    if (extForm.document) {
      formData.append('document', extForm.document);
    }
    
    try {
      await api.post('/student/deadlines/extension', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Extension request submitted to your supervisor!');
      setExtensionModal({ open: false, deadline: null });
      setExtForm({ requestedDate: '', reason: '', document: null });
      fetchExtensions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setExtSubmitting(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setData(d => ({ ...d, unreadCount: 0, notifications: d.notifications.map(n => ({ ...n, isRead: true })) }));
    } catch {}
  };

  const proposal = data.proposal;
  const isApproved = proposal?.finalSubmission?.status === 'Accepted';
  const statusMeta = proposal ? (STATUS_META[proposal.status] || { color: 'slate', label: proposal.status, step: 1 }) : {};

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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
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

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar
        navItems={TABS}
        user={data.profile}
        role="student"
        onLogout={handleLogout}
        unreadCount={data.unreadCount}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <header className="bg-white border-b border-gray-100 shadow-sm px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-base md:text-lg font-extrabold text-gray-900 capitalize">{TABS.find(t=>t.id===activeTab)?.label || 'Dashboard'}</h2>
            <p className="text-[10px] md:text-xs text-gray-400 font-medium">Student Interface</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
            <button onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'Disable Sounds' : 'Enable Sounds'} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-200 transition-all">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="relative">
              <button onClick={() => setShowNotifs(p => !p)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-200 transition-all">
                <Bell className="w-4 h-4" />
                {data.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">{data.unreadCount}</span>}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-blue-500"/> Notifications</h4>
                    {data.unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-blue-600 font-semibold hover:underline bg-blue-50 px-2 py-1 rounded-md border border-blue-100">Mark all read</button>}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {data.notifications.length === 0 && <div className="p-8 text-center"><Bell className="w-8 h-8 text-gray-200 mx-auto mb-2"/><p className="text-sm text-gray-400 font-medium">No notifications yet</p></div>}
                    {data.notifications.map(n => (
                      <div key={n._id} className={`p-4 transition-colors hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/30' : ''}`}>
                        <p className="text-xs text-gray-700 font-medium leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(n.createdAt).toLocaleDateString()}</p>
                        {!n.isRead && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full -mt-6 float-right shadow-sm"></span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={fetchDashboard} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-200 transition-all"><RefreshCw className="w-4 h-4" /></button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {/* Mobile project tab group sub-navigation */}
          {proposal && ['details', 'tracker', 'deadlines'].includes(activeTab) && (
            <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-5 border-b border-gray-100 scrollbar-none">
              {[
                { id: 'details', label: 'Project Details' },
                { id: 'tracker', label: 'Progress Tracker' },
                { id: 'deadlines', label: 'Milestones' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="w-full">
                       {/* ── 1. DASHBOARD OVERVIEW ── */}
            {activeTab === 'overview' && (() => {
              const approaching = getApproachingDeadline();
              return (
                <div className="space-y-6 animate-fade-in">
                  {/* Approaching Deadline Banner */}
                  {approaching && (
                    <div className={`p-4 rounded-2xl flex items-center justify-between border ${
                      approaching.daysLeft === 0 ? 'bg-red-50 border-red-200 text-red-800 animate-pulse' :
                      approaching.daysLeft === 1 ? 'bg-amber-50 border-amber-200 text-amber-800' :
                      approaching.daysLeft === 3 ? 'bg-orange-50 border-orange-200 text-orange-800' :
                      'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce text-amber-500" />
                        <div>
                          <p className="text-sm font-black">
                            🚨 Approaching Deadline: {approaching.deadline.title} is due {approaching.daysLeft === 0 ? 'TODAY' : approaching.daysLeft === 1 ? 'tomorrow' : `in ${approaching.daysLeft} days`}!
                          </p>
                          <p className="text-xs opacity-90 mt-0.5">{approaching.deadline.description}</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('submission')} className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                        approaching.daysLeft <= 1 ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}>
                        Go to Submissions
                      </button>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {[
                      { label: 'Applied', val: proposal ? 1 : 0, color: 'blue' },
                      { label: 'Approved', val: ['HOD Approved', 'Pending Faculty Assignment', 'Faculty Assigned', 'Faculty Accepted', 'Submitted'].includes(proposal?.status) ? 1 : 0, color: 'green' },
                      { label: 'Pending', val: proposal?.status === 'Pending HOD Review' ? 1 : 0, color: 'yellow' },
                      { label: 'Rejected', val: proposal?.status?.includes('Reject') ? 1 : 0, color: 'red' },
                      { label: 'Ongoing', val: proposal?.status === 'Faculty Accepted' ? 1 : 0, color: 'indigo' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
                        <p className={`text-3xl font-extrabold mt-1 text-${s.color}-600`}>{s.val}</p>
                      </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Summary and Progress */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Project Status & Details */}
                    <div className={`bg-white rounded-3xl p-8 border shadow-sm relative overflow-hidden ${!proposal ? 'border-gray-200' : proposal.status.includes('Rejected') ? 'border-red-200' : proposal.status === 'Faculty Accepted' || proposal.status === 'Submitted' ? 'border-green-200' : 'border-blue-200'}`}>
                      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 -mr-10 -mt-10 rounded-full ${proposal?.status?.includes('Reject') ? 'bg-red-500' : proposal?.status === 'Faculty Accepted' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      
                      <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
                        <div className="w-full">
                          <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Target className="w-4 h-4"/> Project Summary</p>
                          {!proposal ? (
                            <>
                              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">Ready to start your journey?</h2>
                              <p className="text-gray-500 text-sm mt-2 max-w-md">Submit your final year project proposal with team details to get HOD approval.</p>
                              <button onClick={() => setActiveTab('proposal')} className="mt-5 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl inline-flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                                <BookOpen className="w-4 h-4" /> Start Proposal 
                              </button>
                            </>
                          ) : (
                            <>
                              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">{proposal.title}</h2>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">{proposal.department || 'N/A'}</span>
                                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md">Type: {proposal.projectType || 'Application'}</span>
                                <span className="text-xs font-bold bg-purple-50 text-purple-600 px-2.5 py-1 rounded-md">Team Size: {proposal.teamMembers?.length + 1 || 1}</span>
                                {proposal.assignedFaculty && <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-md">Supervisor: {proposal.assignedFaculty.name}</span>}
                              </div>

                              {/* Progress bar */}
                              <div className="mt-6">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-bold text-gray-500">Project Progress</span>
                                  <span className="text-xs font-bold text-blue-600">{proposal.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${proposal.progress}%` }}></div>
                                </div>
                              </div>

                              <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border shadow-sm
                                ${statusMeta.color === 'red' || statusMeta.color === 'orange' ? 'bg-red-50 text-red-700 border-red-200' :
                                  statusMeta.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                                  statusMeta.color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                {proposal.status.includes('Accepted') || proposal.status === 'Submitted' ? <CheckCircle className="w-4 h-4" /> : proposal.status.includes('Rejected') ? <XCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                {statusMeta.label}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Compliance Warnings */}
                    {proposal && (
                      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Project Compliance Checks</h3>
                        {proposal.progress < 100 ? (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-amber-800 font-bold">Project Incomplete (Locked)</p>
                              <p className="text-xs text-amber-700 font-medium mt-0.5">Your project progress is currently {proposal.progress}%. You must reach 100% (log "PROJECT COMPLETE" in the Progress Tracker tab) to unlock file uploads and submit your project.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(() => {
                              const warnings = [];
                              const hasReport = files.some(f => f.fileType === 'document');
                              const hasPPT = files.some(f => f.fileType === 'presentation');
                              const hasPaper = files.some(f => f.fileType === 'paper');
                              
                              if (!hasReport) warnings.push("Project Report File (.pdf/.docx) is missing.");
                              if (!hasPPT) warnings.push("Project Presentation PPT (.ppt/.pptx) is missing.");
                              if (proposal.projectType === 'Research Paper' && !hasPaper) warnings.push("Research Paper PDF is missing.");
                              if (!proposal.finalSubmission?.liveLink) warnings.push("Live Prototype Link is missing.");
                              if (!proposal.finalSubmission?.githubLink) warnings.push("GitHub Repository Link is missing.");
                              if (!proposal.finalSubmission?.linkedinLink) warnings.push("LinkedIn Presentation Link is missing.");
                              
                              if (warnings.length > 0) {
                                return (
                                  <div className="space-y-2">
                                    <p className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Required items missing before submission:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {warnings.map((w, idx) => (
                                        <div key={idx} className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
                                          <XCircle className="w-4.5 h-4.5 shrink-0 text-red-500" />
                                          <span>{w}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2">Go to the <strong>Submission & Files</strong> tab to upload missing files or update links.</p>
                                  </div>
                                );
                              } else if (proposal.finalSubmission?.status === 'Not Submitted' || !proposal.finalSubmission?.status) {
                                return (
                                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-sm text-green-800 font-bold">All Compliance Checks Cleared!</p>
                                      <p className="text-xs text-green-700 font-medium mt-0.5">Your files are uploaded and links are filled. Please go to the <strong>Submission & Files</strong> tab and click "Submit Final Project" to route your project for HOD Review.</p>
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-sm text-blue-800 font-bold">Project Submitted</p>
                                      <p className="text-xs text-blue-700 font-medium mt-0.5">Your final submission is currently: <strong>{proposal.finalSubmission?.status}</strong>.</p>
                                    </div>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Notifications & Recent Announcement */}
                  <div className="space-y-6">
                    {/* Recent Notifications List */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-blue-500" /> Recent Notifications</h3>
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {data.notifications.slice(0, 3).map(n => (
                          <div key={n._id} className={`p-3 rounded-2xl border ${!n.isRead ? 'bg-blue-50/50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                            <p className="text-xs text-gray-700 font-medium leading-normal">{n.message}</p>
                            <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        ))}
                        {data.notifications.length === 0 && (
                          <p className="text-xs text-gray-400 text-center py-4">No notifications.</p>
                        )}
                      </div>
                    </div>

                    {/* Latest Announcement */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Megaphone className="w-4 h-4 text-purple-500" /> Latest Announcement</h3>
                      {data.announcements && data.announcements.length > 0 ? (
                        <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl">
                          <p className="text-xs font-extrabold text-purple-800 uppercase tracking-wider mb-1">{data.announcements[0].title}</p>
                          <p className="text-xs text-gray-600 line-clamp-3 font-medium">{data.announcements[0].content}</p>
                          <button onClick={() => setActiveTab('announcements')} className="text-[10px] text-purple-600 font-bold hover:underline mt-2 inline-block">Read Full Announcement →</button>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-4">No recent announcements.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

            {/* ── 2. SUBMIT PROPOSAL ── */}
            {activeTab === 'proposal' && (
              <div className="max-w-4xl mx-auto">
                {proposal && !['Rejected (HOD)', 'Rejected (Faculty)'].includes(proposal.status) ? (
                   <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-fade-in">
                     <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8 text-blue-600"/></div>
                     <h2 className="text-xl font-extrabold text-blue-900">Proposal Already Submitted</h2>
                     <p className="text-blue-700 mt-2 max-w-md">Your proposal is currently in the <strong>{proposal.status}</strong> stage. You cannot edit it unless HOD or Faculty requests changes. Head to the Project Details tab to view it.</p>
                     <button onClick={() => setActiveTab('details')} className="mt-6 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition animate-pulse">View Details</button>
                   </div>
                ) : (
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden animate-fade-in">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-bl-full -z-10"></div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><BookOpen className="w-6 h-6"/></div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">
                          {proposal ? 'Resubmit Project Proposal' : 'Submit Project Proposal'}
                        </h2>
                        <p className="text-sm font-medium text-gray-500 mt-1">Fill in the project details and team member information carefully.</p>
                      </div>
                    </div>

                    {proposal && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start gap-3 mb-6">
                        <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5"/>
                        <div>
                          <p className="text-sm text-orange-800 font-bold mb-1">Previous Rejection Note</p>
                          <p className="text-sm text-orange-700 font-medium">{proposal.status === 'Rejected (HOD)' ? proposal.hodReview?.comment : proposal.facultyReview?.comment}</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleProposalSubmit} className="space-y-8">
                      {/* Section 1: Project Info */}
                      <div className="space-y-5">
                        <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">1. Project Information</h3>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1.5 block">Project Title <span className="text-red-400">*</span></label>
                          <input required minLength={10} maxLength={120}
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3.5 px-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                            placeholder="Enter a descriptive title for your project" value={proposalForm.title}
                            onChange={e => setProposalForm({ ...proposalForm, title: e.target.value })} />
                        </div>
                        
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1.5 block">Project Type <span className="text-red-400">*</span></label>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-gray-700 bg-gray-50 border border-gray-200 p-3.5 rounded-xl hover:bg-gray-100 transition-all flex-1">
                              <input type="radio" name="projectType" value="Application" checked={proposalForm.projectType === 'Application'} onChange={e => setProposalForm({ ...proposalForm, projectType: e.target.value })} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                              <span>Application Development</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-gray-700 bg-gray-50 border border-gray-200 p-3.5 rounded-xl hover:bg-gray-100 transition-all flex-1">
                              <input type="radio" name="projectType" value="Research Paper" checked={proposalForm.projectType === 'Research Paper'} onChange={e => setProposalForm({ ...proposalForm, projectType: e.target.value })} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                              <span>Research Paper</span>
                            </label>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 font-medium">
                          🏫 Your proposal will be routed to the <strong>{data.profile?.branch || 'your'}</strong> department HOD automatically.
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1.5 block">Project Domain / Technology Area <span className="text-red-400">*</span></label>
                          <input required
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3.5 px-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
                            placeholder="e.g. Machine Learning, Web Development, IoT, Data Science..."
                            value={proposalForm.domain}
                            onChange={e => setProposalForm({ ...proposalForm, domain: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-gray-700 mb-1.5 block">Project Description <span className="text-red-400">*</span></label>
                          <textarea required minLength={100} maxLength={1000} rows={5}
                            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3.5 px-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium resize-none shadow-inner"
                            placeholder="Describe your project, objectives, methodologies, and expected outcomes..."
                            value={proposalForm.description}
                            onChange={e => setProposalForm({ ...proposalForm, description: e.target.value })} />
                        </div>
                      </div>

                      {/* Section 2: Team Members */}
                      <div className="space-y-5">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">2. Team Configuration</h3>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-bold text-gray-700">Non-Leader Team Size:</label>
                            <select className="bg-gray-100 border-none rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 focus:ring-blue-500" value={proposalForm.teamSize} onChange={handleTeamSizeChange}>
                               {[1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                        </div>

                        {proposalForm.teamSize === 0 && (
                          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-sm font-bold text-gray-500">Solo Project (No additional team members)</div>
                        )}

                        <div className="space-y-4">
                          {proposalForm.teamMembers.map((member, i) => (
                            <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 relative">
                              <span className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-sm">Member {i+1}</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Full Name</label>
                                  <input required className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm" value={member.name} onChange={e => updateTeamMember(i, 'name', e.target.value)} placeholder="John Doe"/>
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Email</label>
                                  <input type="email" required className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm" value={member.email} onChange={e => updateTeamMember(i, 'email', e.target.value)} placeholder="john@example.com"/>
                                </div>
                                <div>
                                  <label className="text-xs font-bold text-gray-500 mb-1 block">Mobile Number</label>
                                  <input required className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm" value={member.mobileNumber} onChange={e => updateTeamMember(i, 'mobileNumber', e.target.value)} placeholder="10-digit number"/>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Course</label>
                                    <input required className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm" value={member.course} onChange={e => updateTeamMember(i, 'course', e.target.value)}/>
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Branch</label>
                                    <input required className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm" value={member.branch} onChange={e => updateTeamMember(i, 'branch', e.target.value)}/>
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Section</label>
                                    <input required className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-sm" value={member.section} onChange={e => updateTeamMember(i, 'section', e.target.value)}/>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={submitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 transition-all">
                        {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Send className="w-5 h-5" /> {proposal ? 'Resubmit Proposal' : 'Submit Proposal'}</>}
                      </motion.button>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ── 3. PROJECT DETAILS ── */}
            {activeTab === 'details' && (
              <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
                {!proposal ? (
                  <div className="py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100 font-medium">Please submit a proposal first.</div>
                ) : (
                  <>
                    {/* Project Info Card */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                       <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
                          <div>
                             <h2 className="text-2xl font-extrabold text-gray-900">{proposal.title}</h2>
                             <div className="flex flex-wrap gap-2 mt-2">
                               {proposal.domain && <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md border border-indigo-100">{proposal.domain}</span>}
                               <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100">Type: {proposal.projectType || 'Application'}</span>
                             </div>
                          </div>
                          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">{proposal.status}</span>
                       </div>
                       <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-4">{proposal.description}</p>
                       {proposal.referenceLinks?.length > 0 && (
                         <div className="space-y-1">
                           <p className="text-xs font-bold text-gray-400">References:</p>
                           <div className="flex flex-wrap gap-2">
                             {proposal.referenceLinks.map((link, i) => <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">{link}</a>)}
                           </div>
                         </div>
                       )}
                    </div>

                    {/* Team Members Card */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-500" /> Team Members</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Leader */}
                        <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 relative">
                          <span className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">Leader</span>
                          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-extrabold shrink-0">{data.profile?.name?.[0]?.toUpperCase()}</div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 text-sm truncate">{data.profile?.name} (You)</p>
                            <p className="text-xs text-gray-400 truncate mt-0.5">{data.profile?.email}</p>
                            <p className="text-xs text-gray-500 mt-1 font-semibold">{data.profile?.course} — {data.profile?.branch} Sec-{data.profile?.section}</p>
                          </div>
                        </div>
                        {/* Additional members */}
                        {proposal.teamMembers?.map((m, i) => (
                          <div key={i} className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-xl font-extrabold text-indigo-700 shrink-0">{m.name?.[0]?.toUpperCase() || '?'}</div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-gray-900 text-sm truncate">{m.name}</p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{m.email}</p>
                              <p className="text-xs text-gray-500 mt-1 font-semibold">{m.course} — {m.branch} Sec-{m.section}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Guide Info Card */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10"></div>
                       <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><User className="w-4 h-4 text-indigo-500" /> Guide Information</h3>
                       
                       {proposal.assignedFaculty ? (
                         <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-24 h-24 bg-indigo-100 border-4 border-white shadow-lg rounded-full flex items-center justify-center shrink-0">
                              <span className="text-3xl font-extrabold text-indigo-600">{proposal.assignedFaculty.name[0]}</span>
                            </div>
                            <div className="text-center md:text-left">
                              <p className="text-2xl font-extrabold text-gray-900">{proposal.assignedFaculty.name}</p>
                              <p className="text-sm font-bold text-gray-500 mt-1">{proposal.assignedFaculty.department} Dept. {proposal.assignedFaculty.designation && `• ${proposal.assignedFaculty.designation}`}</p>
                              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-3">
                                <a href={`mailto:${proposal.assignedFaculty.email}`} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-100 transition"><Mail className="w-4 h-4" /> {proposal.assignedFaculty.email}</a>
                              </div>
                            </div>
                         </div>
                       ) : (
                         <div className="space-y-6">
                           {proposal.supervisorRequested ? (
                             <div className="flex flex-col items-center justify-center py-8 text-center bg-yellow-50/50 border border-dashed border-yellow-300 rounded-2xl">
                               <Clock className="w-12 h-12 text-yellow-500 mb-3" />
                               <h3 className="text-lg font-bold text-yellow-800">Supervisor Request Pending Approval</h3>
                               <p className="text-sm font-medium text-yellow-600 mt-1 max-w-sm">You requested supervisor approval. The supervisor or HOD is reviewing your request.</p>
                             </div>
                           ) : (
                             <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
                               <User className="w-12 h-12 text-gray-300 mb-3" />
                               <h3 className="text-lg font-bold text-gray-700">No Supervisor Assigned</h3>
                               <p className="text-sm font-medium text-gray-500 mt-1 max-w-sm mb-4">Please select and request a supervisor from your branch below to mentor your project.</p>
                             </div>
                           )}

                           {!proposal.assignedFaculty && !proposal.supervisorRequested && (
                             <div className="pt-6 border-t border-gray-100">
                               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                 <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Search className="w-4 h-4 text-blue-500" /> Choose Department Supervisors</h3>
                                 <div className="relative w-full sm:w-64">
                                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                   <input type="text" placeholder="Search by name..." className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={facultySearch} onChange={e => setFacultySearch(e.target.value)} />
                                 </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                 {filteredAvailableFaculty.map(faculty => (
                                   <div key={faculty._id} className="p-5 border border-gray-100 rounded-2xl bg-white relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                                     <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4">
                                       <span className="text-lg font-extrabold text-blue-700">{faculty.name[0]}</span>
                                     </div>
                                     <h4 className="font-extrabold text-gray-900 leading-tight">{faculty.name}</h4>
                                     <p className="text-xs font-bold text-gray-500 mb-2">{faculty.department} • {faculty.designation || 'Faculty'}</p>
                                     <p className="text-[11px] font-medium text-gray-400 line-clamp-2">{faculty.specialization || 'Supervise project milestones and thesis reviews.'}</p>
                                     
                                     <div className="mt-4 pt-4 border-t border-gray-50">
                                        <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-500 font-bold mb-3">
                                          <div>Assigned: <span className="text-blue-600">{faculty.studentCount ?? 0}</span></div>
                                          <div>Capacity: <span className="text-gray-700">{faculty.capacity ?? 60}</span></div>
                                          <div>Available: <span className="text-green-600">{faculty.availableSlots ?? 60}</span></div>
                                        </div>
                                        <button onClick={() => handleRequestSupervisor(faculty._id)} className="w-full text-center text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white py-1.5 rounded-lg transition-all">
                                          Request Guide
                                        </button>
                                      </div>
                                   </div>
                                 ))}
                                 {availableFaculty.length === 0 && <div className="col-span-full py-10 text-center text-gray-400 font-medium">No department supervisors available.</div>}
                               </div>
                             </div>
                           )}
                         </div>
                       )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── 4. PROGRESS TRACKER ── */}
            {activeTab === 'tracker' && (
              <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
                {!proposal ? (
                  <div className="py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100 font-medium">Please submit a proposal first.</div>
                ) : (
                  <>
                    {/* Progress Bar Header */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Project Milestone Tracker</h3>
                          <p className="text-xs font-medium text-gray-400">Post updates as you complete key checkpoints.</p>
                        </div>
                        <span className="text-2xl font-black text-blue-600">{proposal.progress}% Completed</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-700" style={{ width: `${proposal.progress}%` }}></div>
                      </div>
                    </div>

                    {/* Progress timeline logging form */}
                    {['Faculty Accepted', 'Submitted'].includes(proposal.status) && (
                      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-fade-in">
                        <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" /> Log Progress Milestone
                        </h3>
                        {isApproved ? (
                          <p className="text-xs text-green-700 bg-green-50 border border-green-200 p-4 rounded-2xl font-bold flex items-center gap-2">✓ Project report has been approved. Milestone logs are closed.</p>
                        ) : (
                          <form onSubmit={handleTimelineSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-1">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Progress Status *</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={timelineStatus} onChange={e => setTimelineStatus(e.target.value)}>
                                  <option value="PROJECT STARTED">PROJECT STARTED (20%)</option>
                                  <option value="PROTOTYPE CREATED">PROTOTYPE CREATED (50%)</option>
                                  <option value="REPORT PREPARED">REPORT PREPARED (80%)</option>
                                  <option value="PROJECT COMPLETE">PROJECT COMPLETE (100%)</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Milestone Description / Remarks *</label>
                                <input required type="text" placeholder="Detail the features built or deliverables prepared..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={timelineRemarks} onChange={e => setTimelineRemarks(e.target.value)} />
                              </div>
                            </div>
                            <button type="submit" disabled={timelineSubmitting} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                              {timelineSubmitting ? 'Posting...' : <><Sparkles className="w-3.5 h-3.5" /> Post Progress Update</>}
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* Milestone logs */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                      <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Milestone Logs</h3>
                      {proposal.timeline && proposal.timeline.length > 0 ? (
                        <div className="relative border-l border-gray-200 ml-4 space-y-6">
                          {[...proposal.timeline].reverse().map((t, idx) => (
                            <div key={idx} className="relative pl-6">
                              <div className="absolute -left-2 top-1.5 w-4 h-4 rounded-full border-2 border-blue-500 bg-white shadow-sm flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                              </div>
                              <div>
                                <span className="inline-block bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-blue-100">{t.status}</span>
                                <span className="text-[10px] text-gray-400 ml-2">{new Date(t.timestamp).toLocaleString()}</span>
                                {t.remarks && <p className="text-xs text-gray-700 mt-1 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">{t.remarks}</p>}
                                {t.facultyComment && (
                                  <div className="mt-2 p-2.5 bg-green-50 border border-green-100 rounded-xl text-xs text-green-800 flex items-start gap-2">
                                    <MessageSquare className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                                    <p><strong>Supervisor Feedback:</strong> {t.facultyComment}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No milestone updates posted yet. Select status above to log progress updates.</p>
                      )}
                    </div>

                    {/* Extension Request list */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500" /> Deadline Extension Requests</h3>
                      <div className="space-y-3">
                        {extensions.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No extension requests logged. You can request extensions next to any deadline listed in the "Milestones & Deadlines" tab.</p>
                        ) : (
                          extensions.map(req => (
                            <div key={req._id} className="p-4 border border-gray-100 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                              <div>
                                <p className="text-sm font-bold text-gray-900">{req.deadlineId?.title || 'Milestone'}</p>
                                <p className="text-xs text-gray-500">Requested Extension: <span className="font-semibold">{new Date(req.requestedDate).toLocaleDateString()}</span></p>
                                <p className="text-xs text-gray-400 mt-1">Reason: "{req.reason}"</p>
                                {req.documentUrl && <a href={req.documentUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 mt-1"><Download className="w-3 h-3" /> View Proof Document</a>}
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider border
                                  ${req.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                    req.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-200' :
                                    'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                  {req.status}
                                </span>
                                {req.remarks && <p className="text-[11px] text-gray-600 italic">Remarks: {req.remarks}</p>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── 5. SUBMISSION & FILES ── */}
            {activeTab === 'submission' && (
              <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
                {!proposal ? (
                  <div className="py-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100 font-medium">Please submit a proposal first.</div>
                ) : proposal.progress < 100 ? (
                  /* LOCK SCREEN */
                  <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center animate-fade-in">
                    <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <Lock className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">File Submission Portal Locked</h2>
                    <p className="text-gray-500 text-sm mt-2 max-w-md">Your project progress is currently <strong>{proposal.progress}%</strong>. You must complete your project work and reach 100% progress before you can upload deliverables and submit.</p>
                    
                    <div className="mt-8 p-6 bg-red-50/50 border border-red-100 rounded-2xl w-full max-w-md text-left">
                      <h4 className="text-xs font-black text-red-800 uppercase tracking-widest mb-3">Unlocking Requirements</h4>
                      <div className="space-y-2.5 font-semibold text-xs text-red-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Submit Proposal & Get HOD Approval</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Get Mentor Supervisor Assigned</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>Set Milestone Progress to 100% (PROJECT COMPLETE under Progress Tracker tab)</span>
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={() => setActiveTab('tracker')} className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Go to Progress Tracker
                    </button>
                  </div>
                ) : (
                  /* UNLOCKED PORTAL */
                  <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-8 animate-fade-in">
                    {/* Left Column: Upload box and links form */}
                    <div className="space-y-6">
                      {/* 1. Upload Deliverable form */}
                      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Upload className="w-4 h-4 text-blue-500" /> Upload Deliverable File</h3>
                        {isApproved ? (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-xs text-green-700 font-bold leading-relaxed flex items-center gap-2">
                             ✓ Project has been approved and completed. Uploads are closed.
                          </div>
                        ) : ['Rejected (HOD)', 'Rejected (Faculty)'].includes(proposal.status) ? (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-medium leading-relaxed">
                             ❌ Cannot upload files. Your project proposal is currently rejected.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">File Type *</label>
                              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none" value={selectedFileType} onChange={e => setSelectedFileType(e.target.value)}>
                                {FILE_TYPES.filter(t => t.value !== 'paper' || proposal.projectType === 'Research Paper').map(t => (
                                  <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500 transition relative bg-gray-50/50">
                              <input type="file" required onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading}/>
                              <div className="space-y-2">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                                <p className="text-xs font-bold text-gray-900">{uploading ? 'Uploading...' : 'Choose files to upload'}</p>
                                <p className="text-[10px] text-gray-400">PDF, PPTX, Docx up to 50MB</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. Final Submission Form (URLs) */}
                      {proposal.status !== 'Submitted' && !isApproved ? (
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-green-500" /> Submit Project Links</h3>
                          <form onSubmit={handleFinalSubmit} className="space-y-4">
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Live Prototype Link *</label>
                              <input type="url" required placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" value={finalForm.liveLink} onChange={e => setFinalForm({...finalForm, liveLink: e.target.value})} />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">GitHub Repository Link *</label>
                              <input type="url" required placeholder="https://github.com/..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" value={finalForm.githubLink} onChange={e => setFinalForm({...finalForm, githubLink: e.target.value})} />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">LinkedIn Presentation Link *</label>
                              <input type="url" required placeholder="https://linkedin.com/..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm" value={finalForm.linkedinLink} onChange={e => setFinalForm({...finalForm, linkedinLink: e.target.value})} />
                            </div>

                            {/* Missing Fields Checklist */}
                            {(() => {
                              const warnings = [];
                              const hasReport = files.some(f => f.fileType === 'document');
                              const hasPPT = files.some(f => f.fileType === 'presentation');
                              const hasPaper = files.some(f => f.fileType === 'paper');

                              if (!hasReport) warnings.push("Project Report File (.pdf/.docx) is missing.");
                              if (!hasPPT) warnings.push("Project Presentation PPT (.ppt/.pptx) is missing.");
                              if (proposal.projectType === 'Research Paper' && !hasPaper) warnings.push("Research Paper PDF is missing.");
                              if (!finalForm.liveLink) warnings.push("Live URL Link is missing.");
                              if (!finalForm.githubLink) warnings.push("GitHub URL Link is missing.");
                              if (!finalForm.linkedinLink) warnings.push("LinkedIn URL Link is missing.");

                              const canSubmit = warnings.length === 0;

                              return (
                                <div className="space-y-4 pt-2">
                                  {warnings.length > 0 && (
                                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                                      <p className="text-[11px] font-black text-amber-800 uppercase tracking-wider">Missing Submission Items</p>
                                      <ul className="space-y-1 pl-1">
                                        {warnings.map((w, idx) => (
                                          <li key={idx} className="text-[10px] text-amber-700 font-semibold flex items-center gap-1.5">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                            <span>{w}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  <button type="submit" disabled={!canSubmit} className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition-all text-xs">
                                    Submit Project for HOD Approval
                                  </button>
                                </div>
                              );
                            })()}
                          </form>
                        </div>
                      ) : (
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Send className="w-4 h-4 text-blue-500" /> Submitted Links</h3>
                          <div className="space-y-2 text-xs font-medium text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <p>🌐 <strong>Live Prototype URL:</strong> <a href={proposal.finalSubmission?.liveLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate block">{proposal.finalSubmission?.liveLink}</a></p>
                            <p className="mt-2">💻 <strong>GitHub Repository URL:</strong> <a href={proposal.finalSubmission?.githubLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate block">{proposal.finalSubmission?.githubLink}</a></p>
                            <p className="mt-2">🔗 <strong>LinkedIn Presentation URL:</strong> <a href={proposal.finalSubmission?.linkedinLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate block">{proposal.finalSubmission?.linkedinLink}</a></p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Files history and submission stages tracker */}
                    <div className="space-y-6">
                      {/* 1. Final Submission Stages Tracker */}
                      {proposal.finalSubmission && proposal.finalSubmission.status !== 'Not Submitted' && (
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Submission Review Timeline</h3>
                          {(() => {
                            const fStatus = proposal.finalSubmission.status;
                            const stages = ['Under HOD Review', 'Under Faculty Review', 'Accepted'];
                            const labels = ['HOD Review', 'Faculty Review', 'Final Approved'];
                            const isRejected = fStatus === 'Rejected';
                            const idx = isRejected ? 0 : stages.indexOf(fStatus);

                            return (
                              <div className="space-y-4">
                                <div className="flex items-center gap-1.5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                  {stages.map((stage, i) => (
                                    <React.Fragment key={stage}>
                                      <div className={`flex flex-col items-center text-center min-w-[60px] ${i <= idx && !isRejected ? 'opacity-100' : 'opacity-35'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 
                                          ${i < idx ? 'bg-green-50 border-green-400 text-green-700' : 
                                            i === idx && !isRejected ? 'bg-blue-50 border-blue-500 ring-4 ring-blue-100 text-blue-700' : 
                                            'bg-gray-100 border-gray-200'}`}>
                                          {i < idx ? '✓' : i + 1}
                                        </div>
                                        <p className="text-[9px] font-black text-gray-500 mt-1">{labels[i]}</p>
                                      </div>
                                      {i < 2 && <div className={`flex-1 h-0.5 min-w-[10px] ${i < idx && !isRejected ? 'bg-green-400' : 'bg-gray-200'}`} />}
                                    </React.Fragment>
                                  ))}
                                </div>
                                {isRejected && (
                                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-red-800 font-extrabold">Final Submission Rejected</p>
                                      <p className="text-xs text-red-700 mt-1">Review the corrections requested in the revision history below, modify files/links as needed, and submit again.</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* 2. Uploaded Deliverables List */}
                      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> Current Deliverable Files</h3>
                        {files.length === 0 ? (
                          <div className="py-8 text-center text-gray-400 italic text-xs">No files uploaded yet. Select a file type and upload deliverables.</div>
                        ) : (
                          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                            {files.map(f => (
                              <div key={f._id} className="p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between gap-3 hover:bg-gray-100/50 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 font-bold"><FileText className="w-4 h-4" /></div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate">{f.fileName}</p>
                                    <p className="text-[9px] text-gray-400">Type: <span className="font-semibold uppercase">{f.fileType}</span> • Version: v{f.version}</p>
                                  </div>
                                </div>
                                <a href={f.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white hover:bg-blue-50 hover:text-blue-600 rounded-lg border border-gray-200 shadow-sm transition"><Download className="w-3.5 h-3.5" /></a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 3. Rejection / Submission History */}
                      {proposal.submissionHistory && proposal.submissionHistory.length > 0 && (
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                          <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-red-500" /> Revision Comments History</h3>
                          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                            {[...proposal.submissionHistory].reverse().map((hist, idx) => (
                              <div key={idx} className="p-4 bg-red-50/30 border border-red-100 rounded-2xl space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black text-red-600 bg-red-100 px-2 py-0.5 rounded uppercase">Version v{hist.version}</span>
                                  <span className="text-[9px] text-gray-400">{new Date(hist.reviewedAt || hist.submittedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-xs text-gray-700 space-y-1.5">
                                  <p>👤 <strong>Reviewer:</strong> {hist.reviewerName} ({hist.reviewerRole})</p>
                                  <p>❌ <strong>Rejection Reason:</strong> <span className="text-red-700 italic font-medium">"{hist.rejectionReason}"</span></p>
                                  <p>🔧 <strong>Required Corrections:</strong> <span className="text-indigo-800 font-semibold">"{hist.requiredCorrections}"</span></p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 6. ANNOUNCEMENTS ── */}
            {activeTab === 'announcements' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                <h3 className="text-gray-900 font-extrabold text-base flex items-center gap-2"><Megaphone className="w-5 h-5 text-purple-600" /> Department Announcements</h3>
                <div className="space-y-3">
                  {data.announcements && data.announcements.length > 0 ? (
                    data.announcements.map(ann => (
                      <div key={ann._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase">Creator: {ann.createdByRole}</span>
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase">{ann.targetAudience === 'all' ? 'All Users' : ann.targetAudience}</span>
                        </div>
                        <h4 className="text-gray-900 font-bold text-sm">{ann.title}</h4>
                        <p className="text-gray-500 text-sm mt-1 leading-relaxed font-medium">{ann.content}</p>
                        <p className="text-gray-400 text-[10px] mt-2">Published: {new Date(ann.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-gray-400 italic bg-white border border-gray-100 rounded-2xl">No announcements from your department HOD or Faculty yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* ── 7. MILESTONES & DEADLINES ── */}
            {activeTab === 'deadlines' && (
              <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-600" /> Project Milestones & Deadlines</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs font-medium text-gray-700">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-black uppercase tracking-wider">
                          <th className="py-3 px-4">Milestone</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4">Compliance Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {data.deadlines.map(d => {
                          const extMatch = proposal?.extendedDeadlines?.find(ed => ed.deadlineId === d._id);
                          const finalDueDate = extMatch ? new Date(extMatch.extendedDate) : new Date(d.dueDate);
                          const isOverdue = new Date() > finalDueDate;
                          
                          const subMatch = proposal?.deadlineSubmissions?.find(ds => ds.deadlineId === d._id);
                          let complianceStatus = 'Pending Submission';
                          let submittedAt = null;

                          if (subMatch) {
                            complianceStatus = subMatch.status;
                            submittedAt = subMatch.submittedAt;
                          } else if (isOverdue) {
                            complianceStatus = 'Deadline Missed';
                          }

                          const handleMarkSubmitted = async () => {
                            try {
                              const res = await api.post(`/student/deadlines/${d._id}/submit`);
                              toast.success(res.data.message || 'Deadline marked as submitted!');
                              fetchDashboard();
                            } catch (err) {
                              toast.error(err.response?.data?.message || 'Failed to submit milestone.');
                            }
                          };

                          return (
                            <tr key={d._id} className="hover:bg-gray-50/50 transition">
                              <td className="py-4 px-4 font-bold text-gray-900">{d.title}</td>
                              <td className="py-4 px-4 text-gray-400 max-w-xs truncate">{d.description || 'Deliver project target documentation.'}</td>
                              <td className="py-4 px-4 font-semibold">
                                <div>{finalDueDate.toLocaleDateString()}</div>
                                {extMatch && (
                                  <span className="inline-block bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black text-[9px] uppercase mt-0.5">Extended</span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border
                                  ${complianceStatus === 'Submitted' ? 'bg-green-50 border-green-200 text-green-700' :
                                    complianceStatus === 'Late Submission' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                    complianceStatus === 'Deadline Missed' ? 'bg-red-50 border-red-200 text-red-600' :
                                    'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                                  {complianceStatus}
                                </span>
                                {submittedAt && (
                                  <div className="text-[9px] text-gray-400 mt-0.5">At: {new Date(submittedAt).toLocaleDateString()}</div>
                                )}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex gap-2 justify-end">
                                  {isApproved ? (
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 py-1.5 px-2.5 rounded-lg">✓ Project Completed</span>
                                  ) : (
                                    <>
                                      {proposal && (
                                        <button onClick={() => setExtensionModal({ open: true, deadline: d })} className="text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 py-1.5 px-2.5 rounded-lg border border-purple-100 transition-all">
                                          Request Extension
                                        </button>
                                      )}
                                      {complianceStatus !== 'Submitted' && complianceStatus !== 'Late Submission' && (
                                        <button onClick={handleMarkSubmitted} className="text-[10px] font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 py-1.5 px-2.5 rounded-lg border border-green-100 transition-all">
                                          Mark Submitted
                                        </button>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {data.deadlines.length === 0 && (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-gray-400 italic">No deadlines mapped for you.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── 8. MY PROFILE ── */}
            {activeTab === 'profile' && (
              <div className="max-w-4xl mx-auto animate-fade-in">
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">My Profile Credentials</h3>
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100 w-full">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-3xl shrink-0">
                      {data.profile?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="text-center md:text-left flex-1 min-w-0">
                      <h4 className="text-xl font-extrabold text-gray-900 truncate">{data.profile?.name}</h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">{data.profile?.email} • {data.profile?.mobileNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-bold uppercase tracking-wider truncate">{data.profile?.course} — {data.profile?.branch} Dept.</p>
                      <p className="text-xs text-gray-400">Year {data.profile?.year || 'N/A'} • Sec-{data.profile?.section || 'N/A'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="md:hidden w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2 md:mt-0"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">GitHub Profile Link</label>
                        <input type="url" placeholder="https://github.com/..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none" value={profileForm.githubId} onChange={e => setProfileForm({...profileForm, githubId: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">LinkedIn Profile Link</label>
                        <input type="url" placeholder="https://linkedin.com/in/..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none" value={profileForm.linkedinId} onChange={e => setProfileForm({...profileForm, linkedinId: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Portfolio Website URL</label>
                      <input type="url" placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none" value={profileForm.portfolioLink} onChange={e => setProfileForm({...profileForm, portfolioLink: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block">Supporting Resume (PDF only)</label>
                      <div className="flex items-center gap-3">
                        <input type="file" ref={resumeRef} accept=".pdf" className="hidden" onChange={e => setResumeFile(e.target.files[0])} />
                        <button type="button" onClick={() => resumeRef.current.click()} className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold transition flex items-center gap-2"><Upload className="w-4 h-4 text-blue-500" /> Select PDF</button>
                        <span className="text-xs text-gray-400 truncate">{resumeFile ? resumeFile.name : data.profile?.resume?.url ? 'Resume PDF Uploaded' : 'No file chosen'}</span>
                      </div>
                    </div>
                    <button type="submit" disabled={updatingProfile} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md">{updatingProfile ? 'Saving...' : 'Save Profile Changes'}</button>
                  </form>
                </div>
              </div>
            )}

            {/* ── 9. TEAM CHAT ── */}
            {activeTab === 'messages' && (
              <div className="max-w-4xl mx-auto animate-fade-in flex flex-col h-[70vh] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-4 text-white flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="font-extrabold text-base flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-400" /> Team Discussion Channel
                    </h3>
                    <p className="text-[10px] text-blue-200/80 mt-0.5">
                      {proposal ? `Project: ${proposal.title}` : 'No active project'}
                    </p>
                  </div>
                  {proposal?.assignedFaculty && (
                    <span className="text-[10px] bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg font-bold">
                      Supervisor: {proposal.assignedFaculty.name}
                    </span>
                  )}
                </div>

                {!proposal ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                    <MessageSquare className="w-12 h-12 text-gray-200 mb-2" />
                    <p className="text-sm font-semibold">No active project proposal found.</p>
                    <p className="text-xs text-gray-400 mt-1">Submit your project proposal first to access team chat.</p>
                  </div>
                ) : (
                  <>
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                      {messages.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-xs italic">
                          No messages yet. Send a message to start the discussion!
                        </div>
                      ) : (
                        messages.map((msg) => {
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
                                }`}>
                                  {roleLabel}
                                </span>
                              </div>
                              <div className={`p-3 rounded-2xl max-w-lg text-xs leading-normal shadow-sm ${
                                isMe 
                                  ? 'bg-blue-600 text-white rounded-tr-none' 
                                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                              }`}>
                                <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                              </div>
                              <span className="text-[8px] text-gray-400 font-bold mt-1 px-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Type your message here..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" /> Send
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Extension Modal (Task 6) */}
      {extensionModal.open && extensionModal.deadline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Request Deadline Extension</h2>
              <button onClick={() => setExtensionModal({ open: false, deadline: null })} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleExtensionSubmit} className="p-5 space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-700">
                🚀 Requesting extension for milestone: <strong>{extensionModal.deadline.title}</strong> (Due {new Date(extensionModal.deadline.dueDate).toLocaleDateString()})
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Requested Target Date *</label>
                <input required type="datetime-local" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" value={extForm.requestedDate} onChange={e => setExtForm({...extForm, requestedDate: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Reason (min 20 characters) *</label>
                <textarea required rows={3} placeholder="Explain why you need this extension..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" value={extForm.reason} onChange={e => setExtForm({...extForm, reason: e.target.value})} />
                <p className="text-[10px] text-gray-400 mt-1">{extForm.reason.length}/20 chars min</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Optional Supporting Document (PDF / DOCX)</label>
                <input type="file" accept=".pdf,.doc,.docx" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs" onChange={e => setExtForm({...extForm, document: e.target.files[0]})} />
              </div>
              <button type="submit" disabled={extSubmitting} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-500/20">{extSubmitting ? 'Submitting...' : 'Submit Request'}</button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Smart Deadline Popup reminders (Task 7) */}
      <AnimatePresence>
        {reminderPopup.open && reminderPopup.deadline && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
              
              {/* Header based on urgency */}
              {reminderPopup.type === 'today' && (
                <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 animate-bounce" />
                  <h3 className="text-xl font-extrabold">🚨 Submission Deadline is TODAY!</h3>
                  <p className="text-white/80 text-xs mt-1">Submit your deliverables immediately to prevent late penalties.</p>
                </div>
              )}
              {reminderPopup.type === 'urgent' && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white text-center">
                  <Clock className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <h3 className="text-xl font-extrabold">⚠️ Urgent Reminder: 1 Day Left!</h3>
                  <p className="text-white/80 text-xs mt-1">Review the submission checklist below carefully.</p>
                </div>
              )}
              {reminderPopup.type === 'motivational_3' && (
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white text-center">
                  <Clock className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <h3 className="text-xl font-extrabold">⚠️ Milestone Approaching: 3 Days Left!</h3>
                  <p className="text-white/80 text-xs mt-1">Submit your milestone targets soon.</p>
                </div>
              )}
              {reminderPopup.type === 'motivational_7' && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-2 animate-spin-slow" />
                  <h3 className="text-xl font-extrabold">🚀 Milestone Approaching: 7 Days Left</h3>
                  <p className="text-white/80 text-xs mt-1">Keep up the steady momentum, team!</p>
                </div>
              )}

              {/* Body Content */}
              <div className="p-6 space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Milestone Target</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{reminderPopup.deadline.title}</p>
                  <p className="text-xs text-gray-400">Description: {reminderPopup.deadline.description || 'Deliver project target documentation.'}</p>
                  <p className="text-xs font-black text-red-600 mt-2">Due Date: {new Date(reminderPopup.deadline.dueDate).toLocaleString()}</p>
                </div>

                {/* Specific Popups Features */}
                {(reminderPopup.type === 'motivational_7' || reminderPopup.type === 'motivational_3') && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-800 leading-relaxed space-y-2">
                    <p className="font-bold flex items-center gap-1"><Sparkles className="w-4 h-4 text-blue-600"/> Milestone Preparation Guidance:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Draft the main proposal/report architecture with your members.</li>
                      <li>Finalize the basic code prototypes and compile references.</li>
                      <li>Sync up with your Faculty Supervisor to clear conceptual blocker reviews.</li>
                    </ul>
                  </div>
                )}

                {reminderPopup.type === 'urgent' && (
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-800 space-y-2">
                    <p className="font-bold flex items-center gap-1"><Info className="w-4 h-4 text-amber-600"/> Submission Preparation Checklist:</p>
                    <div className="space-y-1.5 font-medium pl-1">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-amber-600" /> Deliverable documentation PDF cleared and proofread.</label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-amber-600" /> Git codebase pushed and branches unified.</label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="rounded text-amber-600" /> Presentation (PPT) prepared and slide counts verified.</label>
                    </div>
                  </div>
                )}

                {reminderPopup.type === 'today' && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs text-rose-800 leading-relaxed font-bold">
                    ⚠️ CRITICAL: Today is the final date. Head over to the Submission & Files tab, attach your deliverables, or post progress timeline updates immediately to avoid grading deductions!
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={dismissPopup} className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-2xl transition">Mark as Read (Dismiss)</button>
                  <button onClick={() => { setReminderPopup({ open: false, deadline: null, type: '' }); setActiveTab('submission'); }} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition">Go to Submissions</button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Floating Action Button for Mobile Chat */}
      {proposal && activeTab !== 'messages' && (
        <div className="md:hidden fixed bottom-20 right-6 z-40">
          <button
            onClick={() => {
              setActiveTab('messages');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer animate-bounce"
            title="Team Chat"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Bottom Navigation Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-150 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex justify-around items-center py-2 px-2 pb-[max(12px,env(safe-area-inset-bottom))]">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'project-group', label: 'Project', icon: Target },
          { id: 'messages', label: 'Chat', icon: MessageSquare },
          { id: 'submission', label: 'Submit', icon: Send },
          { id: 'profile', label: 'Profile', icon: User },
        ].map((tab) => {
          let isActive = false;
          let targetId = tab.id;

          if (tab.id === 'project-group') {
            const projectTabs = ['details', 'tracker', 'deadlines', 'proposal', 'announcements'];
            isActive = projectTabs.includes(activeTab);
            targetId = data.proposal ? 'details' : 'proposal';
          } else {
            isActive = activeTab === tab.id;
          }

          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(targetId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDashboard;
