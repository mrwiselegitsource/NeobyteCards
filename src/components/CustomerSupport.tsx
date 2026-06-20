import React, { useState } from 'react';
import { Mail, Phone, Clock, Send, Check, Copy, ShieldCheck, HelpCircle } from 'lucide-react';

export interface SupportContacts {
  email: string;
  phone: string;
  operatingHours: string;
}

interface CustomerSupportProps {
  contacts: SupportContacts;
  onSubmitTicket: (name: string, email: string, message: string) => Promise<boolean>;
}

export const CustomerSupport: React.FC<CustomerSupportProps> = ({ contacts, onSubmitTicket }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contacts.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(contacts.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const success = await onSubmitTicket(name, email, message);
      if (success) {
        setSubmitSuccess(true);
        setName('');
        setEmail('');
        setMessage('');
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        setErrorMsg('Failed to transmit ticket. Please try again or direct-mail our support team.');
      }
    } catch (err) {
      setErrorMsg('An unexpected connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-black py-16 px-4 border-t border-zinc-900" id="customer-support-portal">
      <div className="max-w-6xl mx-auto">
        
        {/* Title Grid */}
        <div className="text-center md:text-left mb-12">
          <div className="inline-flex items-center space-x-2 bg-[#122c12]/40 border border-[#adff2f]/20 px-3 py-1 rounded-full text-[10px] font-mono text-[#adff2f] uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Cyber-Security Support Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-tight uppercase" id="support-heading">
            NEOBYTE <span className="text-[#adff2f]">CUSTOMER SUPPORT</span> SECURE HUB
          </h2>
          <p className="text-xs text-zinc-500 max-w-2xl font-sans mt-2 leading-relaxed">
            Need active account help, credit line verification, or bespoke node setups? Consult our real-time verified support lines below or dispatch an authenticated message directly to our cybersecurity response team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Contact details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Main Info Card */}
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 space-y-5 text-left">
              <h3 className="text-white text-sm font-sans font-extrabold uppercase tracking-wider text-[#adff2f] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#adff2f]" />
                VERIFIED OPERATIONAL NODE
              </h3>
              
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Our support terminals are protected with multi-layered secure SSL integrations. All customer calls and email tickets are managed on zero-log private servers for supreme confidentiality.
              </p>

              <div className="border-t border-zinc-900 pt-4 space-y-4 font-mono text-xs text-left">
                
                {/* Support Email Row */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">ADMIN-SECURED EMAIL ADDRESS</span>
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-900 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Mail className="w-4 h-4 text-[#adff2f] shrink-0" />
                      <span className="text-white font-bold truncate select-all">{contacts.email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="text-[10px] text-zinc-400 hover:text-white uppercase px-2 py-1 bg-zinc-950 rounded border border-zinc-800 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3 h-3 text-[#adff2f]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Support Helpline Row */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">SECURE TELEPHONY LINE HELPLINE</span>
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-900 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Phone className="w-4 h-4 text-[#adff2f] shrink-0" />
                      <a href={`tel:${contacts.phone}`} className="text-white font-bold truncate hover:text-[#adff2f] transition-colors">{contacts.phone}</a>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="text-[10px] text-zinc-400 hover:text-white uppercase px-2 py-1 bg-zinc-950 rounded border border-zinc-800 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {copiedPhone ? (
                        <>
                          <Check className="w-3 h-3 text-[#adff2f]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Hours of Coverage Row */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">TERMINAL COVERAGE METRICS</span>
                  <div className="bg-zinc-900/30 p-3 rounded-xl border border-zinc-900/60 flex items-center space-x-2.5">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300 font-sans">{contacts.operatingHours}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Side: Message Input Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 text-left">
              <h3 className="text-white text-sm font-sans font-extrabold uppercase tracking-wider mb-4">
                DISPATCH SECURE SUPPORT TICKET
              </h3>

              {submitSuccess ? (
                <div className="p-6 bg-[#122812]/50 border border-[#adff2f]/30 text-[#adff2f] rounded-xl text-center space-y-2 animate-in zoom-in-95 duration-200">
                  <ShieldCheck className="w-10 h-10 text-[#adff2f] mx-auto" />
                  <h4 className="text-sm font-sans font-black uppercase text-white">Transmission Authenticated</h4>
                  <p className="text-xs text-zinc-400 font-sans">
                    Your support message was securely registered inside our helpdesk node. A response cybersecurity agent will email you shortly!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                  
                  {errorMsg && (
                    <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 rounded-lg text-xs">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-wide text-zinc-500 mb-1.5">Full Name / Tag</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jean Dupont"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-sans text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-wide text-zinc-500 mb-1.5">Your Account Email</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. client@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-sans text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wide text-zinc-500 mb-1.5">Support Issue Details</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Please delineate your inquiry, proxy authentication, or credit limit setup requests..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-sans text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#adff2f] hover:bg-[#bbf04d] disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 font-mono"
                  >
                    {isSubmitting ? (
                      <span>TRANSMITTING SIGNAL...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 fill-current" />
                        <span>SEND SECURED SIGNAL</span>
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
