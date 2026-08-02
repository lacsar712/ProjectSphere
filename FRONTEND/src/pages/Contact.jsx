// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Mail, MessageSquare, Send, MapPin, Phone, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
// import toast from 'react-hot-toast';

// const Contact = () => {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '' });

//   const submitHandler = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     await new Promise(resolve => setTimeout(resolve, 1200));

//     toast.success('Your message has been dispatched securely!');
//     setFormData({ firstName: '', lastName: '', email: '', message: '' });
//     setIsSubmitting(false);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.1, delayChildren: 0.2 }
//     }
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
//   };

//   const floatingVariants = {
//     animate: {
//       y: [0, -20, 0],
//       transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
//     }
//   };

//   const contactInfo = [
//     {
//       icon: Phone,
//       label: 'Phone',
//       value: '+1 (555) 123-4567',
//       color: 'from-cyan-500 to-blue-600'
//     },
//     {
//       icon: Mail,
//       label: 'Email',
//       value: 'support@gateway.edu',
//       color: 'from-blue-500 to-cyan-600'
//     },
//     {
//       icon: MapPin,
//       label: 'Location',
//       value: '123 Academic Block, Main Campus',
//       color: 'from-emerald-500 to-cyan-600'
//     }
//   ];

//   return (
//     <div
//       className="min-h-screen relative overflow-hidden pt-24 pb-20"
//       style={{ background: 'linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #051424 100%)' }}
//     >
//       {/* Animated gradient orbs */}
//       <motion.div
//         animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
//         transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
//         className="absolute top-20 -left-40 w-96 h-96 rounded-full pointer-events-none"
//         style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}
//       />
//       <motion.div
//         animate={{ x: [0, -30, 0], y: [0, -40, 0] }}
//         transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
//         className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full pointer-events-none"
//         style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)', filter: 'blur(60px)' }}
//       />
//       <motion.div
//         animate={{ scale: [1, 1.1, 1] }}
//         transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
//         className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full pointer-events-none"
//         style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', filter: 'blur(80px)' }}
//       />

//       {/* Grid texture */}
//       <div
//         className="absolute inset-0 pointer-events-none"
//         style={{
//           backgroundImage: 'linear-gradient(rgba(6,182,212,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.02) 1px, transparent 1px)',
//           backgroundSize: '80px 80px'
//         }}
//       />

//       <div className="max-w-7xl mx-auto px-6 relative z-10">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -30 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.7 }}
//           className="text-center mb-20"
//         >
//           <motion.div
//             initial={{ scale: 0 }}
//             whileInView={{ scale: 1 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
//             className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
//             style={{ background: 'rgba(6,182,212,0.08)', borderColor: 'rgba(6,182,212,0.2)' }}
//           >
//             <MessageSquare className="w-4 h-4 text-cyan-400" />
//             <span className="text-sm font-semibold text-cyan-400">Get in Touch</span>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.7, delay: 0.1 }}
//             className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
//           >
//             <span className="text-white">Let's Connect</span>
//             <br />
//             <span style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
//               We're Here to Help
//             </span>
//           </motion.h1>

//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.7, delay: 0.2 }}
//             className="text-lg max-w-2xl mx-auto leading-relaxed"
//             style={{ color: 'rgba(148,163,184,0.8)' }}
//           >
//             Have questions regarding the platform or need administrative integration support? Our team responds within 24 hours.
//           </motion.p>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
//           {/* Contact cards */}
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             className="lg:col-span-1 space-y-6"
//           >
//             {contactInfo.map((info, idx) => {
//               const Icon = info.icon;
//               return (
//                 <motion.div
//                   key={idx}
//                   variants={itemVariants}
//                   whileHover={{ x: 8, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
//                   className="group relative p-6 rounded-2xl border backdrop-blur-sm overflow-hidden cursor-default"
//                   style={{ background: 'rgba(6,182,212,0.05)', borderColor: 'rgba(6,182,212,0.15)' }}
//                 >
//                   {/* Gradient background on hover */}
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     whileHover={{ opacity: 1 }}
//                     className="absolute inset-0 -z-10"
//                     style={{ background: `linear-gradient(135deg, ${info.color})`, opacity: 0.05 }}
//                   />

