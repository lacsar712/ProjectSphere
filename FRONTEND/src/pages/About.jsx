// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Target, Users, Zap, LayoutDashboard, Database, ArrowRight, Sparkles, Lightbulb, Rocket } from 'lucide-react';

// const FloatingOrb = ({ className }) => (
//   <motion.div
//     className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
//     animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
//     transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
//   />
// );

// const AnimatedCounter = ({ from = 0, to, duration = 2 }) => {
//   const [count, setCount] = useState(from);

//   useEffect(() => {
//     let interval;
//     const increment = (to - from) / (duration * 60);
//     let current = from;

//     interval = setInterval(() => {
//       current += increment;
//       if (current >= to) {
//         setCount(to);
//         clearInterval(interval);
//       } else {
//         setCount(Math.floor(current));
//       }
//     }, 1000 / 60);

//     return () => clearInterval(interval);
//   }, [from, to, duration]);

//   return <span>{count}+</span>;
// };

// const StatCard = ({ icon: Icon, label, value, color, delay }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 32 }}
//     whileInView={{ opacity: 1, y: 0 }}
//     transition={{ delay, duration: 0.6, ease: 'easeOut' }}
//     viewport={{ once: true, margin: '-100px' }}
//     whileHover={{ y: -8, scale: 1.03 }}
//     className={`relative group rounded-2xl border border-white/8 bg-gradient-to-br ${color} p-6 overflow-hidden backdrop-blur-sm`}
//   >
//     <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//     <div className="relative z-10">
//       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
//         <Icon className="w-5 h-5 text-white" />
//       </div>
//       <p className="text-3xl font-black text-white mb-1">{value}</p>
//       <p className="text-xs text-white/60 font-semibold uppercase tracking-wider">{label}</p>
//     </div>
//   </motion.div>
// );

// const FeatureItem = ({ icon: Icon, title, description, index, color }) => (
//   <motion.div
//     initial={{ opacity: 0, x: -24 }}
//     whileInView={{ opacity: 1, x: 0 }}
//     transition={{ delay: index * 0.12, duration: 0.5, ease: 'easeOut' }}
//     viewport={{ once: true }}
//     whileHover={{ x: 8 }}
//     className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/8 hover:border-white/15 transition-all duration-300 group cursor-pointer"
//   >
//     <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${color} shadow-lg`}>
//       <Icon className="w-5 h-5 text-white" />
//     </div>
//     <div className="flex-1 min-w-0">
//       <h4 className="font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-blue-400 transition-all">{title}</h4>
//       <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
//     </div>
//     <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 self-start mt-0.5 flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100" />
//   </motion.div>
// );

// const TechTag = ({ tech, delay }) => (
//   <motion.div
//     initial={{ opacity: 0, scale: 0.8 }}
//     whileInView={{ opacity: 1, scale: 1 }}
//     transition={{ delay, duration: 0.4, ease: 'backOut' }}
//     viewport={{ once: true }}
//     whileHover={{ scale: 1.08, y: -4 }}
//     className="px-5 py-2.5 rounded-full bg-gradient-to-r from-slate-800/60 to-slate-700/40 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-300 font-semibold text-sm transition-all duration-300 shadow-lg backdrop-blur-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
//   >
//     {tech}
//   </motion.div>
// );

// const ImageCard = ({ src, alt, delay, rotation = 3 }) => (
//   <motion.div
//     initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
//     whileInView={{ opacity: 1, scale: 1, rotate: rotation }}
//     transition={{ delay, duration: 0.7, ease: 'easeOut' }}
//     viewport={{ once: true }}
//     className="relative group rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
//   >
//     <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-blue-600/10 group-hover:from-indigo-600/40 group-hover:to-blue-600/20 transition-all duration-500 z-20" />
//     <motion.img
//       src={src}
//       alt={alt}
//       whileHover={{ scale: 1.08 }}
//       transition={{ duration: 0.5 }}
//       className="w-full h-full object-cover"
//     />
//   </motion.div>
// );

// const About = () => {
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//         delayChildren: 0.1,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, ease: 'easeOut' },
//     },
//   };

