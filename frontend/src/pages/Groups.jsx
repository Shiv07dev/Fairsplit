import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Users, ArrowRight, Search, X, Copy, Check, Trash2, Crown } from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const GROUP_ICONS = ['👥', '🏠', '✈️', '🎉', '🍕', '🎓', '💼', '🛍️', '⚽', '🎸'];

function CreateGroupModal({ onClose, darkMode }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('👥');
  const [memberEmails, setMemberEmails] = useState(['']);

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/groups', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success(res.data.message || 'Group created!');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create group.')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Group name is required.');
    const validEmails = memberEmails.filter(e => e.trim() && e.includes('@'));
    createMutation.mutate({ name: name.trim(), description, icon, memberEmails: validEmails });
  };

  const addEmailField = () => setMemberEmails([...memberEmails, '']);
  const updateEmail = (i, val) => {
    const updated = [...memberEmails];
    updated[i] = val;
    setMemberEmails(updated);
  };
  const removeEmail = (i) => setMemberEmails(memberEmails.filter((_, idx) => idx !== i));

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    outline: 'none',
    color: '#e2e8f0'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl"
        style={{
          background: 'rgba(13,16,53,0.97)',
          border: '1px solid rgba(99,102,241,0.3)',
          backdropFilter: 'blur(20px)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white">Create New Group</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Group Icon</label>
            <div className="flex flex-wrap gap-2">
              {GROUP_ICONS.map(ico => (
                <button
                  key={ico}
                  type="button"
                  onClick={() => setIcon(ico)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{
                    background: icon === ico ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.05)',
                    border: icon === ico ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.1)',
                    transform: icon === ico ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Group Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='e.g., "Flat 301" or "Goa Trip 2024"'
              className="w-full px-4 py-3.5 rounded-xl text-sm placeholder-slate-500"
              style={inputStyle}
              onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
              onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="w-full px-4 py-3.5 rounded-xl text-sm placeholder-slate-500"
              style={inputStyle}
              onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
              onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'}
            />
          </div>

          {/* Member Emails */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Invite Members by Email</label>
            <div className="space-y-2">
              {memberEmails.map((email, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => updateEmail(i, e.target.value)}
                    placeholder="friend@example.com"
                    className="flex-1 px-4 py-3 rounded-xl text-sm placeholder-slate-500"
                    style={inputStyle}
                    onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'}
                  />
                  {memberEmails.length > 1 && (
                    <button type="button" onClick={() => removeEmail(i)}
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/10 transition-all"
                      style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addEmailField}
                className="text-indigo-400 text-sm hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add another member
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full py-3.5 rounded-xl font-semibold text-white gradient-brand shadow-lg hover:opacity-90 transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" />
            ) : (
              <>Create Group ✨</>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function GroupCard({ group, darkMode }) {
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/groups/${group.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group deleted.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot delete group.')
  });

  const copyInviteCode = () => {
    navigator.clipboard.writeText(group.invite_code || '');
    setCopied(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const subColor = darkMode ? '#94a3b8' : '#64748b';

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl p-6 flex flex-col"
      style={{
        background: darkMode ? 'rgba(13,16,53,0.7)' : 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(99,102,241,0.2)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)' }}>
            {group.icon || '👥'}
          </div>
          <div>
            <h3 className="font-display font-semibold text-base" style={{ color: textColor }}>{group.name}</h3>
            {group.description && (
              <p className="text-xs mt-0.5 truncate max-w-32" style={{ color: subColor }}>{group.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm('Delete this group? This action cannot be undone.')) {
              deleteMutation.mutate();
            }
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
          style={{ }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.08)' }}>
          <p className="text-xl font-bold font-display" style={{ color: '#6366f1' }}>
            {group.member_count || 1}
          </p>
          <p className="text-xs" style={{ color: subColor }}>Members</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.08)' }}>
          <p className="text-xl font-bold font-display" style={{ color: '#10b981' }}>
            ₹{parseFloat(group.total_expenses || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-xs" style={{ color: subColor }}>Total Spent</p>
        </div>
      </div>

      {/* Invite Code */}
      {group.invite_code && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl mb-4"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <code className="text-xs font-mono flex-1 tracking-wider" style={{ color: '#a5b4fc' }}>
            {group.invite_code}
          </code>
          <button onClick={copyInviteCode}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      <Link
        to={`/groups/${group.id}`}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 mt-auto"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4))', border: '1px solid rgba(99,102,241,0.3)' }}
      >
        Open Group <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

export default function Groups() {
  const { user, darkMode } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const subColor = darkMode ? '#94a3b8' : '#64748b';

  const { data, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => api.get('/groups').then(r => r.data.groups || [])
  });

  const joinMutation = useMutation({
    mutationFn: (code) => api.post('/groups/join', { inviteCode: code }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success(res.data.message || 'Joined group!');
      setShowJoinModal(false);
      setInviteCode('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid invite code.')
  });

  const filteredGroups = (data || []).filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-black" style={{ color: textColor }}>My Groups</h1>
            <p className="text-sm mt-1" style={{ color: subColor }}>
              {(data || []).length} group{(data || []).length !== 1 ? 's' : ''} total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc'
              }}
            >
              Join via Code
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-brand shadow-lg hover:opacity-90 transition-all hover:scale-105 shine"
            >
              <Plus className="w-4 h-4" />
              New Group
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: subColor }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm placeholder-slate-500"
            style={{
              background: darkMode ? 'rgba(13,16,53,0.7)' : 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(99,102,241,0.2)',
              color: textColor,
              outline: 'none',
              backdropFilter: 'blur(10px)'
            }}
          />
        </div>

        {/* Groups Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-48">
            <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full spinner" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-display font-semibold mb-2" style={{ color: textColor }}>
              {searchQuery ? 'No groups found' : 'No groups yet'}
            </h3>
            <p className="text-sm mb-6" style={{ color: subColor }}>
              {searchQuery ? 'Try a different search term' : 'Create a group to start splitting expenses'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold gradient-brand hover:opacity-90 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" /> Create First Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 group">
            {filteredGroups.map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="group"
              >
                <GroupCard group={group} darkMode={darkMode} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateGroupModal onClose={() => setShowCreateModal(false)} darkMode={darkMode} />
        )}
      </AnimatePresence>

      {/* Join Group Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-3xl p-8 shadow-2xl"
              style={{
                background: 'rgba(13,16,53,0.97)',
                border: '1px solid rgba(99,102,241,0.3)',
                backdropFilter: 'blur(20px)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-display font-bold text-white mb-2">Join a Group</h2>
              <p className="text-sm text-slate-400 mb-6">Enter the invite code shared by your friend.</p>
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code (e.g., ABC123)"
                className="w-full px-4 py-3.5 rounded-xl text-white placeholder-slate-500 text-sm font-mono tracking-widest mb-4"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  outline: 'none'
                }}
                onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'}
              />
              <div className="flex gap-3">
                <button onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  Cancel
                </button>
                <button
                  onClick={() => joinMutation.mutate(inviteCode)}
                  disabled={!inviteCode.trim() || joinMutation.isPending}
                  className="flex-1 py-3 rounded-xl font-semibold text-white gradient-brand text-sm hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {joinMutation.isPending ? '...' : 'Join Group'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