//                   <div className="flex items-start gap-4">
//                     <motion.div
//                       whileHover={{ rotate: 360, scale: 1.1 }}
//                       transition={{ duration: 0.6 }}
//                       className={`p-3 rounded-xl bg-gradient-to-br ${info.color}`}
//                     >
//                       <Icon className="w-5 h-5 text-white" />
//                     </motion.div>
//                     <div className="flex-1">
//                       <h4 className="text-sm font-semibold text-slate-300 mb-1">{info.label}</h4>
//                       <p className="text-base text-white font-medium group-hover:text-cyan-400 transition-colors">{info.value}</p>
//                     </div>
//                   </div>
//                 </motion.div>
//               );
//             })}

//             {/* Hours card */}
//             <motion.div
//               variants={itemVariants}
//               className="p-6 rounded-2xl border"
//               style={{ background: 'rgba(14,165,233,0.05)', borderColor: 'rgba(14,165,233,0.15)' }}
//             >
//               <div className="flex items-start gap-3">
//                 <motion.div
//                   animate={{ scale: [1, 1.2, 1] }}
//                   transition={{ duration: 2, repeat: Infinity }}
//                   className="w-2 h-2 rounded-full bg-emerald-400 mt-1"
//                 />
//                 <div>
//                   <h4 className="text-sm font-semibold text-slate-300 mb-2">Operating Hours</h4>
//                   <p className="text-sm text-slate-400">Monday - Friday</p>
//                   <p className="text-base font-medium text-cyan-400">09:00 AM - 05:00 PM EST</p>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>

//           {/* Contact Form */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//             className="lg:col-span-2 p-8 md:p-10 rounded-3xl border backdrop-blur-md relative overflow-hidden"
//             style={{ background: 'rgba(6,182,212,0.03)', borderColor: 'rgba(6,182,212,0.1)' }}
//           >
//             {/* Gradient border effect */}
//             <div
//               className="absolute inset-0 rounded-3xl pointer-events-none"
//               style={{
//                 background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, transparent 100%)',
//                 padding: '1px',
//                 mask: 'linear-gradient(to right, black 0%, transparent 30%, transparent 70%, black 100%)'
//               }}
//             />

//             <form onSubmit={submitHandler} className="space-y-6 relative z-10">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {[
//                   { name: 'firstName', placeholder: 'John', label: 'First Name' },
//                   { name: 'lastName', placeholder: 'Doe', label: 'Last Name' }
//                 ].map((field) => (
//                   <motion.div
//                     key={field.name}
//                     initial={{ opacity: 0, y: 20 }}
//                     whileInView={{ opacity: 1, y: 0 }}
//                     viewport={{ once: true }}
//                     transition={{ duration: 0.6 }}
//                   >
//                     <label className="block text-sm font-semibold text-slate-300 mb-3">{field.label}</label>
//                     <motion.input
//                       whileFocus={{ scale: 1.01 }}
//                       required
//                       type="text"
//                       name={field.name}
//                       value={formData[field.name]}
//                       onChange={handleChange}
//                       className="w-full px-4 py-3.5 rounded-xl border outline-none transition-all text-white placeholder-slate-500"
//                       style={{
//                         background: 'rgba(255,255,255,0.03)',
//                         borderColor: 'rgba(6,182,212,0.2)'
//                       }}
//                       placeholder={field.placeholder}
//                       onFocus={(e) => {
//                         e.target.style.borderColor = 'rgba(6,182,212,0.5)';
//                         e.target.style.background = 'rgba(6,182,212,0.08)';
//                       }}
//                       onBlur={(e) => {
//                         e.target.style.borderColor = 'rgba(6,182,212,0.2)';
//                         e.target.style.background = 'rgba(255,255,255,0.03)';
//                       }}
//                     />
//                   </motion.div>
//                 ))}
//               </div>

