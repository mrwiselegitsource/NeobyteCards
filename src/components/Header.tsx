import React from 'react';
import { Shield, Key, Cpu, MoreVertical, X, User as UserIcon, LogOut } from 'lucide-react';
import { User, SiteImagesConfig } from '../types';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  activeTab: 'shop' | 'admin' | 'login';
  setActiveTab: (tab: 'shop' | 'admin' | 'login') => void;
  siteImages?: SiteImagesConfig;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  siteImages
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Admin section validation supports both registered email portals
  const isAdmin = user && user.isLoggedIn && user.email && (
    user.email.toLowerCase().trim() === 'mrwiselegitsource@proton.me' ||
    user.email.toLowerCase().trim() === 'mrwiselegitsource@gmail.com' ||
    user.email.toLowerCase().trim() === 'bankadmin@admin.com'
  );

  return (
    <header className="sticky top-0 z-50 bg-[#040904]/90 backdrop-blur-md border-b border-[#adff2f]/10 shadow-lg px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Slogan */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group animate-none"
          onClick={() => setActiveTab('shop')}
          id="brand-logo-trigger"
        >
          <img 
            src={siteImages?.headerLogo || "/logo.png"} 
            alt="NeoByte Bank Logo" 
            className="h-10 object-contain" 
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6" id="desktop-nav">
          <button
            onClick={() => setActiveTab('shop')}
            id="nav-shop-btn"
            className={`font-sans text-[13px] font-bold tracking-wide transition-colors duration-300 cursor-pointer ${
              activeTab === 'shop'
                ? 'text-[#adff2f]'
                : 'text-[#adff2f] hover:text-[#bbf04d]'
            }`}
          >
            Cards
          </button>
          
          <button
            onClick={() => {
              const element = document.getElementById('how-it-works-section');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              } else {
                setActiveTab('shop');
                setTimeout(() => {
                  document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            id="nav-how-it-works-btn"
            className="text-[#adff2f] hover:text-[#bbf04d] font-sans text-[13px] font-bold tracking-wide transition-colors duration-300 cursor-pointer animate-none"
          >
            How It Works
          </button>

          <button
            onClick={() => {
              const element = document.getElementById('customer-support-portal');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              } else {
                setActiveTab('shop');
                setTimeout(() => {
                  document.getElementById('customer-support-portal')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            id="nav-support-btn"
            className="text-[#adff2f] hover:text-[#bbf04d] font-sans text-[13px] font-bold tracking-wide transition-colors duration-300 cursor-pointer animate-none"
          >
            Contact Us
          </button>
          
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              id="nav-admin-btn"
              className={`font-sans text-[13px] font-bold tracking-wide transition-colors duration-300 cursor-pointer ${
                activeTab === 'admin'
                  ? 'text-[#adff2f]'
                  : 'text-[#adff2f] hover:text-[#bbf04d]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </span>
            </button>
          )}

          {/* User Logout Button directly in nav for desktop */}
          {user.isLoggedIn && (
            <button
              onClick={onLogout}
              className="ml-4 bg-[#c0ea5b] hover:bg-[#c9f561] text-black font-sans text-[13px] font-bold px-6 py-2 rounded transition-colors duration-300 shadow-md cursor-pointer"
            >
              Logout
            </button>
          )}
        </nav>

        {/* User Actions & Authenticator Access */}
        <div className="hidden md:flex items-center space-x-4">
          {!user.isLoggedIn && (
            <button
              onClick={() => setActiveTab('login')}
              id="header-login-btn"
              className={`flex items-center space-x-1.5 font-sans text-xs font-black tracking-wider uppercase px-4 py-2 rounded-xl transition-all duration-300 shadow-md cursor-pointer ${
                activeTab === 'login'
                  ? 'text-white bg-zinc-900 border border-zinc-750'
                  : 'bg-[#adff2f] hover:bg-[#bbf04d] text-black shadow-[#adff2f]/5'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Connect Client</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Trigger (Three dots) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          id="mobile-menu-trigger"
          className="md:hidden p-2 text-zinc-400 hover:text-white focus:outline-none cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <MoreVertical className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#adff2f]/10 flex flex-col space-y-3 bg-[#040904] px-2 pb-4 rounded-xl transition-all animate-in fade-in animate-none" id="mobile-nav">
          <button
            onClick={() => {
              setActiveTab('shop');
              setMobileMenuOpen(false);
            }}
            id="mobile-nav-shop"
            className={`w-full text-left py-2 px-3 rounded-lg text-[13px] font-bold tracking-wide transition-all ${
              activeTab === 'shop'
                ? 'text-[#adff2f] bg-[#122c12]/40 border-l-4 border-l-[#adff2f]'
                : 'text-zinc-300'
            }`}
          >
            Cards
          </button>
          
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              const element = document.getElementById('how-it-works-section');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              } else {
                setActiveTab('shop');
                setTimeout(() => {
                  document.getElementById('how-it-works-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            id="mobile-nav-how-it-works"
            className="w-full text-left py-2 px-3 rounded-lg text-[13px] font-bold tracking-wide text-zinc-300 transition-all cursor-pointer"
          >
            How It Works
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              const element = document.getElementById('customer-support-portal');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              } else {
                setActiveTab('shop');
                setTimeout(() => {
                  document.getElementById('customer-support-portal')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            id="mobile-nav-support"
            className="w-full text-left py-2 px-3 rounded-lg text-[13px] font-bold tracking-wide text-zinc-300 transition-all cursor-pointer"
          >
            Contact Us
          </button>
          
          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              id="mobile-nav-admin"
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-extrabold uppercase tracking-wide flex items-center justify-between transition-all ${
                activeTab === 'admin'
                  ? 'text-[#adff2f] bg-[#122c12]/40 border-l-4 border-l-[#adff2f]'
                  : 'text-zinc-355'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </span>
            </button>
          )}

          <hr className="border-zinc-850 my-1" />

          {user.isLoggedIn ? (
            <div className="flex items-center justify-between bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#122812] to-[#adff2f]/30 flex items-center justify-center border border-[#adff2f]/20 text-[#adff2f]">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] font-mono font-medium text-white">{user.username}</p>
                  <p className="text-[8px] text-[#adff2f] font-mono uppercase tracking-wider font-bold">Client Connected</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                id="mobile-nav-logout"
                className="text-zinc-400 hover:text-red-400 transition-colors p-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setActiveTab('login');
                setMobileMenuOpen(false);
              }}
              id="mobile-nav-login"
              className="w-full flex items-center justify-center space-x-1.5 bg-[#adff2f] text-black font-sans font-black uppercase text-xs px-4 py-2.5 rounded-lg shadow-md cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>Connect Client</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