//   return (
//     <div className="font-sans bg-[#050810] min-h-screen text-slate-300 overflow-hidden">
//       {/* Ambient Background Elements */}
//       <FloatingOrb className="w-[600px] h-[600px] bg-indigo-700/15 -top-48 -left-48" />
//       <FloatingOrb className="w-[500px] h-[500px] bg-blue-600/10 bottom-1/3 right-0" />

//       {/* ── HERO SECTION ── */}
//       <section className="relative pt-16 pb-24 overflow-hidden">
//         <div className="absolute inset-0 opacity-40"
//           style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '80px 80px' }}
//         />

//         <motion.div
//           className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full border border-indigo-500/10"
//           animate={{ rotate: 360 }}
//           transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
//         />

//         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: -24 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6"
//           >
//             <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
//             <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">About Our Platform</span>
//           </motion.div>

//           <motion.h1
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1, duration: 0.7 }}
//             className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight"
//           >
//             Transforming Academic<br />
//             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400">
//               Delivery Systems
//             </span>
//           </motion.h1>

//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2, duration: 0.7 }}
//             className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium"
//           >
//             Project Sphere solves the fundamental data scattering crisis across global University Engineering Departments by unifying deliverables, proposals, and workflows into one beautiful platform.
//           </motion.p>

//           <motion.div
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.35, duration: 0.6 }}
//             className="mt-10 flex flex-wrap gap-3 justify-center"
//           >
//             <div className="px-5 py-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm font-semibold">📊 10K+ Active Users</div>
//             <div className="px-5 py-2.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-semibold">⚡ 99.9% Uptime</div>
//             <div className="px-5 py-2.5 bg-cyan-600/20 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-semibold">🔒 Enterprise Security</div>
//           </motion.div>
//         </div>
//       </section>

//       {/* ── THE PROBLEM SECTION ── */}
//       <section className="relative py-28 border-t border-white/5">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -40 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.7, ease: 'easeOut' }}
//               viewport={{ once: true }}
//               className="relative group order-2 md:order-1"
//             >
//               <motion.div
//                 className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/10 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
//                 animate={{ scale: [1, 1.1, 1] }}
//                 transition={{ duration: 4, repeat: Infinity }}
//               />
//               <ImageCard src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Problem visualization" delay={0.2} rotation={-2} />
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, x: 40 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.7, ease: 'easeOut' }}
//               viewport={{ once: true }}
//               className="order-1 md:order-2"
//             >
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
//                   <Target className="w-6 h-6 text-red-400" />
//                 </div>
//                 <h2 className="text-3xl font-black text-white">The Core Problem</h2>
//               </div>

//               <motion.div
//                 variants={containerVariants}
//                 initial="hidden"
//                 whileInView="visible"
//                 viewport={{ once: true }}
//                 className="space-y-5"
//               >
//                 <motion.p variants={itemVariants} className="text-slate-400 leading-relaxed">
//                   Universities worldwide rely on legacy platforms, scattered spreadsheets, and endless email chains to track Final Year Projects. This methodology <span className="text-red-400 font-semibold">catastrophically fails</span> when managing thousands of deliverables simultaneously.
//                 </motion.p>

//                 <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 my-6">
//                   <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
//                     <p className="text-2xl font-black text-red-400">40%</p>
//                     <p className="text-xs text-slate-400 mt-1">Time Lost</p>
//                   </div>
//                   <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
//                     <p className="text-2xl font-black text-orange-400">70%</p>
//                     <p className="text-xs text-slate-400 mt-1">Data Scattered</p>
//                   </div>
//                   <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
//                     <p className="text-2xl font-black text-yellow-400">∞</p>
//                     <p className="text-xs text-slate-400 mt-1">Frustration</p>
//                   </div>
//                 </motion.div>

//                 <motion.p variants={itemVariants} className="text-slate-400 leading-relaxed">
//                   Administrators lose oversight, faculty struggle with capacity planning, and students lack transparency into their project progression.
//                 </motion.p>
//               </motion.div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* ── THE SOLUTION SECTION ── */}
//       <section className="relative py-28 border-t border-white/5">
//         <FloatingOrb className="w-[400px] h-[400px] bg-emerald-600/10 top-1/2 left-0 -translate-y-1/2" />

