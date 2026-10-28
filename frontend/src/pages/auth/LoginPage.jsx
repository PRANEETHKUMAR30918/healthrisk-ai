import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import {
  HeartPulse, Lock, Mail, ArrowRight, Sun, Moon,
  UserPlus, Stethoscope, User, Calendar, Users,
  Activity, Shield, Sparkles, Eye, EyeOff, CheckCircle2
} from 'lucide-react'

export const LoginPage = () => {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [dob, setDob] = useState('')
  const [sex, setSex] = useState('M')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { setAuth } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const resetForm = () => {
    setEmail(''); setPassword(''); setConfirmPassword('')
    setFullName(''); setDob(''); setSex('M'); setError(null)
    setShowPassword(false); setShowConfirm(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const data = await authService.login(email, password)
      const role = data.role || 'clinician'
      setAuth(data.access_token, {
        id: data.user_id || 'user',
        email: data.email || email,
        full_name: data.full_name || email.split('@')[0],
        role,
        patient_id: data.patient_id || null,
      })
      if (role === 'patient' && data.patient_id) {
        navigate(`/patients/${data.patient_id}/history`)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterPatient = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    if (password !== confirmPassword) { setError('Passwords do not match.'); setLoading(false); return }
    if (password.length < 4) { setError('Password must be at least 4 characters.'); setLoading(false); return }
    if (!fullName.trim()) { setError('Please enter your full name.'); setLoading(false); return }
    try {
      await authService.registerPatient(email, password, fullName, dob || null, sex || 'M')
      const loginData = await authService.login(email, password)
      const patientId = loginData.patient_id
      setAuth(loginData.access_token, {
        id: loginData.user_id || 'patient',
        email: loginData.email || email,
        full_name: loginData.full_name || fullName,
        role: 'patient',
        patient_id: patientId || null,
      })
      navigate(patientId ? `/patients/${patientId}/history` : '/upload')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. This email or username may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `
    block w-full pl-10 pr-10 py-3
    bg-slate-50 border border-slate-200
    rounded-xl text-sm text-slate-800
    placeholder-slate-400
    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-400 focus:bg-white
    transition-all
  `

  const features = [
    { icon: Activity, title: 'Multi-Engine Analysis', desc: '3 analytical engines evaluate your biomarkers simultaneously' },
    { icon: Shield, title: 'Risk Stratification', desc: 'Know which body systems need medical attention' },
    { icon: Sparkles, title: 'Plain Language Reports', desc: 'Lab results explained simply — no medical jargon' },
  ]

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 -right-20 w-60 h-60 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 left-1/4 w-48 h-48 bg-white/10 rounded-full" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 shadow-lg">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">HealthRisk AI</p>
            <p className="text-teal-100 text-xs mt-0.5">Clinical Intelligence Platform</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative space-y-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Understand your<br />health reports<br />
              <span className="text-teal-100">clearly.</span>
            </h1>
            <p className="mt-4 text-sm text-teal-100/80 leading-relaxed max-w-xs">
              Upload your lab test PDF and receive an instant plain-language summary with risk analysis and trend detection.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-teal-100/70 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial-style note */}
          <div className="bg-white/15 border border-white/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              {[0,1,2,3,4].map(i => (
                <svg key={i} className="w-3.5 h-3.5 text-amber-300 fill-amber-300" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ))}
            </div>
            <p className="text-xs text-white/80 leading-relaxed italic">
              "Finally I can understand what my blood test results actually mean."
            </p>
            <p className="text-[11px] text-teal-200 mt-1.5 font-medium">— Patient User</p>
          </div>
        </div>

        <p className="relative text-xs text-teal-100/50">Academic research prototype · Not a certified medical device</p>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative">

        {/* Theme toggle */}
        <div className="absolute top-5 right-5">
          <button
            onClick={toggleTheme}
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-medium transition-all shadow-sm"
          >
            {theme === 'dark'
              ? <><Sun className="w-3.5 h-3.5 text-amber-500" /><span>Light</span></>
              : <><Moon className="w-3.5 h-3.5" /><span>Dark</span></>}
          </button>
        </div>

        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg">HealthRisk AI</span>
        </div>

        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === 'login' ? 'Welcome back 👋' : 'Create your free account'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'login'
                ? 'Sign in to view your health reports and analysis'
                : 'Register as a patient to upload your lab reports'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => { setMode('login'); resetForm() }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                mode === 'login'
                  ? 'bg-white text-teal-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register-patient'); resetForm() }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                mode === 'register-patient'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Patient Register
            </button>
          </div>

          {/* White card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 p-7">

            {/* Error */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <span className="shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* ── SIGN IN ── */}
            {mode === 'login' && (
              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Email or username" className={inputClass} />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Password" className={inputClass} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-md shadow-teal-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                    : <>Sign In <ArrowRight className="w-4 h-4" /></>}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-[11px] text-slate-400 font-medium">Quick Access</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Doctor quick login */}
                <button type="button"
                  onClick={() => { setEmail('doctor'); setPassword('doctor') }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold border-2 border-teal-100 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:border-teal-200 transition-all flex items-center justify-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Doctor Login &nbsp;·&nbsp; username: doctor &nbsp;/&nbsp; password: doctor
                </button>

                <p className="text-center text-xs text-slate-400 pt-1">
                  New patient?{' '}
                  <button type="button" onClick={() => { setMode('register-patient'); resetForm() }}
                    className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                    Register here
                  </button>
                </p>
              </form>
            )}

            {/* ── PATIENT REGISTER ── */}
            {mode === 'register-patient' && (
              <form className="space-y-3.5" onSubmit={handleRegisterPatient}>

                {/* Benefits list */}
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 space-y-2">
                  {['Upload lab reports (PDF or photo)', 'Get a plain-language health summary', 'Track trends across multiple reports'].map(t => (
                    <div key={t} className="flex items-center gap-2 text-xs text-teal-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name" className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                      className={inputClass + ' cursor-pointer'} />
                  </div>
                  <select value={sex} onChange={e => setSex(e.target.value)}
                    className="block w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all">
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Email or username" className={inputClass} />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Password (min 4 chars)" className={inputClass} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type={showConfirm ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password" className={inputClass} />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-md shadow-teal-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating profile...</>
                    : <><UserPlus className="w-4 h-4" /> Create My Health Profile</>}
                </button>

                <p className="text-center text-xs text-slate-400">
                  Already registered?{' '}
                  <button type="button" onClick={() => { setMode('login'); resetForm() }}
                    className="text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                    Sign in here
                  </button>
                </p>
              </form>
            )}
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-5">
            Academic research prototype · Not a certified medical device
          </p>
        </div>
      </div>
    </div>
  )
}
