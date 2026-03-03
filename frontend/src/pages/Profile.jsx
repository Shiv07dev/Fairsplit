import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, Edit2, Camera, Lock, Sun, Moon, Save, X, Globe } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

export default function Profile() {
  const { user, updateUser, darkMode, toggleDarkMode } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    currency: user?.currency || 'INR'
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const subColor = darkMode ? '#94a3b8' : '#64748b';
  const cardBg = darkMode ? 'rgba(13,16,53,0.7)' : 'rgba(255,255,255,0.85)';
  const cardBorder = darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)';
  const inputStyle = {
    background: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.05)',
    border: darkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(99,102,241,0.2)',
    color: textColor,
    outline: 'none'
  };

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/auth/profile').then(r => r.data.user)
  });

  const profileUser = profileData || user;

  const updateMutation = useMutation({
    mutationFn: (formData) => api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (res) => {
      updateUser(res.data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated! ✅');
      setIsEditing(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed.')
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => api.put('/auth/change-password', data),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Password change failed.')
  });

  const handleSave = () => {
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    updateMutation.mutate(formData);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB.');
    const formData = new FormData();
    formData.append('avatar', file);
    updateMutation.mutate(formData);
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-black mb-1" style={{ color: textColor }}>My Profile</h1>
          <p className="text-sm" style={{ color: subColor }}>Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl p-8"
          style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <div className="relative group">
              <img
                src={profileUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser?.name || 'U')}&background=6366f1&color=fff&size=200`}
                alt={profileUser?.name}
                className="w-24 h-24 rounded-2xl object-cover shadow-xl"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              {updateMutation.isPending && (
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/60">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spinner" />
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-display font-bold mb-1" style={{ color: textColor }}>
                {profileUser?.name}
              </h2>
              <p className="text-sm mb-1" style={{ color: subColor }}>{profileUser?.email}</p>
              {profileUser?.bio && (
                <p className="text-sm" style={{ color: subColor }}>{profileUser.bio}</p>
              )}
              <p className="text-xs mt-2" style={{ color: subColor }}>
                Member since {profileUser?.created_at ? format(parseISO(profileUser.created_at), 'MMMM yyyy') : 'recently'}
              </p>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{
                background: isEditing ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
                border: isEditing ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(99,102,241,0.3)',
                color: isEditing ? '#f87171' : '#a5b4fc'
              }}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: subColor }}>Full Name</label>
                {isEditing ? (
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: subColor }} />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                      style={inputStyle}
                      onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                      onBlur={e => e.target.style.border = inputStyle.border}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.04)', border: `1px solid ${cardBorder}` }}>
                    <User className="w-4 h-4" style={{ color: subColor }} />
                    <span className="text-sm" style={{ color: textColor }}>{profileUser?.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: subColor }}>Email</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.04)', border: `1px solid ${cardBorder}` }}>
                  <Mail className="w-4 h-4" style={{ color: subColor }} />
                  <span className="text-sm" style={{ color: textColor }}>{profileUser?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: subColor }}>Phone Number</label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: subColor }} />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm placeholder-slate-500"
                      style={inputStyle}
                      onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                      onBlur={e => e.target.style.border = inputStyle.border}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.04)', border: `1px solid ${cardBorder}` }}>
                    <Phone className="w-4 h-4" style={{ color: subColor }} />
                    <span className="text-sm" style={{ color: profileUser?.phone ? textColor : subColor }}>
                      {profileUser?.phone || 'Not set'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: subColor }}>Currency</label>
                {isEditing ? (
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: subColor }} />
                    <select
                      value={form.currency}
                      onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm appearance-none"
                      style={inputStyle}
                    >
                      {currencies.map(c => (
                        <option key={c} value={c} style={{ background: '#0d1035' }}>{c}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.04)', border: `1px solid ${cardBorder}` }}>
                    <Globe className="w-4 h-4" style={{ color: subColor }} />
                    <span className="text-sm" style={{ color: textColor }}>{profileUser?.currency || 'INR'}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: subColor }}>Bio</label>
              {isEditing ? (
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Tell us something about yourself..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm placeholder-slate-500 resize-none"
                  style={inputStyle}
                  onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.border = inputStyle.border}
                />
              ) : (
                <div className="px-4 py-3 rounded-xl min-h-16"
                  style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.04)', border: `1px solid ${cardBorder}` }}>
                  <span className="text-sm" style={{ color: profileUser?.bio ? textColor : subColor }}>
                    {profileUser?.bio || 'No bio set'}
                  </span>
                </div>
              )}
            </div>

            {isEditing && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white gradient-brand hover:opacity-90 transition-all hover:scale-105 disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </motion.button>
            )}
          </div>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Dark Mode Toggle */}
          <div className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: textColor }}>Appearance</h3>
                <p className="text-sm" style={{ color: subColor }}>
                  {darkMode ? 'Dark mode is active' : 'Light mode is active'}
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className="relative w-14 h-7 rounded-full transition-all flex items-center"
                style={{
                  background: darkMode ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.2)',
                  border: '1px solid rgba(99,102,241,0.3)'
                }}
              >
                <motion.div
                  animate={{ x: darkMode ? 28 : 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="absolute w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                >
                  {darkMode
                    ? <Moon className="w-3 h-3 text-indigo-600" />
                    : <Sun className="w-3 h-3 text-yellow-500" />
                  }
                </motion.div>
              </button>
            </div>
          </div>

          {/* Change Password */}
          <div className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold mb-1" style={{ color: textColor }}>Password</h3>
                <p className="text-sm" style={{ color: subColor }}>Update your security credentials</p>
              </div>
            </div>

            {!showChangePassword ? (
              <button
                onClick={() => setShowChangePassword(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
              >
                <Lock className="w-4 h-4" /> Change Password
              </button>
            ) : (
              <div className="space-y-3">
                {[
                  { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
                  { key: 'newPassword', label: 'New Password', placeholder: '••••••••' },
                  { key: 'confirmPassword', label: 'Confirm', placeholder: '••••••••' }
                ].map(field => (
                  <input
                    key={field.key}
                    type="password"
                    placeholder={field.placeholder}
                    value={passwordForm[field.key]}
                    onChange={e => setPasswordForm(f => ({ ...f, [field.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm placeholder-slate-500"
                    style={{ ...inputStyle, fontSize: '12px' }}
                    onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                    onBlur={e => e.target.style.border = inputStyle.border}
                  />
                ))}
                <div className="flex gap-2">
                  <button onClick={() => setShowChangePassword(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/5 transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={passwordMutation.isPending}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-white gradient-brand disabled:opacity-50"
                  >
                    {passwordMutation.isPending ? '...' : 'Update'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="rounded-2xl p-6"
          style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
          <h3 className="font-display font-semibold mb-5" style={{ color: textColor }}>Account Info</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'User ID', value: `#${profileUser?.id || '—'}` },
              { label: 'Currency', value: profileUser?.currency || 'INR' },
              { label: 'Theme', value: darkMode ? '🌙 Dark' : '☀️ Light' },
              { label: 'Joined', value: profileUser?.created_at ? format(parseISO(profileUser.created_at), 'MMM yyyy') : '—' }
            ].map(stat => (
              <div key={stat.label} className="text-center p-4 rounded-xl"
                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <p className="font-bold font-display" style={{ color: '#a5b4fc' }}>{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: subColor }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
