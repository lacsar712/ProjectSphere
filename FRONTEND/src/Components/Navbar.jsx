import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, LogOut, LayoutDashboard,
  ChevronRight, GraduationCap, BookOpen, Briefcase, Sparkles,
} from 'lucide-react';

/* ─── Scroll-progress bar ─── */
const ScrollProgress = () => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const update = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-100">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 transition-all duration-100 ease-linear rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

/* ─── Main component ─── */
const Navbar = () => {
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close drawer on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { name: 'Home',    path: '/' },
    { name: 'About',   path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const loginLinks = [
    { name: 'Student', path: '/login/student', icon: GraduationCap, accent: 'indigo' },
    { name: 'Faculty', path: '/login/faculty', icon: BookOpen,      accent: 'purple' },
    { name: 'HOD',     path: '/login/hod',     icon: Briefcase,     accent: 'sky'    },
  ];

  const isActive = (p) =>
    location.pathname === p || (p !== '/' && location.pathname.startsWith(p));

  /* accent colour map for mobile login cards */
  const accentMap = {
    indigo: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-400/40',
    purple: 'text-purple-300 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-400/40',
    sky:    'text-sky-300    bg-sky-500/10    border-sky-500/20    hover:bg-sky-500/20    hover:border-sky-400/40',
  };

  return (
    <>
      {/* ════════════════════ NAVBAR ════════════════════ */}
      <nav
        className={`fixed w-full z-50 top-0 transition-all duration-500 ease-out ${
          scrolled
            ? 'bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 py-2.5 shadow-[0_2px_20px_rgba(0,0,0,0.06)]'
            : 'bg-white/70 backdrop-blur-xl border-b border-slate-100/60 py-4'
        }`}
      >
        {/* subtle dot texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* ambient glow top */}
        <div className="absolute -top-8 right-1/4 w-64 h-16 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18 }}
              className="p-1.5 bg-blue-50 border border-blue-100 rounded-xl shadow-sm group-hover:bg-blue-100 group-hover:border-blue-200 transition-all duration-300"
            >
              <img src="/logo.png" alt="ProjectSphere" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            </motion.div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-800 leading-none">
              Project
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Sphere
              </span>
            </span>
          </Link>

          {/* ── Desktop centre links ── */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                    className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 tracking-wide group ${
                      isActive(link.path)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-100/80'
                    }`}
                >
                  {link.name}
                  {/* active dot */}
                  {isActive(link.path) && (
                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Desktop right actions ── */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200/70">
            {user ? (
              <>
                  <Link
                    to={`/${user.role}/dashboard`}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-500" />
                    Dashboard
                  </Link>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                {loginLinks.map((item, i) => (
                  <React.Fragment key={item.name}>
                    <Link
                      to={item.path}
                      className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-100/80 rounded-xl transition-all duration-200 whitespace-nowrap"
                    >
                      {item.name}
                    </Link>
                    {i < loginLinks.length - 1 && (
                      <span className="w-px h-4 bg-slate-200" />
                    )}
                  </React.Fragment>
                ))}

                {/* CTA button */}
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="ml-1">
                  <Link
                    to="/login/student"
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl shadow-lg shadow-blue-200/60 hover:shadow-blue-300/70 transition-all duration-200 whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl shadow-sm transition-all duration-200"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </div>

        <ScrollProgress />
      </nav>

      {/* ════════════════════ MOBILE DRAWER ════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* slide-in panel */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 h-full z-[70] w-[82%] max-w-[340px] flex flex-col md:hidden
                         bg-white border-l border-slate-200 shadow-2xl"
            >
              {/* top ambient */}
              <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-blue-50 translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none" />
              <div className="absolute bottom-20 left-0 w-36 h-36 rounded-full bg-cyan-50 -translate-x-1/2 blur-2xl pointer-events-none" />

              {/* header row */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 relative z-10">
                <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                  <span className="text-base font-extrabold text-slate-800">
                    Project<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">Sphere</span>
                  </span>
                </Link>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-all"
                  aria-label="Close menu"
                >  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* nav links */}
              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1 relative z-10">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-200 ${
                        isActive(link.path)
                          ? 'text-blue-600 bg-blue-50 border border-blue-100'
                          : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      {link.name}
                      {isActive(link.path)
                        ? <span className="w-2 h-2 rounded-full bg-blue-500" />
                        : <ChevronRight className="w-4 h-4 text-slate-300" />
                      }
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* bottom actions */}
              <div className="px-4 pb-8 pt-4 border-t border-slate-100 space-y-2.5 relative z-10">
                {user ? (
                  <>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Link
                        to={`/${user.role}/dashboard`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-500" />
                        Dashboard
                      </Link>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}>
                      <button
                        onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}
                        className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-2xl transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 pb-1">Sign in as</p>
                    {loginLinks.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.18 + i * 0.07 }}
                        >
                          <Link
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-2xl border transition-all duration-200 ${accentMap[item.accent]}`}
                          >
                            <span className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            {item.name} Login
                            <ChevronRight className="w-4 h-4 opacity-40 ml-auto" />
                          </Link>
                        </motion.div>
                      );
                    })}

                    {/* mobile CTA */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                      <Link
                        to="/login/student"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-center gap-1.5 w-full py-3.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all mt-1"
                      >
                        <Sparkles className="w-4 h-4" />
                        Get Started
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
