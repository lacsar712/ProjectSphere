import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ArrowRight, Mail, RefreshCw, CheckCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

// ── Floating ambient orb
const FloatingOrb = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3], y: [0, 20, 0] }}
    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

const OTP_LENGTH = 6;

const VerifyOTP = () => {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  // Focus a specific box
  const focusBox = (i) => {
    if (inputRefs.current[i]) inputRefs.current[i].focus();
  };

  const handleChange = useCallback((value, index) => {
    // Allow only single alphanumeric char
    const char = value.replace(/[^a-zA-Z0-9]/g, '').slice(-1).toUpperCase();
    const updated = [...digits];
    updated[index] = char;
    setDigits(updated);
    if (char && index < OTP_LENGTH - 1) focusBox(index + 1);
  }, [digits]);

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const updated = [...digits];
        updated[index] = '';
        setDigits(updated);
      } else if (index > 0) {
        focusBox(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusBox(index - 1);
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').slice(0, OTP_LENGTH).toUpperCase();
    if (!pasted) return;
    const updated = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((c, i) => { if (i < OTP_LENGTH) updated[i] = c; });
    setDigits(updated);
    focusBox(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH;

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!email) return toast.error('No email found. Please register again.');
    if (!isComplete) return toast.error('Please enter the complete 6-character OTP.');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      setVerified(true);
      toast.success('Email verified successfully!');
      setTimeout(() => navigate('/login'), 1800);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return toast.error('No email found.');
    setResending(true);
    try {
      await api.post('/auth/resend-otp', { email });
      toast.success('A new OTP has been sent to your email.');
      setDigits(Array(OTP_LENGTH).fill(''));
      focusBox(0);
    } catch {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden px-4 py-10"
      style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 60%, #f0f7ff 100%)' }}
    >
      {/* Grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient orbs */}
      <FloatingOrb className="w-[500px] h-[500px] bg-sky-200/25 top-[-140px] left-[-120px]" delay={0} />
      <FloatingOrb className="w-[380px] h-[380px] bg-blue-200/20 bottom-[-80px] right-[-80px]" delay={2} />
      <FloatingOrb className="w-[280px] h-[280px] bg-teal-200/15 bottom-[20%] left-[5%]" delay={4} />

      {/* Rotating decorative ring */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full border border-blue-200/20 pointer-events-none"
        style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />
      <motion.div
        className="absolute w-[420px] h-[420px] rounded-full border border-sky-200/15 pointer-events-none"
        style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/90 backdrop-blur-md border border-sky-100 rounded-[28px] shadow-2xl shadow-sky-100/40 overflow-hidden">
          {/* Top gradient accent bar */}
          <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, #0ea5e9, #3b82f6, #14b8a6)' }} />

          <div className="p-8 sm:p-10">

            {/* Animated shield / checkmark icon */}
            <div className="flex justify-center mb-6">
              <AnimatePresence mode="wait">
                {verified ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="w-20 h-20 rounded-[22px] flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}
                  >
                    <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="shield"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
                  >
                    {/* Pulsing ring */}
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 rounded-[22px]"
                        style={{ background: 'linear-gradient(135deg,#0ea5e9,#3b82f6)' }}
                        animate={{ scale: [1, 1.18, 1], opacity: [0.18, 0.06, 0.18] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        aria-hidden
                      />
                      <div
                        className="relative w-20 h-20 rounded-[22px] flex items-center justify-center shadow-md"
                        style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' }}
                      >
                        <ShieldCheck className="w-10 h-10 text-white" strokeWidth={2} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Heading block */}
            <div className="text-center mb-7">
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight"
              >
                {verified ? 'Verified!' : 'Check Your Email'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.28 }}
                className="text-slate-500 mt-2 text-sm leading-relaxed"
              >
                {verified ? (
                  'Redirecting you to login…'
                ) : email ? (
                  <>
                    We sent a <span className="font-bold text-slate-700">6-character OTP</span> to{' '}
                    <span
                      className="font-bold"
                      style={{
                        background: 'linear-gradient(90deg,#0ea5e9,#3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {email}
                    </span>
                  </>
                ) : (
                  <span className="text-rose-500 font-semibold">
                    No email detected.{' '}
                    <Link to="/register/student" className="underline">Register again</Link>
                  </span>
                )}
              </motion.p>

              {/* Email chip */}
              {email && !verified && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700 font-semibold"
                >
                  <Mail className="w-3 h-3" />
                  <span className="truncate max-w-[220px]">{email}</span>
                </motion.div>
              )}
            </div>

            {/* OTP Input Boxes */}
            {!verified && (
              <form onSubmit={handleVerify} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 }}
                  className="flex justify-center gap-2.5"
                  onPaste={handlePaste}
                >
                  {digits.map((d, i) => (
                    <motion.input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleChange(e.target.value, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                      onFocus={(e) => e.target.select()}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.38 + i * 0.05 }}
                      className={`
                        w-12 h-14 sm:w-13 sm:h-15 rounded-xl text-center text-xl font-black font-mono uppercase
                        border-2 transition-all duration-200 outline-none
                        ${d
                          ? 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm shadow-sky-100/60'
                          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
                        }
                        focus:border-sky-500 focus:ring-4 focus:ring-sky-400/20 focus:bg-sky-50/60
                      `}
                      disabled={loading}
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </motion.div>

                {/* Progress dots */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center gap-1.5"
                >
                  {digits.map((d, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${d ? 'bg-sky-500 scale-125' : 'bg-slate-200'}`}
                    />
                  ))}
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                >
                  <button
                    type="submit"
                    disabled={loading || !isComplete || !email}
                    className="w-full relative group overflow-hidden text-white font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sky-200 hover:shadow-lg"
                    style={{ background: isComplete ? 'linear-gradient(135deg, #0ea5e9, #3b82f6)' : 'linear-gradient(135deg,#94a3b8,#cbd5e1)' }}
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
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Complete Verification</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                        </>
                      )}
                    </div>
                  </button>
                </motion.div>
              </form>
            )}

            {/* Footer: resend + re-register */}
            {!verified && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className="mt-6 pt-5 border-t border-slate-100 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <p className="text-slate-500 font-medium">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="flex items-center gap-1.5 text-sky-600 font-bold hover:text-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.span
                      animate={resending ? { rotate: 360 } : { rotate: 0 }}
                      transition={resending ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}
                      className="inline-block"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </motion.span>
                    {resending ? 'Sending…' : 'Resend OTP'}
                  </button>
                </div>
                <p className="text-center text-xs text-slate-400 font-medium">
                  Wrong email?{' '}
                  <Link to="/register/student" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                    Re-register here
                  </Link>
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Trust line */}
        <p className="text-center text-slate-400 text-xs mt-5 font-medium flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          OTP expires in 10 minutes. Do not share it with anyone.
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
