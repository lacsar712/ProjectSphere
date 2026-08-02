import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Lock, User, Phone, BookOpen, Settings as SettingsIcon,
  ArrowRight, UserPlus, Hash, Camera, Eye, EyeOff,
  GraduationCap, Shield, Zap, Sparkles, Target,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

// ── Shared input styles (light theme)
const inputCls =
  'w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all duration-200 text-sm font-medium';
const selectCls =
  'w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all duration-200 text-sm font-medium appearance-none';

// ── Floating ambient orb
const FloatingOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.6, 0.35], y: [0, 18, 0] }}
    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

// ── Feature bullet
const FeatureItem = ({ icon, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-center gap-3 group"
  >
    <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
      <span className="text-xs">{icon}</span>
    </div>
    <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">{text}</span>
  </motion.div>
);

// ── Stagger animation props
const staggerProps = (i) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.05 * i, duration: 0.3 },
});

const BRANCHES = [
  'Computer Science', 'Electrical', 'Mechanical Polytechnic',
  'BCA', 'BBA', 'MBA', 'MCA', 'B.Ed', 'M.Ed',
];

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobileNumber: '',
    course: 'B.Tech', branch: 'Computer Science', year: '4', section: 'A',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setProfilePhoto(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = new FormData();
    Object.keys(formData).forEach((k) => payload.append(k, formData[k]));
    if (profilePhoto) payload.append('profilePhoto', profilePhoto);
    try {
      const { data } = await api.post('/auth/register/student', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(data.message || 'Registered successfully!');
      if (data.verified) {
        navigate('/login/student');
      } else {
        navigate('/verify-email', { state: { email: formData.email } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen font-sans text-slate-900 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 60%, #f0f7ff 100%)', overflowX: 'hidden' }}
    >
      {/* Ambient orbs */}
      <FloatingOrb className="w-[550px] h-[550px] bg-teal-200/15 top-[-100px] left-[-120px]" delay={0} />
      <FloatingOrb className="w-[360px] h-[360px] bg-sky-200/15 bottom-[-80px] right-[-60px]" delay={2} />

      {/* Grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="flex flex-col lg:flex-row min-h-screen relative z-10">

        {/* ── LEFT INFO PANEL ── */}
        <div className="hidden lg:flex w-[46%] relative flex-col justify-between p-12 xl:p-14 overflow-hidden border-r border-teal-100/60">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/40 via-white/30 to-transparent pointer-events-none" />

          {/* Decorative rings */}
          <motion.div
            className="absolute right-[-50px] top-[8%] w-80 h-80 rounded-full border border-teal-200/25"
            animate={{ rotate: 360 }}
            transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
            aria-hidden
          />
          <motion.div
            className="absolute right-[10px] top-[14%] w-56 h-56 rounded-full border border-teal-300/15"
            animate={{ rotate: -360 }}
            transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
            aria-hidden
          />

          {/* Floating icon chips */}
          <motion.div
            className="absolute top-28 left-14 w-14 h-14 rounded-2xl bg-white border border-teal-100 shadow-sm flex items-center justify-center opacity-75"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          >
            <GraduationCap className="w-6 h-6 text-teal-500" />
          </motion.div>
          <motion.div
            className="absolute bottom-36 right-16 w-12 h-12 rounded-xl bg-white border border-sky-100 shadow-sm flex items-center justify-center opacity-65"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            aria-hidden
          >
            <Target className="w-5 h-5 text-sky-500" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            {/* Logo */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Link to="/" className="inline-flex items-center gap-2.5">
                <div className="p-2 rounded-xl shadow-sm border border-teal-200" style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}>
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-800 tracking-tight">
                  Project<span style={{ background: 'linear-gradient(90deg,#14b8a6,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sphere</span>
                </span>
              </Link>
            </motion.div>

            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-10 mb-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-teal-50 border border-teal-200 text-teal-700">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Student Portal
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl xl:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight mb-4"
            >
              Begin Your<br />
              <span style={{ background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Academic Journey
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
              className="text-slate-500 text-sm mb-8 max-w-xs leading-relaxed">
              Create your student profile to access project repositories, connect with expert faculty, and manage all your final-year deliverables securely.
            </motion.p>

            {/* Feature list */}
            <div className="space-y-2.5 mb-8">
              {[
                { icon: '🎯', text: 'Submit structured project proposals', delay: 0.32 },
                { icon: '👨‍🏫', text: 'Get matched with expert faculty guides', delay: 0.36 },
                { icon: '☁️', text: 'Upload deliverables to secure cloud', delay: 0.40 },
                { icon: '📊', text: 'Track approval status in real-time', delay: 0.44 },
              ].map((f) => <FeatureItem key={f.text} {...f} />)}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-2.5"
            >
              {[
                { value: '500+', label: 'Students', color: '#14b8a6' },
                { value: '50+', label: 'Faculty', color: '#0ea5e9' },
                { value: '98%', label: 'Success', color: '#3b82f6' },
              ].map(({ value, label, color }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center bg-white border border-slate-200 shadow-sm hover:border-teal-200 hover:shadow-md transition-all duration-300 cursor-default"
                >
                  <div className="text-xl font-black mb-0.5" style={{ color }}>{value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
                </div>
              ))}
            </motion.div>

            {/* Highlight card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.56 }}
              className="mt-6 rounded-xl p-4 bg-teal-50 border border-teal-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10 bg-gradient-to-br from-teal-500 to-sky-400" />
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-teal-100 border border-teal-200 mt-0.5">
                  <Shield className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-0.5">Secure & Encrypted</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Your academic data is protected with enterprise-grade security.</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="relative z-10 pt-4 border-t border-slate-200 mt-6">
            <p className="text-[11px] font-medium text-slate-400 flex items-center gap-3">
              <span>&copy; {new Date().getFullYear()} Project Sphere</span>
              <span>•</span>
              <Link to="/about" className="hover:text-slate-600 transition-colors">About</Link>
            </p>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="w-full lg:w-[54%] flex items-center justify-center p-4 sm:p-6 relative overflow-y-auto">

          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md relative z-10 my-4"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
              <div className="p-2 rounded-xl shadow-sm border border-teal-200" style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Project<span style={{ color: '#14b8a6' }}>Sphere</span>
              </span>
            </div>

            {/* Form card */}
            <div className="bg-white/90 backdrop-blur-md border border-teal-100 rounded-[24px] shadow-xl shadow-teal-100/30 overflow-hidden">
              {/* Gradient accent bar */}
              <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #14b8a6, #0ea5e9, #3b82f6)' }} />

              <div className="p-6 sm:p-7">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Registration</h2>
                    <p className="text-slate-500 mt-0.5 text-xs font-medium">Set up your portal identity below</p>
                  </div>
                  <div className="p-2 rounded-xl bg-teal-50 border border-teal-100">
                    <GraduationCap className="w-5 h-5 text-teal-500" />
                  </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3.5">

                  {/* Avatar Upload */}
                  <motion.div {...staggerProps(1)}
                    className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="relative group cursor-pointer shrink-0">
                      <div className="w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white overflow-hidden transition-all group-hover:border-teal-400 group-hover:shadow-md">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-slate-300 group-hover:text-teal-400 transition-colors" />
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 bg-teal-500 rounded-full p-1 shadow-md scale-0 group-hover:scale-100 transition-transform border-2 border-white">
                        <Camera className="w-2.5 h-2.5 text-white" />
                      </div>
                      <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handlePhotoChange} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Profile Photo</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click avatar to upload</p>
                    </div>
                  </motion.div>

                  {/* Name + Mobile */}
                  <motion.div {...staggerProps(2)} className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 ml-0.5 tracking-wider uppercase">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <input type="text" required className={inputCls} placeholder="John Doe" value={formData.name} onChange={set('name')} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 ml-0.5 tracking-wider uppercase">Mobile</label>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <input type="text" required className={inputCls} placeholder="10-digit" value={formData.mobileNumber} onChange={set('mobileNumber')} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div {...staggerProps(3)} className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 ml-0.5 tracking-wider uppercase">University Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                      <input type="email" required className={inputCls} placeholder="you@institution.edu" value={formData.email} onChange={set('email')} />
                    </div>
                  </motion.div>

                  {/* Course + Branch */}
                  <motion.div {...staggerProps(4)} className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 ml-0.5 tracking-wider uppercase">Course</label>
                      <div className="relative group">
                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <select className={selectCls} value={formData.course} onChange={set('course')}>
                          <option value="B.Tech">B.Tech</option>
                          <option value="M.Tech">M.Tech</option>
                          <option value="BCA">BCA</option>
                          <option value="MCA">MCA</option>
                          <option value="BBA">BBA</option>
                          <option value="MBA">MBA</option>
                          <option value="B.Ed">B.Ed</option>
                          <option value="M.Ed">M.Ed</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 ml-0.5 tracking-wider uppercase">Branch</label>
                      <div className="relative group">
                        <SettingsIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <select className={selectCls} value={formData.branch} onChange={set('branch')}>
                          {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    </div>
                  </motion.div>

                  {/* Year + Section */}
                  <motion.div {...staggerProps(5)} className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 ml-0.5 tracking-wider uppercase">Year</label>
                      <div className="relative group">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <select className={selectCls} value={formData.year} onChange={set('year')}>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 ml-0.5 tracking-wider uppercase">Section</label>
                      <div className="relative group">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <select className={selectCls} value={formData.section} onChange={set('section')}>
                          <option value="A">Section A</option>
                          <option value="B">Section B</option>
                          <option value="C">Section C</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div {...staggerProps(6)} className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 ml-0.5 tracking-wider uppercase">
                      Password <span className="text-slate-400 lowercase font-normal">(min 8 chars)</span>
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                      <input
                        type={showPassword ? 'text' : 'password'} required minLength={8}
                        className={`${inputCls} tracking-wider pr-10`} placeholder="••••••••"
                        value={formData.password} onChange={set('password')}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors focus:outline-none">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Submit */}
                  <motion.div {...staggerProps(7)}>
                    <button
                      type="submit" disabled={loading}
                      className="w-full relative group overflow-hidden text-white font-bold rounded-xl py-3 mt-1 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 shadow-md hover:shadow-teal-200 hover:shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}
                    >
                      {/* Shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                      <div className="relative flex items-center gap-2">
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Create Secure Account</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                          </>
                        )}
                      </div>
                    </button>
                  </motion.div>
                </form>

                {/* Sign in link */}
                <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-slate-500 text-xs font-medium">
                    Already registered?{' '}
                    <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 transition-colors">Sign In</Link>
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <Zap className="w-3 h-3 text-teal-500/70" />
                    <span>Secure Registration</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust line */}
            <p className="text-center text-slate-400 text-xs mt-4 font-medium">
              Protected by industry-standard encryption
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
