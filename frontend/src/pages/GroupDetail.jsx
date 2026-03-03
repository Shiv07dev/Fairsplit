import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, ArrowLeft, Users, DollarSign, CheckCircle2, Clock,
  X, Calculator, Tag, Trash2, Share2, TrendingDown, TrendingUp,
  MessageCircle, Download, Star, ChevronDown, Filter, Crown
} from 'lucide-react';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';

const CATEGORIES = ['Food', 'Rent', 'Travel', 'Shopping', 'Printing', 'Entertainment', 'Utilities', 'Other'];
const CATEGORY_EMOJIS = { Food: '🍕', Rent: '🏠', Travel: '✈️', Shopping: '🛍️', Printing: '🖨️', Entertainment: '🎬', Utilities: '💡', Other: '📦' };

// Built-in Calculator Component
function Calculator2({ value, onChange }) {
  const [display, setDisplay] = useState(value ? String(value) : '0');
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [pendingOperator, setPendingOperator] = useState(null);
  const [pending, setPending] = useState(null);

  const handleNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) { setDisplay('0.'); setWaitingForOperand(false); return; }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const handleOperator = (op) => {
    const current = parseFloat(display);
    if (pending !== null && pendingOperator) {
      const result = calculate(pending, current, pendingOperator);
      setDisplay(String(result));
      setPending(result);
    } else {
      setPending(current);
    }
    setPendingOperator(op);
    setWaitingForOperand(true);
  };

  const calculate = (a, b, op) => {
    switch (op) {
      case '+': return Math.round((a + b) * 100) / 100;
      case '-': return Math.round((a - b) * 100) / 100;
      case '×': return Math.round((a * b) * 100) / 100;
      case '÷': return b !== 0 ? Math.round((a / b) * 100) / 100 : 0;
    }
  };

  const handleEquals = () => {
    if (pending !== null && pendingOperator) {
      const result = calculate(pending, parseFloat(display), pendingOperator);
      setDisplay(String(result));
      onChange(result);
      setPending(null);
      setPendingOperator(null);
      setWaitingForOperand(false);
    } else {
      onChange(parseFloat(display));
    }
  };

  const handleClear = () => { setDisplay('0'); setPending(null); setPendingOperator(null); setWaitingForOperand(false); };
  const handleBackspace = () => { if (display.length > 1) setDisplay(display.slice(0, -1)); else setDisplay('0'); };

  const btnStyle = (color = 'default') => ({
    padding: '12px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.1s',
    border: 'none',
    ...(color === 'operator' ? { background: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }
      : color === 'equals' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }
      : color === 'special' ? { background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }
      : { background: 'rgba(255,255,255,0.08)', color: '#e2e8f0' })
  });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="p-4 text-right">
        <div className="text-3xl font-mono font-bold text-white">{display}</div>
        {pendingOperator && <div className="text-sm text-slate-400">{pending} {pendingOperator}</div>}
      </div>
      <div className="grid grid-cols-4 gap-2 p-3">
        {[
          ['C', 'clear'], ['⌫', 'backspace'], ['÷', 'operator'], ['×', 'operator'],
          ['7', 'num'], ['8', 'num'], ['9', 'num'], ['-', 'operator'],
          ['4', 'num'], ['5', 'num'], ['6', 'num'], ['+', 'operator'],
          ['1', 'num'], ['2', 'num'], ['3', 'num'], ['=', 'equals'],
          ['0', 'num'], ['.', 'decimal'], ['', 'empty'], ['', 'empty'],
        ].map(([key, type], i) => (
          key ? (
            <button
              key={i}
              type="button"
              style={btnStyle(type === 'num' || type === 'decimal' ? 'default' : type === 'operator' || type === 'equals' ? type : 'special')}
              onClick={() => {
                if (type === 'num') handleNumber(key);
                else if (type === 'decimal') handleDecimal();
                else if (type === 'operator') handleOperator(key);
                else if (type === 'equals') handleEquals();
                else if (type === 'clear') handleClear();
                else if (type === 'backspace') handleBackspace();
              }}
            >{key}</button>
          ) : <div key={i} />
        ))}
      </div>
    </div>
  );
}

