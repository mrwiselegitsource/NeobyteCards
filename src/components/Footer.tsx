import React from 'react';
import { Shield, Lock, Landmark, FileText, CheckCircle } from 'lucide-react';
import { SiteImagesConfig } from '../types';

interface FooterProps {
  onOpenPrivacyTerms: (title: string, type: 'privacy' | 'terms' | 'contact') => void;
  visitorCount?: number | null;
  siteImages?: SiteImagesConfig;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyTerms, visitorCount, siteImages }) => {
  return (
    <footer className="bg-[#030603] border-t border-zinc-900 pt-16 pb-8 px-4 text-zinc-400 font-sans" id="site-footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-12">
          
          {/* Brand & Mission Statement */}
          <div className="col-span-1 md:col-span-6 space-y-4">
            {siteImages?.footerLogo ? (
              <img 
                src={siteImages.footerLogo} 
                alt="Footer Corporate Logo" 
                className="h-10 object-contain block mb-4" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex items-center space-x-2 text-white">
                <Shield className="w-5 h-5 text-[#adff2f]" />
                <span className="font-sans font-bold tracking-widest text-[#adff2f] text-sm">NEOBYTE BANK PROTECT</span>
              </div>
            )}
            
            <p className="text-xs leading-relaxed text-zinc-400 max-w-xl">
              NeoByte Bank of NeoByte Technologies Ltd., delivering secure, next-generation credit and payment services. We combine encrypted, real-time transaction processing with adaptive cyber-defense to protect your accounts and data. Committed to transparency, compliance, and innovative fintech solutions.
            </p>
            
            <div className="flex items-center space-x-4 pt-1 text-[11px] text-[#adff2f]/80 font-mono">
              <span className="flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>SSL Secured (256-Bit)</span>
              </span>
              <span className="flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Luhn Validation (Mod 10)</span>
              </span>
            </div>
          </div>

          {/* Quick Navigational links */}
          <div className="col-span-1 md:col-span-3 space-y-3">
            <h4 className="text-white text-xs font-semibold tracking-wider uppercase font-mono">Internal Portal Links</h4>
            <ul className="space-y-1.5 text-xs text-zinc-500">
              <li>
                <button 
                  onClick={() => onOpenPrivacyTerms('Privacy Policy', 'privacy')}
                  id="footer-privacy-btn"
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPrivacyTerms('Terms & Conditions', 'terms')}
                  id="footer-terms-btn"
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPrivacyTerms('Cookies Directives', 'privacy')}
                  id="footer-cookies-btn"
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cookies Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPrivacyTerms('Contact Corporate Support', 'contact')}
                  id="footer-contact-btn"
                  className="hover:text-[#adff2f] transition-colors cursor-pointer text-left flex items-center space-x-1"
                >
                  <span>Contact Us</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance notice */}
          <div className="col-span-1 md:col-span-3 space-y-3 font-mono text-[11px] text-zinc-500 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900">
            <div className="flex items-center space-x-2 mb-2 text-zinc-400">
              <Landmark className="w-4 h-4 text-lime-500" />
              <span className="font-semibold text-xs text-white font-sans uppercase">PCI-DSS Level 1</span>
            </div>
            <p className="leading-relaxed">
              License reference block: NBL-9284-SEC. Certified globally as a class-A virtual credit proxy issuer under strict regulatory frameworks.
            </p>
          </div>

        </div>

        {/* Legal notice and fine print */}
        <div className="pt-8 border-t border-zinc-900/60 text-center flex flex-col md:flex-row items-center justify-between text-[11px] text-zinc-600 gap-4">
          <p className="font-mono">
            &copy; {new Date().getFullYear()} NeoByte Bank. All technical rights secured to NeoByte Technologies Ltd.
          </p>
          
          {visitorCount !== undefined && visitorCount !== null && (
            <div className="flex items-center space-x-2 text-xs text-[#adff2f]/90 bg-[#122c12]/30 border border-[#adff2f]/20 py-1 px-3 rounded-lg font-mono">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Active Trust Visits: <strong className="text-white font-sans text-xs font-bold">{visitorCount.toLocaleString()}</strong></span>
            </div>
          )}

          <p className="hover:text-zinc-400 transition-colors cursor-pointer flex items-center space-x-1.5 font-sans">
            <span>Powered by secure cryptographic networks &bull; PCI compliant gateway node 3000</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
