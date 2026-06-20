import React from 'react';
import { ShieldCheck, Zap, ChevronDown } from 'lucide-react';
import { SiteImagesConfig } from '../types';

interface HeroProps {
  onScrollToCards: () => void;
  siteImages: SiteImagesConfig;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToCards, siteImages }) => {
  return (
    <div className="w-full bg-black">
      {/* HERO SECTION - Matches reference design exactly */}
      <section 
        className="relative overflow-hidden bg-black py-32 px-4"
        id="site-hero"
        style={siteImages.heroBackground ? { backgroundImage: `url(${siteImages.heroBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : undefined}
      >
        {/* Dark overlay for text readability */}
        {siteImages.heroBackground && <div className="absolute inset-0 bg-black/50" />}
        
        <div className="relative max-w-7xl mx-auto text-center space-y-8">
          
          {/* Main Heading - Lime Green */}
          <h1 className="font-sans font-black tracking-tight text-[#ADFF2F] leading-none text-5xl sm:text-6xl md:text-7xl uppercase">
            SECURE GLOBAL<br />PREPAID CARDS<br />PORTAL
          </h1>
          
          {/* Subheading - Lime Green */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black text-[#ADFF2F] tracking-widest uppercase">
            INSTANT ACCESS. ENDLESS POSSIBILITIES
          </h2>

          {/* Body Text - White */}
          <p className="text-white font-sans text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            Live cards ready for immediate use. Buy Some cards you need. Use the card the way you want
          </p>

          {/* CTA Button - Lime Green */}
          <button
            onClick={onScrollToCards}
            id="hero-buy-now-btn"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-[#ADFF2F] hover:bg-[#C7FF6F] text-black font-sans font-black text-sm uppercase tracking-wider rounded-full transition-all duration-300 hover:shadow-[0_0_30px_rgba(173,255,47,0.4)] transform hover:scale-105 cursor-pointer"
          >
            <span>BUY NOW</span>
            <span>&rarr;</span>
          </button>

        </div>
      </section>

      {/* HIDDEN: Right column - Stacked Card Custom Graphic Representation */}
      <div className="hidden lg:col-span-5 relative flex items-center justify-center p-2">
            {siteImages.heroCardsStack ? (
              <img 
                src={siteImages.heroCardsStack} 
                alt="Stacked Prepaid Cards" 
                className="w-full max-w-sm h-auto object-contain filter drop-shadow-[0_15px_40px_rgba(0,0,0,0.8)]" 
                referrerPolicy="no-referrer"
              />
            ) : null}
          </div>
    </div>
  );
};
