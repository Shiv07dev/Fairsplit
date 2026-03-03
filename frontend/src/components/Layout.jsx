import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, User, LogOut, Sun, Moon,
  Bell, ChevronDown, Zap, Plus, X, Menu
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/groups', icon: Users, label: 'Groups' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Layout({ children }) {
  const { user, logout, darkMode, toggleDarkMode } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: notifData, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/settlements/notifications').then(r => r.data),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.put('/settlements/notifications/read'),
    onSuccess: () => refetch()
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully. See you soon! 👋');
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`} style={{
      background: darkMode
        ? 'linear-gradient(135deg, #0a0b1e 0%, #0d1035 50%, #0a0b28 100%)'
        : 'linear-gradient(135deg, #f0f4ff 0%, #e8ecff 50%, #f5f0ff 100%)'
    }}>
      {/* Decorative background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">FairSplit</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === path
                      ? 'text-white shadow-lg'
                      : darkMode
                        ? 'text-slate-400 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  style={location.pathname === path ? {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4))',
                    border: '1px solid rgba(99,102,241,0.4)'
                  } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  darkMode ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                    : 'text-slate-500 hover:bg-slate-200/60'
                }`}
              >
                {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all relative ${
                    darkMode ? 'text-slate-400 hover:text-white hover:bg-white/10'
                      : 'text-slate-500 hover:bg-slate-200/60'
                  }`}
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
                      style={{
                        background: darkMode ? 'rgba(13,16,53,0.97)' : 'rgba(255,255,255,0.97)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      <div className="flex items-center justify-between p-4 border-b"
                        style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
                        <span className="font-semibold text-sm" style={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markReadMutation.mutate()}
                            className="text-xs text-indigo-400 hover:text-indigo-300"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: darkMode ? '#94a3b8' : '#64748b' }} />
                            <p className="text-sm opacity-50" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map(notif => (
                            <div
                              key={notif.id}
                              className={`p-3 border-b last:border-0 transition-colors ${!notif.is_read ? 'bg-indigo-500/5' : ''}`}
                              style={{ borderColor: 'rgba(99,102,241,0.1)' }}
                            >
                              <p className="text-sm font-medium mb-0.5" style={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                                {notif.title}
                              </p>
                              <p className="text-xs opacity-60" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all ${
                    darkMode ? 'hover:bg-white/10' : 'hover:bg-slate-200/60'
                  }`}
                >
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff`}
                    alt={user?.name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <span className="hidden sm:block text-sm font-medium" style={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-48 rounded-2xl overflow-hidden shadow-2xl z-50"
                      style={{
                        background: darkMode ? 'rgba(13,16,53,0.97)' : 'rgba(255,255,255,0.97)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        backdropFilter: 'blur(20px)'
                      }}
                    >
                      <Link to="/profile" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-indigo-500/10"
                        style={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}>
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ color: darkMode ? '#e2e8f0' : '#1e293b' }}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t overflow-hidden"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === path
                        ? 'text-white'
                        : darkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}
                    style={location.pathname === path ? {
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4))'
                    } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main content */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Click outside handlers */}
      {(showNotifications || showUserMenu) && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowNotifications(false); setShowUserMenu(false); }} />
      )}
    </div>
  );
}
