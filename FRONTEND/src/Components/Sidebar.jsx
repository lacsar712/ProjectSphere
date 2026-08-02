import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, LogOut, Bell, X } from 'lucide-react';

const Sidebar = ({ navItems, user, role, onLogout, unreadCount = 0, activeTab, onTabChange, isMobileOpen, setIsMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const roleColors = {
    hod:     { bg: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-500', gradient: 'from-purple-600 to-indigo-700' },
    student: { bg: 'bg-blue-600',   light: 'bg-blue-50',   text: 'text-blue-600',   ring: 'ring-blue-500',   gradient: 'from-blue-600 to-cyan-600' },
    faculty: { bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-500', gradient: 'from-indigo-600 to-purple-700' },
    admin:   { bg: 'bg-rose-600',   light: 'bg-rose-50',   text: 'text-rose-600',   ring: 'ring-rose-500',   gradient: 'from-rose-600 to-orange-600' },
  };
  const c = roleColors[role] || roleColors.student;

  const roleLabel = {
    hod: 'Head of Department',
    student: 'Student',
    faculty: 'Faculty Supervisor',
    admin: 'Administrator',
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={isMobile ? {
          x: isMobileOpen ? 0 : -260,
          width: 260
        } : {
          x: 0,
          width: collapsed ? 72 : 260
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="h-[100dvh] bg-white border-r border-gray-100 shadow-sm flex flex-col fixed md:sticky inset-y-0 left-0 shrink-0 overflow-hidden z-50 md:z-30"
      >
        {/* Logo / Brand */}
        <div className={`p-4 flex items-center gap-3 border-b border-gray-100 bg-gradient-to-br ${c.gradient}`}>
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-sm">
            FYP
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                <p className="text-white font-extrabold text-sm leading-tight whitespace-nowrap">FYP Portal</p>
                <p className="text-white/60 text-[10px] whitespace-nowrap">Management System</p>
              </motion.div>
            )}
          </AnimatePresence>
          {isMobile ? (
            <button
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className="ml-auto w-6 h-6 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(p => !p)}
              className="ml-auto w-6 h-6 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all shrink-0"
            >
              {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* User Profile */}
        <div className={`px-3 py-4 border-b border-gray-100 flex items-center gap-3 ${(collapsed && !isMobile) ? 'justify-center' : ''}`}>
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white font-bold text-sm shrink-0 ring-2 ring-offset-2 ${c.ring}`}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className={`text-[10px] font-bold ${c.text} uppercase tracking-wide`}>{roleLabel[role]}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon, badge }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  onTabChange(id);
                  if (isMobile && setIsMobileOpen) setIsMobileOpen(false);
                }}
                title={collapsed ? label : ''}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group relative ${
                  isActive
                    ? `${c.light} ${c.text} font-bold`
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`shrink-0 ${isActive ? c.text : 'text-gray-400 group-hover:text-gray-700'}`}>
                  <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                </div>
                <AnimatePresence>
                  {(!collapsed || isMobile) && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm whitespace-nowrap overflow-hidden">
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Badge */}
                {badge > 0 && (
                  <span className={`${collapsed ? 'absolute top-1.5 right-1.5' : 'ml-auto'} w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0`}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                {/* Active indicator */}
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full ${c.bg}`}></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <button
            onClick={() => {
              onLogout();
              if (isMobile && setIsMobileOpen) setIsMobileOpen(false);
            }}
            title={collapsed ? 'Sign Out' : ''}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0 group-hover:text-red-500" />
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold whitespace-nowrap">
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
