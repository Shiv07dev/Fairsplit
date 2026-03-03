import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const passwordStrength = (password) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score;
};

const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#10b981'];

export default function Register() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const strength = passwordStrength(password);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const registerMutation = useMutation({
    mutationFn: (data) => api.post('/auth/register', data),
    onSuccess: (res) => {
      const { user, token, message } = res.data;
      setAuth(user, token);
      toast.success(message || 'Welcome to FairSplit! 🎉');
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  });

  const onSubmit = (data) => {
    const { confirmPassword, ...rest } = data;
    registerMutation.mutate(rest);
  };

  const perks = [
    'Free groups & unlimited expenses',
    'Smart balance calculation',
    'WhatsApp expense sharing',
    'PDF monthly reports'
  ];

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-15"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
      >
        {/* Left side - branding */}
        <div className="hidden lg:block text-white">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-10">
            <div className="w-11 h-11 rounded-2xl gradient-brand flex items-center justify-center shadow-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-black text-2xl">FairSplit</span>
          </Link>

          <h1 className="font-display font-black text-4xl leading-tight mb-4">
            Join thousands<br />
            splitting <span className="gradient-text">fair</span>
          </h1>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Create your free account and start managing group expenses like a pro.
          </p>

          <div className="space-y-4">
            {perks.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.2)' }}>
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                </div>
                <span className="text-slate-300 text-sm">{perk}</span>
              </motion.div>
            ))}
          </div>

          {/* Decorative card */}
          <div className="mt-12 rounded-2xl p-5 glass-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {['6366f1', '8b5cf6', 'ec4899'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: `#${c}` }}>
                    {['S', 'R', 'P'][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-white">College Trip Group</p>
                <p className="text-xs text-slate-400">3 members · ₹4,200 total</p>
              </div>
            </div>
            <div className="text-xs text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> All settled up! 🎉
            </div>
          </div>
        </div>

        {/* Right side - form */}
        <div>
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl gradient-brand flex items-center justify-center shadow-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-black text-2xl text-white">FairSplit</span>
            </Link>
          </div>

          <div className="rounded-3xl p-8 shadow-2xl"
            style={{
              background: 'rgba(13,16,53,0.88)',
              border: '1px solid rgba(99,102,241,0.25)',
              backdropFilter: 'blur(20px)'
            }}>
            <h2 className="text-2xl font-display font-bold text-white mb-1">Create Account</h2>
            <p className="text-slate-400 text-sm mb-6">It's free and always will be.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
                    placeholder="Shiv Kumar"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-slate-500 text-sm transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: errors.name ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      outline: 'none'
                    }}
                    onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                    onBlur={e => e.target.style.border = errors.name ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)'}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                    placeholder="shiv@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-slate-500 text-sm transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: errors.email ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      outline: 'none'
                    }}
                    onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                    onBlur={e => e.target.style.border = errors.email ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)'}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' }, onChange: (e) => setPassword(e.target.value) })}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl text-white placeholder-slate-500 text-sm transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: errors.password ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      outline: 'none'
                    }}
                    onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                    onBlur={e => e.target.style.border = errors.password ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)'}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: i <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)' }} />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</p>
                  </div>
                )}
                {errors.password && <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (val) => val === watch('password') || 'Passwords do not match'
                    })}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-slate-500 text-sm transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: errors.confirmPassword ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      outline: 'none'
                    }}
                    onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                    onBlur={e => e.target.style.border = errors.confirmPassword ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)'}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full py-3.5 rounded-xl font-semibold text-white gradient-brand shadow-lg hover:opacity-90 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 shine"
              >
                {registerMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Free Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
