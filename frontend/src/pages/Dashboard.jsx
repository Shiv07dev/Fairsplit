import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Wallet, Users, ArrowRight,
  Clock, BarChart2, PieChart, Zap, AlertCircle
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import Layout from '../components/Layout';
import { format, parseISO } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const CATEGORY_COLORS = {
  Food: '#f59e0b', Rent: '#6366f1', Travel: '#3b82f6',
  Shopping: '#ec4899', Printing: '#14b8a6', Entertainment: '#8b5cf6',
  Utilities: '#10b981', Other: '#6b7280'
};

const CATEGORY_EMOJIS = {
  Food: '🍕', Rent: '🏠', Travel: '✈️', Shopping: '🛍️',
  Printing: '🖨️', Entertainment: '🎬', Utilities: '💡', Other: '📦'
};

function StatCard({ icon: Icon, label, amount, subtitle, color, gradient, darkMode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: darkMode ? 'rgba(13,16,53,0.7)' : 'rgba(255,255,255,0.85)',
        border: `1px solid ${color}30`,
        backdropFilter: 'blur(16px)'
      }}
    >
      {/* Background gradient blob */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-8 translate-x-8"
        style={{ background: gradient }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 rounded-xl" style={{ background: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
        <p className="text-xs font-medium mb-1.5" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{label}</p>
        <p className="text-3xl font-black font-display mb-1" style={{ color }}>
          ₹{Math.abs(parseFloat(amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {subtitle && (
          <p className="text-xs opacity-60" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, darkMode } = useAuthStore();
  const [activeChart, setActiveChart] = useState('bar');

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/expenses/dashboard').then(r => r.data.dashboard),
    refetchInterval: 60000,
  });

  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const subTextColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const cardBg = darkMode ? 'rgba(13,16,53,0.7)' : 'rgba(255,255,255,0.85)';
  const cardBorder = darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)';

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(13,16,53,0.95)' : 'rgba(255,255,255,0.95)',
        titleColor: textColor,
        bodyColor: subTextColor,
        borderColor: 'rgba(99,102,241,0.3)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: subTextColor, font: { size: 11 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: subTextColor, font: { size: 11 }, callback: (v) => `₹${v}` }
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full spinner mx-auto mb-4" />
            <p style={{ color: subTextColor }} className="text-sm">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const monthlyLabels = (data?.monthlyData || []).map(d => {
    try {
      return format(parseISO(d.month + '-01'), 'MMM');
    } catch { return d.month; }
  });
  const monthlyAmounts = (data?.monthlyData || []).map(d => parseFloat(d.amount));

  const categoryLabels = (data?.categoryData || []).map(d => d.category);
  const categoryAmounts = (data?.categoryData || []).map(d => parseFloat(d.amount));
  const categoryColors = categoryLabels.map(c => CATEGORY_COLORS[c] || '#6b7280');

  const barData = {
    labels: monthlyLabels.length ? monthlyLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Your Share',
      data: monthlyAmounts.length ? monthlyAmounts : [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(99,102,241,0.9)',
      borderRadius: 10,
      borderSkipped: false,
      hoverBackgroundColor: '#8b5cf6'
    }]
  };

  const doughnutData = {
    labels: categoryLabels.length ? categoryLabels : ['No expenses'],
    datasets: [{
      data: categoryAmounts.length ? categoryAmounts : [1],
      backgroundColor: categoryColors.length ? categoryColors : ['rgba(99,102,241,0.3)'],
      borderColor: 'transparent',
      borderWidth: 0,
      hoverOffset: 8
    }]
  };

  const networthColor = (data?.youAreOwed || 0) >= (data?.youOwe || 0) ? '#10b981' : '#ef4444';

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-display font-black mb-1"
              style={{ color: textColor }}
            >
              Hey, {user?.name?.split(' ')[0]}! 👋
            </motion.h1>
            <p style={{ color: subTextColor }} className="text-sm">Here's your financial overview</p>
          </div>
          <Link
            to="/groups"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white gradient-brand hover:opacity-90 transition-all hover:scale-105 shadow-lg shine"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">View Groups</span>
          </Link>
        </div>

        {/* Balance Alert */}
        {data && parseFloat(data.youOwe || 0) > 500 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-semibold text-sm">Auto Settle Suggestion</p>
              <p className="text-yellow-300/70 text-xs mt-0.5">
                You owe more than ₹500. Consider settling up to avoid imbalance and maintain your Fairness Score.
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon={TrendingUp}
            label="You Are Owed"
            amount={data?.youAreOwed || 0}
            subtitle="Others owe you"
            color="#10b981"
            gradient="linear-gradient(135deg, #10b981, #14b8a6)"
            darkMode={darkMode}
          />
          <StatCard
            icon={TrendingDown}
            label="You Owe"
            amount={data?.youOwe || 0}
            subtitle="Your pending dues"
            color="#ef4444"
            gradient="linear-gradient(135deg, #ef4444, #ec4899)"
            darkMode={darkMode}
          />
          <StatCard
            icon={Wallet}
            label="Net Balance"
            amount={Math.abs((data?.youAreOwed || 0) - (data?.youOwe || 0))}
            subtitle={(data?.youAreOwed || 0) >= (data?.youOwe || 0) ? 'Net positive' : 'Net negative'}
            color={networthColor}
            gradient={`linear-gradient(135deg, ${networthColor}, ${networthColor}88)`}
            darkMode={darkMode}
          />
          <StatCard
            icon={Users}
            label="Active Groups"
            amount={(data?.groups?.length || 0) * 100}
            subtitle={`${data?.groups?.length || 0} groups`}
            color="#6366f1"
            gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
            darkMode={darkMode}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Bar Chart */}
          <div className="lg:col-span-2 rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-semibold" style={{ color: textColor }}>Monthly Expenses</h3>
                <p className="text-xs mt-0.5" style={{ color: subTextColor }}>Your share over last 6 months</p>
              </div>
              <BarChart2 className="w-5 h-5" style={{ color: '#6366f1' }} />
            </div>
            <div style={{ height: '200px' }}>
              <Bar data={barData} options={chartDefaults} />
            </div>
          </div>

          {/* Doughnut Chart */}
          <div className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-semibold" style={{ color: textColor }}>By Category</h3>
                <p className="text-xs mt-0.5" style={{ color: subTextColor }}>This month's breakdown</p>
              </div>
              <PieChart className="w-5 h-5" style={{ color: '#8b5cf6' }} />
            </div>
            <div style={{ height: '160px' }} className="flex items-center justify-center">
              <Doughnut data={doughnutData} options={{
                ...chartDefaults,
                cutout: '65%',
                plugins: {
                  ...chartDefaults.plugins,
                  legend: { display: false }
                }
              }} />
            </div>
            {/* Legend */}
            <div className="mt-4 space-y-2">
              {categoryLabels.slice(0, 4).map((cat, i) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[i] }} />
                    <span className="text-xs" style={{ color: subTextColor }}>
                      {CATEGORY_EMOJIS[cat] || '📦'} {cat}
                    </span>
                  </div>
                  <span className="text-xs font-medium" style={{ color: textColor }}>
                    ₹{parseFloat(categoryAmounts[i] || 0).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Groups + Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Groups */}
          <div className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold" style={{ color: textColor }}>My Groups</h3>
              <Link to="/groups" className="text-indigo-400 text-xs hover:text-indigo-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {(data?.groups || []).length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: subTextColor }} />
                <p className="text-sm" style={{ color: subTextColor }}>No groups yet</p>
                <Link to="/groups" className="text-indigo-400 text-sm mt-2 block hover:text-indigo-300">
                  Create your first group →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {(data?.groups || []).map((group, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    <Link
                      to={`/groups/${group.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-indigo-500/8"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,0.15)' }}>
                        {group.icon || '👥'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: textColor }}>{group.name}</p>
                        <p className="text-xs" style={{ color: subTextColor }}>
                          {group.member_count} members · ₹{parseFloat(group.total_expenses || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-40" style={{ color: subTextColor }} />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(16px)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold" style={{ color: textColor }}>Recent Transactions</h3>
              <Clock className="w-4 h-4 opacity-50" style={{ color: subTextColor }} />
            </div>
            {(data?.recentExpenses || []).length === 0 ? (
              <div className="text-center py-8">
                <Zap className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: subTextColor }} />
                <p className="text-sm" style={{ color: subTextColor }}>No transactions yet</p>
                <p className="text-xs mt-1" style={{ color: subTextColor }}>Add an expense in a group to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(data?.recentExpenses || []).slice(0, 6).map((expense, i) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: `${CATEGORY_COLORS[expense.category] || '#6b7280'}20` }}>
                      {CATEGORY_EMOJIS[expense.category] || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: textColor }}>{expense.title}</p>
                      <p className="text-xs" style={{ color: subTextColor }}>
                        {expense.paid_by_name} · {expense.group_name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: '#ef4444' }}>
                        -₹{parseFloat(expense.your_share || 0).toFixed(2)}
                      </p>
                      <p className="text-xs opacity-50" style={{ color: subTextColor }}>your share</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