// Add Expense Modal
function AddExpenseModal({ groupId, members, onClose, currentUserId }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [splitType, setSplitType] = useState('equal');
  const [note, setNote] = useState('');
  const [showCalc, setShowCalc] = useState(false);
  const [customSplits, setCustomSplits] = useState(() =>
    members.reduce((acc, m) => ({ ...acc, [m.id]: '' }), {})
  );

  const addMutation = useMutation({
    mutationFn: (data) => api.post('/expenses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
      toast.success('Expense added! 💰');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add expense.')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) {
      return toast.error('Title and a valid amount are required.');
    }

    let splits = null;
    if (splitType === 'custom') {
      splits = Object.entries(customSplits)
        .filter(([, v]) => parseFloat(v) > 0)
        .map(([userId, share]) => ({ user_id: parseInt(userId), share_amount: parseFloat(share) }));

      const totalCustom = splits.reduce((s, x) => s + x.share_amount, 0);
      if (Math.abs(totalCustom - parseFloat(amount)) > 0.01) {
        return toast.error(`Custom splits must add up to ₹${parseFloat(amount).toFixed(2)}`);
      }
    }

    addMutation.mutate({
      group_id: groupId,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      paid_by: paidBy,
      split_type: splitType,
      note: note.trim() || null,
      splits: splitType === 'custom' ? splits : null
    });
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    outline: 'none',
    color: '#e2e8f0'
  };

  const equalShare = amount && members.length ? (parseFloat(amount) / members.length).toFixed(2) : '0.00';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: 'rgba(13,16,53,0.97)', border: '1px solid rgba(99,102,241,0.3)', backdropFilter: 'blur(20px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-white">Add Expense</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">What's it for? *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder='e.g., "Pizza Party" or "Electricity Bill"'
                className="w-full px-4 py-3.5 rounded-xl text-sm placeholder-slate-500"
                style={inputStyle}
                onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'}
              />
            </div>

            {/* Amount with Calculator */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount (₹) *</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3.5 rounded-xl text-sm placeholder-slate-500 text-lg font-bold"
                    style={{ ...inputStyle, color: '#a5f3fc' }}
                    onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowCalc(!showCalc)}
                  className="px-3.5 rounded-xl transition-all hover:scale-105"
                  style={{
                    background: showCalc ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: showCalc ? '#a5b4fc' : '#94a3b8'
                  }}
                  title="Open Calculator"
                >
                  <Calculator className="w-4.5 h-4.5" />
                </button>
              </div>
              <AnimatePresence>
                {showCalc && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2"
                  >
                    <Calculator2 value={parseFloat(amount || 0)} onChange={(val) => { setAmount(String(val)); setShowCalc(false); }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: category === cat ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.05)',
                      border: category === cat ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      color: category === cat ? '#a5b4fc' : '#94a3b8',
                      transform: category === cat ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    {CATEGORY_EMOJIS[cat]} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Paid By */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Paid by</label>
              <select
                value={paidBy}
                onChange={e => setPaidBy(parseInt(e.target.value))}
                className="w-full px-4 py-3.5 rounded-xl text-sm"
                style={{ ...inputStyle, appearance: 'none' }}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id} style={{ background: '#0d1035' }}>
                    {m.name} {m.id === currentUserId ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Split Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">How to split?</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'equal', label: '⚖️ Equally', desc: `₹${equalShare} each` },
                  { key: 'custom', label: '✏️ Custom', desc: 'Set exact amounts' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setSplitType(opt.key)}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      background: splitType === opt.key ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                      border: splitType === opt.key ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <div className="text-sm font-medium text-white">{opt.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Splits */}
            {splitType === 'custom' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-2 overflow-hidden"
              >
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="flex-1 text-sm text-slate-300">{m.name}</span>
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₹</span>
                      <input
                        type="number"
                        value={customSplits[m.id]}
                        onChange={e => setCustomSplits(prev => ({ ...prev, [m.id]: e.target.value }))}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-6 pr-2 py-2 rounded-lg text-sm text-right text-white"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                      />
                    </div>
                  </div>
                ))}
                <div className="text-xs text-right"
                  style={{ color: Math.abs(Object.values(customSplits).reduce((s, v) => s + parseFloat(v || 0), 0) - parseFloat(amount || 0)) < 0.01 ? '#10b981' : '#ef4444' }}>
                  Total: ₹{Object.values(customSplits).reduce((s, v) => s + parseFloat(v || 0), 0).toFixed(2)} / ₹{parseFloat(amount || 0).toFixed(2)}
                </div>
              </motion.div>
            )}

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-4 py-3 rounded-xl text-sm placeholder-slate-500"
                style={inputStyle}
                onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'}
              />
            </div>

            <button
              type="submit"
              disabled={addMutation.isPending}
              className="w-full py-3.5 rounded-xl font-semibold text-white gradient-brand shadow-lg hover:opacity-90 transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {addMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" /> : 'Add Expense 💰'}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Settle Up Modal
