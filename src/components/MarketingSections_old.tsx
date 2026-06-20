import React from 'react';
import { Play, ShieldAlert, ArrowRight, User as UserIcon, Check, ShieldCheck, CreditCard, Zap, Smartphone, Lock, Globe } from 'lucide-react';
import { SiteImagesConfig } from '../types';

interface MarketingSectionsProps {
  siteImages: SiteImagesConfig;
  onGetStarted: () => void;
}

export const MarketingSections: React.FC<MarketingSectionsProps> = ({ siteImages, onGetStarted }) => {
  return (
    <div className="w-full bg-black text-white selection:bg-[#adff2f]/30" id="marketing-additional-sections">
      
      {/* ----------------- SECTION 1: ONLINE CREDIT CARD MARKETPLACE ----------------- */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900" id="sec-marketplace">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Text */}
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
              <button 
                onClick={onGetStarted}
                className="group inline-flex items-center space-x-2 font-mono text-xs font-bold text-[#adff2f] uppercase tracking-wider hover:underline cursor-pointer"
              >
                <span>Browse inventory</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Right Column: Custom Image Placeholder */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950/20 to-black border border-emerald-900/30 p-1 flex items-center justify-center group shadow-[0_0_50px_rgba(16,185,129,0.02)]">
              {siteImages.marketplaceImage ? (
                <img 
                  src={siteImages.marketplaceImage} 
                  alt="Marketplace Graphic" 
                  className="w-full h-full object-cover rounded-[22px]" 
                  referrerPolicy="no-referrer"
                />
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

      {/* ----------------- SECTION 2: TRYING TO PULL FOREIGN FUNDS? CONSIDER IT DONE ----------------- */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900" id="sec-foreign-funds">
        <div className="max-w-7xl mx-auto">
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
        </div>
      </section>

      {/* ----------------- SECTION 3: IT'S YOUR MONEY, SPEND LIKE IT. ----------------- */}
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

      {/* ----------------- SECTION 4: DON'T SLEEP ON THIS; IT'S EVERYTHING YOU WANT. ----------------- */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900 bg-gradient-to-b from-black via-zinc-950/20 to-black" id="sec-what-you-get">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-1.5 bg-pink-500/10 border border-pink-550/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest mx-auto">
            <span>WHAT YOU GET</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-pink-500 uppercase leading-none max-w-3xl mx-auto">
            DON'T SLEEP ON THIS; IT'S EVERYTHING YOU WANT.
          </h2>
        </div>
      </section>

      {/* ----------------- SECTION 5: HOW IT WORKS ----------------- */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900" id="sec-how-it-works">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-550/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest mx-auto">
            <span>HOW IT WORKS</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-indigo-500 uppercase leading-none max-w-3xl mx-auto">
            NO TUTORIAL NEEDED FOR THIS GET STARTED.
          </h2>
        </div>
      </section>

      {/* ----------------- SECTION 6: REAL PEOPLE, REAL TALK (TESTIMONIAL) ----------------- */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900 bg-gradient-to-b from-black via-zinc-950/10 to-black" id="sec-testimonials">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Centered Headers */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-1.5 bg-teal-500/10 border border-teal-555/30 px-3 py-1 rounded-full text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest">
              <span>TESTIMONIALS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-white uppercase leading-none">
              REAL PEOPLE, REAL TALK
            </h2>
          </div>

          {/* Testimonial Card */}
          <div className="max-w-4xl mx-auto bg-zinc-900/60 border border-zinc-800 rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
            
            {/* Gloss Highlight banner */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-lime-400/5 blur-3xl pointer-events-none rounded-full" />
            
            {/* Left Column: Avatar */}
            <div className="shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-[#adff2f]/30 p-1 bg-zinc-950 flex items-center justify-center">
                {siteImages.testimonialAvatar ? (
                  <img 
                    src={siteImages.testimonialAvatar} 
                    alt="Adesuwa B." 
                    className="w-full h-full object-cover rounded-full" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#122812] to-zinc-950 flex items-center justify-center text-[#adff2f]">
                    <UserIcon className="w-10 h-10 sm:w-12 sm:h-12" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Q&A Interview */}
            <div className="flex-1 text-left space-y-6">
              <div>
                <h3 className="text-xl font-sans font-black text-[#adff2f] uppercase tracking-wide">
                  ADESUWA B.
                </h3>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-0.5">Verified Corporate Client Node</p>
              </div>

              <div className="space-y-4 text-zinc-300 font-sans">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#adff2f]/90 uppercase font-mono tracking-wider">Interviewer: Does it feel safe?</p>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    — Yes, I make international purchases regularly and haven't had any issues. It's reliable.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#adff2f]/90 uppercase font-mono tracking-wider">Interviewer: Any favorites?</p>
                  <p className="text-sm leading-relaxed text-zinc-400">
                    — I use it for streaming and apps. One card, no drama. I just set limits and move on.
                  </p>
                </div>
              </div>

              <button 
                onClick={onGetStarted}
                className="inline-flex items-center space-x-2 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-extrabold text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-[0_4px_15px_rgba(173,255,47,0.2)] cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 font-bold" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ----------------- SECTION 7: GET STARTED ----------------- */}
      <section className="relative overflow-hidden py-24 px-4 border-t border-zinc-900 bg-zinc-955/20" id="sec-get-started">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Neon shape image/drawing */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-full max-w-sm aspect-square bg-[#030d03]/40 border border-zinc-800 rounded-[40px] flex items-center justify-center p-8 overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(173,255,47,0.05)_0%,transparent_70%)]" />
              {siteImages.getStartedGraphic ? (
                <img 
                  src={siteImages.getStartedGraphic} 
                  alt="Neon Shape" 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_30px_rgba(173,255,47,0.15)]" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full border border-dashed border-[#adff2f]/20 rounded-full flex items-center justify-center relative animate-none p-4">
                  <div className="w-3/4 h-3/4 border border-[#adff2f]/30 rounded-full flex items-center justify-center relative">
                    <div className="w-1/2 h-1/2 bg-[#adff2f]/10 rounded-full flex items-center justify-center border border-[#adff2f]/40 relative">
                      <ShieldCheck className="w-10 h-10 text-[#adff2f]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Title Text & Action */}
          <div className="space-y-6 text-left">
            <h2 className="text-4xl sm:text-5xl font-sans font-black tracking-tight text-white uppercase leading-none">
              GET STARTED
            </h2>
            
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-sans max-w-xl">
              Step into Neobyte Bank — your gateway to secure digital transactions and advanced cyber technology. Deploy encryption, real-time processing, and seamless cloud integration to power your financial journey. Your command center is ready.
            </p>
            
            <div className="pt-2">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-extrabold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-102 hover:shadow-[0_4px_15px_rgba(173,255,47,0.2)] cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 font-bold" />
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
