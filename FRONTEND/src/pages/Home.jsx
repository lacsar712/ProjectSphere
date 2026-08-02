import { useRef, useState, useCallback } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, BookOpen, ShieldCheck, UploadCloud,
  Users, FileText, CheckCircle, ChevronRight, Zap,
  GitBranch, Lock, BarChart2, Sparkles, TrendingUp,
  Layers, Star, Award, Globe,
} from 'lucide-react';
import { Link } from 'react-router-dom';


const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

function InView({ children, className = '', once = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function TiltCard({ children, className = '', intensity = 10 }) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});
  const [hovered, setHovered] = useState(false);

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
      transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.025)`,
      transition: 'transform 0.08s ease',
    });
  }, [intensity]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)',
      transition: 'transform 0.55s cubic-bezier(0.22,1,0.36,1)',
    });
  }, []);

  const handleMouseEnter = useCallback(() => setHovered(true), []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transformStyle: 'preserve-3d', willChange: 'transform' }}
      className={className}
    >
      {children}
    </div>
  );
}

const FEATURES = [
  {
    icon: BookOpen,
    label: 'Structured Proposals',
    desc: 'Students submit formatted domain scopes and descriptions directly to the department for rapid, auditable review.',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    ring: 'hover:ring-2 hover:ring-sky-200',
    accent: '#0ea5e9',
  },
  {
    icon: ShieldCheck,
    label: 'Hierarchical Approvals',
    desc: 'Multi-tiered verification maps HOD conditional clearances sequentially to designated faculty guides.',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    ring: 'hover:ring-2 hover:ring-blue-200',
    accent: '#3b82f6',
  },
  {
    icon: UploadCloud,
    label: 'Cloud Deliverables',
    desc: 'Secure Cloudinary integration handles zipped source bundles and compressed presentations with enterprise-grade reliability.',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-500',
    ring: 'hover:ring-2 hover:ring-teal-200',
    accent: '#14b8a6',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Student Maps Scope',
    desc: 'The lifecycle begins when a student drafts their project idea and registers to the portal network.',
    iconBg: 'bg-sky-50',
    numColor: 'text-sky-600',
    borderColor: 'border-sky-200',
  },
  {
    num: '02',
    title: 'HOD Assignment',
    desc: 'Department Heads review the global project pool and actively assign proposals to authorised faculty handlers.',
    iconBg: 'bg-blue-50',
    numColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  {
    num: '03',
    title: 'Vault Uploads Active',
    desc: 'Upon faculty acceptance the student dashboard unlocks the secure artifact vault for all deliverable uploads.',
    iconBg: 'bg-teal-50',
    numColor: 'text-teal-600',
    borderColor: 'border-teal-200',
  },
];

const PILLS = [
  { icon: GitBranch, text: 'Version-tracked submissions' },
  { icon: Lock, text: 'Role-based access control' },
  { icon: BarChart2, text: 'Real-time status dashboard' },
  { icon: Zap, text: 'Instant faculty notifications' },
  { icon: FileText, text: 'Automated audit trail' },
  { icon: Users, text: 'Multi-role collaboration' },
  { icon: TrendingUp, text: 'Progress analytics' },
  { icon: Sparkles, text: 'Smart assignment engine' },
];

const STATS = [
  { value: '500+', label: 'Active Students', icon: Users },
  { value: '50+', label: 'Faculty Members', icon: BookOpen },
  { value: '12K', label: 'Files Stored', icon: UploadCloud },
  { value: '100%', label: 'Digital Workflow', icon: Zap, accent: true },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const heroBlobY1 = useTransform(scrollYProgress, [0, 1], [0, -130]);
  const heroBlobY2 = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const heroBlobY3 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.97]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen bg-slate-50" style={{ overflowX: 'hidden' }}>
     

      <main className="pt-16">

        {/* ─── HERO ─────────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 60%, #f0f7ff 100%)',
            minHeight: '100svh',
          }}
        >
          {/* Top edge line */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.35), transparent)' }}
          />

          {/* Parallax background orbs */}
          <motion.div
            style={{ y: heroBlobY1 }}
            className="absolute pointer-events-none"
            aria-hidden
          >
            <div
              className="float-anim-slow"
              style={{
                position: 'absolute',
                top: '-80px',
                left: '-120px',
                width: '560px',
                height: '560px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(14,165,233,0.10) 0%, rgba(59,130,246,0.05) 60%, transparent 80%)',
                filter: 'blur(40px)',
              }}
            />
          </motion.div>

          <motion.div
            style={{ y: heroBlobY2 }}
            className="absolute right-0 pointer-events-none"
            aria-hidden
          >
            <div
              className="float-anim-delay"
              style={{
                position: 'absolute',
                top: '60px',
                right: '-100px',
                width: '440px',
                height: '440px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, rgba(14,165,233,0.04) 60%, transparent 80%)',
                filter: 'blur(50px)',
              }}
            />
          </motion.div>

          <motion.div
            style={{ y: heroBlobY3 }}
            className="absolute pointer-events-none"
            aria-hidden
          >
            <div
              className="float-anim"
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '30%',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)',
                filter: 'blur(60px)',
              }}
            />
          </motion.div>

          {/* Floating decorative shapes */}
          <motion.div
            style={{ y: heroBlobY1 }}
            className="absolute top-24 right-[8%] pointer-events-none hidden lg:block float-anim"
            aria-hidden
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-sky-100 card-shadow flex items-center justify-center rotate-12 opacity-70">
              <BookOpen className="w-6 h-6 text-sky-400" />
            </div>
          </motion.div>

          <motion.div
            style={{ y: heroBlobY2 }}
            className="absolute top-40 left-[7%] pointer-events-none hidden lg:block float-anim-delay"
            aria-hidden
          >
            <div className="w-12 h-12 rounded-xl bg-white border border-blue-100 card-shadow flex items-center justify-center -rotate-6 opacity-60">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            style={{ y: heroBlobY3 }}
            className="absolute bottom-36 right-[12%] pointer-events-none hidden lg:block float-anim-slow"
            aria-hidden
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-teal-100 card-shadow flex items-center justify-center rotate-6 opacity-60">
              <UploadCloud className="w-4 h-4 text-teal-400" />
            </div>
          </motion.div>

          {/* Grid dots pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(14,165,233,0.12) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
              className="pt-16 sm:pt-24 lg:pt-28 pb-8 sm:pb-12"
            >
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="max-w-3xl mx-auto text-center"
              >
                <motion.div variants={fadeUp} className="mb-7">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-600 text-xs font-semibold tracking-widest uppercase shadow-sm">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500" />
                    </span>
                    Portal System Active
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="text-[clamp(2.4rem,6.5vw,4.8rem)] font-black tracking-tight leading-[0.94] mb-6 text-slate-900"
                >
                  Academic Projects,
                  <br />
                  <span className="gradient-text">Managed Seamlessly</span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="text-sm sm:text-base lg:text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                  ProjectSphere is the central hub for academic project reviews — connecting students
                  with faculty, managing deliverables in the cloud, and eliminating every paperwork bottleneck.
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="flex flex-col sm:flex-row items-center justify-center gap-3"
                >
                  <Link
                    to="/register/student"
                    className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-sky-200 hover:shadow-lg transition-all duration-200 w-full sm:w-auto justify-center"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)' }}
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </Link>
                  <Link
                    to="/about"
                    className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-200 card-shadow hover:card-shadow-hover transition-all duration-200 w-full sm:w-auto justify-center"
                  >
                    How It Works
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </Link>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400"
                >
                  {['No setup fees', 'Instant access', 'Secure & private'].map((item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      {item}
                    </span>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Dashboard Mockup */}
            <InView className="pb-16 sm:pb-20 lg:pb-24 max-w-5xl mx-auto" once>
              <motion.div variants={fadeIn}>
                <TiltCard
                  intensity={5}
                  className="rounded-2xl overflow-hidden bg-white card-shadow border border-slate-200/80"
                >
                  {/* Browser chrome */}
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400/80" />
                      <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                      <span className="w-3 h-3 rounded-full bg-green-400/80" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="max-w-[280px] mx-auto h-6 rounded-md flex items-center px-3 text-xs text-slate-400 bg-white border border-slate-200">
                        <Lock className="w-3 h-3 mr-1.5 text-slate-300" />
                        portal.university.edu/dashboard
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center">
                          <div className="w-2.5 h-0.5 rounded-full bg-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dashboard body */}
                  <div className="grid grid-cols-1 md:grid-cols-4">
                    {/* Sidebar */}
                    <div className="hidden md:block border-r border-slate-100 p-4 space-y-1 bg-slate-50/50">
                      <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Navigation</p>
                      {[
                        { label: 'Dashboard', active: true },
                        { label: 'My Project', active: false },
                        { label: 'Submissions', active: false },
                        { label: 'Faculty', active: false },
                        { label: 'Documents', active: false },
                      ].map(({ label, active }) => (
                        <div
                          key={label}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                            active
                              ? 'bg-sky-50 text-sky-600 font-semibold border border-sky-100'
                              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-sky-500' : 'bg-slate-300'}`} />
                          {label}
                        </div>
                      ))}
                    </div>

                    {/* Main content */}
                    <div className="md:col-span-3 p-5 md:p-6 space-y-5 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">Welcome back</p>
                          <p className="text-sm font-bold text-slate-800">Ahmad Raza's Dashboard</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active Project
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Project Status', value: 'Approved', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                          { label: 'Assigned Faculty', value: 'Dr. Ahmad', color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
                          { label: 'Files Uploaded', value: '4 / 6', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                        ].map(({ label, value, color, bg, border }) => (
                          <div key={label} className={`rounded-xl p-3.5 ${bg} border ${border}`}>
                            <p className="text-xs text-slate-500 mb-1">{label}</p>
                            <p className={`text-sm font-bold ${color}`}>{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl p-5 bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Submission Progress</p>
                          <span className="text-xs text-sky-600 font-bold">67%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-1">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #38bdf8, #3b82f6)' }}
                            initial={{ width: 0 }}
                            animate={{ width: '67%' }}
                            transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { name: 'Project Proposal.pdf', done: true },
                            { name: 'Source Code v1.zip', done: true },
                            { name: 'Presentation Final.pptx', done: false },
                          ].map(({ name, done }) => (
                            <div key={name} className="flex items-center gap-2 text-xs">
                              <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${done ? 'text-sky-500' : 'text-slate-300'}`} />
                              <span className={done ? 'text-slate-600' : 'text-slate-400'}>{name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            </InView>
          </div>
        </section>

        {/* ─── STATS ────────────────────────────────────────────────────────── */}
        <section
          className="py-14 sm:py-16 border-y border-slate-200"
          style={{ background: 'linear-gradient(180deg, #f8fbff 0%, #f0f7ff 100%)' }}
        >
          <InView className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {STATS.map(({ value, label, icon: Icon, accent }) => (
                <motion.div key={label} variants={fadeUp}>
                  <TiltCard
                    className={`group relative p-6 rounded-2xl bg-white border card-shadow text-center transition-all duration-300 cursor-default ${
                      accent ? 'border-sky-200' : 'border-slate-200'
                    }`}
                    intensity={8}
                  >
                    <div
                      className={`w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center ${accent ? 'bg-sky-50' : 'bg-slate-50'}`}
                    >
                      <Icon
                        className={`${accent ? 'text-sky-500' : 'text-slate-400'}`}
                        style={{ width: '18px', height: '18px' }}
                      />
                    </div>
                    <div
                      className={`text-3xl sm:text-4xl font-black mb-1.5 tracking-tight ${accent ? 'text-sky-600' : 'text-slate-800'}`}
                      style={accent ? { background: 'linear-gradient(135deg,#0ea5e9,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' } : {}}
                    >
                      {value}
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </InView>
        </section>

        {/* ─── CAPABILITY PILLS ─────────────────────────────────────────────── */}
        <div className="py-5 bg-white border-b border-slate-100">
          <div className="flex gap-2.5 overflow-x-auto px-4 sm:px-6 no-scrollbar max-w-7xl mx-auto flex-wrap justify-center">
            {PILLS.map(({ icon: Icon, text }) => (
              <motion.div
                key={text}
                whileHover={{ scale: 1.05, y: -1 }}
                transition={{ duration: 0.15 }}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-slate-500 border border-slate-200 bg-slate-50 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 whitespace-nowrap transition-colors duration-200 cursor-default"
              >
                <Icon className="w-3.5 h-3.5" />
                {text}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── FEATURES ─────────────────────────────────────────────────────── */}
        <section
          id="features"
          className="py-24 sm:py-28 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #f8fbff 0%, #f0f7ff 100%)' }}
        >
          {/* Background accent */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.05) 0%, transparent 70%)', filter: 'blur(40px)' }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <InView>
              <motion.div variants={fadeUp} className="text-center mb-14">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4 bg-sky-50 border border-sky-200 text-sky-600">
                  Core Capabilities
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
                  Enterprise-Grade Tools
                  <br />
                  <span className="text-slate-400 font-light text-2xl sm:text-3xl">Built for Academia</span>
                </h2>
                <p className="text-slate-500 max-w-xl mx-auto leading-relaxed text-sm sm:text-base">
                  We built ProjectSphere to eliminate paperwork constraints and structural bottlenecks within university departments.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {FEATURES.map(({ icon: Icon, label, desc, iconBg, iconColor, ring, accent }) => (
                  <motion.div key={label} variants={fadeUp}>
                    <TiltCard
                      className={`group relative rounded-2xl p-7 sm:p-8 bg-white border border-slate-200 card-shadow hover:card-shadow-hover ${ring} transition-all duration-300 overflow-hidden cursor-default h-full`}
                      intensity={12}
                    >
                      {/* Inner glow on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                        style={{ background: `radial-gradient(ellipse at top left, ${accent}08 0%, transparent 60%)` }}
                      />
                      <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3">{label}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                      <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-slate-400 group-hover:text-sky-500 transition-colors">
                        Learn more <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </TiltCard>
                  </motion.div>
                ))}
              </div>
            </InView>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="py-24 sm:py-28 bg-white border-t border-slate-100 relative overflow-hidden"
        >
          <div
            className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <InView>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

                {/* Left */}
                <div>
                  <motion.span
                    variants={fadeUp}
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-5 bg-sky-50 border border-sky-200 text-sky-600"
                  >
                    The Workflow
                  </motion.span>
                  <motion.h2
                    variants={fadeUp}
                    className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-5 leading-tight"
                  >
                    Designed for
                    <br />Seamless Operations
                  </motion.h2>
                  <motion.p variants={fadeUp} className="text-slate-500 mb-12 leading-relaxed text-sm sm:text-base">
                    Our portal ensures complex administrative logic never hinders academic progression.
                    The mapping is intentionally linear, auditable, and fast.
                  </motion.p>

                  <div className="relative space-y-0">
                    {STEPS.map(({ num, title, desc, iconBg, numColor, borderColor }, idx) => (
                      <motion.div key={num} variants={fadeUp} className="relative flex gap-5 sm:gap-6">
                        {idx < STEPS.length - 1 && (
                          <div className="absolute left-[21px] top-[50px] w-px h-[calc(100%-4px)] bg-gradient-to-b from-slate-200 to-transparent" />
                        )}
                        <div className={`shrink-0 w-11 h-11 rounded-xl border ${borderColor} ${iconBg} flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-default`}>
                          <span className={`text-xs font-black ${numColor}`}>{num}</span>
                        </div>
                        <div className="pb-10">
                          <h4 className="text-sm sm:text-base font-bold text-slate-800 mb-1.5">{title}</h4>
                          <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right panel */}
                <motion.div variants={fadeIn} className="relative">
                  <div
                    className="absolute inset-0 rounded-3xl opacity-50 blur-2xl transform scale-95 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)' }}
                  />
                  <TiltCard
                    intensity={6}
                    className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 card-shadow"
                  >
                    <div
                      className="p-6 border-b border-slate-100"
                      style={{ background: 'linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' }}
                        >
                          <Layers style={{ width: '18px', height: '18px', color: 'white' }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Project Lifecycle</p>
                          <p className="text-xs text-slate-400">Live tracking status</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-3">
                      {[
                        { label: 'Proposal Submitted', status: 'complete', color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                        { label: 'HOD Review', status: 'complete', color: 'text-emerald-600', dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                        { label: 'Faculty Assigned', status: 'active', color: 'text-sky-600', dot: 'bg-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' },
                        { label: 'Vault Access Unlocked', status: 'pending', color: 'text-slate-400', dot: 'bg-slate-200', bg: 'bg-slate-50', border: 'border-slate-100' },
                      ].map(({ label, status, color, dot, bg, border }) => (
                        <div
                          key={label}
                          className={`flex items-center gap-4 px-4 py-3.5 rounded-xl ${bg} border ${border} transition-all duration-200 hover:shadow-sm`}
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
                          <span className={`text-xs font-semibold flex-1 ${color}`}>{label}</span>
                          {status === 'complete' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                          {status === 'active' && <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin shrink-0" />}
                          {status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-slate-200 shrink-0" />}
                        </div>
                      ))}
                    </div>

                    <div className="px-6 pb-6">
                      <div className="rounded-xl p-4 bg-sky-50 border border-sky-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-sky-700">Overall Progress</span>
                          <span className="text-xs font-bold text-sky-600">75%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-sky-100 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #38bdf8, #3b82f6)' }}
                            initial={{ width: 0 }}
                            animate={{ width: '75%' }}
                            transition={{ duration: 1.4, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              </div>
            </InView>
          </div>
        </section>

        {/* ─── ROLE CARDS ───────────────────────────────────────────────────── */}
        <section
          id="roles"
          className="py-24 sm:py-28 border-t border-slate-100 relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(14,165,233,0.06) 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <InView>
              <motion.div variants={fadeUp} className="text-center mb-14">
                <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4 bg-blue-50 border border-blue-200 text-blue-600">
                  Role-Based Access
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  A Portal Built for Everyone
                </h2>
                <p className="mt-4 text-slate-500 text-sm sm:text-base max-w-xl mx-auto">
                  Whether you're submitting projects or overseeing an entire department, ProjectSphere has you covered.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                {[
                  {
                    role: 'Student',
                    icon: Users,
                    desc: 'Submit proposals, track approval status, upload deliverables and communicate directly with assigned faculty.',
                    cta: { label: 'Register as Student', to: '/register/student' },
                    iconBg: 'bg-sky-50',
                    iconColor: 'text-sky-500',
                    badgeBg: 'bg-sky-50 text-sky-600 border-sky-200',
                    ctaGrad: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                    ring: 'hover:border-sky-200',
                    accent: '#0ea5e9',
                  },
                  {
                    role: 'Faculty',
                    icon: BookOpen,
                    desc: 'Review assigned projects, provide structured feedback, manage deliverable milestones and report to the department.',
                    cta: { label: 'Register as Faculty', to: '/register/faculty' },
                    iconBg: 'bg-blue-50',
                    iconColor: 'text-blue-500',
                    badgeBg: 'bg-blue-50 text-blue-600 border-blue-200',
                    ctaGrad: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    ring: 'hover:border-blue-200',
                    accent: '#3b82f6',
                  },
                  {
                    role: 'HOD',
                    icon: ShieldCheck,
                    desc: 'Oversee department-wide project pools, assign projects to faculty, enforce approvals and monitor overall progress.',
                    cta: { label: 'HOD Access', to: '/login' },
                    iconBg: 'bg-teal-50',
                    iconColor: 'text-teal-500',
                    badgeBg: 'bg-teal-50 text-teal-600 border-teal-200',
                    ctaGrad: 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                    ring: 'hover:border-teal-200',
                    accent: '#14b8a6',
                  },
                ].map(({ role, icon: Icon, desc, cta, iconBg, iconColor, badgeBg, ctaGrad, ring, accent }) => (
                  <motion.div key={role} variants={fadeUp}>
                    <TiltCard
                      className={`group relative rounded-2xl p-7 sm:p-8 bg-white border border-slate-200 ${ring} card-shadow hover:card-shadow-hover transition-all duration-300 flex flex-col h-full cursor-default overflow-hidden`}
                      intensity={10}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                        style={{ background: `radial-gradient(ellipse at top left, ${accent}08 0%, transparent 65%)` }}
                      />
                      <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-4 w-fit ${badgeBg}`}>
                        {role}
                      </span>
                      <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">{desc}</p>
                      <Link
                        to={cta.to}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white w-fit shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                        style={{ background: ctaGrad }}
                      >
                        {cta.label}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </TiltCard>
                  </motion.div>
                ))}
              </div>
            </InView>
          </div>
        </section>

        {/* ─── TRUST BADGES ─────────────────────────────────────────────────── */}
        <section className="py-10 bg-white border-t border-slate-100">
          <InView className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {[
                { icon: ShieldCheck, label: 'Enterprise Security' },
                { icon: Globe, label: 'Cloud Infrastructure' },
                { icon: Award, label: 'Audit Compliant' },
                { icon: Star, label: 'Rated 5 Stars' },
                { icon: Zap, label: 'Instant Sync' },
              ].map(({ icon: Icon, label }) => (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  whileHover={{ scale: 1.08, color: '#0ea5e9' }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2.5 text-slate-400 cursor-default"
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
                </motion.div>
              ))}
            </div>
          </InView>
        </section>

        {/* ─── CTA ──────────────────────────────────────────────────────────── */}
        <section
          className="py-24 sm:py-32 relative overflow-hidden border-t border-slate-100"
          style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)' }}
        >
          {/* Mesh dots */}
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(14,165,233,0.1) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Radial glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
          />

          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <InView>
              <motion.span
                variants={fadeUp}
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6 bg-white border border-sky-200 text-sky-600 shadow-sm"
              >
                Ready to Begin?
              </motion.span>
              <motion.h2
                variants={fadeUp}
                className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-[0.95]"
              >
                Optimize Your
                <br />
                <span className="gradient-text">Academic Workflow</span>
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="text-slate-500 text-sm sm:text-base md:text-lg mb-10 leading-relaxed max-w-xl mx-auto"
              >
                Join hundreds of students and faculty using one unified workspace to manage projects
                from proposal to final submission.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link
                  to="/register/student"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-sm text-white shadow-md hover:shadow-sky-300 hover:shadow-lg transition-all duration-200 w-full sm:w-auto justify-center"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' }}
                >
                  Access Portal Gateway
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-sky-200 card-shadow transition-all duration-200 w-full sm:w-auto justify-center"
                >
                  Sign In
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                {['500+ students enrolled', 'Trusted by 10+ universities', '24/7 system uptime'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                    {item}
                  </span>
                ))}
              </motion.div>
            </InView>
          </div>
        </section>

      </main>

      
    </div>
  );
}