//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.6, delay: 0.1 }}
//               >
//                 <label className="block text-sm font-semibold text-slate-300 mb-3">Email Address</label>
//                 <motion.input
//                   whileFocus={{ scale: 1.01 }}
//                   required
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3.5 rounded-xl border outline-none transition-all text-white placeholder-slate-500"
//                   style={{
//                     background: 'rgba(255,255,255,0.03)',
//                     borderColor: 'rgba(6,182,212,0.2)'
//                   }}
//                   placeholder="you@university.edu"
//                   onFocus={(e) => {
//                     e.target.style.borderColor = 'rgba(6,182,212,0.5)';
//                     e.target.style.background = 'rgba(6,182,212,0.08)';
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.borderColor = 'rgba(6,182,212,0.2)';
//                     e.target.style.background = 'rgba(255,255,255,0.03)';
//                   }}
//                 />
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.6, delay: 0.2 }}
//               >
//                 <label className="block text-sm font-semibold text-slate-300 mb-3">Your Message</label>
//                 <motion.textarea
//                   whileFocus={{ scale: 1.01 }}
//                   required
//                   rows="5"
//                   name="message"
//                   value={formData.message}
//                   onChange={handleChange}
//                   className="w-full px-4 py-3.5 rounded-xl border outline-none transition-all text-white placeholder-slate-500 resize-none"
//                   style={{
//                     background: 'rgba(255,255,255,0.03)',
//                     borderColor: 'rgba(6,182,212,0.2)'
//                   }}
//                   placeholder="Write your inquiry here..."
//                   onFocus={(e) => {
//                     e.target.style.borderColor = 'rgba(6,182,212,0.5)';
//                     e.target.style.background = 'rgba(6,182,212,0.08)';
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.borderColor = 'rgba(6,182,212,0.2)';
//                     e.target.style.background = 'rgba(255,255,255,0.03)';
//                   }}
//                 />
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.6, delay: 0.3 }}
//                 className="flex items-center justify-between pt-4"
//               >
//                 <p className="text-xs text-slate-500">We'll respond within 24 hours</p>
//                 <motion.button
//                   type="submit"
//                   disabled={isSubmitting}
//                   whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(6,182,212,0.4)' }}
//                   whileTap={{ scale: 0.98 }}
//                   className="px-8 py-3.5 rounded-xl font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-50"
//                   style={{
//                     background: isSubmitting
//                       ? 'rgba(6,182,212,0.3)'
//                       : 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
//                     cursor: isSubmitting ? 'not-allowed' : 'pointer'
//                   }}
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <motion.div
//                         animate={{ rotate: 360 }}
//                         transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
//                         className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
//                       />
//                       Sending...
//                     </>
//                   ) : (
//                     <>
//                       <Send className="w-4 h-4" />
//                       Dispatch Request
//                     </>
//                   )}
//                 </motion.button>
//               </motion.div>
//             </form>
//           </motion.div>
//         </div>

//         {/* Features grid */}
//         <motion.div
//           initial={{ opacity: 0, y: 40 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.8 }}
//           className="grid grid-cols-1 md:grid-cols-3 gap-6"
//         >
//           {[
//             { title: 'Fast Response', description: '24-hour response time guaranteed', icon: CheckCircle2 },
//             { title: 'Secure', description: 'End-to-end encrypted messages', icon: Mail },
//             { title: 'Expert Support', description: 'Dedicated team of professionals', icon: MessageSquare }
//           ].map((feature, idx) => {
//             const FeatureIcon = feature.icon;
//             return (
//               <motion.div
//                 key={idx}
//                 whileHover={{ y: -8, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
//                 className="p-6 rounded-2xl border text-center"
//                 style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}
//               >
//                 <motion.div
//                   whileHover={{ rotate: 360, scale: 1.1 }}
//                   transition={{ duration: 0.6 }}
//                   className="inline-block p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 mb-4"
//                 >
//                   <FeatureIcon className="w-5 h-5 text-white" />
//                 </motion.div>
//                 <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
//                 <p className="text-sm text-slate-400">{feature.description}</p>
//               </motion.div>
//             );
//           })}
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default Contact;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, MessageSquare, Send, MapPin, Phone,
  CheckCircle2, Clock, Shield, Sparkles, ArrowRight, Zap
} from 'lucide-react';

const useParallaxScroll = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handle = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);
  return scrollY;
};

const useTilt = (maxTilt = 10) => {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 });
  const [hovered, setHovered] = useState(false);

  const onMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (py - 0.5) * -maxTilt * 2,
      y: (px - 0.5) * maxTilt * 2,
      glareX: px * 100,
      glareY: py * 100,
    });
  }, [maxTilt]);

  const onMouseEnter = () => setHovered(true);
  const onMouseLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 });
  };

  return { ref, tilt, hovered, onMouseMove, onMouseEnter, onMouseLeave };
};

