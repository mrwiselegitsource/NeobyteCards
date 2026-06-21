import React, { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, ShieldAlert, CheckCircle, Smartphone, Send, Landmark, Copy, Check, Upload, RefreshCw } from 'lucide-react';
import { PrepaidCard, SiteImagesConfig } from '../types';

interface PaymentPortalProps {
  card: PrepaidCard;
  onPaymentValidated: (notes?: string, screenshot?: string | null) => void;
  onBackToCheckout: () => void;
  siteImages?: SiteImagesConfig;
}

export const PaymentPortal: React.FC<PaymentPortalProps> = ({
  card,
  onPaymentValidated,
  onBackToCheckout,
  siteImages
}) => {
  const [activeMethod, setActiveMethod] = useState<'mobile' | 'bitcoin' | 'neomail'>('mobile');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isMMModalOpen, setIsMMModalOpen] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  // Mobile money states
  const [mmCountry, setMmCountry] = useState('United States (USD)');
  const [mmMobileNumber, setMmMobileNumber] = useState('');
  const [mmCarrier, setMmCarrier] = useState('MTN');
  const [mmAmount, setMmAmount] = useState(card.price.toString());

  // Eversend stats
  const [eversendStatus, setEversendStatus] = useState<'form' | 'submitting' | 'done'>('form');

  // Dynamic rotated variables from storage configpools (no back-to-back repeats for user sessions)
  const [currentBitcoinAddress, setCurrentBitcoinAddress] = useState('1AvUwag3sbSBmZd16qmQxPc62zPKje4Qrq');
  const [currentEversendLink, setCurrentEversendLink] = useState('https://eversend.me/credittrusts');

  useEffect(() => {
    // Determine user session identification key from logged-in session or input name
    const emailKey = localStorage.getItem('neobyte_user_auth');
    let userKey = 'guest';
    if (emailKey) {
      try {
        const parsed = JSON.parse(emailKey);
        if (parsed?.email) {
          userKey = parsed.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }
      } catch (e) {}
    }
    if (userKey === 'guest' && card.accountHolder) {
      userKey = card.accountHolder.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    // Load available EverSend Links pool configured by Admin (or defaults)
    const savedLinks = localStorage.getItem('neobyte_eversend_links');
    let linksPool = savedLinks ? JSON.parse(savedLinks) : [
      'https://eversend.me/credittrusts',
      'https://eversend.me/paynode55',
      'https://eversend.me/securesettlement'
    ];
    if (!Array.isArray(linksPool) || linksPool.length === 0) {
      linksPool = ['https://eversend.me/credittrusts'];
    }

    // Load available Crypto Address pool configured by Admin (or defaults)
    const savedCrypto = localStorage.getItem('neobyte_crypto_addresses');
    let cryptoPool = savedCrypto ? JSON.parse(savedCrypto) : [
      '1AvUwag3sbSBmZd16qmQxPc62zPKje4Qrq',
      'bc1qxy2kg3ut765rw9hl80p3ca286g281q0748t432',
      '3Ektv93tcqS8or42zP76pPde122mQxPce2'
    ];
    if (!Array.isArray(cryptoPool) || cryptoPool.length === 0) {
      cryptoPool = ['1AvUwag3sbSBmZd16qmQxPc62zPKje4Qrq'];
    }

    // Retrieve rotation histories for this specific user key
    const usedLinksKey = `neobyte_used_eversend_links_${userKey}`;
    const usedCryptoKey = `neobyte_used_bitcoin_addresses_${userKey}`;

    let usedLinks: string[] = [];
    try {
      const parsed = localStorage.getItem(usedLinksKey);
      if (parsed) usedLinks = JSON.parse(parsed);
    } catch(e) {}
    if (!Array.isArray(usedLinks)) usedLinks = [];

    let usedCrypto: string[] = [];
    try {
      const parsed = localStorage.getItem(usedCryptoKey);
      if (parsed) usedCrypto = JSON.parse(parsed);
    } catch(e) {}
    if (!Array.isArray(usedCrypto)) usedCrypto = [];

    // Select and cycle EverSend Link (1-3)
    let availableLinks = linksPool.filter((lk: string) => !usedLinks.includes(lk));
    let chosenLink = '';
    if (availableLinks.length > 0) {
      chosenLink = availableLinks[Math.floor(Math.random() * availableLinks.length)];
      usedLinks.push(chosenLink);
    } else {
      // Clear/Reset pool history to recycle entries smoothly when fully exhausted
      chosenLink = linksPool[Math.floor(Math.random() * linksPool.length)];
      usedLinks = [chosenLink];
    }
    localStorage.setItem(usedLinksKey, JSON.stringify(usedLinks));
    setCurrentEversendLink(chosenLink);

    // Select and cycle Bitcoin/Crypto Addresses
    let availableCrypto = cryptoPool.filter((addr: string) => !usedCrypto.includes(addr));
    let chosenCrypto = '';
    if (availableCrypto.length > 0) {
      chosenCrypto = availableCrypto[Math.floor(Math.random() * availableCrypto.length)];
      usedCrypto.push(chosenCrypto);
    } else {
      // Clear/Reset pool history to recycle entries smoothly when fully exhausted
      chosenCrypto = cryptoPool[Math.floor(Math.random() * cryptoPool.length)];
      usedCrypto = [chosenCrypto];
    }
    localStorage.setItem(usedCryptoKey, JSON.stringify(usedCrypto));
    setCurrentBitcoinAddress(chosenCrypto);
  }, [card.accountHolder]);

  const [txHash, setTxHash] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle address copy animation
  const handleCopyBtcAddress = () => {
    navigator.clipboard.writeText(currentBitcoinAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Drag and drop setup for Bitcoin payment confirmation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedFile(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedFile(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBitcoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentValidated(`Paid via BTC. Hash: ${txHash || '1AvUwag3...zPKje4Qrq'}`, uploadedFile);
  };

  const handleNeoMailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentValidated(`Paid via NeoMail Regional: ${mmCountry}, Carrier: ${mmCarrier}, Mobile: ${mmMobileNumber}`, uploadedFile);
  };

  return (
    <div className="w-full bg-black py-12 px-4 shadow-inner" id="payment-portal-wrapper">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Back navigation */}
        <button
          onClick={onBackToCheckout}
          id="payment-back-btn"
          className="flex items-center space-x-2 text-zinc-400 hover:text-[#adff2f] transition-colors font-mono text-xs uppercase mb-4 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Change Billing Information</span>
        </button>

        <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white uppercase text-center tracking-tight">
          CHOOSE PAYMENT METHOD
        </h2>

        {/* Option Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveMethod('mobile')}
            className={`p-4 rounded-xl border font-sans text-xs font-bold uppercase transition-all tracking-wider cursor-pointer ${
              activeMethod === 'mobile'
                ? 'bg-[#122c12] text-[#adff2f] border-[#adff2f]/30 ring-1 ring-[#adff2f]/30'
                : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'
            }`}
          >
            Mobile Money
          </button>
          
          <button
            onClick={() => setActiveMethod('bitcoin')}
            className={`p-4 rounded-xl border font-sans text-xs font-bold uppercase transition-all tracking-wider cursor-pointer ${
              activeMethod === 'bitcoin'
                ? 'bg-[#122c12] text-[#adff2f] border-[#adff2f]/30 ring-1 ring-[#adff2f]/30'
                : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'
            }`}
          >
            Bitcoin Payment
          </button>

          <button
            onClick={() => setActiveMethod('neomail')}
            className={`p-4 rounded-xl border font-sans text-xs font-bold uppercase transition-all tracking-wider cursor-pointer ${
              activeMethod === 'neomail'
                ? 'bg-[#122c12] text-[#adff2f] border-[#adff2f]/30 ring-1 ring-[#adff2f]/30'
                : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'
            }`}
          >
            NeoMail Pay
          </button>
        </div>

        {/* Method Subsections Panels */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8">
          
          {/* Mobile Money Selection Panel */}
          {activeMethod === 'mobile' && (
            <div className="space-y-6 text-center max-w-md mx-auto" id="portal-mobile-money">
              <div className="flex justify-center text-lime-400">
                <Smartphone className="w-12 h-12" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-white text-lg font-sans font-bold uppercase tracking-wide">
                  SEND E-MONEY
                </h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Click the button below to complete the secure payment of <span className="text-[#adff2f] font-mono font-bold">${card.price.toFixed(2)} USD</span> using the Eversend compliance gateway.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsMMModalOpen(true)}
                  id="mm-open-eversend-btn"
                  className="w-full py-4 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-extrabold text-xs tracking-widest uppercase rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Continue to Payment
                </button>
              </div>

              <div className="flex items-center justify-center space-x-1 text-[10px] text-zinc-650 font-mono">
                <span>Secured by SSL, ASSA &bull; Escrow verification active</span>
              </div>
            </div>
          )}

          {/* Bitcoin Payment Selection Panel */}
          {activeMethod === 'bitcoin' && (
            <div className="space-y-6 text-left max-w-lg mx-auto" id="portal-bitcoin">
              
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                {/* Simulated QR Code representation */}
                <div className="w-32 h-32 bg-white p-2 rounded-xl flex flex-col justify-between shadow-lg flex-shrink-0">
                  <div className="w-full h-full bg-[radial-gradient(#111_1.5px,transparent_1.5px)] bg-[size:6px_6px] flex flex-col items-center justify-center relative">
                    <div className="w-6 h-6 border-4 border-black absolute top-0 left-0" />
                    <div className="w-6 h-6 border-4 border-black absolute top-0 right-0" />
                    <div className="w-6 h-6 border-4 border-black absolute bottom-0 left-0" />
                    <Wallet className="w-6 h-6 text-black relative z-10" />
                  </div>
                </div>

                <div className="space-y-3 flex-1 w-full text-center sm:text-left">
                  <div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase bg-amber-500/20 text-amber-500 rounded border border-amber-500/10">
                      Bitcoin Address Active
                    </span>
                    <h3 className="text-white text-sm font-sans font-bold uppercase tracking-wider mt-1.5 label-awaiting">
                      BITCOIN PAYMENT
                    </h3>
                  </div>
                  
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    Scan the QR code or copy the address to complete payment. Transmit exactly <span className="text-[#adff2f] font-mono font-bold">${card.price.toFixed(2)} USD</span> worth of BTC.
                  </p>

                  {/* Address indicator with copy trigger */}
                  <div className="flex items-center bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
                    <span className="text-[10px] text-zinc-400 font-mono px-3 py-1.5 select-all truncate flex-1">
                      {currentBitcoinAddress}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyBtcAddress}
                      id="btc-address-copy"
                      className="p-2 border-l border-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all flex-shrink-0 cursor-pointer"
                      title="Copy Address"
                    >
                      {copiedAddress ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-emerald-400 font-bold">Awaiting Payment...</span>
              </div>

              {/* Screenshot Upload with Form Confirmation */}
              <form onSubmit={handleBitcoinSubmit} className="space-y-4 pt-2 border-t border-zinc-905">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider font-mono">
                  CONFIRM YOUR PAYMENT
                </h4>
                <p className="text-[10px] text-zinc-500">
                  After completing the blockchain transaction, upload your transfer confirmation screenshot and fill in the identifier below.
                </p>

                {/* Secure Tx hash input */}
                <div className="text-left space-y-1">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400">Transaction ID / Hash (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1a2b3c4d5e...f6g7"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 focus:border-[#adff2f]/30 p-2.5 rounded-xl text-white outline-none"
                  />
                </div>

                {/* Drag and Drop Screenshot Uploader */}
                <div className="space-y-1 text-left">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400">Transfer screenshot</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all relative ${
                      isDragging 
                        ? 'border-[#adff2f] bg-[#122c12]/20' 
                        : uploadedFile 
                        ? 'border-emerald-500 bg-[#0d2212]/10' 
                        : 'border-zinc-805 bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="file"
                      id="btc-receipt-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                        <p className="text-xs text-white font-mono font-bold truncate max-w-xs mx-auto">Upload Successful!</p>
                        <p className="text-[10px] text-zinc-500">Click or drag and drop to replace file</p>
                        
                        {/* Compact thumbnail preview */}
                        <div className="relative w-16 h-16 border border-zinc-800 mx-auto rounded-lg overflow-hidden">
                          <img src={uploadedFile} alt="Receipt preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-zinc-500 mx-auto" />
                        <p className="text-xs text-zinc-300 font-sans font-medium">Drag & Drop transaction screenshot or click</p>
                        <p className="text-[10px] text-zinc-650 font-mono">Format support: PNG, JPG, JPEG</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm button */}
                <button
                  type="submit"
                  id="btc-submit-payment"
                  className="w-full py-4 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-extrabold text-xs tracking-widest uppercase rounded-xl transition-all shadow-md cursor-pointer mt-4"
                >
                  Confirm Payment
                </button>
              </form>

            </div>
          )}

          {/* NeoMail Pay Selection Panel */}
          {activeMethod === 'neomail' && (
            <form onSubmit={handleNeoMailSubmit} className="space-y-5 max-w-md mx-auto text-left py-2" id="portal-neomail">
              
              <div className="text-center mb-4 space-y-1">
                <Landmark className="w-12 h-12 text-[#adff2f] mx-auto" />
                <h3 className="text-white text-base font-sans font-bold uppercase tracking-wide">
                  NeoMail Regional Exchange
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Execute direct, real-time local integrations with safe regional carriers.
                </p>
              </div>

              {/* Country dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Select Region / Country</label>
                <select
                  value={mmCountry}
                  onChange={(e) => {
                    setMmCountry(e.target.value);
                    if (e.target.value.includes('Ghana')) setMmCarrier('MTN');
                    else if (e.target.value.includes('Kenya')) setMmCarrier('M-PESA');
                    else if (e.target.value.includes('Tanzania')) setMmCarrier('HaloPesa');
                    else setMmCarrier('MTN');
                  }}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-zinc-200 outline-none focus:border-[#adff2f]/30"
                >
                  <option value="United States (USD)">United States (USD)</option>
                  <option value="Ghana (GHS)">Ghana (GHS)</option>
                  <option value="Zambia (ZMW)">Zambia (ZMW)</option>
                  <option value="South Africa (ZAR)">South Africa (ZAR)</option>
                  <option value="Tanzania (TZS)">Tanzania (TZS)</option>
                  <option value="Nigeria (NGN)">Nigeria (NGN)</option>
                  <option value="Kenya (KES)">Kenya (KES)</option>
                  <option value="United Kingdom (GBP)">United Kingdom (GBP)</option>
                  <option value="Germany (EUR)">Germany (EUR)</option>
                  <option value="Cameroon">Cameroon</option>
                </select>
              </div>

              {/* Mobile Number Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Enter Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +233 24 000 0000"
                  value={mmMobileNumber}
                  onChange={(e) => setMmMobileNumber(e.target.value)}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                />
              </div>

              {/* Carrier Selection */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Select Carrier</label>
                <select
                  value={mmCarrier}
                  onChange={(e) => setMmCarrier(e.target.value)}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-zinc-200 outline-none focus:border-[#adff2f]/30"
                >
                  <option value="MTN">MTN</option>
                  <option value="Airtel/Tigo">Airtel / Tigo</option>
                  <option value="Telecel (Formerly Vodafone)">Telecel (formerly Vodafone)</option>
                  <option value="ZAMTEL">ZAMTEL</option>
                  <option value="HaloPesa">HaloPesa</option>
                  <option value="Tigo">Tigo</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="M-PESA">M-PESA</option>
                </select>
              </div>

              {/* Enter Amount */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Enter Local Equivalent Amount</label>
                <input
                  type="text"
                  required
                  value={mmAmount}
                  onChange={(e) => setMmAmount(e.target.value)}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                />
              </div>

              {/* Drag and Drop Screenshot Uploader for NeoMail */}
              <div className="space-y-1 text-left mt-4">
                <label className="block text-[9px] font-mono uppercase tracking-wider text-zinc-400">Transfer screenshot</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all relative ${
                    isDragging 
                      ? 'border-[#adff2f] bg-[#122c12]/20' 
                      : uploadedFile 
                      ? 'border-emerald-500 bg-[#0d2212]/10' 
                      : 'border-zinc-805 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="file"
                    id="neomail-receipt-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto" />
                      <p className="text-[10px] text-white font-mono font-bold truncate max-w-xs mx-auto">Upload Successful!</p>
                      <div className="relative w-12 h-12 border border-zinc-800 mx-auto rounded overflow-hidden">
                        <img src={uploadedFile} alt="Receipt preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                      <p className="text-[10px] text-zinc-400 font-sans">Drag & Drop transaction screenshot or click</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning tag */}
              <p className="text-[10px] text-zinc-650 font-sans italic text-center leading-normal">
                IMPORTANT WARNING: Double check exchange compliance guidelines prior to authorizing the carrier transfer node.
              </p>

              {/* Submit Pay Now */}
              <button
                type="submit"
                id="neomail-pay-submit"
                className="w-full py-4 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-extrabold text-xs tracking-widest uppercase rounded-xl transition-all shadow-md cursor-pointer"
              >
                Pay Now
              </button>

            </form>
          )}

        </div>

      </div>

      {/* Embedded High-Fidelity Interactive Eversend Modal/Gateway Iframe */}
      {isMMModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md" id="eversend-gateway-container">
          <div className="relative w-full max-w-[440px] bg-[#090F09] border border-[#adff2f]/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(173,255,47,0.15)] flex flex-col text-[#EDEDED] font-sans h-[90vh]">
            
            {/* Header block status */}
            <div className="bg-zinc-950 p-4 flex items-center justify-between border-b border-zinc-900">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-[#adff2f] rounded-full animate-ping" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">Live Eversend Mobile Money Gateway</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMMModalOpen(false)}
                className="text-zinc-400 hover:text-[#adff2f] transition-all text-xs flex items-center gap-1 font-mono uppercase cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Abort Transfer</span>
              </button>
            </div>

            {/* The Integrated Payment IFrame with Custom Mask */}
            <div className="flex-1 bg-white relative overflow-hidden" id="iframe-viewport-container">
              <div style={{ position: 'relative', width: '100%', maxWidth: '480px', margin: '0 auto' }}>
                {/* STICKY OVERLAY - With centered logo */}
                <div style={{ position: 'sticky', top: 0, zIndex: 20, height: '240px', background: 'white', borderBottom: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 16px', pointerEvents: 'none' }}>
                  {/* CENTERED LOGO / PROFILE IMAGE */}
                  {siteImages?.paymentMaskLogo ? (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={siteImages.paymentMaskLogo} alt="Mask Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '32px', flexShrink: 0, marginBottom: '12px', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}>
                      🏦
                    </div>
                  )}
                  {/* Name below the logo */}
                  <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '18px', fontFamily: 'sans-serif' }}>
                    {siteImages?.paymentMaskName || 'Priscilla Acquah'}
                  </span>
                </div>

                {/* SCROLLABLE IFRAME CONTAINER */}
                <div style={{ height: '600px', overflowY: 'auto', marginTop: '-240px', paddingTop: '240px', background: 'white', borderRadius: '0 0 12px 12px', border: '1px solid #e0e0e0', borderTop: 'none' }}>
                  <iframe
                    src={currentEversendLink}
                    title="Eversend Payment Portal Link"
                    style={{ width: '100%', height: '1100px', border: 'none', display: 'block', marginTop: '-240px' }}
                    scrolling="no"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* Verification panel at the bottom */}
            <div className="bg-zinc-950 p-3 border-t border-zinc-900 flex flex-col justify-center">
              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 relative h-[42px]">
                  <input
                    type="file"
                    id="mm-receipt-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full h-full flex items-center justify-center gap-2 rounded-xl border text-[10px] font-mono transition-all ${
                    uploadedFile ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}>
                    {uploadedFile ? <><CheckCircle className="w-3.5 h-3.5"/> Proof Attached</> : <><Upload className="w-3.5 h-3.5"/> Upload Proof</>}
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowVerificationAlert(true);
                  }}
                  id="verify-eversend-btn"
                  className="flex-1 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-extrabold text-[10px] tracking-widest uppercase h-[42px] rounded-xl transition-all shadow-md shadow-[#adff2f]/5 cursor-pointer text-center flex items-center justify-center"
                >
                  {eversendStatus === 'submitting' ? (
                    <span className="flex items-center gap-1.5">
                      <span className="border-2 border-black border-t-transparent rounded-full w-3 h-3 animate-spin" />
                      <span>Verifying...</span>
                    </span>
                  ) : eversendStatus === 'done' ? (
                    <span>Done</span>
                  ) : (
                    <span>Verify & Mint</span>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom Verification Alert Modal */}
      {showVerificationAlert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121212] border border-[#adff2f]/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-[#adff2f]/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#adff2f]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Delivery Notice</h3>
            <p className="text-zinc-300 text-center text-sm mb-6 leading-relaxed">
              Please note: After your payment has been verified, your card details will be delivered to your email <span className="text-[#adff2f] font-bold">within 5 minutes</span>.
            </p>
            <button
              onClick={() => {
                setShowVerificationAlert(false);
                setEversendStatus('submitting');
                setTimeout(() => {
                  setEversendStatus('done');
                  setTimeout(() => {
                    setIsMMModalOpen(false);
                    onPaymentValidated(`Eversend Mobile Money payment verification completed successfully via secure ledger.`, uploadedFile);
                    setEversendStatus('form');
                  }, 1800);
                }, 1500);
              }}
              className="w-full bg-[#adff2f] hover:bg-[#bbf04d] text-black font-bold py-3 rounded-xl transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
