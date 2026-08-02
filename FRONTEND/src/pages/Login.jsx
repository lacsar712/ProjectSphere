
// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Mail, Lock, LogIn, Activity, ArrowRight, Eye, EyeOff,
//   KeyRound, CheckCircle, Shield, Zap, Users, X, ChevronRight
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import axios from 'axios';

// const FloatingOrb = ({ className }) => (
//   <motion.div
//     className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
//     animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.65, 0.4] }}
//     transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
//   />
// );

// const FeatureCard = ({ icon: Icon, title, value, color, delay }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 24 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ delay, duration: 0.6, ease: 'easeOut' }}
//     whileHover={{ y: -4, scale: 1.02 }}
//     className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col gap-1"
//   >
//     <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1 ${color}`}>
//       <Icon className="w-4 h-4 text-white" />
//     </div>
//     <span className="text-2xl font-black text-white">{value}</span>
//     <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
//   </motion.div>
// );

// const StepDot = ({ step, current }) => (
//   <div className="flex items-center gap-1.5">
//     <motion.div
//       animate={{
//         backgroundColor: step <= current ? '#6366f1' : '#1e293b',
//         borderColor: step <= current ? '#6366f1' : '#334155',
//         scale: step === current ? 1.15 : 1,
//       }}
//       className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white"
//     >
//       {step < current ? <CheckCircle className="w-3.5 h-3.5" /> : step}
//     </motion.div>
//     {step < 3 && (
//       <motion.div
//         animate={{ backgroundColor: step < current ? '#6366f1' : '#334155' }}
//         className="w-8 h-0.5 rounded-full"
//       />
//     )}
//   </div>
// );

// const InputField = ({ label, icon: Icon, right, children, error }) => (
//   <div className="space-y-1.5">
//     {label && <label className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">{label}</label>}
//     <div className="relative group">
//       {Icon && (
//         <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors duration-200 z-10" />
//       )}
//       {children}
//       {right && <div className="absolute right-4 top-1/2 -translate-y-1/2">{right}</div>}
//     </div>
//     {error && <p className="text-xs text-red-400 font-medium ml-1">{error}</p>}
//   </div>
// );

// const inputClass = (withLeft = true, withRight = false) =>
//   `w-full bg-slate-900/60 border border-slate-700/70 rounded-xl py-3.5 ${withLeft ? 'pl-11' : 'pl-4'} ${withRight ? 'pr-11' : 'pr-4'} text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all duration-200 text-sm font-medium`;

// const Login = ({ role = 'student' }) => {
//   const [formData, setFormData] = useState({ email: '', password: '', role });
//   useEffect(() => setFormData(prev => ({ ...prev, role })), [role]);
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [mounted, setMounted] = useState(false);

//   const [forgotModal, setForgotModal] = useState(false);
//   const [resetStep, setResetStep] = useState(1);
//   const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '', resetToken: '' });
//   const [resetLoading, setResetLoading] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

//   const navigate = useNavigate();

//   useEffect(() => { setMounted(true); }, []);

//   const handleOtpChange = (index, value) => {
//     if (!/^\d?$/.test(value)) return;
//     const next = [...otpDigits];
//     next[index] = value;
//     setOtpDigits(next);
//     setResetData(prev => ({ ...prev, otp: next.join('') }));
//     if (value && index < 5) {
//       document.getElementById(`otp-${index + 1}`)?.focus();
//     }
//   };

//   const handleOtpKeyDown = (index, e) => {
//     if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
//       document.getElementById(`otp-${index - 1}`)?.focus();
//     }
//   };

//   const closeForgotModal = () => {
//     setForgotModal(false);
//     setTimeout(() => {
//       setResetStep(1);
//       setResetData({ email: '', otp: '', newPassword: '', confirmPassword: '', resetToken: '' });
//       setOtpDigits(['', '', '', '', '', '']);
//     }, 300);
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const { data } = await axios.post('/api/auth/login', formData);
//       localStorage.setItem('user', JSON.stringify(data));
//       toast.success('Login successful!');
//       if (data.role === 'student') navigate('/student/dashboard');
//       else if (data.role === 'faculty') navigate('/faculty/dashboard');
//       else if (data.role === 'hod') navigate('/hod/dashboard');
//       else if (data.role === 'admin') navigate('/admin/dashboard');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendResetOtp = async (e) => {
//     e.preventDefault();
//     if (!resetData.email) return toast.error('Enter your email');
//     setResetLoading(true);
//     try {
//       await axios.post('/api/auth/forgot-password', { email: resetData.email, role });
//       toast.success('OTP sent to your email');
//       setResetStep(2);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to send OTP');
//     } finally { setResetLoading(false); }
//   };

