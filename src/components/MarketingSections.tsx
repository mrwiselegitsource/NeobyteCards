import React, { useState } from 'react';
import { Play, ShieldAlert, ArrowRight, User as UserIcon, Check, ShieldCheck, CreditCard, Zap, Lock, Globe } from 'lucide-react';
import { SiteImagesConfig } from '../types';

interface MarketingSectionsProps {
  siteImages: SiteImagesConfig;
  onGetStarted: () => void;
}

export const MarketingSections: React.FC<MarketingSectionsProps> = ({ siteImages, onGetStarted }) => {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'security' | 'virtual' | 'features' | 'how' | 'testimonials' | null>(null);

  const sections = [
    { id: 'marketplace', label: 'INTERNATIONAL CREDIT CARDS', anchor: 'sec-marketplace' },
    { id: 'security', label: 'SECURED TECHNOLOGY', anchor: 'sec-foreign-funds' },
    { id: 'virtual', label: 'VIRTUAL CARDS', anchor: 'sec-spend' },
    { id: 'features', label: 'WHAT YOU GET', anchor: 'sec-what-you-get' },
    { id: 'how', label: 'HOW IT WORKS', anchor: 'sec-how-it-works' },
    { id: 'testimonials', label: 'TESTIMONIALS', anchor: 'sec-testimonials' },
  ] as const;

  const scrollToSection = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full bg-black text-white selection:bg-[#adff2f]/30" id="marketing-additional-sections">
      
      {/* TABS/NAVIGATION */}
      <div className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveTab(section.id as any);
                  scrollToSection(section.anchor);
                }}
                className={`px-4 py-4 text-[11px] font-mono font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${ activeTab === section.id || document.getElementById(section.anchor)?.parentElement?.parentElement?.offsetTop === window.scrollY
                  ? 'text-[#adff2f] border-[#adff2f]'
                  : 'text-zinc-400 border-transparent hover:text-[#adff2f] hover:border-[#adff2f]/30'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* SECTION 1: ONLINE CREDIT CARD MARKETPLACE */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900" id="sec-marketplace">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left order-2 lg:order-1">
            <div className="inline-flex items-center space-x-1.5 bg-yellow-500/10 border border-yellow-550/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-yellow-400 uppercase tracking-widest">
              <span>INTERNATIONAL CREDIT CARDS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-[#adff2f] uppercase leading-none">
              ONLINE CREDIT CARD MARKETPLACE
            </h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-sans max-w-xl">
              We provide premium credit card details complete with card numbers, CVV, and names for seamless online transactions and verifications.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <button onClick={onGetStarted} className="group inline-flex items-center space-x-2 font-mono text-xs font-bold text-[#adff2f] uppercase tracking-wider hover:underline cursor-pointer">
                <span>Browse inventory</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950/20 to-black border border-emerald-900/30 p-1 flex items-center justify-center group shadow-[0_0_50px_rgba(16,185,129,0.02)]">
              {siteImages.marketplaceImage ? (
                <img src={siteImages.marketplaceImage} alt="Marketplace Graphic" className="w-full h-full object-cover rounded-[22px]" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full rounded-[22px] bg-gradient-to-tr from-[#051405] via-zinc-950 to-black p-8 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                      <CreditCard className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">SECURE NODE</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-emerald-400/90 font-bold uppercase tracking-wider">&bull; SECURED GATEWAY CONNECTIONS</p>
                    <h4 className="text-lg font-sans font-bold text-white uppercase leading-tight max-w-xs">Global Checkout Proxy Terminals</h4>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">algorithmic allocation of direct regional accounts.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRYING TO PULL FOREIGN FUNDS */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900" id="sec-foreign-funds">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-4xl space-y-6 text-left">
              <div className="inline-flex items-center space-x-1.5 bg-purple-500/10 border border-purple-550/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                <span>SECURED TECHNOLOGY</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-fuchsia-500 uppercase leading-none max-w-3xl">
                TRYING TO PULL FOREIGN FUNDS? CONSIDER IT DONE
              </h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-sans max-w-2xl">
                Each transaction runs on high-grade tech infrastructure with military-grade encryption, quantum-secure hashing, and real-time secure anomaly detection creating a coded, tamper-proof pipeline for any foreign funds source.
              </p>
            </div>
            {siteImages.lightningGraphic && (
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full max-w-md rounded-3xl overflow-hidden">
                  <img src={siteImages.lightningGraphic} alt="Lightning Graphic" className="w-full h-auto object-cover rounded-3xl border border-purple-900/30" referrerPolicy="no-referrer" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 3: IT'S YOUR MONEY, SPEND LIKE IT */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900" id="sec-spend">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl space-y-6 text-left">
            <div className="inline-flex items-center space-x-1.5 bg-orange-500/10 border border-orange-550/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-orange-400 uppercase tracking-widest">
              <span>VIRTUAL CARDS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-orange-500 uppercase leading-none max-w-3xl">
              IT'S YOUR MONEY, SPEND LIKE IT.
            </h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-sans max-w-2xl">
              From streaming to sneakers, our secure virtual USD credit cards give you the freedom to buy what you want, when you want. Subscribe Globaly Fast Safe and hassle free
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: WHAT YOU GET - FEATURES */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900 bg-gradient-to-b from-black via-zinc-950/20 to-black" id="sec-what-you-get">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center space-x-1.5 bg-pink-500/10 border border-pink-550/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest mx-auto">
              <span>WHAT YOU GET</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-pink-500 uppercase leading-none max-w-3xl mx-auto">
              DON'T SLEEP ON THIS; IT'S EVERYTHING YOU WANT.
            </h2>
          </div>

          {/* 4-Column Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative group overflow-hidden rounded-2xl p-6 border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/40 to-black hover:border-fuchsia-400/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/30 flex items-center justify-center text-fuchsia-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-sans font-bold text-fuchsia-400 uppercase tracking-wide">INSTANT DELIVERY</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">Get your cards activated immediately upon purchase. Start spending right away with real-time access.</p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl p-6 border border-lime-500/20 bg-gradient-to-br from-lime-950/40 to-black hover:border-lime-400/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-lime-500/20 border border-lime-400/30 flex items-center justify-center text-lime-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-sans font-bold text-lime-400 uppercase tracking-wide">ZERO MONTHLY FEES</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">No hidden charges. No maintenance fees. Pure spending power without financial surprises.</p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl p-6 border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-black hover:border-cyan-400/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-sans font-bold text-cyan-400 uppercase tracking-wide">SECURE ENCRYPTED</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">Military-grade encryption protects your card details. Advanced fraud detection keeps you safe 24/7.</p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl p-6 border border-yellow-500/20 bg-gradient-to-br from-yellow-950/40 to-black hover:border-yellow-400/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-sans font-bold text-yellow-400 uppercase tracking-wide">GLOBAL ACCEPTANCE</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">Use your card anywhere in the world. Supported by millions of merchants worldwide.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900" id="sec-how-it-works">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 mb-16">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-550/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest mx-auto">
              <span>HOW IT WORKS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-indigo-500 uppercase leading-none max-w-3xl mx-auto">
              NO TUTORIAL NEEDED. IT'S SOMETHING YOU MUST TRY.
            </h2>
          </div>

          {/* 4-Step Process */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent transform -translate-y-1/2" />

            <div className="relative flex flex-col items-center text-center space-y-4 group">
              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 border-2 border-indigo-400 flex items-center justify-center text-white font-sans font-black text-2xl group-hover:scale-110 transition-transform group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                1
              </div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wide">BROWSE CARDS</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Explore our collection of premium credit and debit cards with different features and benefits.</p>
            </div>

            <div className="relative flex flex-col items-center text-center space-y-4 group">
              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 border-2 border-indigo-400 flex items-center justify-center text-white font-sans font-black text-2xl group-hover:scale-110 transition-transform group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                2
              </div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wide">SELECT & CHECKOUT</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Choose your preferred card and proceed to secure checkout with multiple payment options.</p>
            </div>

            <div className="relative flex flex-col items-center text-center space-y-4 group">
              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 border-2 border-indigo-400 flex items-center justify-center text-white font-sans font-black text-2xl group-hover:scale-110 transition-transform group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                3
              </div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wide">CONFIRM DETAILS</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Enter billing information and confirm your purchase. Verification happens instantly.</p>
            </div>

            <div className="relative flex flex-col items-center text-center space-y-4 group">
              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 border-2 border-indigo-400 flex items-center justify-center text-white font-sans font-black text-2xl group-hover:scale-110 transition-transform group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                4
              </div>
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wide">ENJOY & SPEND</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">Get instant access and start using your card immediately. No waiting, no delays.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: TESTIMONIALS */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900 bg-gradient-to-b from-black via-zinc-950/10 to-black" id="sec-testimonials">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center space-x-1.5 bg-teal-500/10 border border-teal-555/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest">
              <span>TESTIMONIALS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-white uppercase leading-none">
              REAL PEOPLE, REAL TALK
            </h2>
          </div>

          {/* 2-Column Testimonials */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="group relative rounded-2xl overflow-hidden border border-teal-500/20 bg-gradient-to-br from-teal-950/30 to-black p-8 hover:border-teal-400/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-6">
                <div className="flex items-start space-x-4">
                  {siteImages.testimonialAvatar ? (
                    <img src={siteImages.testimonialAvatar} alt="ADESUWA B." className="w-16 h-16 rounded-full border border-teal-400/30 flex-shrink-0 object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 border border-teal-400/30 flex items-center justify-center text-white font-sans font-bold text-lg flex-shrink-0">
                      A.D
                    </div>
                  )}
                  <div>
                    <h4 className="font-sans font-bold text-white text-lg">ADESUWA B.</h4>
                    <p className="text-xs text-teal-400 font-mono tracking-wider uppercase">Verified User</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  "Interviewer: Does it feel safe? — Yes, I make international purchases regularly and haven't had any issues. It's reliable. Interviewer: Any favorites? — I use it for streaming and apps. One card, no drama. I just set limits and move on."
                </p>
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden border border-teal-500/20 bg-gradient-to-br from-teal-950/30 to-black p-8 hover:border-teal-400/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 border border-teal-400/30 flex items-center justify-center text-white font-sans font-bold text-lg flex-shrink-0">
                    K.E
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-white text-lg">KWAME E.</h4>
                    <p className="text-xs text-teal-400 font-mono tracking-wider uppercase">Global Merchant</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  "I use this for international transactions and the support team is incredible. Every question gets answered within minutes. Best fintech experience I've had so far."
                </p>
                <div className="flex items-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: GET STARTED */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900" id="sec-get-started">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {siteImages.getStartedGraphic && (
              <div className="flex justify-center">
                <div className="relative w-full max-w-md rounded-3xl overflow-hidden">
                  <img src={siteImages.getStartedGraphic} alt="Get Started Graphic" className="w-full h-auto object-cover rounded-3xl border border-lime-900/30" referrerPolicy="no-referrer" />
                </div>
              </div>
            )}
            
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a3a1a] to-black border border-lime-500/20 p-12 md:p-16 text-center lg:text-left space-y-8">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(173,255,47,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-lime-500/10 blur-[120px] rounded-full" />
              
              <div className="relative space-y-8">
                <div className="inline-flex items-center space-x-1.5 bg-lime-500/10 border border-lime-550/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-lime-400 uppercase tracking-widest">
                  <span>GET STARTED</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-[#adff2f] uppercase leading-none max-w-3xl">
                  STEP INTO NEOBYTE BANK
                </h2>
                
                <p className="text-zinc-300 text-base leading-relaxed max-w-2xl font-sans">
                  Your gateway to secure digital transactions and advanced cyber technology. Deploy encryption, real-time processing, and seamless cloud integration to power your financial journey. Your command center is ready.
                </p>
                
                <button 
                  onClick={onGetStarted}
                  className="inline-flex items-center space-x-2 px-10 py-4 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(173,255,47,0.4)] transform hover:scale-105 cursor-pointer"
                >
                  <span>Browse Our Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FEATURED CARDS GALLERY */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900" id="sec-featured-cards-gallery">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-purple-500/10 border border-purple-550/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest mx-auto">
              <span>CARD COLLECTION</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-purple-500 uppercase leading-none max-w-3xl mx-auto">
              OUR FEATURED CARDS
            </h2>
          </div>

          {/* Featured Card Examples Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-950/60 to-black border border-orange-500/20 p-6 hover:border-orange-400/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-8 flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest">DISCOVER</span>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs">D</div>
                  </div>
                </div>
                <div className="space-y-3 text-white">
                  <p className="text-sm font-mono tracking-widest">5412 •••• •••• 1234</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider">Card Holder</p>
                      <p className="text-xs font-mono font-bold uppercase">JOHN DOE</p>
                    </div>
                    <p className="text-[8px] text-zinc-500 font-mono">12/26</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-950/60 to-black border border-red-500/20 p-6 hover:border-red-400/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-8 flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest">MASTERCARD</span>
                    <div className="flex space-x-1">
                      <div className="w-5 h-5 rounded-full bg-red-500 opacity-80"></div>
                      <div className="w-5 h-5 rounded-full bg-yellow-500 opacity-80" style={{marginLeft: '-10px'}}></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-white">
                  <p className="text-sm font-mono tracking-widest">5105 •••• •••• 5005</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider">Card Holder</p>
                      <p className="text-xs font-mono font-bold uppercase">JANE SMITH</p>
                    </div>
                    <p className="text-[8px] text-zinc-500 font-mono">03/27</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-950/60 to-black border border-blue-500/20 p-6 hover:border-blue-400/40 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative space-y-8 flex flex-col justify-between h-full">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-widest">VISA</span>
                    <div className="w-10 h-6 rounded bg-blue-500 flex items-center justify-center text-white text-[7px] font-bold">VISA</div>
                  </div>
                </div>
                <div className="space-y-3 text-white">
                  <p className="text-sm font-mono tracking-widest">4916 •••• •••• 6537</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] text-zinc-500 font-mono uppercase tracking-wider">Card Holder</p>
                      <p className="text-xs font-mono font-bold uppercase">ALEX JONES</p>
                    </div>
                    <p className="text-[8px] text-zinc-500 font-mono">08/25</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
