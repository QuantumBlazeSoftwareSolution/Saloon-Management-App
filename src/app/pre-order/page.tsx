'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, 
  Calendar, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Check, 
  AlertCircle, 
  Building2, 
  Mail, 
  Phone, 
  User, 
  ChevronRight, 
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { requestSaloonSetup } from '@/lib/actions/admin';

export default function PreOrderPage() {
  const router = useRouter();
  // Modal Banner state
  const [showPopup, setShowPopup] = useState(false);
  
  // Form Fields
  const [fullName, setFullName] = useState('');
  const [saloonName, setSaloonName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [staffCount, setStaffCount] = useState('1-3');
  const [managementMethod, setManagementMethod] = useState('Notebook');
  
  // UX States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form Ref for scrolling
  const formRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  // Trigger popup banner on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Monitor scroll to show sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      if (!formRef.current || !heroRef.current) return;
      
      const heroBottom = heroRef.current.getBoundingClientRect().bottom + window.scrollY;
      const formTop = formRef.current.getBoundingClientRect().top + window.scrollY;
      const currentScroll = window.scrollY + window.innerHeight;

      // Show sticky CTA if we scrolled past hero but haven't reached the form CTA button
      if (window.scrollY > 400 && currentScroll < formTop + 100) {
        setShowStickyCta(true);
      } else {
        setShowStickyCta(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await requestSaloonSetup(
        saloonName,
        email,
        whatsappNumber,
        fullName,
        staffCount,
        managementMethod
      );

      if (res.success) {
        setIsSuccess(true);
      } else {
        setSubmitError(res.error || 'Failed to submit. Please try again.');
      }
    } catch (err: any) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const featureCards = [
    {
      icon: <Calendar className="h-6 w-6 text-amber-500" />,
      title: 'Appointments',
      desc: 'Manage client bookings and schedules effortlessly, minimizing downtime.'
    },
    {
      icon: <Users className="h-6 w-6 text-amber-500" />,
      title: 'Staff Management',
      desc: 'Track barbers, custom commission rates, and schedules dynamically.'
    },
    {
      icon: <DollarSign className="h-6 w-6 text-amber-500" />,
      title: 'Auto-Commissions',
      desc: 'Automatic commission calculation per barber. No spreadsheets, zero disputes.'
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-amber-500" />,
      title: 'Analytics & Ledgers',
      desc: 'Visualize performance trends, sales distributions, and daily transaction ledgers.'
    },
    {
      icon: <Settings className="h-6 w-6 text-amber-500" />,
      title: 'Smart Administration',
      desc: 'Control operational settings, add services, and customize workspace preferences.'
    },
    {
      icon: <Scissors className="h-6 w-6 text-amber-500" />,
      title: 'Offline Resiliency',
      desc: 'Built as a progressive web app to load fast and operate smoothly under poor network.'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-amber-500 selection:text-black pb-12 overflow-x-hidden">
      {/* Top Header / Nav */}
      <header className="w-full py-6 px-6 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/fade-master-logo-transparent.png" 
              alt="Fade Master" 
              width={36} 
              height={36} 
              className="object-contain"
            />
            <div>
              <span className="text-sm font-black tracking-wider uppercase text-white block">Fade Master</span>
              <span className="text-[10px] text-amber-500 font-bold block -mt-1 tracking-widest uppercase">Smart Saloon OS</span>
            </div>
          </div>
          <button 
            onClick={scrollToForm}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl transition-all"
          >
            Pre-Order Now
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="max-w-6xl mx-auto px-6 pt-12 md:pt-20 pb-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Stop Running Your Saloon on WhatsApp & Paper.
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg leading-relaxed">
            Fade Master simplifies salon and barbershop management. Streamline schedules, staff commissions, client history, and daily finance logs from one unified app.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <button
              onClick={scrollToForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
            >
              Pre-Order Early Access
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="relative flex justify-center items-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent blur-3xl rounded-full" />
          <div className="relative w-full max-w-[400px] border border-zinc-800 rounded-3xl bg-zinc-900/50 p-4 backdrop-blur-sm shadow-2xl">
            <div className="aspect-[4/5] relative rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center">
              <Image 
                src="/banner/pre-order.png" 
                alt="Fade Master Dashboard" 
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Fade Master (Features Grid) */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Everything Your Salon Needs. One Place.
          </h2>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            Engineered to streamline daily service logs, payments, and client accounts in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, i) => (
            <div 
              key={i} 
              className="p-6 bg-zinc-900/40 border border-zinc-900 rounded-2xl space-y-4 hover:border-zinc-800 transition-all hover:bg-zinc-900/60"
            >
              <div className="h-12 w-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="font-bold text-lg text-white">{feat.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Early Access Value Pitch */}
      <section className="bg-zinc-900/30 border-y border-zinc-900 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Become an Early Access Member
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We are releasing Fade Master to a select group of salon owners before the public release. Register now to secure priority onboarding and lifetime benefits.
            </p>
          </div>
          <div className="space-y-3 bg-zinc-950/50 p-6 rounded-2xl border border-zinc-900">
            <div className="flex items-start gap-3 text-sm">
              <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <span>Priority workspace deployment</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <span>Special pre-launch lifetime pricing</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <span>Direct feedback channel to product engineers</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Check className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <span>Free PWA configuration for tablet & mobile</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Pre-Order Action Card */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <div ref={formRef} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-full blur-xl pointer-events-none" />

          {/* Success State */}
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-white">You&apos;re In! 🎉</h3>
                  <p className="text-zinc-400 text-sm max-w-md mx-auto">
                    Your Fade Master Early Access registration was successful. We will contact you soon with the next steps.
                  </p>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => router.push('/login')} 
                    className="px-6 py-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-white font-bold rounded-xl text-sm transition-all"
                  >
                    Back to Login
                  </button>
                  <a 
                    href="https://www.quantumblaze.lk" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-sm transition-all flex items-center justify-center gap-1"
                  >
                    Visit Quantum Blaze
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Header */}
                <div className="text-center space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-white">Reserve Your Early Access</h3>
                  <p className="text-zinc-400 text-sm">
                    No upfront setup fees. Secure your pre-order to unlock early access.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-amber-500" /> Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Vihanga Heshan"
                        className="w-full px-4 py-3 bg-zinc-955 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 placeholder-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-amber-500" /> Saloon Name
                      </label>
                      <input
                        type="text"
                        required
                        value={saloonName}
                        onChange={(e) => setSaloonName(e.target.value)}
                        placeholder="e.g. Fade Studio"
                        className="w-full px-4 py-3 bg-zinc-955 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 placeholder-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-amber-500" /> WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="e.g. 0771234567"
                        className="w-full px-4 py-3 bg-zinc-955 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 placeholder-zinc-600"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs font-bold mb-1.5 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-amber-500" /> Owner Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. name@example.com"
                        className="w-full px-4 py-3 bg-zinc-955 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 placeholder-zinc-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-bold mb-1.5">
                        Number of Staff / Barbers
                      </label>
                      <select
                        value={staffCount}
                        onChange={(e) => setStaffCount(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-955 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="1-3">1 - 3 staff members</option>
                        <option value="4-7">4 - 7 staff members</option>
                        <option value="8-12">8 - 12 staff members</option>
                        <option value="13+">13+ staff members</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs font-bold mb-1.5">
                        Current Management Method
                      </label>
                      <select
                        value={managementMethod}
                        onChange={(e) => setManagementMethod(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-955 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="Notebook">Notebook / Paper ledger</option>
                        <option value="WhatsApp">WhatsApp Messages</option>
                        <option value="Excel">Excel / Sheets</option>
                        <option value="Other Software">Other software system</option>
                        <option value="None">None (Starting fresh)</option>
                      </select>
                    </div>
                  </div>

                  {submitError && (
                    <div className="flex items-center gap-2 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-650 text-black font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Reserve My Early Access
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-zinc-500 text-center">
                    No complicated setup. We&apos;ll contact you with the next steps.
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="text-center py-6 border-t border-zinc-900">
        <p className="text-[11px] text-zinc-600">
          Powered by <a href="https://www.quantumblaze.lk" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 underline transition-colors">Quantum Blaze</a>
        </p>
      </footer>

      {/* Sticky Bottom CTA on Mobile */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-900 z-40 sm:hidden pb-safe"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-amber-500 block">Fade Master OS</span>
                <span className="text-xs font-bold text-white block">Pre-Order Early Access</span>
              </div>
              <button
                onClick={scrollToForm}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all"
              >
                Pre-Order
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup Campaign Modal Banner */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden max-w-md w-full relative shadow-2xl"
            >
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 h-8 w-8 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center z-10 transition-colors border border-zinc-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative aspect-[4/5] w-full">
                <Image 
                  src="/banner/pre-order.png" 
                  alt="Fade Master Promo Banner" 
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6 pb-8 text-center space-y-4 bg-zinc-900">
                <h4 className="text-xl font-black text-white">Pre-Order Discount Open!</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Join the pre-order campaign now to lock in a lifetime discount and get priority setup support.
                </p>
                <div className="relative w-full">
                  {/* Sonar Beacon Pulse Ring */}
                  <motion.div
                    className="absolute rounded-xl border border-amber-500 bg-transparent pointer-events-none"
                    animate={{
                      top: ["0px", "-5px", "-10px"],
                      bottom: ["0px", "-5px", "-10px"],
                      left: ["0px", "-5px", "-10px"],
                      right: ["0px", "-5px", "-10px"],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                  <button
                    onClick={() => {
                      setShowPopup(false);
                      scrollToForm();
                    }}
                    className="relative w-full py-3 px-6 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all"
                  >
                    Claim Early Access
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