//         <div className="max-w-7xl mx-auto px-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -40 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.7, ease: 'easeOut' }}
//               viewport={{ once: true }}
//             >
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
//                   <Lightbulb className="w-6 h-6 text-emerald-400" />
//                 </div>
//                 <h2 className="text-3xl font-black text-white">Our Solution</h2>
//               </div>

//               <motion.p
//                 initial={{ opacity: 0 }}
//                 whileInView={{ opacity: 1 }}
//                 transition={{ delay: 0.15, duration: 0.6 }}
//                 viewport={{ once: true }}
//                 className="text-slate-400 leading-relaxed mb-8"
//               >
//                 By architecting a modern, scalable MERN stack ecosystem deployed globally, we eliminate friction entirely—leaving only beautiful code and seamless workflows.
//               </motion.p>

//               <motion.div
//                 variants={containerVariants}
//                 initial="hidden"
//                 whileInView="visible"
//                 viewport={{ once: true }}
//                 className="space-y-3"
//               >
//                 <FeatureItem
//                   icon={Users}
//                   title="Role-Based Access Control"
//                   description="Cryptographic boundaries for Students, Faculty, HODs, and Admins"
//                   index={0}
//                   color="bg-indigo-500/20"
//                 />
//                 <FeatureItem
//                   icon={LayoutDashboard}
//                   title="Visual Intelligence Dashboards"
//                   description="Spatial timelines and real-time analytics replacing text-heavy confusion"
//                   index={1}
//                   color="bg-purple-500/20"
//                 />
//                 <FeatureItem
//                   icon={Database}
//                   title="Global Cloud Infrastructure"
//                   description="Secure CDN delivery and instant sync across all departments worldwide"
//                   index={2}
//                   color="bg-cyan-500/20"
//                 />
//                 <FeatureItem
//                   icon={Rocket}
//                   title="Enterprise Performance"
//                   description="Sub-millisecond query response times with automated failover"
//                   index={3}
//                   color="bg-blue-500/20"
//                 />
//               </motion.div>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, x: 40 }}
//               whileInView={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.7, ease: 'easeOut' }}
//               viewport={{ once: true }}
//               className="relative group"
//             >
//               <motion.div
//                 className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-cyan-600/10 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
//                 animate={{ scale: [1, 1.1, 1] }}
//                 transition={{ duration: 4, repeat: Infinity }}
//               />
//               <ImageCard src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1000" alt="Solution dashboard" delay={0.2} rotation={2} />
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* ── STATS SECTION ── */}
//       <section className="relative py-28 border-t border-white/5">
//         <div className="max-w-7xl mx-auto px-6">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl font-black text-white mb-3">Impact by Numbers</h2>
//             <p className="text-slate-400 text-lg">Real results from our global deployment</p>
//           </motion.div>

//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
//           >
//             <StatCard icon={Users} label="Active Users" value="10K+" color="from-indigo-600/10 to-blue-600/10" delay={0} />
//             <StatCard icon={Zap} label="Uptime" value="99.9%" color="from-emerald-600/10 to-cyan-600/10" delay={0.1} />
//             <StatCard icon={Database} label="Projects Tracked" value="5K+" color="from-purple-600/10 to-pink-600/10" delay={0.2} />
//             <StatCard icon={Rocket} label="Departments" value="200+" color="from-orange-600/10 to-red-600/10" delay={0.3} />
//           </motion.div>
//         </div>
//       </section>

//       {/* ── TECH STACK SECTION ── */}
//       <section className="relative py-28 border-t border-white/5">
//         <div className="absolute inset-0 opacity-30"
//           style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '100px 100px' }}
//         />

//         <div className="max-w-7xl mx-auto px-6 relative z-10">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true }}
//             className="text-center mb-16"
//           >
//             <h2 className="text-4xl font-black text-white mb-3">Technology Stack</h2>
//             <p className="text-slate-400 text-lg">Enterprise-grade tools powering our platform</p>
//           </motion.div>

//           <motion.div
//             className="flex flex-wrap justify-center gap-4 md:gap-5"
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//           >
//             {[
//               'React 19', 'Node.JS', 'Express.JS', 'MongoDB Atlas', 'Supabase',
//               'TailwindCSS V4', 'Framer Motion', 'Cloudinary', 'JWT Auth', 'Stripe'
//             ].map((tech, i) => (
//               <TechTag key={i} tech={tech} delay={i * 0.05} />
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* ── VISION SECTION ── */}
//       <section className="relative py-32 border-t border-white/5 overflow-hidden">
//         <FloatingOrb className="w-[700px] h-[700px] bg-indigo-700/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

