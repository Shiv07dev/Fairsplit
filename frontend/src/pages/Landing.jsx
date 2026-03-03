import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Star
} from 'lucide-react';

const features = [
  { icon: '💸', title: 'Smart Splitting', desc: 'Split bills equally or custom — FairSplit calculates everything instantly.' },
  { icon: '📊', title: 'Visual Analytics', desc: 'Beautiful charts showing monthly spending and who owes what.' },
  { icon: '🎯', title: 'Fairness Score', desc: 'Unique AI-powered score that tracks financial fairness in your group.' },
  { icon: '💬', title: 'WhatsApp Share', desc: 'One-tap share expense summaries directly to WhatsApp.' },
  { icon: '📄', title: 'PDF Reports', desc: 'Download monthly expense reports for your records.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'End-to-end data security with JWT authentication.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen animated-gradient text-white overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-12 py-5 glass border-b border-white/10">
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

      {/* HERO SECTION */}
      <section className="relative z-10 pt-28 pb-24 px-6 sm:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/30">
            <Star className="w-4 h-4 text-yellow-400" />
            Made in India 🇮🇳 • Built for Modern Friendships
          </div>

          {/* 🔥 NEW POWERFUL SLOGAN */}
          <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl leading-tight mb-6">
            Money Shared.<br />
            <span className="gradient-text">Friendships Protected.</span>
          </h1>

          {/* Emotional Subheading */}
          <p className="text-xl sm:text-2xl text-indigo-300 font-semibold mb-4">
            Because expenses should never become emotional.
          </p>

          {/* Supporting Line */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            FairSplit helps you split bills transparently, track balances clearly,
            and maintain peace in every group — roommates, trips, or business partners.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg text-white gradient-brand shadow-2xl hover:opacity-90 transition-all hover:scale-105 glow-brand">
              Start for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg glass hover:bg-white/15 transition-all hover:scale-105">
              Sign In
            </Link>
          </div>

          {/* Trust Points */}
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
              Secure & Private
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 py-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto text-center mb-14">
          <h2 className="font-display font-black text-4xl sm:text-5xl mb-4">
            Everything you need to <span className="gradient-text">stay fair</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Packed with powerful tools to make expense splitting effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-7 rounded-2xl hover:scale-[1.03] transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="glass-card p-12 rounded-3xl bg-indigo-500/10 border border-indigo-400/30">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="font-display font-black text-4xl mb-4">
              Ready to split smarter?
            </h2>
            <p className="text-slate-400 mb-8">
              Join thousands who trust FairSplit to manage shared expenses peacefully.
            </p>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg text-white gradient-brand shadow-2xl hover:scale-105 transition-all">
              Get Started — It's Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center text-slate-500 text-sm">
        © 2026 FairSplit. Made with ❤️ by Shiv.
      </footer>

    </div>
  );
}