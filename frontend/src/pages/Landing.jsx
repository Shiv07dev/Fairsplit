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
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 lg:px-12 py-4 glass border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-brand flex items-center justify-center shadow-lg flex-shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg sm:text-xl">FairSplit</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login"
            className="px-3 sm:px-5 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-colors hover:bg-white/10">
            Sign In
          </Link>
          <Link to="/register"
            className="px-3 sm:px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-brand shadow-lg hover:opacity-90 transition-all hover:scale-105 shine whitespace-nowrap">
            Get Started
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 sm:pt-24 lg:pt-28 pb-16 sm:pb-20 px-4 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >

          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 text-xs sm:text-sm font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/30">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 flex-shrink-0" />
            <span>Made in India 🇮🇳 • Built for Modern Friendships</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-8xl leading-tight mb-4 sm:mb-6 px-2">
            Money Shared.<br />
            <span className="gradient-text">Friendships Protected.</span>
          </h1>

          {/* Emotional Subheading */}
          <p className="text-base sm:text-xl text-indigo-300 font-semibold mb-3 sm:mb-4 px-4">
            Because expenses should never become emotional.
          </p>

          {/* Supporting Line */}
          <p className="text-sm sm:text-lg text-slate-400 max-w-xl sm:max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
            FairSplit helps you split bills transparently, track balances clearly,
            and maintain peace in every group — roommates, trips, or business partners.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link to="/register"
              className="group flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg text-white gradient-brand shadow-2xl hover:opacity-90 transition-all hover:scale-105 glow-brand">
              Start for Free
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login"
              className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg glass hover:bg-white/15 transition-all hover:scale-105">
              Sign In
            </Link>
          </div>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 sm:mt-10 px-4">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
              No credit card needed
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
              Free forever plan
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 flex-shrink-0" />
              Secure &amp; Private
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto text-center mb-10 sm:mb-14">
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4 px-2">
            Everything you need to <span className="gradient-text">stay fair</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-lg max-w-xl mx-auto px-4">
            Packed with powerful tools to make expense splitting effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-5 sm:p-7 rounded-2xl hover:scale-[1.03] transition-all"
            >
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{feature.icon}</div>
              <h3 className="font-display font-semibold text-base sm:text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 py-16 sm:py-24 px-4 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-xl sm:max-w-2xl mx-auto"
        >
          <div className="glass-card p-8 sm:p-12 rounded-3xl bg-indigo-500/10 border border-indigo-400/30">
            <div className="text-4xl sm:text-5xl mb-4">🚀</div>
            <h2 className="font-display font-black text-2xl sm:text-4xl mb-3 sm:mb-4">
              Ready to split smarter?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mb-6 sm:mb-8">
              Join thousands who trust FairSplit to manage shared expenses peacefully.
            </p>
            <Link to="/register"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg text-white gradient-brand shadow-2xl hover:scale-105 transition-all">
              Get Started — It's Free
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 py-6 sm:py-8 text-center text-slate-500 text-xs sm:text-sm px-4">
        © 2026 FairSplit. Made with ❤️ by Shiv.
      </footer>

    </div>
  );
}