//         <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
//           <motion.div
//             initial={{ opacity: 0, y: -24 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             viewport={{ once: true }}
//             className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6"
//           >
//             <Rocket className="w-3.5 h-3.5 text-indigo-400" />
//             <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Our Mission</span>
//           </motion.div>

//           <motion.h2
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1, duration: 0.7 }}
//             viewport={{ once: true }}
//             className="text-5xl md:text-6xl font-black text-white mb-8 leading-tight"
//           >
//             Liberating Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Creativity</span>
//           </motion.h2>

//           <motion.p
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             transition={{ delay: 0.2, duration: 0.7 }}
//             viewport={{ once: true }}
//             className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10 font-medium"
//           >
//             We envision universities unburdened by logistics—where faculty mentor brilliance, students create freely, and administrators orchestrate seamlessly. All powered by <span className="text-indigo-300 font-semibold">invisible, beautiful code</span>.
//           </motion.p>

//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.3, duration: 0.6 }}
//             viewport={{ once: true }}
//             className="flex flex-col sm:flex-row gap-4 justify-center"
//           >
//             <a href="/" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-indigo-500/20">
//               <Rocket className="w-4.5 h-4.5" />
//               Get Started
//             </a>
//             <a href="/" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white/8 hover:bg-white/12 border border-white/15 hover:border-indigo-500/30 text-white font-bold rounded-xl transition-all duration-300">
//               Learn More
//               <ArrowRight className="w-4 h-4" />
//             </a>
//           </motion.div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default About;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Target, Users, Zap, LayoutDashboard, Database,
  ArrowRight, Sparkles, Lightbulb, Rocket, Check, TrendingUp, Shield,
  Globe, Lock, BarChart3, Star
} from 'lucide-react';