const TiltCard = ({ children, className = '', maxTilt = 10, glare = true }) => {
  const { ref, tilt, hovered, onMouseMove, onMouseEnter, onMouseLeave } = useTilt(maxTilt);
  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.03 : 1})`,
        transition: hovered ? 'transform 0.08s ease-out' : 'transform 0.45s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={`relative ${className}`}
    >
      {glare && hovered && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-[inherit]">
          <div
            style={{
              position: 'absolute',
              width: '130%',
              height: '130%',
              top: `${tilt.glareY - 65}%`,
              left: `${tilt.glareX - 65}%`,
              background: 'radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 65%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
};

const FloatingBlob = ({ className, style }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.6, 0.3], y: [0, 20, 0] }}
    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    style={style}
  />
);

const ParticleField = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 9 + Math.random() * 5,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-br from-blue-300 to-cyan-300"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{ y: [0, -90, 0], opacity: [0, 0.65, 0], scale: [0, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

const SectionTag = ({ text, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: -10, scale: 0.85 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
    viewport={{ once: true }}
    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full px-4 py-1.5 mb-5 shadow-sm"
  >
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
      {Icon ? <Icon className="w-3 h-3 text-blue-500" /> : <Sparkles className="w-3 h-3 text-blue-500" />}
    </motion.div>
    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{text}</span>
  </motion.div>
);

const SuccessBanner = ({ onReset }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: -20 }}
    transition={{ type: 'spring', stiffness: 100 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
      className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-xl shadow-emerald-200"
    >
      <CheckCircle2 className="w-10 h-10 text-white" />
    </motion.div>
    <h3 className="text-2xl font-black text-slate-900 mb-2">Message Sent!</h3>
    <p className="text-slate-500 mb-8 max-w-xs">Your inquiry has been dispatched securely. We will respond within 24 hours.</p>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={onReset}
      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-200"
    >
      Send Another <ArrowRight className="w-4 h-4" />
    </motion.button>
  </motion.div>
);

const InputField = ({ label, name, type = 'text', placeholder, value, onChange, required = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
    <input
      required={required}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm"
    />
  </motion.div>
);

const Contact = () => {
  const scrollY = useParallaxScroll();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });

  const parallax = (factor) => ({
    transform: `translateY(${scrollY * factor}px)`,
    willChange: 'transform',
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const contactCards = [
    {
      icon: Phone,
      label: 'Phone',
      value: '+91 7983727005',
      sub: 'Mon–Fri, 9AM–5PM IST',
      accent: 'bg-blue-500',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      ring: 'ring-blue-100',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'aicoach219@gmail.com',
      sub: 'We reply within 24 hours',
      accent: 'bg-cyan-500',
      bg: 'bg-cyan-50',
      border: 'border-cyan-100',
      ring: 'ring-cyan-100',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Hi-Tech Institute of Engineering & Technology',
      sub: 'NH-24, Delhi-Hapur Road, Ghaziabad, UP',
      accent: 'bg-teal-500',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
      ring: 'ring-teal-100',
    },
  ];

  const features = [
    { icon: CheckCircle2, title: 'Fast Response', desc: '24-hour guaranteed response time', color: 'bg-emerald-500' },
    { icon: Shield, title: 'Secure & Private', desc: 'End-to-end encrypted messages', color: 'bg-blue-500' },
    { icon: Zap, title: 'Expert Support', desc: 'Dedicated professionals on standby', color: 'bg-cyan-500' },
  ];

  return (
    <div className="font-sans bg-slate-50 min-h-screen text-slate-700 overflow-x-hidden w-full">

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <FloatingBlob
          className="w-[400px] h-[400px] md:w-[600px] md:h-[600px]"
          style={{ background: 'radial-gradient(circle, #bfdbfe 0%, transparent 70%)', top: '-12%', left: '-8%', opacity: 0.5 }}
        />
        <FloatingBlob
          className="w-[350px] h-[350px] md:w-[500px] md:h-[500px]"
          style={{ background: 'radial-gradient(circle, #a7f3d0 0%, transparent 70%)', top: '40%', right: '-8%', opacity: 0.38 }}
        />
        <FloatingBlob
          className="w-[400px] h-[400px] md:w-[550px] md:h-[550px]"
          style={{ background: 'radial-gradient(circle, #cffafe 0%, transparent 70%)', bottom: '-8%', left: '20%', opacity: 0.32 }}
        />
      </div>

      {/* ── HERO ── */}
      <section className="relative pt-16 sm:pt-20 pb-16 sm:pb-24 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1.5px, transparent 1.5px)',
            backgroundSize: '36px 36px',
            opacity: 0.45,
            ...parallax(0.1),
          }}
        />

        <motion.div
          className="absolute top-1/3 right-1/4 w-56 h-56 sm:w-72 sm:h-72 rounded-full border-2 border-blue-200/30 pointer-events-none hidden md:block"
          animate={{ rotate: 360 }}
          transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
          style={parallax(-0.06)}
        />
        <motion.div
          className="absolute top-1/4 right-1/5 w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-cyan-200/25 pointer-events-none hidden md:block"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          style={parallax(-0.1)}
        />

        <ParticleField />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <SectionTag text="Get in Touch" icon={MessageSquare} />

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, type: 'spring', stiffness: 60 }}
            style={parallax(0.04)}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-5 leading-[1.08] tracking-tight"
          >
            Let's Connect
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500">
              We're Here to Help
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium px-2"
          >
            Have questions about the platform or need administrative integration support? Our team responds within 24 hours — guaranteed.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-10 flex flex-wrap gap-2 sm:gap-3 justify-center"
          >
            {[
              { icon: CheckCircle2, text: '24hr Response' },
              { icon: Shield, text: 'Encrypted Messages' },
              { icon: Clock, text: 'Mon–Fri 9AM–5PM' },
            ].map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.07, y: -2 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border bg-white border-slate-200 shadow-sm"
              >
                <b.icon className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">{b.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Reach Us</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-0.5 h-7 bg-gradient-to-b from-slate-300 to-transparent rounded-full"
          />
        </motion.div>
      </section>

      {/* ── CONTACT INFO CARDS ── */}
      <section className="relative py-10 sm:py-14 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {contactCards.map((card, i) => (
              <TiltCard key={i} maxTilt={8}>
                <motion.div
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.55, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className={`group relative p-5 sm:p-6 rounded-2xl border ${card.bg} ${card.border} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  <div className="relative z-10 flex items-start gap-4">
                    <motion.div
                      className={`w-11 h-11 rounded-xl ${card.accent} flex items-center justify-center shadow-md flex-shrink-0`}
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <card.icon className="w-5 h-5 text-white" />
                    </motion.div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{card.label}</p>
                      <p className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{card.value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT: FORM + SIDE INFO ── */}
      <section className="relative py-10 sm:py-16 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            opacity: 0.55,
            ...parallax(0.05),
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">

            {/* Side Info Panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, type: 'spring', stiffness: 60 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-5"
              style={parallax(-0.03)}
            >
              <div>
                <SectionTag text="Why Reach Out?" />
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 leading-tight">
                  Dedicated to Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                    Success
                  </span>
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Whether you're a student, faculty member, or institutional administrator — our support team has the answers you need.
                </p>
              </div>

              {/* Operating hours */}
              <TiltCard maxTilt={6} glare={false}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">Operating Hours</h3>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { day: 'Monday – Friday', time: '09:00 AM – 05:00 PM', active: true },
                      { day: 'Saturday', time: '10:00 AM – 02:00 PM', active: false },
                      { day: 'Sunday', time: 'Closed', active: false },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{row.day}</span>
                        <span className={`text-xs font-semibold ${row.time === 'Closed' ? 'text-slate-400' : 'text-blue-600'}`}>{row.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-emerald-400"
                    />
                    <span className="text-xs font-semibold text-emerald-600">Online now</span>
                  </div>
                </motion.div>
              </TiltCard>

              {/* Quick topics */}
              <TiltCard maxTilt={6} glare={false}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <h3 className="font-bold text-slate-900 text-sm mb-4">Common Topics</h3>
                  <div className="space-y-2">
                    {[
                      'Account & access issues',
                      'Project submission support',
                      'Institutional integration',
                      'Billing & subscriptions',
                      'Feature requests',
                    ].map((topic, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="flex items-center gap-3 group cursor-default"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                        <span className="text-xs text-slate-600 group-hover:text-blue-600 transition-colors">{topic}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TiltCard>

              {/* Response guarantee */}
              <TiltCard maxTilt={6} glare={false}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md flex-shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-1">24-Hour Guarantee</p>
                      <p className="text-xs text-slate-500 leading-relaxed">Every inquiry receives a response within one business day, no exceptions.</p>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15, type: 'spring', stiffness: 60 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <TiltCard maxTilt={4} glare={true}>
                <div className="relative bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 rounded-t-3xl" />

                  <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-30">
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-50 rounded-bl-full" />
                  </div>

                  <div className="relative z-10 p-6 sm:p-8 md:p-10">
                    {submitted ? (
                      <SuccessBanner onReset={() => setSubmitted(false)} />
                    ) : (
                      <>
                        <div className="mb-7">
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">Send a Message</h2>
                          <p className="text-sm text-slate-500">Fill in the details below and we'll get back to you shortly.</p>
                        </div>

                        <form onSubmit={submitHandler} className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                              label="First Name"
                              name="firstName"
                              placeholder="John"
                              value={formData.firstName}
                              onChange={handleChange}
                            />
                            <InputField
                              label="Last Name"
                              name="lastName"
                              placeholder="Doe"
                              value={formData.lastName}
                              onChange={handleChange}
                            />
                          </div>

                          <InputField
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="you@university.edu"
                            value={formData.email}
                            onChange={handleChange}
                          />

                          <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                          >
                            <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                            <select
                              name="subject"
                              value={formData.subject}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm appearance-none cursor-pointer"
                            >
                              <option value="" disabled>Select a topic...</option>
                              <option value="account">Account & Access Issues</option>
                              <option value="project">Project Submission Support</option>
                              <option value="integration">Institutional Integration</option>
                              <option value="billing">Billing & Subscriptions</option>
                              <option value="feature">Feature Request</option>
                              <option value="other">Other</option>
                            </select>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.05 }}
                          >
                            <label className="block text-sm font-bold text-slate-700 mb-2">Your Message</label>
                            <textarea
                              required
                              rows={5}
                              name="message"
                              value={formData.message}
                              onChange={handleChange}
                              placeholder="Describe your inquiry in detail..."
                              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm resize-none"
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2"
                          >
                            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              Your data is encrypted and never shared
                            </p>
                            <motion.button
                              type="submit"
                              disabled={isSubmitting}
                              whileHover={{ scale: 1.04, boxShadow: '0 12px 28px rgba(59,130,246,0.25)' }}
                              whileTap={{ scale: 0.97 }}
                              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-100"
                              style={{
                                background: isSubmitting
                                  ? 'linear-gradient(135deg, #93c5fd, #67e8f9)'
                                  : 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                              }}
                            >
                              {isSubmitting ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                                  />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4" />
                                  Send Message
                                </>
                              )}
                            </motion.button>
                          </motion.div>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURE STRIPS ── */}
      <section className="relative py-16 sm:py-20 border-t border-slate-100 overflow-hidden">
        <FloatingBlob
          className="w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
          style={{ background: 'radial-gradient(circle, #d1fae5 0%, transparent 70%)', top: '10%', right: '-5%', opacity: 0.5 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <SectionTag text="Why Choose Us" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Support You Can Count On</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {features.map((feat, i) => (
              <TiltCard key={i} maxTilt={7} glare={false}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.55, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  className="group p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 text-center"
                >
                  <motion.div
                    className={`w-12 h-12 mx-auto mb-4 rounded-xl ${feat.color} flex items-center justify-center shadow-md`}
                    whileHover={{ scale: 1.18, rotate: 12 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <feat.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{feat.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
                </motion.div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST FOOTER STRIP ── */}
      <section className="py-10 border-t border-slate-100 bg-white overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-5 sm:gap-8 text-sm text-slate-500"
          >
            {[
              { icon: Shield, label: 'SOC 2 Certified' },
              { icon: CheckCircle2, label: 'GDPR Compliant' },
              { icon: Zap, label: '99.9% SLA' },
              { icon: Clock, label: '24hr Response' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                whileHover={{ scale: 1.07, y: -1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <item.icon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="font-semibold whitespace-nowrap">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;