import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckSquare, Trash2, Calendar, FileText, CheckCircle, XCircle, UserPlus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HeaderNotificationBell = ({ notifications = [], unreadCount = 0, onMarkRead, onMarkAllRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const diff = now - new Date(dateString);
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return 'just now';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getIcon = (type) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="w-4 h-4 text-rose-500" />;
      case 'submission':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejection':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'assignment':
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'feedback':
        return <Check className="w-4 h-4 text-indigo-500" />;
      default:
        return <Info className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-100 rounded-2xl transition-all duration-300"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-3xl shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-sm">Notifications</h4>
                <p className="text-[10px] text-indigo-200/80 mt-0.5">{unreadCount} unread alerts</p>
              </div>
              {unreadCount > 0 && onMarkAllRead && (
                <button
                  onClick={() => {
                    onMarkAllRead();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg border border-white/10 transition-all cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Read All
                </button>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                  <p className="text-xs font-semibold">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-gray-50/50 ${
                      !n.isRead ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    <div className="p-2 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs text-gray-800 leading-normal ${!n.isRead ? 'font-bold' : 'font-medium'}`}>
                        {n.message}
                      </p>
                      <span className="text-[9px] text-gray-400 font-bold block mt-1">
                        {getRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    {!n.isRead && onMarkRead && (
                      <button
                        onClick={() => onMarkRead(n._id)}
                        className="p-1 text-gray-300 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all shrink-0 cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HeaderNotificationBell;