const useTilt = (maxTilt = 12) => {
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

const useParallaxScroll = () => {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handle = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, []);
  return scrollY;
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
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.04 : 1})`,
        transition: hovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={`relative ${className}`}
    >
      {glare && hovered && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none z-10 overflow-hidden" style={{ borderRadius: 'inherit' }}>
          <div
            style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              top: `${tilt.glareY - 60}%`,
              left: `${tilt.glareX - 60}%`,
              background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 70%)',
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
    animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.65, 0.3], y: [0, 18, 0] }}
    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    style={style}
  />
);

const ParticleField = () => {
  const particles = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 4,
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
          animate={{ y: [0, -80, 0], opacity: [0, 0.7, 0], scale: [0, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

const AnimatedCounter = ({ to, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const increment = to / (duration * 60);
        let current = 0;
        const interval = setInterval(() => {
          current += increment;
          if (current >= to) {
            setCount(to);
            clearInterval(interval);
          } else {
            setCount(Math.floor(current));
          }
        }, 1000 / 60);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{count}</span>;
};

const StatCard = ({ icon: Icon, label, value, suffix = '+', accentColor, bgColor, borderColor, delay, gradient }) => (
  <TiltCard maxTilt={8}>
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true, margin: '-60px' }}
      className={`relative rounded-2xl border p-6 overflow-hidden ${bgColor} ${borderColor} shadow-md hover:shadow-xl transition-all duration-300 group`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
      <div className="relative z-10">
        <motion.div
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${accentColor} shadow-lg`}
          whileHover={{ scale: 1.2, rotate: 15 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
        <p className="text-4xl font-black text-slate-800 mb-1 tabular-nums">
          <AnimatedCounter to={parseInt(value)} />{suffix}
        </p>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{label}</p>
      </div>
    </motion.div>
  </TiltCard>
);

const FeatureItem = ({ icon: Icon, title, description, index, accentClass }) => (
  <TiltCard maxTilt={5} glare={false}>
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
      viewport={{ once: true }}
      className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group cursor-pointer"
    >
      <motion.div
        className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${accentClass} shadow-md`}
        whileHover={{ scale: 1.15, rotate: -8 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <Icon className="w-5 h-5 text-white" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors text-sm sm:text-base">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      </div>
      <motion.div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" whileHover={{ x: 4 }}>
        <ArrowRight className="w-4 h-4 text-blue-400 mt-0.5" />
      </motion.div>
    </motion.div>
  </TiltCard>
);

const TechTag = ({ tech, delay, color }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.75, y: 16 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: 'backOut' }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.1, y: -4, boxShadow: '0 12px 28px rgba(59,130,246,0.15)' }}
    className={`px-4 py-2 rounded-full border font-semibold text-sm transition-all duration-300 shadow-sm cursor-default ${color}`}
  >
    {tech}
  </motion.div>
);

const ProblemStat = ({ value, label, color }) => (
  <TiltCard maxTilt={7} glare={false}>
    <motion.div
      className={`p-4 rounded-2xl border-2 text-center ${color} shadow-sm`}
      whileHover={{ scale: 1.06, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <p className="text-2xl sm:text-3xl font-black mb-1">{value}</p>
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</p>
    </motion.div>
  </TiltCard>
);

const GlowingBadge = ({ text, icon: Icon, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 8 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className={`flex items-center gap-2 px-4 py-2 rounded-full border ${colorClass} shadow-lg backdrop-blur-sm`}
    whileHover={{ scale: 1.08, y: -2 }}
  >
    <Icon className="w-3.5 h-3.5" />
    <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">{text}</span>
  </motion.div>
);

const SectionTag = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, y: -10, scale: 0.85 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
    viewport={{ once: true }}
    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full px-4 py-1.5 mb-5 shadow-sm"
  >
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
      <Sparkles className="w-3 h-3 text-blue-500" />
    </motion.div>
    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{text}</span>
  </motion.div>
);

const ValueCard = ({ icon: Icon, title, text, gradient, iconBg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    viewport={{ once: true }}
  >
    <TiltCard maxTilt={6} glare={false} className="h-full">
      <div className={`relative p-6 rounded-2xl border border-slate-100 h-full shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group ${gradient}`}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/30" />
        <div className="relative z-10">
          <motion.div
            className={`w-12 h-12 mb-4 rounded-xl ${iconBg} flex items-center justify-center shadow-md`}
            whileHover={{ scale: 1.15, rotate: 12 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{text}</p>
        </div>
      </div>
    </TiltCard>
  </motion.div>
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const About = () => {
  const scrollY = useParallaxScroll();

  const parallax = (factor) => ({
    transform: `translateY(${scrollY * factor}px)`,
    willChange: 'transform',
  });

  return (
    <div className="font-sans bg-slate-50 min-h-screen text-slate-700 overflow-x-hidden w-full">

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <FloatingBlob
          className="w-[500px] h-[500px] md:w-[700px] md:h-[700px]"
          style={{ background: 'radial-gradient(circle, #bfdbfe 0%, transparent 70%)', top: '-15%', left: '-10%', opacity: 0.45 }}
        />
        <FloatingBlob
          className="w-[400px] h-[400px] md:w-[500px] md:h-[500px]"
          style={{ background: 'radial-gradient(circle, #a7f3d0 0%, transparent 70%)', top: '35%', right: '-8%', opacity: 0.35 }}
        />
        <FloatingBlob
          className="w-[450px] h-[450px] md:w-[600px] md:h-[600px]"
          style={{ background: 'radial-gradient(circle, #cffafe 0%, transparent 70%)', bottom: '-8%', right: '5%', opacity: 0.3 }}
        />
      </div>

      {/* ── HERO ── */}
      <section className="relative pt-16 sm:pt-20 pb-24 sm:pb-32 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1.5px, transparent 1.5px)',
            backgroundSize: '36px 36px',
            opacity: 0.45,
            ...parallax(0.12),
          }}
        />

        <motion.div
          className="absolute top-1/3 right-1/4 w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-blue-200/35 pointer-events-none hidden sm:block"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          style={parallax(-0.07)}
        />
        <motion.div
          className="absolute top-1/4 right-1/3 w-36 h-36 sm:w-48 sm:h-48 rounded-full border border-cyan-200/25 pointer-events-none hidden sm:block"
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          style={parallax(-0.11)}
        />

        <ParticleField />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full px-4 py-1.5 mb-6 shadow-sm"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            </motion.div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">About Our Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, type: 'spring', stiffness: 60 }}
            style={parallax(0.04)}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-5 leading-[1.08] tracking-tight"
          >
            Transforming<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500">
              Academic Delivery
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium px-2"
          >
            Project Sphere solves the fundamental data scattering crisis across global University Engineering Departments by unifying deliverables, proposals, and workflows into one beautiful platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-10 flex flex-wrap gap-2 sm:gap-3 justify-center"
          >
            {[
              { text: '10K+ Active Users', icon: Users, color: 'bg-blue-50 border-blue-200 text-blue-700' },
              { text: '99.9% Uptime', icon: TrendingUp, color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
              { text: 'Enterprise Security', icon: Shield, color: 'bg-teal-50 border-teal-200 text-teal-700' },
            ].map((badge, i) => (
              <GlowingBadge key={i} text={badge.text} icon={badge.icon} colorClass={badge.color} delay={i * 0.1} />
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.6, type: 'spring' }}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl shadow-blue-500/20 group text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <Rocket className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              Get Started Free
            </motion.a>
            <motion.a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 font-bold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md group text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Features
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Discover</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-0.5 h-7 bg-gradient-to-b from-slate-300 to-transparent rounded-full"
          />
        </motion.div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="relative py-20 sm:py-28 md:py-32 bg-white border-t border-slate-100 overflow-hidden">
        <FloatingBlob
          className="w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
          style={{ background: 'radial-gradient(circle, #fee2e2 0%, transparent 70%)', top: '5%', left: '-5%', opacity: 0.55 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 60 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
              style={parallax(-0.03)}
            >
              <TiltCard maxTilt={8} className="rounded-3xl">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                  <motion.img
                    src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=900"
                    alt="Problem visualization"
                    className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 via-transparent to-orange-400/10" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-red-100 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Target className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Legacy System Failure</p>
                          <p className="text-xs text-slate-500">Affecting 2,400+ institutions globally</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
              <motion.div
                className="absolute -bottom-5 -right-5 w-32 h-32 bg-red-50 rounded-3xl border-2 border-red-100 -z-10 hidden sm:block"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 60 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <SectionTag text="The Challenge" />

              <motion.div
                className="flex items-center gap-3 mb-5"
                initial={{ x: -16, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="w-11 h-11 rounded-xl bg-red-50 border-2 border-red-200 flex items-center justify-center shadow-md flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: 6 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Target className="w-5 h-5 text-red-500" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">The Core Problem</h2>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-5"
              >
                <motion.p variants={itemVariants} className="text-slate-600 leading-relaxed text-base sm:text-lg">
                  Universities worldwide rely on legacy platforms, scattered spreadsheets, and endless email chains to track Final Year Projects. This methodology{' '}
                  <span className="text-red-600 font-black bg-red-50 px-1.5 py-0.5 rounded-md">catastrophically fails</span>{' '}
                  when managing thousands of deliverables simultaneously.
                </motion.p>

                <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
                  <ProblemStat value="40%" label="Time Lost" color="bg-red-50 border-red-200 text-red-600" />
                  <ProblemStat value="70%" label="Data Scattered" color="bg-orange-50 border-orange-200 text-orange-600" />
                  <ProblemStat value="∞" label="Frustration" color="bg-amber-50 border-amber-200 text-amber-600" />
                </motion.div>

                <motion.p variants={itemVariants} className="text-slate-600 leading-relaxed text-base sm:text-lg">
                  Administrators lose oversight, faculty struggle with capacity planning, and students lack transparency into their project progression.
                </motion.p>

                <motion.div variants={itemVariants} className="space-y-2.5 pt-1">
                  {[
                    'No centralised deliverable tracking across departments',
                    'Manual coordination leading to missed deadlines',
                    'Zero real-time visibility for stakeholders',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      </div>
                      <p className="text-sm text-slate-600">{item}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── THE SOLUTION ── */}
      <section className="relative py-20 sm:py-28 md:py-32 border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <FloatingBlob
          className="w-[320px] h-[320px] md:w-[450px] md:h-[450px]"
          style={{ background: 'radial-gradient(circle, #d1fae5 0%, transparent 70%)', top: '12%', right: '-5%', opacity: 0.65 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 60 }}
              viewport={{ once: true }}
            >
              <SectionTag text="Our Approach" />

              <motion.div
                className="flex items-center gap-3 mb-5"
                initial={{ x: -16, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="w-11 h-11 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center shadow-md flex-shrink-0"
                  whileHover={{ scale: 1.1, rotate: -6 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Lightbulb className="w-5 h-5 text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">Our Solution</h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.7 }}
                viewport={{ once: true }}
                className="text-slate-600 leading-relaxed mb-7 text-base sm:text-lg"
              >
                By architecting a modern, scalable MERN stack ecosystem deployed globally, we eliminate friction entirely — leaving only beautiful code and seamless workflows.
              </motion.p>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-3"
              >
                <FeatureItem icon={Users} title="Role-Based Access Control" description="Cryptographic boundaries for Students, Faculty, HODs, and Admins" index={0} accentClass="bg-blue-500" />
                <FeatureItem icon={LayoutDashboard} title="Visual Intelligence Dashboards" description="Spatial timelines and real-time analytics replacing text-heavy confusion" index={1} accentClass="bg-cyan-500" />
                <FeatureItem icon={Database} title="Global Cloud Infrastructure" description="Secure CDN delivery and instant sync across all departments worldwide" index={2} accentClass="bg-teal-500" />
                <FeatureItem icon={Rocket} title="Enterprise Performance" description="Sub-millisecond query response times with automated failover" index={3} accentClass="bg-emerald-500" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 60 }}
              viewport={{ once: true }}
              className="relative"
              style={parallax(-0.03)}
            >
              <TiltCard maxTilt={8} className="rounded-3xl">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
                  <motion.img
                    src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=900"
                    alt="Solution dashboard"
                    className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-transparent to-cyan-400/10" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100 shadow-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Unified Platform Live</p>
                          <p className="text-xs text-slate-500">All workflows in one place</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
              <motion.div
                className="absolute -bottom-5 -left-5 w-32 h-32 bg-emerald-50 rounded-3xl border-2 border-emerald-100 -z-10 hidden sm:block"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative py-20 sm:py-28 md:py-32 bg-white border-t border-slate-100 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            opacity: 0.65,
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 60 }}
            viewport={{ once: true }}
            className="text-center mb-14 sm:mb-20"
          >
            <SectionTag text="Platform Impact" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-3">Impact by Numbers</h2>
            <p className="text-slate-500 text-base sm:text-lg md:text-xl">Real results from our global deployment</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard icon={Users} label="Active Users" value="10" suffix="K+" accentColor="bg-blue-500" bgColor="bg-blue-50/60" borderColor="border-blue-200" delay={0} gradient="bg-gradient-to-br from-blue-50 to-cyan-50" />
            <StatCard icon={Zap} label="Uptime %" value="99" suffix="%" accentColor="bg-emerald-500" bgColor="bg-emerald-50/60" borderColor="border-emerald-200" delay={0.1} gradient="bg-gradient-to-br from-emerald-50 to-teal-50" />
            <StatCard icon={Database} label="Projects Tracked" value="5" suffix="K+" accentColor="bg-cyan-500" bgColor="bg-cyan-50/60" borderColor="border-cyan-200" delay={0.2} gradient="bg-gradient-to-br from-cyan-50 to-sky-50" />
            <StatCard icon={Globe} label="Departments" value="200" suffix="+" accentColor="bg-teal-500" bgColor="bg-teal-50/60" borderColor="border-teal-200" delay={0.3} gradient="bg-gradient-to-br from-teal-50 to-emerald-50" />
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="relative py-20 sm:py-28 md:py-32 border-t border-slate-100 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <FloatingBlob
          className="w-[350px] h-[350px] md:w-[500px] md:h-[500px]"
          style={{ background: 'radial-gradient(circle, #dbeafe 0%, transparent 70%)', bottom: '-8%', left: '-5%', opacity: 0.55 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <SectionTag text="Built With" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-3">Technology Stack</h2>
            <p className="text-slate-500 text-base sm:text-lg">Enterprise-grade tools powering our platform</p>
          </motion.div>

          <div className="space-y-5">
            {[
              {
                category: 'Frontend',
                items: [
                  { name: 'React 19', color: 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100 hover:border-sky-400 hover:text-sky-800' },
                  { name: 'TailwindCSS V4', color: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100 hover:border-teal-400' },
                  { name: 'Framer Motion', color: 'bg-violet-50 border-violet-200 text-violet-700 hover:bg-violet-100 hover:border-violet-400' },
                ],
              },
              {
                category: 'Backend',
                items: [
                  { name: 'Node.JS', color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-400' },
                  { name: 'Express.JS', color: 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:border-slate-400' },
                  { name: 'JWT Auth', color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-400' },
                ],
              },
              {
                category: 'Infrastructure',
                items: [
                  { name: 'MongoDB Atlas', color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400' },
                  { name: 'Supabase', color: 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-400' },
                  { name: 'Cloudinary', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400' },
                  { name: 'Stripe', color: 'bg-indigo-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-400' },
                ],
              },
            ].map((group, gi) => (
              <motion.div
                key={gi}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-wrap items-center gap-3"
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest w-20 flex-shrink-0">{group.category}</span>
                <div className="flex flex-wrap gap-2.5">
                  {group.items.map((item, i) => (
                    <TechTag key={i} tech={item.name} delay={(gi * 3 + i) * 0.04} color={`${item.color} border`} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="relative py-24 sm:py-32 md:py-40 bg-white border-t border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/25 to-cyan-50/15 pointer-events-none" />
        <FloatingBlob
          className="w-[500px] h-[500px] md:w-[700px] md:h-[700px]"
          style={{ background: 'radial-gradient(circle, #e0f2fe 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.4 }}
        />

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0"
              style={{ background: `linear-gradient(${i * 45}deg, transparent 0%, rgba(59,130,246,0.04) 50%, transparent 100%)` }}
              animate={{ rotate: [i * 45, i * 45 + 360] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.85 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300 rounded-full px-5 py-2 mb-7 shadow-md"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
              <Rocket className="w-4 h-4 text-blue-600" />
            </motion.div>
            <span className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-widest">Our Vision & Mission</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, type: 'spring', stiffness: 60 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-7 leading-tight"
          >
            Liberating Academic{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500">
              Excellence
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto mb-12 font-medium"
          >
            We envision universities unburdened by logistics — where faculty mentor brilliance, students create freely, and administrators orchestrate seamlessly. All powered by{' '}
            <span className="text-blue-600 font-bold">invisible, beautiful code</span>. Our mission is to democratize access to world-class project management infrastructure, ensuring every academic institution can thrive in the digital age.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
            <ValueCard
              icon={Users}
              title="Collaborative"
              text="Seamless teamwork across all departments and institutions"
              gradient="bg-gradient-to-br from-white to-blue-50/60"
              iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
              delay={0}
            />
            <ValueCard
              icon={Zap}
              title="Innovative"
              text="Cutting-edge technology at your fingertips, always"
              gradient="bg-gradient-to-br from-white to-cyan-50/60"
              iconBg="bg-gradient-to-br from-cyan-500 to-teal-500"
              delay={0.1}
            />
            <ValueCard
              icon={Shield}
              title="Secure"
              text="Enterprise-grade security and compliance built-in"
              gradient="bg-gradient-to-br from-white to-teal-50/60"
              iconBg="bg-gradient-to-br from-teal-500 to-emerald-500"
              delay={0.2}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: 'spring', stiffness: 80 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <TiltCard maxTilt={7}>
              <motion.a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl shadow-blue-500/20 group text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <Rocket className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                Get Started
              </motion.a>
            </TiltCard>

            <TiltCard maxTilt={7}>
              <motion.a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 sm:px-10 py-4 bg-white border-2 border-slate-200 hover:border-blue-400 text-slate-800 hover:text-blue-600 font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Learn More
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </motion.a>
            </TiltCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-14 pt-8 border-t border-slate-100 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500"
          >
            {[
              { label: 'SOC 2 Certified', icon: Shield },
              { label: 'GDPR Compliant', icon: Lock },
              { label: '99.9% SLA', icon: BarChart3 },
              { label: 'ISO 27001', icon: Star },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                whileHover={{ scale: 1.06, y: -1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <item.icon className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;