//   const handleVerifyResetOtp = async (e) => {
//     e.preventDefault();
//     if (!resetData.otp || resetData.otp.length < 6) return toast.error('Enter complete OTP');
//     setResetLoading(true);
//     try {
//       const { data } = await axios.post('/api/auth/verify-reset-otp', { email: resetData.email, otp: resetData.otp, role });
//       setResetData(prev => ({ ...prev, resetToken: data.resetToken }));
//       toast.success('OTP verified!');
//       setResetStep(3);
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Invalid OTP');
//     } finally { setResetLoading(false); }
//   };

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     if (resetData.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
//     if (resetData.newPassword !== resetData.confirmPassword) return toast.error('Passwords do not match');
//     setResetLoading(true);
//     try {
//       await axios.post('/api/auth/reset-password', { resetToken: resetData.resetToken, newPassword: resetData.newPassword });
//       toast.success('Password reset successfully!');
//       closeForgotModal();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to reset password');
//     } finally { setResetLoading(false); }
//   };

//   const stepLabels = ['Email', 'Verify OTP', 'New Password'];

//   return (
//     <div className="min-h-screen bg-[#060c1a] font-sans flex text-slate-300 overflow-hidden">

//       {/* Ambient background */}
//       <FloatingOrb className="w-[500px] h-[500px] bg-indigo-700/20 top-[-100px] left-[-100px]" />
//       <FloatingOrb className="w-[400px] h-[400px] bg-blue-600/15 bottom-[-80px] left-[30%]" />

//       {/* ── LEFT PANEL ── */}
//       <div className="hidden lg:flex w-[52%] relative flex-col justify-between p-14 overflow-hidden border-r border-white/5">
//         <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-slate-900/20 to-transparent pointer-events-none" />

//         {/* Animated grid lines */}
//         <div className="absolute inset-0 opacity-[0.04]"
//           style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '60px 60px' }}
//         />

//         {/* Floating decorative circle */}
//         <motion.div
//           className="absolute right-[-60px] top-[20%] w-80 h-80 rounded-full border border-indigo-500/10"
//           animate={{ rotate: 360 }}
//           transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
//         />
//         <motion.div
//           className="absolute right-[-30px] top-[25%] w-56 h-56 rounded-full border border-indigo-400/8"
//           animate={{ rotate: -360 }}
//           transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
//         />

//         {/* Logo */}
        

//         {/* Hero Content */}
//         <div className="relative z-10 -mt-4">
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
//           >
//             <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
//               <Shield className="w-3.5 h-3.5 text-indigo-400" />
//               <span className="text-xs font-bold text-indigo-300 tracking-wider uppercase">Secure Academic Platform</span>
//             </div>

//             <h1 className="text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight">
//               Authenticate Your<br />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-300 to-indigo-400">
//                 Academic Hub
//               </span>
//             </h1>
//             <p className="text-slate-400 text-base leading-relaxed max-w-[400px] mb-10">
//               Log into the unified interface to securely manage deliverables, track proposals, and interact with your departmental workflows.
//             </p>
//           </motion.div>

//           {/* Feature cards */}
//           <div className="grid grid-cols-3 gap-3 max-w-sm">
//             <FeatureCard icon={Zap} title="Uptime" value="99.9%" color="bg-indigo-500/20" delay={0.3} />
//             <FeatureCard icon={Users} title="Active Users" value="10K+" color="bg-blue-500/20" delay={0.4} />
//             <FeatureCard icon={Shield} title="Secured" value="256-bit" color="bg-sky-500/20" delay={0.5} />
//           </div>
//         </div>

//         {/* Footer */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.6 }}
//           className="relative z-10 text-xs text-slate-600 flex items-center gap-3"
//         >
//           <span>&copy; {new Date().getFullYear()} ProjectSphere</span>
//           <span>•</span>
//           <Link to="/about" className="hover:text-slate-400 transition-colors">Platform Info</Link>
//           <span>•</span>
//           <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
//         </motion.div>
//       </div>

//       {/* ── RIGHT PANEL ── */}
//       <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-10 relative">
//         <FloatingOrb className="w-[300px] h-[300px] bg-indigo-600/10 top-0 right-0" />

//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={mounted ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.6, ease: 'easeOut' }}
//           className="w-full max-w-[420px] relative z-10"
//         >
//           {/* Mobile Logo */}
//           <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
//             <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)]">
//               <Activity className="w-5 h-5 text-white" />
//             </div>
//             <span className="text-xl font-black text-white tracking-tight">Project<span className="text-indigo-400">Sphere</span></span>
//           </div>

//           {/* Card */}
//           <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/8 rounded-[28px] p-8 sm:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
//             <motion.div
//               initial={{ opacity: 0, y: 12 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.15 }}
//               className="mb-8"
//             >
//               <h2 className="text-3xl font-black text-white tracking-tight">{role.charAt(0).toUpperCase() + role.slice(1)} Login</h2>
//               <p className="text-slate-400 mt-1.5 text-sm font-medium">Sign in to continue to your {role} workspace</p>
//             </motion.div>

//             <form onSubmit={handleLogin} className="space-y-4">
//               <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
//                 <InputField label="Email Address" icon={Mail}>
//                   <input
//                     type="email"
//                     required
//                     placeholder="you@institution.edu"
//                     className={inputClass(true, false)}
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   />
//                 </InputField>
//               </motion.div>

//               <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
//                 <div className="flex justify-between items-center mb-1.5">
//                   <label className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Password</label>
//                   <button
//                     type="button"
//                     onClick={() => setForgotModal(true)}
//                     className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
//                   >
//                     Forgot password?
//                   </button>
//                 </div>
//                 <InputField
//                   icon={Lock}
//                   right={
//                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-indigo-400 transition-colors">
//                       {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
//                     </button>
//                   }
//                 >
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     required
//                     placeholder="••••••••"
//                     className={`${inputClass(true, true)} tracking-widest`}
//                     value={formData.password}
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   />
//                 </InputField>
//               </motion.div>

//               <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full mt-2 relative group bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2.5 shadow-[0_8px_32px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_40px_rgba(79,70,229,0.55)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
//                 >
//                   <motion.div
//                     className="absolute inset-0 bg-white/10"
//                     initial={{ x: '-100%' }}
//                     whileHover={{ x: '100%' }}
//                     transition={{ duration: 0.5 }}
//                   />
//                   {loading ? (
//                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                   ) : (
//                     <>
//                       <LogIn className="w-4.5 h-4.5" />
//                       <span>Sign In Securely</span>
//                       <motion.div
//                         initial={{ opacity: 0, x: -4 }}
//                         whileHover={{ opacity: 1, x: 0 }}
//                         className="ml-1"
//                       >
//                         <ArrowRight className="w-4 h-4" />
//                       </motion.div>
//                     </>
//                   )}
//                 </button>
//               </motion.div>
//             </form>

//             {/* Divider */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.4 }}
//               className="mt-8 pt-7 border-t border-white/6"
//             >
//               <p className="text-slate-500 text-sm text-center mb-3 font-medium">New to ProjectSphere?</p>
//               <div className="flex gap-3">
//                 <Link
//                   to="/register/student"
//                   className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-700/50 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all duration-200 group"
//                 >
//                   Student Setup
//                   <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
//                 </Link>
//                 <Link
//                   to="/register/faculty"
//                   className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-700/50 hover:border-blue-500/40 text-slate-300 hover:text-white text-xs font-bold transition-all duration-200 group"
//                 >
//                   Faculty Setup
//                   <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
//                 </Link>
//               </div>
//             </motion.div>
//           </div>

//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.5 }}
//             className="text-center text-slate-600 text-xs mt-5 font-medium"
//           >
//             Protected by industry-standard encryption
//           </motion.p>
//         </motion.div>
//       </div>

//       {/* ── FORGOT PASSWORD MODAL ── */}
//       <AnimatePresence>
//         {forgotModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={closeForgotModal}
//               className="absolute inset-0 bg-black/70 backdrop-blur-md"
//             />

//             <motion.div
//               initial={{ scale: 0.92, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.94, opacity: 0, y: 10 }}
//               transition={{ type: 'spring', stiffness: 300, damping: 28 }}
//               className="relative bg-[#0c1628] border border-white/8 w-full max-w-[400px] rounded-3xl p-8 shadow-[0_40px_80px_rgba(0,0,0,0.7)] overflow-hidden z-10"
//             >
//               {/* Top gradient bar */}
//               <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-blue-400 to-indigo-500" />

//               {/* Ambient glow */}
//               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-indigo-500/10 rounded-full blur-2xl" />

//               {/* Close button */}
//               <button
//                 onClick={closeForgotModal}
//                 className="absolute top-5 right-5 w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
//               >
//                 <X className="w-3.5 h-3.5" />
//               </button>

//               {/* Header */}
//               <div className="text-center mb-7 relative z-10">
//                 <motion.div
//                   key={resetStep}
//                   initial={{ scale: 0.8, opacity: 0 }}
//                   animate={{ scale: 1, opacity: 1 }}
//                   className="w-14 h-14 bg-gradient-to-br from-indigo-600/30 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/25 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
//                 >
//                   {resetStep === 3
//                     ? <KeyRound className="w-6 h-6 text-indigo-300" />
//                     : resetStep === 2
//                       ? <Mail className="w-6 h-6 text-indigo-300" />
//                       : <KeyRound className="w-6 h-6 text-indigo-300" />
//                   }
//                 </motion.div>
//                 <h3 className="text-xl font-black text-white mb-0.5">Reset Password</h3>
//                 <p className="text-xs text-slate-500 font-medium">Step {resetStep} of 3 — {stepLabels[resetStep - 1]}</p>
//               </div>

//               {/* Step progress */}
//               <div className="flex items-center justify-center mb-7">
//                 {[1, 2, 3].map(s => <StepDot key={s} step={s} current={resetStep} />)}
//               </div>

//               {/* Step Content */}
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={resetStep}
//                   initial={{ opacity: 0, x: 20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -20 }}
//                   transition={{ duration: 0.22 }}
//                 >
//                   {resetStep === 1 && (
//                     <form onSubmit={handleSendResetOtp} className="space-y-4">
//                       <div>
//                         <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Registered Email</label>
//                         <div className="relative group">
//                           <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
//                           <input
//                             type="email" required
//                             placeholder="you@institution.edu"
//                             className="w-full bg-slate-800/60 border border-slate-700/70 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
//                             value={resetData.email}
//                             onChange={e => setResetData({ ...resetData, email: e.target.value })}
//                           />
//                         </div>
//                       </div>
//                       <button type="submit" disabled={resetLoading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_4px_16px_rgba(99,102,241,0.3)] disabled:opacity-60">
//                         {resetLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Mail className="w-4 h-4" /> Send Recovery OTP</>}
//                       </button>
//                     </form>
//                   )}

//                   {resetStep === 2 && (
//                     <form onSubmit={handleVerifyResetOtp} className="space-y-5">
//                       <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-center">
//                         <p className="text-xs text-indigo-300 font-semibold">OTP sent to</p>
//                         <p className="text-sm text-white font-bold mt-0.5">{resetData.email}</p>
//                       </div>
//                       <div>
//                         <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 block text-center">Enter 6-Digit Code</label>
//                         <div className="flex gap-2 justify-center">
//                           {otpDigits.map((d, i) => (
//                             <input
//                               key={i}
//                               id={`otp-${i}`}
//                               type="text"
//                               inputMode="numeric"
//                               maxLength={1}
//                               value={d}
//                               onChange={e => handleOtpChange(i, e.target.value)}
//                               onKeyDown={e => handleOtpKeyDown(i, e)}
//                               className="w-10 h-12 text-center bg-slate-800 border border-slate-700 rounded-xl text-white font-black text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
//                             />
//                           ))}
//                         </div>
//                       </div>
//                       <button type="submit" disabled={resetLoading || resetData.otp.length < 6} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_4px_16px_rgba(99,102,241,0.3)] disabled:opacity-60">
//                         {resetLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Verify Code</>}
//                       </button>
//                     </form>
//                   )}

//                   {resetStep === 3 && (
//                     <form onSubmit={handleResetPassword} className="space-y-3">
//                       <div>
//                         <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
//                           New Password <span className="lowercase font-normal text-slate-500">(min. 8 chars)</span>
//                         </label>
//                         <div className="relative group">
//                           <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
//                           <input
//                             type={showNewPassword ? 'text' : 'password'}
//                             required minLength={8}
//                             placeholder="••••••••"
//                             className="w-full bg-slate-800/60 border border-slate-700/70 rounded-xl py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm tracking-widest"
//                             value={resetData.newPassword}
//                             onChange={e => setResetData({ ...resetData, newPassword: e.target.value })}
//                           />
//                           <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors">
//                             {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                           </button>
//                         </div>
//                       </div>
//                       <div>
//                         <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Confirm Password</label>
//                         <div className="relative group">
//                           <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
//                           <input
//                             type="password"
//                             required minLength={8}
//                             placeholder="••••••••"
//                             className="w-full bg-slate-800/60 border border-slate-700/70 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm tracking-widest"
//                             value={resetData.confirmPassword}
//                             onChange={e => setResetData({ ...resetData, confirmPassword: e.target.value })}
//                           />
//                         </div>
//                         {resetData.confirmPassword && resetData.newPassword !== resetData.confirmPassword && (
//                           <p className="text-xs text-red-400 mt-1 ml-1">Passwords do not match</p>
//                         )}
//                       </div>
//                       <button type="submit" disabled={resetLoading} className="w-full py-3 mt-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_4px_16px_rgba(16,185,129,0.3)] disabled:opacity-60">
//                         {resetLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Set New Password</>}
//                       </button>
//                     </form>
//                   )}
//                 </motion.div>
//               </AnimatePresence>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default Login;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Mail, Lock, LogIn, Activity, ArrowRight, Eye, EyeOff,
  KeyRound, CheckCircle, Shield, Zap, Users, X, ChevronRight,
  Sparkles, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const TiltCard = ({ children, className = '', intensity = 8 }) => {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = useCallback((e) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const cx = r.width / 2;
    const cy = r.height / 2;
    const rx = ((y - cy) / cy) * -intensity;
    const ry = ((x - cx) / cx) * intensity;
    setStyle({
      transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`,
      transition: 'transform 0.08s ease',
    });
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)',
    });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transformStyle: 'preserve-3d', willChange: 'transform' }}
      className={className}
    >
      {children}
    </div>
  );
};

const FloatingOrb = ({ className, delay = 0, y = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{
      scale: [1, 1.12, 1],
      opacity: [0.35, 0.6, 0.35],
      y: [0, 20, 0],
    }}
    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay }}
    style={{ y }}
  />
);

const FeatureCard = ({ icon: Icon, title, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: 'easeOut' }}
    whileHover={{ y: -2, scale: 1.01 }}
    className="bg-white/50 backdrop-blur-md border border-sky-100 rounded-2xl p-5 flex flex-col gap-1.5 card-shadow hover:card-shadow-hover transition-all duration-300"
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
    </div>
    <span className="text-2xl font-black text-slate-900">{value}</span>
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
  </motion.div>
);

const StepDot = ({ step, current }) => (
  <div className="flex items-center gap-1.5">
    <motion.div
      animate={{
        backgroundColor: step <= current ? '#0ea5e9' : '#e2e8f0',
        borderColor: step <= current ? '#0ea5e9' : '#cbd5e1',
        scale: step === current ? 1.15 : 1,
      }}
      className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold"
      style={{ color: step <= current ? 'white' : '#94a3b8' }}
    >
      {step < current ? <CheckCircle className="w-3.5 h-3.5" /> : step}
    </motion.div>
    {step < 3 && (
      <motion.div
        animate={{ backgroundColor: step < current ? '#0ea5e9' : '#e2e8f0' }}
        className="w-8 h-0.5 rounded-full"
      />
    )}
  </div>
);

const InputField = ({ label, icon: Icon, right, children, error }) => (
  <div className="space-y-1.5">
    {label && <label className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">{label}</label>}
    <div className="relative group">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-200 z-10" />
      )}
      {children}
      {right && <div className="absolute right-4 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
    {error && <p className="text-xs text-red-500 font-medium ml-1">{error}</p>}
  </div>
);

const inputClass = (withLeft = true, withRight = false) =>
  `w-full bg-white/80 border border-slate-200 rounded-xl py-3.5 ${withLeft ? 'pl-11' : 'pl-4'} ${withRight ? 'pr-11' : 'pr-4'} text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400 transition-all duration-200 text-sm font-medium`;

const Login = ({ role = 'student' }) => {
  const [formData, setFormData] = useState({ email: '', password: '', role });
  useEffect(() => setFormData(prev => ({ ...prev, role })), [role]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [forgotModal, setForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '', resetToken: '' });
  const [resetLoading, setResetLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);

  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });

  const parallaxY1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const parallaxY2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const parallaxY3 = useTransform(scrollYProgress, [0, 1], [0, 120]);

  useEffect(() => { setMounted(true); }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setResetData(prev => ({ ...prev, otp: next.join('') }));
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const closeForgotModal = () => {
    setForgotModal(false);
    setTimeout(() => {
      setResetStep(1);
      setResetData({ email: '', otp: '', newPassword: '', confirmPassword: '', resetToken: '' });
      setOtpDigits(['', '', '', '', '', '']);
    }, 300);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Login successful!');
      if (data.role === 'student') navigate('/student/dashboard');
      else if (data.role === 'faculty') navigate('/faculty/dashboard');
      else if (data.role === 'hod') navigate('/hod/dashboard');
      else if (data.role === 'admin') navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    if (!resetData.email) return toast.error('Enter your email');
    setResetLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: resetData.email, role });
      if (data.otp) {
        toast.success(`Local OTP: ${data.otp}`, { duration: 12000 });
        setResetData((prev) => ({ ...prev, otp: data.otp }));
      } else {
        toast.success('OTP sent to your email');
      }
      setResetStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally { setResetLoading(false); }
  };

  const handleVerifyResetOtp = async (e) => {
    e.preventDefault();
    if (!resetData.otp || resetData.otp.length < 6) return toast.error('Enter complete OTP');
    setResetLoading(true);
    try {
      const { data } = await api.post('/auth/verify-reset-otp', { email: resetData.email, otp: resetData.otp, role });
      setResetData(prev => ({ ...prev, resetToken: data.resetToken }));
      toast.success('OTP verified!');
      setResetStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally { setResetLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetData.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    if (resetData.newPassword !== resetData.confirmPassword) return toast.error('Passwords do not match');
    setResetLoading(true);
    try {
      await api.post('/auth/reset-password', { resetToken: resetData.resetToken, newPassword: resetData.newPassword });
      toast.success('Password reset successfully!');
      closeForgotModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally { setResetLoading(false); }
  };

  const stepLabels = ['Email', 'Verify OTP', 'New Password'];

  return (
    <div
      ref={containerRef}
      className="min-h-screen font-sans text-slate-900 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 60%, #f0f7ff 100%)',
        overflowX: 'hidden',
      }}
    >

      {/* Ambient background orbs */}
      <FloatingOrb className="w-[600px] h-[600px] bg-sky-200/20 top-[-150px] left-[-150px]" delay={0} />
      <FloatingOrb className="w-[500px] h-[500px] bg-blue-200/15 bottom-[-100px] right-[-80px]" delay={1} />
      <FloatingOrb className="w-[400px] h-[400px] bg-cyan-200/10 top-1/3 right-1/4" delay={2} />

      {/* Animated grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="flex flex-col lg:flex-row min-h-screen relative z-10">

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex w-[52%] relative flex-col justify-between p-14 overflow-hidden border-r border-sky-100/50">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 via-white/30 to-transparent pointer-events-none" />

          {/* Rotating circles */}
          <motion.div
            className="absolute right-[-40px] top-[15%] w-72 h-72 rounded-full border border-sky-200/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            aria-hidden
          />
          <motion.div
            className="absolute right-[20px] top-[20%] w-48 h-48 rounded-full border border-sky-300/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            aria-hidden
          />

          {/* Parallax floating decorative elements */}
          <motion.div
            style={{ y: parallaxY1 }}
            className="absolute top-32 left-16 w-16 h-16 rounded-2xl bg-white border border-sky-200 card-shadow flex items-center justify-center float-anim opacity-80"
            aria-hidden
          >
            <Shield className="w-6 h-6 text-sky-500" />
          </motion.div>

          <motion.div
            style={{ y: parallaxY2 }}
            className="absolute bottom-32 right-20 w-12 h-12 rounded-xl bg-white border border-blue-200 card-shadow flex items-center justify-center float-anim-delay opacity-70"
            aria-hidden
          >
            <Zap className="w-5 h-5 text-blue-500" />
          </motion.div>

          <motion.div
            style={{ y: parallaxY3 }}
            className="absolute top-1/2 left-1/4 w-14 h-14 rounded-xl bg-white border border-cyan-200 card-shadow flex items-center justify-center float-anim-slow opacity-75"
            aria-hidden
          >
            <Lock className="w-5 h-5 text-cyan-500" />
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: 'easeOut' }}
            >
              <div className="inline-flex items-center gap-2 bg-sky-100 border border-sky-300 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-xs font-bold text-sky-700 tracking-wider uppercase">Secure Academic Platform</span>
              </div>

              <h1 className="text-5xl font-black text-slate-900 leading-[1.1] mb-5 tracking-tight">
                Welcome Back to
                <br />
                <span className="gradient-text-warm">ProjectSphere</span>
              </h1>
              <p className="text-slate-600 text-base leading-relaxed max-w-[420px] mb-10">
                Securely access your academic workspace. Manage deliverables, track approvals, and collaborate with faculty seamlessly.
              </p>
            </motion.div>

            {/* Feature cards */}
            <div className="grid grid-cols-3 gap-3 max-w-sm">
              <FeatureCard icon={Zap} title="Uptime" value="99.9%" color="bg-sky-500" delay={0.3} />
              <FeatureCard icon={Users} title="Active Users" value="10K+" color="bg-blue-500" delay={0.4} />
              <FeatureCard icon={Shield} title="Secured" value="256-bit" color="bg-cyan-500" delay={0.5} />
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="relative z-10 text-xs text-slate-500 flex items-center gap-3"
          >
            <span>&copy; {new Date().getFullYear()} ProjectSphere</span>
            <span>•</span>
            <Link to="/about" className="hover:text-slate-700 transition-colors">Platform Info</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-10 relative">
          <motion.div style={{ y: parallaxY2 }} aria-hidden>
            <FloatingOrb className="w-[300px] h-[300px] bg-sky-300/15 top-0 right-0" delay={0.5} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-[420px] relative z-10"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
              <div
                className="p-2 rounded-xl card-shadow"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' }}
              >
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Project<span style={{ color: '#0ea5e9' }}>Sphere</span>
              </span>
            </div>

            {/* Card */}
            <TiltCard
              intensity={6}
              className="bg-white/90 backdrop-blur-md border border-sky-100 rounded-[28px] p-8 sm:p-10 card-shadow hover:card-shadow-hover transition-all duration-300"
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-8"
              >
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {role.charAt(0).toUpperCase() + role.slice(1)} Login
                </h2>
                <p className="text-slate-500 mt-1.5 text-sm font-medium">
                  Sign in to continue to your {role} workspace
                </p>
              </motion.div>

              <form onSubmit={handleLogin} className="space-y-4">
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <InputField label="Email Address" icon={Mail}>
                    <input
                      type="email"
                      required
                      placeholder="you@institution.edu"
                      className={inputClass(true, false)}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </InputField>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotModal(true)}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <InputField
                    icon={Lock}
                    right={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-sky-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    }
                  >
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className={`${inputClass(true, true)} tracking-widest`}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </InputField>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 relative group text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2.5 card-shadow hover:card-shadow-hover transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4.5 h-4.5" />
                        <span>Sign In Securely</span>
                        <motion.div
                          initial={{ opacity: 0, x: -4 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="ml-1"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      </>
                    )}
                  </button>
                </motion.div>
              </form>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 pt-7 border-t border-slate-200"
              >
                <p className="text-slate-500 text-sm text-center mb-3 font-medium">New to ProjectSphere?</p>
                <div className="flex gap-3">
                  <Link
                    to="/register/student"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 hover:border-sky-300 text-slate-700 hover:text-sky-700 text-xs font-bold transition-all duration-200 group"
                  >
                    Student Setup
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link
                    to="/register/faculty"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all duration-200 group"
                  >
                    Faculty Setup
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
              </motion.div>
            </TiltCard>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-slate-500 text-xs mt-5 font-medium"
            >
              Protected by industry-standard encryption
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      <AnimatePresence>
        {forgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ overflowY: 'auto' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForgotModal}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="relative bg-white border border-sky-100 w-full max-w-[400px] rounded-3xl p-8 card-shadow overflow-hidden z-10"
            >
              {/* Top gradient bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: 'linear-gradient(90deg, #0ea5e9, #3b82f6, #06b6d4)' }}
              />

              {/* Ambient glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-2xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.15), transparent)' }}
              />

              {/* Close button */}
              <button
                onClick={closeForgotModal}
                className="absolute top-5 right-5 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Header */}
              <div className="text-center mb-7 relative z-10">
                <motion.div
                  key={resetStep}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-200 card-shadow"
                  style={{
                    background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(59,130,246,0.15))',
                  }}
                >
                  {resetStep === 3
                    ? <KeyRound className="w-6 h-6 text-sky-600" />
                    : resetStep === 2
                      ? <Mail className="w-6 h-6 text-sky-600" />
                      : <KeyRound className="w-6 h-6 text-sky-600" />
                  }
                </motion.div>
                <h3 className="text-xl font-black text-slate-900 mb-0.5">Reset Password</h3>
                <p className="text-xs text-slate-500 font-medium">Step {resetStep} of 3 — {stepLabels[resetStep - 1]}</p>
              </div>

              {/* Step progress */}
              <div className="flex items-center justify-center mb-7">
                {[1, 2, 3].map(s => <StepDot key={s} step={s} current={resetStep} />)}
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={resetStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  {resetStep === 1 && (
                    <form onSubmit={handleSendResetOtp} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Registered Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                          <input
                            type="email"
                            required
                            placeholder="you@institution.edu"
                            className={inputClass(true, false)}
                            value={resetData.email}
                            onChange={e => setResetData({ ...resetData, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 card-shadow disabled:opacity-60"
                      >
                        {resetLoading ? (
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Mail className="w-4 h-4" /> Send Recovery OTP
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {resetStep === 2 && (
                    <form onSubmit={handleVerifyResetOtp} className="space-y-5">
                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-center">
                        <p className="text-xs text-sky-700 font-semibold">OTP sent to</p>
                        <p className="text-sm text-slate-900 font-bold mt-0.5">{resetData.email}</p>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 block text-center">Enter 6-Digit Code</label>
                        <div className="flex gap-2 justify-center">
                          {otpDigits.map((d, i) => (
                            <input
                              key={i}
                              id={`otp-${i}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={d}
                              onChange={e => handleOtpChange(i, e.target.value)}
                              onKeyDown={e => handleOtpKeyDown(i, e)}
                              className="w-10 h-12 text-center bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-black text-lg focus:outline-none focus:ring-0 focus:border-sky-500 transition-all"
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={resetLoading || resetData.otp.length < 6}
                        className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 card-shadow disabled:opacity-60"
                      >
                        {resetLoading ? (
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" /> Verify Code
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {resetStep === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                          New Password <span className="lowercase font-normal text-slate-400">(min. 8 chars)</span>
                        </label>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            placeholder="••••••••"
                            className={inputClass(true, true)}
                            value={resetData.newPassword}
                            onChange={e => setResetData({ ...resetData, newPassword: e.target.value })}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Confirm Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                          <input
                            type="password"
                            required
                            minLength={8}
                            placeholder="••••••••"
                            className={inputClass(true, false)}
                            value={resetData.confirmPassword}
                            onChange={e => setResetData({ ...resetData, confirmPassword: e.target.value })}
                          />
                        </div>
                        {resetData.confirmPassword && resetData.newPassword !== resetData.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1 ml-1">Passwords do not match</p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full py-3 mt-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 card-shadow disabled:opacity-60"
                      >
                        {resetLoading ? (
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" /> Set New Password
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;