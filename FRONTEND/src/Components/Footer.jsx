
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, ChevronRight, Sparkles, Shield, ArrowUpRight, Activity } from 'lucide-react';

/* ─── Inline SVG social icons ─── */
const YoutubeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0h.003z" />
  </svg>
);
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const GoogleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
  </svg>
);

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Footer = () => {
  const [hoveredLink, setHoveredLink] = useState(null);

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Platform', href: '/about' },
    { label: 'Contact Support', href: '/contact' },
    { label: 'Student Login', href: '/login' },
    { label: 'Faculty Access', href: '/login' },
  ];

  const policies = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Submission Guidelines', href: '/submission' },
    { label: 'Code of Conduct', href: '/code-of-conduct' },
  ];

  const socials = [
    { Icon: YoutubeIcon,   label: 'YouTube',   href: 'https://www.youtube.com/@hietgroup', hover: 'hover:bg-red-50 hover:border-red-200' },
    { Icon: LinkedinIcon,  label: 'LinkedIn',  href: 'https://www.linkedin.com/company/hi-tech-institute-of-engineering-of-technology/', hover: 'hover:bg-blue-50 hover:border-blue-200' },
    { Icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/hitech_college_/', hover: 'hover:bg-pink-50 hover:border-pink-200' },
    { Icon: GoogleIcon,     label: 'Gmail',     href: 'mailto:aicoach219@gmail.com', hover: 'hover:bg-red-50 hover:border-red-200' },
  ];

  const contactItems = [
    { icon: MapPin, text: 'Hi-Tech Institute of Engineering and Technology Ghaziabad', href: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3500.545251972305!2d77.49128877566565!3d28.673331882226368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cf2c4cac27f99%3A0xd9961659aee6d5b2!2sHi-Tech%20Institute%20of%20Engineering%20%26%20Technology!5e0!3m2!1sen!2sin!4v1739723721387!5m2!1sen!2sin' },
    { icon: Phone,  text: '+91 7983727005',                     href: 'tel:+91 7983727005' },
    { icon: Mail,   text: 'aicoach219@gmail.com',               href: 'mailto:aicoach219@gmail.com' },
  ];

  return (
    <footer className="relative w-full bg-white border-t border-slate-100 overflow-hidden">

      {/* Static dot grid â€” no parallax */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)',
          backgroundSize: '32px 32px',
          opacity: 0.35,
        }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50" />

      {/* â”€â”€ MAIN GRID â”€â”€ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10"
        >

          {/* â”€â”€ BRAND â”€â”€ */}
          <motion.div custom={0} variants={fadeUp} className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 shadow-sm relative overflow-hidden">
              <motion.div
                className="absolute inset-0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
                style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.1), transparent)', width: '60%' }}
              />
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="w-3.5 h-3.5 text-blue-500 relative z-10" />
              </motion.div>
              <span className="text-sm font-black text-blue-700 relative z-10 tracking-tight">Project Sphere</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              A comprehensive academic portal streamlining Final Year Projects and bridging students, faculty, and department heads.
            </p>

            <div className="flex gap-2">
              {socials.map(({ Icon, label, href, hover }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`group relative flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 ${hover}`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-colors duration-200" />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-slate-900 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap pointer-events-none shadow-lg">
                    {label}
                  </span>
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <motion.div
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-emerald-400"
              />
              <span className="text-[11px] font-semibold text-emerald-600">All systems operational</span>
            </div>
          </motion.div>

          {/* â”€â”€ QUICK LINKS â”€â”€ */}
          <motion.div custom={1} variants={fadeUp} className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">Quick Links</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-300 to-transparent" />
            </div>
            <ul className="space-y-0.5">
              {quickLinks.map(({ label, href }, idx) => (
                <li key={idx}>
                  <motion.a
                    href={href}
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    onMouseEnter={() => setHoveredLink(`q-${idx}`)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className="group flex items-center justify-between py-1 text-xs text-slate-500 hover:text-blue-600 transition-colors duration-200"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <motion.span
                        animate={{ width: hoveredLink === `q-${idx}` ? 12 : 0, opacity: hoveredLink === `q-${idx}` ? 1 : 0 }}
                        transition={{ duration: 0.15 }}
                        className="inline-block h-0.5 bg-blue-500 rounded-full overflow-hidden flex-shrink-0"
                      />
                      {label}
                    </span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-400" />
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* â”€â”€ POLICIES â”€â”€ */}
          <motion.div custom={2} variants={fadeUp} className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">Policies</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-300 to-transparent" />
            </div>
            <ul className="space-y-0.5">
              {policies.map(({ label, href }, idx) => (
                <li key={idx}>
                  <motion.a
                    href={href}
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="group flex items-center gap-2 py-1 text-xs text-slate-500 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    <ChevronRight className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
                    {label}
                  </motion.a>
                </li>
              ))}
            </ul>

            {/* GDPR badge */}
            <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow flex-shrink-0">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800">GDPR Compliant</p>
                  <p className="text-[10px] text-slate-500">Data never sold to third parties.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* â”€â”€ CONTACT â”€â”€ */}
          <motion.div custom={3} variants={fadeUp} className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">Connect</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-teal-300 to-transparent" />
            </div>
            <ul className="space-y-2">
              {contactItems.map(({ icon: Icon, text, href }, idx) => (
                <li key={idx}>
                  <motion.a
                    href={href}
                    whileHover={{ x: 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="group flex items-start gap-2.5 p-2 rounded-lg border border-transparent hover:border-blue-100 hover:bg-blue-50/60 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-blue-100 border border-slate-200 group-hover:border-blue-200 flex items-center justify-center flex-shrink-0 transition-all duration-200 mt-0.5 shadow-sm">
                      <Icon className="w-3 h-3 text-slate-500 group-hover:text-blue-600 transition-colors duration-200" />
                    </div>
                    <span className="text-[11px] text-slate-500 group-hover:text-slate-800 transition-colors duration-200 leading-relaxed font-medium break-all">
                      {text}
                    </span>
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* â”€â”€ DIVIDER â”€â”€ */}
      <div className="relative h-px mx-4 sm:mx-6 bg-slate-100">
        <motion.div
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, transparent, #60a5fa 30%, #22d3ee 70%, transparent)' }}
        />
      </div>

      {/* â”€â”€ COPYRIGHT â”€â”€ */}
      <div className="relative z-10 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} ProjectSphere. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            Engineered by{' '}
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 ml-0.5">
              The Dev Team
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