function SettleUpModal({ groupId, balances, onClose }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const myDebts = balances.filter(b => b.from.id === user.id);

  const settleMutation = useMutation({
    mutationFn: (data) => api.post('/settlements', data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['group-balances', groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-settlements', groupId] });
      toast.success(res.data.message || 'Settled up! ✅');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Settlement failed.')
  });

  const handleSettle = () => {
    if (!selectedDebt || !amount || parseFloat(amount) <= 0) {
      return toast.error('Select a debt and enter an amount.');
    }
    settleMutation.mutate({
      group_id: groupId,
      paid_to: selectedDebt.to.id,
      amount: parseFloat(amount),
      note: note.trim() || null
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl"
        style={{ background: 'rgba(13,16,53,0.97)', border: '1px solid rgba(16,185,129,0.3)', backdropFilter: 'blur(20px)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-white">Settle Up 💚</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {myDebts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">You're all settled up! 🎉</h3>
            <p className="text-sm text-slate-400">You don't owe anyone in this group.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Who are you paying?</label>
              <div className="space-y-2">
                {myDebts.map((debt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setSelectedDebt(debt); setAmount(String(debt.amount)); }}
                    className="w-full flex items-center justify-between p-4 rounded-xl transition-all"
                    style={{
                      background: selectedDebt?.to.id === debt.to.id ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                      border: selectedDebt?.to.id === debt.to.id ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img src={debt.to.avatar} alt={debt.to.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-white">{debt.to.name}</p>
                        <p className="text-xs text-slate-400">You owe them</p>
                      </div>
                    </div>
                    <span className="text-red-400 font-bold">₹{debt.amount.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedDebt && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Amount to pay</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      max={selectedDebt.amount}
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3.5 rounded-xl text-white text-sm"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(16,185,129,0.3)', outline: 'none' }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Max: ₹{selectedDebt.amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Note (optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="e.g., Cash payment"
                    className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder-slate-500"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                  />
                </div>
              </>
            )}

            <button
              onClick={handleSettle}
              disabled={!selectedDebt || !amount || settleMutation.isPending}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.01] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', boxShadow: '0 8px 30px rgba(16,185,129,0.3)' }}
            >
              {settleMutation.isPending ? '...' : 'Confirm Settlement ✅'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, darkMode } = useAuthStore();
  const queryClient = useQueryClient();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const subColor = darkMode ? '#94a3b8' : '#64748b';
  const cardBg = darkMode ? 'rgba(13,16,53,0.7)' : 'rgba(255,255,255,0.85)';
  const cardBorder = darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)';

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => api.get(`/groups/${id}`).then(r => r.data.group)
  });

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['group-expenses', id, categoryFilter],
    queryFn: () => api.get(`/expenses/group/${id}?category=${categoryFilter}`).then(r => r.data)
  });

  const { data: balancesData } = useQuery({
    queryKey: ['group-balances', id],
    queryFn: () => api.get(`/expenses/group/${id}/balances`).then(r => r.data)
  });

  const { data: settlementsData } = useQuery({
    queryKey: ['group-settlements', id],
    queryFn: () => api.get(`/settlements/group/${id}`).then(r => r.data.settlements || [])
  });

  const { data: fairnessData } = useQuery({
    queryKey: ['fairness', id],
    queryFn: () => api.get(`/settlements/group/${id}/fairness`).then(r => r.data)
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expId) => api.delete(`/expenses/${expId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-expenses', id] });
      queryClient.invalidateQueries({ queryKey: ['group-balances', id] });
      toast.success('Expense deleted.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot delete this expense.')
  });

  const generateWhatsAppMessage = () => {
    const balances = balancesData?.balances || [];
    let msg = `💰 *${group?.name} - Expense Summary*\n\n`;
    if (balances.length === 0) {
      msg += '✅ Everyone is settled up!\n';
    } else {
      balances.forEach(b => {
        msg += `• ${b.from.name} owes ${b.to.name} ₹${b.amount.toFixed(2)}\n`;
      });
    }
    msg += `\n_Generated by FairSplit 🚀_`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`FairSplit - ${group?.name}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy')}`, 20, 35);
    doc.setFontSize(14);
    doc.text('Balances:', 20, 55);
    let y = 65;
    (balancesData?.balances || []).forEach(b => {
      doc.setFontSize(12);
      doc.text(`${b.from.name} owes ${b.to.name}: ₹${b.amount.toFixed(2)}`, 20, y);
      y += 10;
    });
    y += 10;
    doc.setFontSize(14);
    doc.text('Recent Expenses:', 20, y);
    y += 10;
    (expensesData?.expenses || []).slice(0, 10).forEach(e => {
      doc.setFontSize(11);
      doc.text(`${e.title} - ₹${e.amount} (${e.paid_by_name}) - ${format(parseISO(e.created_at), 'dd MMM')}`, 20, y);
      y += 8;
    });
    doc.save(`fairsplit-${group?.name}-${format(new Date(), 'MMM-yyyy')}.pdf`);
    toast.success('PDF downloaded! 📄');
  };

  if (groupLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full spinner" />
        </div>
      </Layout>
    );
  }

  if (!group) {
    return <Layout><div className="text-center py-20 text-red-400">Group not found.</div></Layout>;
  }

  const members = group.members || [];
  const expenses = expensesData?.expenses || [];
  const balances = balancesData?.balances || [];
  const myBalance = balances.filter(b => b.from.id === user.id);
  const owedToMe = balances.filter(b => b.to.id === user.id);
  const fairScore = fairnessData?.score || 100;

  const fairColor = fairScore >= 80 ? '#10b981' : fairScore >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-sm mb-5 hover:opacity-80 transition-opacity"
            style={{ color: subColor }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Groups
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                {group.icon || '👥'}
              </div>
              <div>
                <h1 className="text-2xl font-display font-black" style={{ color: textColor }}>{group.name}</h1>
                <p className="text-sm" style={{ color: subColor }}>
                  {members.length} members · {expenses.length} expenses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={generateWhatsAppMessage}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)', color: '#25D466' }}>
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button onClick={downloadPDF}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa' }}>
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              {myBalance.length > 0 && (
                <button
                  onClick={() => setShowSettleUp(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
                  <CheckCircle2 className="w-4 h-4" /> Settle Up
                </button>
              )}
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-brand shadow-lg hover:opacity-90 transition-all hover:scale-105">
                <Plus className="w-4 h-4" /> Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Fairness Score */}
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-4 translate-x-4"
              style={{ background: fairColor }} />
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4" style={{ color: fairColor }} />
              <span className="text-sm font-medium" style={{ color: subColor }}>Fairness Score</span>
            </div>
            <div className="text-5xl font-black font-display mb-2" style={{ color: fairColor }}>
              {fairScore}%
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fairScore}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: fairColor }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: subColor }}>
              {fairScore >= 80 ? '✨ Excellent balance!' : fairScore >= 60 ? '⚠️ Could be better' : '❗ Action needed'}
            </p>
          </div>

          {/* You Owe */}
          <div className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid rgba(239,68,68,0.2)`, backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium" style={{ color: subColor }}>You Owe</span>
            </div>
            {myBalance.length === 0 ? (
              <div>
                <div className="text-3xl font-black font-display text-green-400 mb-1">₹0.00</div>
                <p className="text-xs text-green-400">🎉 All clear!</p>
              </div>
            ) : myBalance.map((b, i) => (
              <div key={i} className="mb-2">
                <div className="text-2xl font-black font-display text-red-400">₹{b.amount.toFixed(2)}</div>
                <p className="text-xs" style={{ color: subColor }}>to {b.to.name}</p>
              </div>
            ))}
          </div>

          {/* Owed to You */}
          <div className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid rgba(16,185,129,0.2)`, backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium" style={{ color: subColor }}>Owed to You</span>
            </div>
            {owedToMe.length === 0 ? (
              <div>
                <div className="text-3xl font-black font-display" style={{ color: subColor }}>₹0.00</div>
                <p className="text-xs" style={{ color: subColor }}>Nobody owes you</p>
              </div>
            ) : owedToMe.map((b, i) => (
              <div key={i} className="mb-2">
                <div className="text-2xl font-black font-display text-green-400">₹{b.amount.toFixed(2)}</div>
                <p className="text-xs" style={{ color: subColor }}>from {b.from.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Members Strip */}
        <div className="rounded-2xl p-5 flex items-center gap-3 flex-wrap"
          style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
          <span className="text-sm font-medium" style={{ color: subColor }}>Members:</span>
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
              <span style={{ color: textColor }}>{m.name}</span>
              {m.role === 'admin' && <Crown className="w-3 h-3 text-yellow-400" />}
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl w-fit"
          style={{ background: darkMode ? 'rgba(13,16,53,0.7)' : 'rgba(255,255,255,0.7)', border: `1px solid ${cardBorder}` }}>
          {[
            { key: 'expenses', label: '💳 Expenses' },
            { key: 'balances', label: '⚖️ Balances' },
            { key: 'timeline', label: '📅 Timeline' },
            { key: 'settlements', label: '✅ Settlements' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.key
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5))'
                  : 'transparent',
                color: activeTab === tab.key ? '#fff' : subColor,
                border: activeTab === tab.key ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* EXPENSES TAB */}
          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Category Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4" style={{ color: subColor }} />
                {['all', ...CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: categoryFilter === cat ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                      border: categoryFilter === cat ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      color: categoryFilter === cat ? '#a5b4fc' : subColor
                    }}
                  >
                    {cat === 'all' ? '🔍 All' : `${CATEGORY_EMOJIS[cat]} ${cat}`}
                  </button>
                ))}
              </div>

              {expensesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full spinner" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-16 rounded-2xl"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <div className="text-5xl mb-4">💸</div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>No expenses yet</h3>
                  <p className="text-sm mb-5" style={{ color: subColor }}>Start by adding your first expense</p>
                  <button onClick={() => setShowAddExpense(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-brand hover:opacity-90 transition-all">
                    <Plus className="w-4 h-4" /> Add Expense
                  </button>
                </div>
              ) : (
                expenses.map((expense, i) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ scale: 1.005, x: 4 }}
                    className="rounded-2xl p-5 flex items-start gap-4"
                    style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.1)' }}>
                      {CATEGORY_EMOJIS[expense.category] || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold" style={{ color: textColor }}>{expense.title}</h4>
                          <p className="text-xs mt-0.5" style={{ color: subColor }}>
                            Paid by {expense.paid_by_name} · {expense.category}
                            {expense.note && ` · "${expense.note}"`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold" style={{ color: '#a5b4fc' }}>₹{parseFloat(expense.amount).toFixed(2)}</p>
                          <p className="text-xs" style={{ color: subColor }}>
                            {format(parseISO(expense.created_at), 'dd MMM')}
                          </p>
                        </div>
                      </div>
                      {/* Individual splits */}
                      {expense.splits && expense.splits.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {expense.splits.map(split => (
                            <span key={split.id} className="text-xs px-2 py-0.5 rounded-lg"
                              style={{ background: 'rgba(99,102,241,0.1)', color: split.user_id === user.id ? '#a5b4fc' : subColor }}>
                              {split.name}: ₹{parseFloat(split.share_amount).toFixed(2)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {expense.paid_by === user.id && (
                      <button
                        onClick={() => {
                          if (confirm('Delete this expense?')) deleteExpenseMutation.mutate(expense.id);
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/40 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* BALANCES TAB */}
          {activeTab === 'balances' && (
            <motion.div
              key="balances"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {balances.length === 0 ? (
                <div className="text-center py-16 rounded-2xl"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-1" style={{ color: textColor }}>Everyone is settled up! 🎉</h3>
                  <p className="text-sm" style={{ color: subColor }}>No outstanding balances in this group</p>
                </div>
              ) : (
                balances.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl p-5 flex items-center gap-4"
                    style={{
                      background: cardBg,
                      border: `1px solid ${b.from.id === user.id || b.to.id === user.id ? 'rgba(99,102,241,0.3)' : cardBorder}`,
                      backdropFilter: 'blur(16px)'
                    }}
                  >
                    <img src={b.from.avatar} alt={b.from.name} className="w-11 h-11 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-sm" style={{ color: textColor }}>
                        <span style={{ color: '#f87171' }}>{b.from.name}</span>
                        {' owes '}
                        <span style={{ color: '#4ade80' }}>{b.to.name}</span>
                      </p>
                      {b.from.id === user.id && (
                        <p className="text-xs text-indigo-400 mt-0.5">This is your debt</p>
                      )}
                    </div>
                    <img src={b.to.avatar} alt={b.to.name} className="w-11 h-11 rounded-xl object-cover" />
                    <div className="text-right">
                      <span className="text-lg font-black font-display text-red-400">₹{b.amount.toFixed(2)}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative pl-12"
            >
              <div className="absolute left-5 top-0 bottom-0 w-0.5"
                style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.6), rgba(139,92,246,0.3), transparent)' }} />

              {expenses.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: subColor }} />
                  <p style={{ color: subColor }}>No expenses to show in timeline</p>
                </div>
              ) : (
                expenses.map((expense, i) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative mb-6"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-8 top-3 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                      style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        boxShadow: '0 0 10px rgba(99,102,241,0.4)'
                      }}>
                      {CATEGORY_EMOJIS[expense.category]?.slice(0, 1) || '•'}
                    </div>

                    <div className="rounded-2xl p-4"
                      style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm" style={{ color: textColor }}>{expense.title}</span>
                        <span className="font-bold text-sm" style={{ color: '#a5b4fc' }}>₹{parseFloat(expense.amount).toFixed(2)}</span>
                      </div>
                      <p className="text-xs" style={{ color: subColor }}>
                        {expense.paid_by_name} paid · {CATEGORY_EMOJIS[expense.category]} {expense.category} · {format(parseISO(expense.created_at), 'dd MMM yyyy, h:mm a')}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* SETTLEMENTS TAB */}
          {activeTab === 'settlements' && (
            <motion.div
              key="settlements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {(settlementsData || []).length === 0 ? (
                <div className="text-center py-16 rounded-2xl"
                  style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                  <CheckCircle2 className="w-12 h-12 text-green-400/50 mx-auto mb-3" />
                  <p style={{ color: subColor }}>No settlements recorded yet</p>
                </div>
              ) : (
                (settlementsData || []).map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-2xl p-5 flex items-center gap-4"
                    style={{ background: cardBg, border: '1px solid rgba(16,185,129,0.2)', backdropFilter: 'blur(16px)' }}
                  >
                    <img src={s.paid_by_avatar} alt={s.paid_by_name} className="w-10 h-10 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: textColor }}>
                        <span style={{ color: '#4ade80' }}>{s.paid_by_name}</span>
                        {' paid '}
                        <span style={{ color: '#60a5fa' }}>{s.paid_to_name}</span>
                      </p>
                      <p className="text-xs" style={{ color: subColor }}>
                        {format(parseISO(s.created_at), 'dd MMM yyyy')}
                        {s.note && ` · "${s.note}"`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black font-display text-green-400">₹{parseFloat(s.amount).toFixed(2)}</span>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">Settled</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddExpense && (
          <AddExpenseModal
            groupId={id}
            members={members}
            currentUserId={user.id}
            onClose={() => setShowAddExpense(false)}
          />
        )}
        {showSettleUp && (
          <SettleUpModal
            groupId={id}
            balances={balances}
            onClose={() => setShowSettleUp(false)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
