import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Users, BarChart3, Shield, Smartphone, ArrowRight, CheckCircle2, Star, TrendingUp } from 'lucide-react';

const features = [
  { icon: '💸', title: 'Smart Splitting', desc: 'Split bills equally or custom — FairSplit calculates everything instantly.' },
  { icon: '📊', title: 'Visual Analytics', desc: 'Beautiful charts showing monthly spending and who owes what.' },
  { icon: '🎯', title: 'Fairness Score', desc: 'Unique AI-powered score that tracks financial fairness in your group.' },
  { icon: '💬', title: 'WhatsApp Share', desc: 'One-tap share expense summaries directly to WhatsApp.' },
  { icon: '📄', title: 'PDF Reports', desc: 'Download monthly expense reports for your records.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'End-to-end data security with JWT authentication.' },
];

const stats = [
  { value: '10K+', label: 'Users' },
  { value: '₹50L+', label: 'Managed' },
  { value: '98%', label: 'Satisfaction' },
  { value: '0 Fights', label: 'Guaranteed' },
];

export default function Landing() {
  return (
    <div className="min-h-screen animated-gradient text-white overflow-x-hidden">
      {/* Decorative orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
        <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      {/* Grid lines background */}
      <div className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-5 glass"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl">FairSplit</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"
            className="px-5 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-colors hover:bg-white/10">
            Sign In
          </Link>
          <Link to="/register"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-brand shadow-lg hover:opacity-90 transition-all hover:scale-105 shine">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-20 px-6 sm:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium text-indigo-300"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <Star className="w-4 h-4 text-yellow-400" />
            Better than Splitwise — Made in India 🇮🇳
          </div>

          <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl leading-tight mb-6">
            Split Bills,<br />
            <span className="gradient-text">Not Friendships</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The smartest way to manage shared expenses with friends, roommates, and co-travelers.
            Track balances, settle debts, and maintain harmony — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg text-white gradient-brand shadow-2xl hover:opacity-90 transition-all hover:scale-105 shine glow-brand">
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg glass hover:bg-white/15 transition-all hover:scale-105">
              Sign In
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              No credit card needed
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Free forever plan
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Works offline
            </div>
          </div>
        </motion.div>

        {/* Hero Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
          className="mt-20 max-w-5xl mx-auto relative"
        >
          <div className="absolute inset-0 gradient-brand rounded-3xl blur-3xl opacity-20 scale-105" />
          <div className="relative glass-card p-6 sm:p-8 rounded-3xl shadow-2xl"
            style={{
              background: 'rgba(13,16,53,0.7)',
              border: '1px solid rgba(99,102,241,0.3)'
            }}>
            {/* Mock Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'You are owed', amount: '₹2,450', color: '#10b981', icon: '⬆️' },
                { label: 'You owe', amount: '₹800', color: '#ef4444', icon: '⬇️' },
                { label: 'Net Balance', amount: '+₹1,650', color: '#6366f1', icon: '✨' },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl p-4 text-left"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs text-slate-400 mb-1">{stat.icon} {stat.label}</p>
                  <p className="text-2xl font-bold font-display" style={{ color: stat.color }}>{stat.amount}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs text-slate-400 mb-3">Monthly Expenses</p>
                <div className="flex items-end gap-1.5 h-16">
                  {[40, 65, 45, 80, 55, 90].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        background: i === 5 ? 'linear-gradient(180deg, #6366f1, #8b5cf6)' : 'rgba(99,102,241,0.3)'
                      }} />
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs text-slate-400 mb-3">Fairness Score</p>
                <div className="flex items-center justify-center h-16">
                  <div className="relative">
                    <div className="text-3xl font-black font-display gradient-text">85%</div>
                    <div className="text-xs text-center text-green-400">Excellent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 px-6 sm:px-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.5 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-black font-display gradient-text">{stat.value}</div>
              <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="font-display font-black text-4xl sm:text-5xl mb-4">
              Everything you need to <span className="gradient-text">stay fair</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Packed with features that make expense splitting effortless and transparent.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-7 hover:scale-[1.02] transition-all duration-300 group cursor-default"
                style={{ background: 'rgba(13,16,53,0.5)', border: '1px solid rgba(99,102,241,0.15)' }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-6 sm:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative glass-card p-12 rounded-3xl"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="font-display font-black text-4xl mb-4">Ready to stop arguing about money?</h2>
            <p className="text-slate-400 mb-8">Join thousands of friends who split fair with FairSplit.</p>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg text-white gradient-brand shadow-2xl hover:scale-105 transition-all glow-brand shine">
              Get Started — It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t py-8 px-6 text-center text-slate-500 text-sm"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <p>© 2024 FairSplit. Made with ❤️ for friends who share everything except debts.</p>
      </footer>
    </div>
  );
}
