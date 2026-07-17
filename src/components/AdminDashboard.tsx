import React, { useState } from 'react';
import { PrepaidCard, CardBrand, PurchasedCard } from '../types';
import { ShieldCheck, Plus, Trash2, Image, FileText, Check, AlertTriangle, Users, Sliders, Edit, ExternalLink, Mail, CheckSquare, CreditCard, HelpCircle, Phone, Clock, MessageSquareText } from 'lucide-react';
import { SupportContacts } from './CustomerSupport';

import { SiteImagesConfig } from '../types';
import { sendEmail } from '../lib/emailService';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AdminDashboardProps {
  cards: PrepaidCard[];
  onAddCard: (card: PrepaidCard) => void;
  onDeleteCard: (id: string) => void;
  onUpdateCard?: (card: PrepaidCard) => void;
  purchasedCards?: PurchasedCard[];
  onUpdatePurchasedCard?: (card: PurchasedCard) => void;
  onDeletePurchasedCard?: (id: string) => void;
  supportContacts?: SupportContacts;
  onUpdateSupportContacts?: (contacts: SupportContacts) => Promise<void>;
  siteImages?: SiteImagesConfig;
  onUpdateSiteImages?: (images: SiteImagesConfig) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  cards,
  onAddCard,
  onDeleteCard,
  onUpdateCard,
  purchasedCards = [],
  onUpdatePurchasedCard,
  onDeletePurchasedCard,
  supportContacts,
  onUpdateSupportContacts,
  siteImages,
  onUpdateSiteImages,
}) => {
  // Initialize EmailJS
  React.useEffect(() => {
    const fetchGeneralSettings = async () => {
      try {
        const generalRef = doc(db, 'settings', 'general');
        const snap = await getDoc(generalRef);
        if (snap.exists()) {
          setAutoDispatchEnabled(snap.data().autoDispatchEnabled || false);
        }
      } catch (err) {
        console.error('Failed to load general settings:', err);
      }
    };

    fetchGeneralSettings();
  }, []);

  // Form fields
  const [brand, setBrand] = useState<CardBrand>('Mastercard');
  const [name, setName] = useState('');
  const [price, setPrice] = useState<string>('49.99');
  const [limit, setLimit] = useState<string>('5000');
  const [accountHolder, setAccountHolder] = useState('AUTHORIZATION NODE');
  const [customCardNumber, setCustomCardNumber] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [fileName, setFileName] = useState('');
  const [isUploadedImage, setIsUploadedImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState('');
  const [customTags, setCustomTags] = useState('New, Admin Addition');
  const [country, setCountry] = useState('United States');
  const [address, setAddress] = useState('733 Bank Road Corporate HQ');

  // Sub-tab selection state
  const [activeSubTab, setActiveSubTab] = useState<'cards' | 'gateways' | 'orders' | 'active_cards' | 'support_config' | 'images_config' | 'database_clone'>('orders');

  // Support contacts configuration state
  const [supportEmail, setSupportEmail] = useState(supportContacts?.email || 'support@neobytebank.com');
  const [supportPhone, setSupportPhone] = useState(supportContacts?.phone || '+1 (888) 555-NEO1');
  const [supportHours, setSupportHours] = useState(supportContacts?.operatingHours || '24/7/365 Global Coverage');
  const [isSavingSupport, setIsSavingSupport] = useState(false);

  // General Config State
  const [autoDispatchEnabled, setAutoDispatchEnabled] = useState(false);
  const [isSavingAutoDispatch, setIsSavingAutoDispatch] = useState(false);

  // Site layouts Image placeholders state
  const [adminHeaderLogo, setAdminHeaderLogo] = useState(siteImages?.headerLogo || '');
  const [adminHeroBackground, setAdminHeroBackground] = useState(siteImages?.heroBackground || '');
  const [adminHeroCardsStack, setAdminHeroCardsStack] = useState(siteImages?.heroCardsStack || '');
  const [adminLightningGraphic, setAdminLightningGraphic] = useState(siteImages?.lightningGraphic || '');
  const [adminMarketplaceImage, setAdminMarketplaceImage] = useState(siteImages?.marketplaceImage || '');
  const [adminTestimonialAvatar, setAdminTestimonialAvatar] = useState(siteImages?.testimonialAvatar || '');
  const [adminGetStartedGraphic, setAdminGetStartedGraphic] = useState(siteImages?.getStartedGraphic || '');
  const [adminFooterLogo, setAdminFooterLogo] = useState(siteImages?.footerLogo || '');
  const [adminPaymentMaskLogo, setAdminPaymentMaskLogo] = useState(siteImages?.paymentMaskLogo || '');
  const [adminPaymentMaskName, setAdminPaymentMaskName] = useState(siteImages?.paymentMaskName || '');
  const [adminSeoPreviewImage, setAdminSeoPreviewImage] = useState(siteImages?.seoPreviewImage || '');

  // Database Clone State
  const [importString, setImportString] = useState('');
  const [exportString, setExportString] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  React.useEffect(() => {
    if (siteImages) {
      setAdminHeaderLogo(siteImages.headerLogo || '');
      setAdminHeroBackground(siteImages.heroBackground || '');
      setAdminHeroCardsStack(siteImages.heroCardsStack || '');
      setAdminLightningGraphic(siteImages.lightningGraphic || '');
      setAdminMarketplaceImage(siteImages.marketplaceImage || '');
      setAdminTestimonialAvatar(siteImages.testimonialAvatar || '');
      setAdminGetStartedGraphic(siteImages.getStartedGraphic || '');
      setAdminFooterLogo(siteImages.footerLogo || '');
      setAdminPaymentMaskLogo(siteImages.paymentMaskLogo || '');
      setAdminPaymentMaskName(siteImages.paymentMaskName || '');
      setAdminSeoPreviewImage(siteImages.seoPreviewImage || '');
    }
  }, [siteImages]);

  React.useEffect(() => {
    if (supportContacts) {
      setSupportEmail(supportContacts.email || 'support@neobytebank.com');
      setSupportPhone(supportContacts.phone || '+1 (888) 555-NEO1');
      setSupportHours(supportContacts.operatingHours || '24/7/365 Global Coverage');
    }
  }, [supportContacts]);

  const handleSaveSupportContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportEmail.trim() || !supportPhone.trim()) {
      setAlertMessage({ type: 'error', text: 'Support contact email and phone are mandatory fields!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSavingSupport(true);
    try {
      if (onUpdateSupportContacts) {
        await onUpdateSupportContacts({
          email: supportEmail.trim(),
          phone: supportPhone.trim(),
          operatingHours: supportHours.trim(),
        });
        setAlertMessage({ type: 'success', text: 'Customer Support contacts successfully updated and deployed to front-side!' });
      } else {
        setAlertMessage({ type: 'error', text: 'Update service offline. Check Firebase initialization.' });
      }
    } catch (err) {
      setAlertMessage({ type: 'error', text: 'Error trying to publish settings to Firestore.' });
    } finally {
      setIsSavingSupport(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Gateways configurations state
  const [eversendLink1, setEversendLink1] = useState(() => {
    try {
      const saved = localStorage.getItem('neobyte_eversend_links');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr[0]) return arr[0];
      }
    } catch (e) {}
    return 'https://eversend.me/credittrusts';
  });
  const [eversendLink2, setEversendLink2] = useState(() => {
    try {
      const saved = localStorage.getItem('neobyte_eversend_links');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr[1]) return arr[1];
      }
    } catch (e) {}
    return 'https://eversend.me/paynode55';
  });
  const [eversendLink3, setEversendLink3] = useState(() => {
    try {
      const saved = localStorage.getItem('neobyte_eversend_links');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr[2]) return arr[2];
      }
    } catch (e) {}
    return 'https://eversend.me/securesettlement';
  });

  const [cryptoAddr1, setCryptoAddr1] = useState(() => {
    try {
      const saved = localStorage.getItem('neobyte_crypto_addresses');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr[0]) return arr[0];
      }
    } catch (e) {}
    return '1AvUwag3sbSBmZd16qmQxPc62zPKje4Qrq';
  });
  const [cryptoAddr2, setCryptoAddr2] = useState(() => {
    try {
      const saved = localStorage.getItem('neobyte_crypto_addresses');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr[1]) return arr[1];
      }
    } catch (e) {}
    return 'bc1qxy2kg3ut765rw9hl80p3ca286g281q0748t432';
  });
  const [cryptoAddr3, setCryptoAddr3] = useState(() => {
    try {
      const saved = localStorage.getItem('neobyte_crypto_addresses');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr[2]) return arr[2];
      }
    } catch (e) {}
    return '3Ektv93tcqS8or42zP76pPde122mQxPce2';
  });

  // General Config Handlers
  const handleToggleAutoDispatch = async () => {
    setIsSavingAutoDispatch(true);
    const newValue = !autoDispatchEnabled;
    try {
      const generalRef = doc(db, 'settings', 'general');
      await setDoc(generalRef, { autoDispatchEnabled: newValue }, { merge: true });
      setAutoDispatchEnabled(newValue);
    } catch (err) {
      console.error('Failed to update auto dispatch:', err);
    }
    setIsSavingAutoDispatch(false);
  };

  // Editing state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Active cards database searching and filtering states
  const [activeCardsSearch, setActiveCardsSearch] = useState('');
  const [activeCardsBrandFilter, setActiveCardsBrandFilter] = useState<'all' | CardBrand>('all');
  const [activeCardsStatusFilter, setActiveCardsStatusFilter] = useState<'all' | 'active' | 'awaiting_dispatch'>('all');
  const [revealedCardSecrets, setRevealedCardSecrets] = useState<Record<string, boolean>>({});

  // User Order modification & Dispatch states
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newCVV, setNewCVV] = useState('');
  const [dispatchDrafts, setDispatchDrafts] = useState<Record<string, { subject: string; message: string }>>({});
  const [customMessageOrderId, setCustomMessageOrderId] = useState<string | null>(null);
  const [savedCustomMessages, setSavedCustomMessages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('neobyte_saved_dispatch_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((value): value is string => typeof value === 'string');
      }
    } catch (e) {}
    return [];
  });
  const [newCustomMessage, setNewCustomMessage] = useState('');
  const [messageTemplateSelections, setMessageTemplateSelections] = useState<Record<string, string>>({});

  React.useEffect(() => {
    localStorage.setItem('neobyte_saved_dispatch_messages', JSON.stringify(savedCustomMessages));
  }, [savedCustomMessages]);

  // EmailJS Configuration states
  const [testEmail, setTestEmail] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testEmailError, setTestEmailError] = useState('');

  const getRecipientName = (order: PurchasedCard) => {
    return order.customerName || order.ownerEmail?.split('@')[0] || 'valued customer';
  };

  const getDefaultDispatchDraft = (order: PurchasedCard) => {
    const amount = order.price?.toFixed(2) ?? '0.00';
    const recipientName = getRecipientName(order);
    return {
      subject: `Your NeoByte card is ready — ${order.name}`,
      message: `Hello ${recipientName},\n\nYour payment for ${order.name} has been received and your card delivery is ready for review.\n\nCard: ${order.name}\nPrice: $${amount}\nCustomer: ${recipientName}\n\nPlease keep these details secure.`,
    };
  };

  const getDefaultCustomMessageDraft = (order: PurchasedCard) => {
    const recipientName = getRecipientName(order);
    return {
      subject: `Quick update on your NeoByte order`,
      message: `Hello ${recipientName},\n\nWe wanted to share a quick update about your recent order.\n\nPlease let us know if you need anything else.\n\nThank you,\nNeoByte Bank`,
    };
  };

  const sendEmailJsEmail = async (
    toEmail: string,
    card: PurchasedCard,
    options?: { subject?: string; message?: string }
  ): Promise<boolean> => {
    try {
      await sendEmail('card_activation', toEmail, {
        cardHolder: card.accountHolder,
        cardBrand: card.brand,
        cardNumber: card.cardNumber,
        expiry: card.expiry,
        cvv: card.cvv,
        limit: card.limit,
        imageURL: card.imageURL,
        customerName: card.customerName || getRecipientName(card),
        customMessage: options?.message,
        emailSubject: options?.subject,
      });
      return true;
    } catch (err) {
      console.error('Email API dispatch error:', err);
      return false;
    }
  };

  // Handle send test email
  const handleSendTestEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!testEmail.trim() || !testEmail.includes('@')) {
      setTestEmailStatus('error');
      setTestEmailError('Please enter a valid recipient email address.');
      return;
    }

    setTestEmailStatus('sending');
    setTestEmailError('');

    const demoCard: PurchasedCard = {
      id: 'demo-node-999',
      brand: 'Visa',
      name: 'NeoByte Ultimate Elite',
      price: 99.99,
      limit: 25000,
      cardNumber: '4204 9918 3772 1045',
      expiry: '09/31',
      cvv: '745',
      accountHolder: 'DEMO INTEGRATION USER',
      purchaseDate: new Date().toISOString().split('T')[0],
      isFrozen: false,
      status: 'active'
    };

    try {
      const success = await sendEmailJsEmail(testEmail.trim(), demoCard);
      if (success) {
        setTestEmailStatus('success');
        setTimeout(() => setTestEmailStatus('idle'), 5000);
      } else {
        setTestEmailStatus('error');
        setTestEmailError('EmailJS declined verification. Check your configuration.');
      }
    } catch (err) {
      setTestEmailStatus('error');
      setTestEmailError('Network link to EmailJS service failed.');
    }
  };

  // Interactive feedback state
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const sortedOrders = [...purchasedCards].sort((a, b) => {
    const aTime = a.purchaseTimestamp ?? (a.purchaseDate ? new Date(a.purchaseDate).getTime() : 0);
    const bTime = b.purchaseTimestamp ?? (b.purchaseDate ? new Date(b.purchaseDate).getTime() : 0);
    return bTime - aTime;
  });

  const pendingOrders = sortedOrders.filter(order => order.status !== 'active');
  const deliveredOrders = sortedOrders.filter(order => order.status === 'active');

  const handleSendDispatch = async (order: PurchasedCard) => {
    const draft = dispatchDrafts[order.id] || getDefaultDispatchDraft(order);
    setAlertMessage({ type: 'success', text: `Sending card details to ${order.ownerEmail || 'the customer'}...` });
    const success = await sendEmailJsEmail(order.ownerEmail || 'guest@neobyte.bank', order, {
      subject: draft.subject,
      message: draft.message,
    });

    if (success) {
      const deliveredCard: PurchasedCard = {
        ...order,
        status: 'active',
        deliveredAt: new Date().toISOString(),
        deliveryNote: draft.message,
      };
      if (onUpdatePurchasedCard) {
        onUpdatePurchasedCard(deliveredCard);
      }
      setAlertMessage({ type: 'success', text: `Card details sent and order marked as delivered for ${order.ownerEmail || 'the customer'}.` });
    } else {
      setAlertMessage({ type: 'error', text: 'Delivery email failed. Please try again.' });
    }
  };

  const handleSendCustomMessage = async (order: PurchasedCard) => {
    const draft = dispatchDrafts[order.id] || getDefaultCustomMessageDraft(order);
    setAlertMessage({ type: 'success', text: `Sending custom message to ${order.ownerEmail || 'the customer'}...` });
    const success = await sendEmailJsEmail(order.ownerEmail || 'guest@neobyte.bank', order, {
      subject: draft.subject,
      message: draft.message,
    });

    if (success) {
      setCustomMessageOrderId(null);
      setAlertMessage({ type: 'success', text: `Custom message sent to ${order.ownerEmail || 'the customer'}.` });
    } else {
      setAlertMessage({ type: 'error', text: 'Custom message failed. Please try again.' });
    }
  };

  const handleSaveCustomMessage = () => {
    const trimmed = newCustomMessage.trim();
    if (!trimmed) {
      setAlertMessage({ type: 'error', text: 'Type a custom message before saving it.' });
      return;
    }

    setSavedCustomMessages(prev => prev.includes(trimmed) ? prev : [trimmed, ...prev].slice(0, 8));
    setNewCustomMessage('');
    setAlertMessage({ type: 'success', text: 'Reusable custom message saved for future dispatches.' });
  };

  const handleSaveGateways = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty entries
    const links = [eversendLink1, eversendLink2, eversendLink3].map(l => l.trim()).filter(Boolean);
    const cryptos = [cryptoAddr1, cryptoAddr2, cryptoAddr3].map(c => c.trim()).filter(Boolean);
    
    if (links.length === 0) {
      setAlertMessage({ type: 'error', text: 'You must provide at least one EverSend payment link!' });
      return;
    }
    if (cryptos.length === 0) {
      setAlertMessage({ type: 'error', text: 'You must provide at least one active Bitcoin / Crypto address!' });
      return;
    }
    
    
    localStorage.setItem('neobyte_eversend_links', JSON.stringify(links));
    localStorage.setItem('neobyte_crypto_addresses', JSON.stringify(cryptos));
    
    setAlertMessage({ type: 'success', text: 'Gateway pools & configurations successfully updated!' });
    
    setTimeout(() => {
      setAlertMessage(null);
    }, 4500);
  };

  // Drag and Drop files handlers
  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setFileName(file.name);
      setIsUploadedImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageURL(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Derive responsive brand visual themes
  const getBrandDetails = (selectedBrand: CardBrand) => {
    switch (selectedBrand) {
      case 'Visa':
        return {
          color: 'from-[#0A2626] to-[#030D0D] hover:border-teal-400',
          textHighlight: 'text-teal-400',
          prefix: '4204',
        };
      case 'Amex':
        return {
          color: 'from-[#4C3B1E] to-[#1A140A] hover:border-yellow-500',
          textHighlight: 'text-yellow-500',
          prefix: '3782',
        };
      case 'Discover':
        return {
          color: 'from-[#4D0F1D] to-[#1C050A] hover:border-red-400',
          textHighlight: 'text-red-400',
          prefix: '6011',
        };
      case 'Atmos':
        return {
          color: 'from-[#0C1B2B] to-[#04090F] hover:border-blue-400',
          textHighlight: 'text-sky-400',
          prefix: '4938',
        };
      default: // Mastercard
        return {
          color: 'from-[#112F11] to-[#040C04] hover:border-[#adff2f]',
          textHighlight: 'text-lime-400',
          prefix: '5574',
        };
    }
  };

  const handleStartEdit = (card: PrepaidCard) => {
    setEditingCardId(card.id);
    setBrand(card.brand);
    setName(card.name);
    setPrice(card.price.toString());
    setLimit(card.limit.toString());
    setAccountHolder(card.accountHolder || 'AUTHORIZATION NODE');
    setCustomCardNumber(card.cardNumber || '');
    setImageURL(card.imageURL || '');
    setFileName(card.isUploadedImage ? 'Uploaded PNG File' : '');
    setIsUploadedImage(!!card.isUploadedImage);
    setDescription(card.description || '');
    setCustomTags(card.tags.join(', '));
    setCountry(card.country || 'United States');
    setAddress(card.address || '733 Bank Road Corporate HQ');

    const formElement = document.getElementById('admin-dashboard-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setAlertMessage({ type: 'error', text: 'Card title model name is required' });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setAlertMessage({ type: 'error', text: 'Price must be a positive number' });
      return;
    }

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 100) {
      setAlertMessage({ type: 'error', text: 'Spending Limit must be at least $100' });
      return;
    }

    const brandTheme = getBrandDetails(brand);

    if (editingCardId) {
      const existing = cards.find(c => c.id === editingCardId);
      const simulatedCardNumber = existing?.cardNumber || `${brandTheme.prefix} ${Math.floor(1000 + Math.random() * 9000).toString()} ${Math.floor(1000 + Math.random() * 9000).toString()} ${Math.floor(1000 + Math.random() * 9000).toString()}`;

      const updatedCard: PrepaidCard = {
        id: editingCardId,
        brand,
        name: name.trim(),
        price: priceNum,
        originalPrice: parseFloat((priceNum * 1.2).toFixed(2)),
        limit: limitNum,
        cardNumber: simulatedCardNumber,
        expiry: existing?.expiry || '12/2030',
        cvv: existing?.cvv || Math.floor(100 + Math.random() * 900).toString(),
        accountHolder: accountHolder.trim() || 'AUTHORIZATION NODE',
        address: address.trim() || 'Central Ledger Substation',
        country: country.trim() || 'Global',
        tags: customTags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        color: brandTheme.color,
        textHighlight: brandTheme.textHighlight,
        description: description.trim() || `Enterprise grade virtual proxy built for flexible checkout options. Auto-assigned with a clean $${limitNum.toLocaleString()} spending threshold.`,
        imageURL: imageURL.trim() || undefined,
        isUploadedImage: isUploadedImage
      };

      if (onUpdateCard) {
        onUpdateCard(updatedCard);
      }
      setAlertMessage({ type: 'success', text: `Success: "${updatedCard.name}" card configuration has been updated successfully!` });
      setEditingCardId(null);
    } else {
      // Simulate standard Luhn number attributes
      const numBlock2 = Math.floor(1000 + Math.random() * 9000).toString();
      const numBlock3 = Math.floor(1000 + Math.random() * 9000).toString();
      const numBlock4 = Math.floor(1000 + Math.random() * 9000).toString();
      const simulatedCardNumber = `${brandTheme.prefix} ${numBlock2} ${numBlock3} ${numBlock4}`;

      // Create PrepaidCard object conforming to Types definitions
      const newCard: PrepaidCard = {
        id: `card-${Date.now()}`,
        brand,
        name: name.trim(),
        price: priceNum,
        originalPrice: parseFloat((priceNum * 1.2).toFixed(2)),
        limit: limitNum,
        cardNumber: simulatedCardNumber,
        expiry: '12/2030',
        cvv: Math.floor(100 + Math.random() * 900).toString(),
        accountHolder: accountHolder.trim() || 'AUTHORIZATION NODE',
        address: address.trim() || 'Central Ledger Substation',
        country: country.trim() || 'Global',
        tags: customTags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        color: brandTheme.color,
        textHighlight: brandTheme.textHighlight,
        description: description.trim() || `Enterprise grade virtual proxy built for flexible checkout options. Auto-assigned with a clean $${limitNum.toLocaleString()} spending threshold.`,
        imageURL: imageURL.trim() || undefined,
        isUploadedImage: isUploadedImage
      };

      onAddCard(newCard);
      setAlertMessage({ type: 'success', text: `Success: "${newCard.name}" card configuration has been added to live stock!` });
    }

    // Reset Form Fields
    setName('');
    setPrice('49.99');
    setLimit('5000');
    setAccountHolder('AUTHORIZATION NODE');
    setCustomCardNumber('');
    setImageURL('');
    setFileName('');
    setIsUploadedImage(false);
    setDescription('');
    setCustomTags('New, Admin Addition');
    setCountry('United States');
    setAddress('733 Bank Road Corporate HQ');

    // Smooth scroll to top of card manager
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  const activeTheme = getBrandDetails(brand);

  return (
    <div className="w-full bg-black py-10 px-4 min-h-[80vh]" id="admin-dashboard-container">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Admin Dashboard Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-900 pb-6 gap-6">
          <div className="text-left space-y-2">
            <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-lime-950/80 border border-[#adff2f]/30 text-[#adff2f] font-bold uppercase tracking-wider">
              Secure Ledger Node
            </span>
            <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-white tracking-tight uppercase" id="admin-title">
              ADMIN <span className="text-[#adff2f]">DASHBOARD</span>
            </h2>
            <p className="text-xs text-zinc-500 max-w-xl font-sans leading-relaxed">
              Authorized admin console. Create and register virtual credit nodes directly into NeoByte's network catalog database, or review the current stock allocations.
            </p>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-left">
            <ShieldCheck className="w-5 h-5 text-[#adff2f]" />
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase block">Ledger Integrity Status</span>
              <span className="text-xs font-mono font-bold text-white uppercase">VALID & ENCRYPTED</span>
            </div>
          </div>
        </div>

        {/* Action feedback message */}
        {alertMessage && (
          <div 
            className={`p-4 rounded-xl text-xs font-mono border flex items-center space-x-2.5 animate-in fade-in duration-300 ${
              alertMessage.type === 'success'
                ? 'bg-[#122812]/40 border-lime-500/30 text-lime-400'
                : 'bg-red-950/20 border-red-500/30 text-red-400'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{alertMessage.text}</span>
          </div>
        )}

        {/* Tab Headers */}
        <div className="flex items-center space-x-1 border-b border-[#adff2f]/10 pb-0.5" id="admin-subtabs-header">
          <button
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'orders'
                ? 'border-[#adff2f] text-[#adff2f] font-black'
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-lime-400" />
            <span>Orders Dispatch ({purchasedCards.filter(c => c.status === 'awaiting_dispatch').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('cards')}
            className={`px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'cards'
                ? 'border-[#adff2f] text-white font-black'
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            Virtual Cards Stock
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('gateways')}
            className={`px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeSubTab === 'gateways'
                ? 'border-[#adff2f] text-white font-black'
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            Payment Portals Rotation Config
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('support_config')}
            className={`px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'support_config'
                ? 'border-[#adff2f] text-[#adff2f] font-black'
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Customer Support Config</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('images_config')}
            className={`px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'images_config'
                ? 'border-[#adff2f] text-[#adff2f] font-black'
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <Image className="w-3.5 h-3.5 text-[#adff2f]" />
            <span>PNG Placeholders</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('active_cards')}
            className={`px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'active_cards'
                ? 'border-[#adff2f] text-[#adff2f] font-black'
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Active Cards Database ({purchasedCards.filter(c => c.status === 'active').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('database_clone')}
            className={`px-5 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'database_clone'
                ? 'border-[#adff2f] text-[#adff2f] font-black'
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Database Clone</span>
          </button>
        </div>

        {activeSubTab === 'orders' ? (
          <div className="space-y-6 text-left" id="admin-orders-tab">
            
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 space-y-2">
              <h3 className="text-white text-base font-sans font-extrabold uppercase tracking-widest text-[#adff2f]">
                CLIENT PURCHASE DISPATCH GATEWAY
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Approve newly signed up profiles' payments. Verify upload receipts, assign active card parameters dynamically, and trigger Gmail client linkages or automated clipboard dispatches.
              </p>
            </div>

            {/* Auto-Dispatch Toggle */}
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-white text-base font-sans font-extrabold uppercase tracking-widest flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-white" />
                  Global Auto-Dispatch Mode
                </h3>
                <p className="text-xs text-zinc-400 font-sans mt-2">
                  If enabled, EVERY new card purchase will be instantly delivered to the customer automatically without requiring admin approval, regardless of payment method.
                </p>
              </div>
              <button
                onClick={handleToggleAutoDispatch}
                disabled={isSavingAutoDispatch}
                className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all whitespace-nowrap shadow-xl cursor-pointer ${
                  autoDispatchEnabled 
                    ? 'bg-[#adff2f] text-black shadow-[#adff2f]/20 hover:bg-[#9ae52a]' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {isSavingAutoDispatch ? 'SAVING...' : autoDispatchEnabled ? 'AUTO-DISPATCH ON' : 'AUTO-DISPATCH OFF'}
              </button>
            </div>

            {/* Clear Dispatched History Action */}
            {purchasedCards.length > 0 && purchasedCards.some(c => c.status === 'active') && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear off ALL fully dispatched and active test cards? This will permanently delete them from history.')) {
                      const activeCards = purchasedCards.filter(c => c.status === 'active');
                      activeCards.forEach(c => {
                        if (onDeletePurchasedCard) {
                          onDeletePurchasedCard(c.id);
                        }
                      });
                      setAlertMessage({ type: 'success', text: 'All dispatched cards have been cleared from history.' });
                    }
                  }}
                  className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase text-[10px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All Dispatched History
                </button>
              </div>
            )}

            {purchasedCards.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto bg-zinc-950/60 p-8 rounded-2xl border border-zinc-900">
                <FileText className="w-12 h-12 text-zinc-700 mx-auto" />
                <h3 className="text-white text-sm font-sans font-bold uppercase tracking-wider">
                  No Client Purchases
                </h3>
                <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                  No registered checkout profiles or purchase submissions exist inside local cache.
                </p>
              </div>
            ) : (
              <div className="space-y-8" id="orders-cards-stack">
                {pendingOrders.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-blue-400">Not Delivered Yet ({pendingOrders.length})</h3>
                      <span className="text-[10px] uppercase text-zinc-500 font-mono">Awaiting admin dispatch</span>
                    </div>
                            <div className="space-y-4">
                      {pendingOrders.map((order) => {
                        const isPending = true;
                        const isEditingThis = editingOrderId === order.id;
                        const draft = dispatchDrafts[order.id] || getDefaultDispatchDraft(order);
                        const customDraft = dispatchDrafts[order.id] || getDefaultCustomMessageDraft(order);

                        return (
                          <div 
                            key={order.id} 
                            className="p-6 rounded-2xl bg-zinc-950 border-2 border-blue-500 shadow-[0_0_24px_rgba(59,130,246,0.2)]"
                          >
                      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                        
                        {/* Left: Metadata & Client Details */}
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-zinc-900 px-2.5 py-1 text-zinc-400 rounded-lg border border-zinc-850">
                              Order: {order.brand}
                            </span>
                            
                            {isPending ? (
                              <span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase bg-blue-500/15 border border-blue-500/20 text-blue-500 rounded-lg animate-pulse">
                                awaiting dispatch
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-lg">
                                active
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                            <div className="space-y-1">
                              <span className="text-zinc-[550] uppercase block text-zinc-500">Customer Email</span>
                              <span className="text-white font-bold select-all truncate block">{order.ownerEmail || 'manmagic550@yahoo.com'}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-zinc-[550] uppercase block text-zinc-500">Account Holder</span>
                              <span className="text-[#adff2f] font-bold block">{order.accountHolder}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-zinc-[550] uppercase block text-zinc-500">Date Purchased</span>
                              <span className="text-zinc-300 block">{order.purchaseDate}</span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-zinc-[550] uppercase block text-zinc-500">Retail Price paid</span>
                              <span className="text-zinc-300 block font-bold">${order.price.toFixed(2)} USD</span>
                            </div>
                          </div>

                          <div className="bg-zinc-900/30 p-3.5 border border-zinc-900 rounded-xl space-y-1 text-xs">
                            <span className="text-[10px] uppercase text-zinc-500 font-mono block">Payment Trace info:</span>
                            <p className="text-zinc-300 font-sans italic">{order.paymentMethod || 'Direct secure e-money dispatch'}</p>
                          </div>

                        </div>

                        {/* Middle: Interactive Base64 Screenshot View */}
                        {order.paymentScreenshot && (
                          <div className="w-full sm:w-auto flex-shrink-0 text-left space-y-1 bg-zinc-900/10 p-3 rounded-xl border border-zinc-900/60">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider">Payments Proof Screenshot</span>
                            <div className="relative group w-24 h-24 bg-black border border-zinc-850 rounded-lg overflow-hidden flex items-center justify-center">
                              <img 
                                src={order.paymentScreenshot} 
                                alt="User provided billing proof" 
                                className="w-full h-full object-cover group-hover:scale-105 transition-all" 
                                referrerPolicy="no-referrer"
                              />
                              <a 
                                href={order.paymentScreenshot} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] uppercase font-mono font-bold transition-all"
                              >
                                View Large
                              </a>
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Editing Actions Block */}
                      <div className="mt-6 pt-6 border-t border-zinc-900">
                        {isEditingThis ? (
                          <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-white text-xs font-mono uppercase tracking-widest font-black text-[#adff2f]">
                                Update delivery credentials
                              </h4>
                              <button
                                onClick={() => setEditingOrderId(null)}
                                className="text-[10px] uppercase text-zinc-400 hover:text-zinc-200"
                              >
                                Close
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Credit Card Number</label>
                                <input
                                  type="text"
                                  value={newCardNumber}
                                  onChange={(e) => setNewCardNumber(e.target.value)}
                                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white font-mono text-xs focus:border-[#adff2f]/30"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[10px] font-mono text-zinc-400 uppercase">Expiration (MM/YY)</label>
                                <input
                                  type="text"
                                  placeholder="12/30"
                                  value={newExpiry}
                                  onChange={(e) => setNewExpiry(e.target.value)}
                                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white font-mono text-xs focus:border-[#adff2f]/30"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-[10px] font-mono text-zinc-400 uppercase">CVV Code</label>
                                <input
                                  type="text"
                                  maxLength={4}
                                  value={newCVV}
                                  onChange={(e) => setNewCVV(e.target.value)}
                                  className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white font-mono text-xs focus:border-[#adff2f]/30"
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2.5 pt-2">
                              <button
                                onClick={async () => {
                                  const baseUpdatedCard: PurchasedCard = {
                                    ...order,
                                    cardNumber: newCardNumber.trim() || order.cardNumber,
                                    expiry: newExpiry.trim() || order.expiry,
                                    cvv: newCVV.trim() || order.cvv,
                                  };
                                  const draft = dispatchDrafts[order.id] || getDefaultDispatchDraft(baseUpdatedCard);
                                  setEditingOrderId(null);
                                  setAlertMessage({ type: 'success', text: `Sending card details to ${order.ownerEmail}...` });

                                  const success = await sendEmailJsEmail(order.ownerEmail || 'guest@neobyte.bank', baseUpdatedCard, {
                                    subject: draft.subject,
                                    message: draft.message,
                                  });
                                  if (success) {
                                    const dispatchedCard: PurchasedCard = {
                                      ...baseUpdatedCard,
                                      status: 'active',
                                      deliveredAt: new Date().toISOString(),
                                      deliveryNote: draft.message,
                                    };
                                    if (onUpdatePurchasedCard) {
                                      onUpdatePurchasedCard(dispatchedCard);
                                    }
                                    setAlertMessage({ type: 'success', text: `Card details sent and order marked as delivered for ${order.ownerEmail}.` });
                                  } else {
                                    setAlertMessage({ type: 'error', text: 'Email transmission failed. Please try again.' });
                                  }
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-sans font-extrabold text-xs uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                              >
                                <Mail className="w-4 h-4 text-black" />
                                <span>Deliver Card Details</span>
                              </button>
                              <button
                                onClick={() => setEditingOrderId(null)}
                                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-sans text-xs uppercase rounded-lg transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => handleSendDispatch(order)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>Deliver Card Details</span>
                                </button>
                                <button
                                  onClick={() => setCustomMessageOrderId(prev => prev === order.id ? null : order.id)}
                                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border border-zinc-800"
                                >
                                  <MessageSquareText className="w-3.5 h-3.5 text-teal-400" />
                                  <span>Custom Message</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingOrderId(order.id);
                                    setNewCardNumber(order.cardNumber);
                                    setNewExpiry(order.expiry);
                                    setNewCVV(order.cvv === '***' ? Math.floor(100 + Math.random() * 900).toString() : order.cvv);
                                  }}
                                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-[10px]"
                                >
                                  <Edit className="w-3.5 h-3.5 text-lime-400" />
                                  <span>Edit Credentials</span>
                                </button>
                              </div>
                              <div className="text-[11px] text-zinc-500 font-mono">Customer: {getRecipientName(order)}</div>
                            </div>

                            {customMessageOrderId === order.id && (
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
                                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                                  <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Saved templates</label>
                                    <select
                                      value={messageTemplateSelections[order.id] || ''}
                                      onChange={(e) => {
                                        const selected = e.target.value;
                                        setMessageTemplateSelections(prev => ({ ...prev, [order.id]: selected }));
                                        if (selected) {
                                          setDispatchDrafts(prev => ({ ...prev, [order.id]: { ...(prev[order.id] || getDefaultCustomMessageDraft(order)), message: selected } }));
                                        }
                                      }}
                                      className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs font-sans"
                                    >
                                      <option value="">Choose a saved template</option>
                                      {savedCustomMessages.map((template, index) => (
                                        <option key={`${template}-${index}`} value={template}>{template.length > 60 ? `${template.slice(0, 57)}...` : template}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Save a reusable message</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={newCustomMessage}
                                        onChange={(e) => setNewCustomMessage(e.target.value)}
                                        className="flex-1 p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs font-sans"
                                        placeholder="Type a reusable note"
                                      />
                                      <button
                                        onClick={handleSaveCustomMessage}
                                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Subject</label>
                                  <input
                                    type="text"
                                    value={customDraft.subject}
                                    onChange={(e) => setDispatchDrafts(prev => ({ ...prev, [order.id]: { ...(prev[order.id] || getDefaultCustomMessageDraft(order)), subject: e.target.value } }))}
                                    className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs font-sans"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Message</label>
                                  <textarea
                                    rows={3}
                                    value={customDraft.message}
                                    onChange={(e) => setDispatchDrafts(prev => ({ ...prev, [order.id]: { ...(prev[order.id] || getDefaultCustomMessageDraft(order)), message: e.target.value } }))}
                                    className="w-full p-2 bg-black border border-zinc-800 rounded-lg text-white text-xs font-sans"
                                  />
                                </div>
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setCustomMessageOrderId(null)}
                                    className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSendCustomMessage(order)}
                                    className="px-3 py-2 bg-teal-500 hover:bg-teal-400 text-black text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                                  >
                                    Send Message
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
                    </div>
                  </div>
                )}

                {deliveredOrders.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-emerald-400">Delivered ({deliveredOrders.length})</h3>
                      <span className="text-[10px] uppercase text-zinc-500 font-mono">Marked as delivered</span>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      {deliveredOrders.map((order) => (
                        <div key={order.id} className="p-6 rounded-2xl bg-zinc-950 border-2 border-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.2)]">
                          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
                            <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-zinc-900 px-2.5 py-1 text-zinc-400 rounded-lg border border-zinc-850">
                                  Order: {order.brand}
                                </span>
                                <span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-lg">
                                  delivered
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                                <div className="space-y-1">
                                  <span className="text-zinc-[550] uppercase block text-zinc-500">Customer Email</span>
                                  <span className="text-white font-bold select-all truncate block">{order.ownerEmail || 'manmagic550@yahoo.com'}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-zinc-[550] uppercase block text-zinc-500">Account Holder</span>
                                  <span className="text-[#adff2f] font-bold block">{order.accountHolder}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-zinc-[550] uppercase block text-zinc-500">Date Purchased</span>
                                  <span className="text-zinc-300 block">{order.purchaseDate}</span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-zinc-[550] uppercase block text-zinc-500">Retail Price paid</span>
                                  <span className="text-zinc-300 block font-bold">${order.price.toFixed(2)} USD</span>
                                </div>
                              </div>
                              {order.deliveryNote && (
                                <div className="bg-zinc-900/40 p-3.5 border border-zinc-900 rounded-xl text-xs text-zinc-300 font-sans">
                                  <span className="text-[10px] uppercase text-zinc-500 font-mono block">Admin Delivery Note</span>
                                  <p className="mt-1 whitespace-pre-wrap">{order.deliveryNote}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        ) : activeSubTab === 'cards' ? (
          <>
            {/* Split UI Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card Showcase / Realtime Live Preview (Left Area) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-950/55 p-6 rounded-2xl border border-zinc-900 flex flex-col justify-between space-y-6">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#adff2f] block text-left">
                &bull; Real-Time Card Node Preview
              </span>

              {/* Virtual Card Mockup */}
              <div 
                className={`relative w-full aspect-[1.58/1] rounded-2xl p-5 flex flex-col justify-between transition-all overflow-hidden ${
                  imageURL 
                    ? 'border-none shadow-none bg-transparent' 
                    : 'border border-[#adff2f]/20 shadow-[0_0_24px_rgba(173,255,47,0.05)] bg-gradient-to-br ' + activeTheme.color.split(' ').filter(c => !c.startsWith('hover:')).join(' ')
                }`}
                style={imageURL ? { backgroundImage: `url(${imageURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              >
                {/* When it's an uploaded image, we don't display standard credit card text overlays because the PNG is in place of the card */}
                {isUploadedImage && imageURL ? (
                  // Overlay to ensure border rounding is flawless
                  <div className="absolute inset-0 bg-transparent z-10" />
                ) : (
                  <>
                    {/* Background image overlay filter for content readability */}
                    {imageURL && <div className="absolute inset-0 bg-black/60 -z-0" />}

                    <div className="flex items-start justify-between z-10 relative">
                      <div>
                        <span className="text-[8px] font-mono tracking-widest text-[#adff2f] font-bold block">NEOBYTE BANK</span>
                        <span className="text-[9px] text-zinc-400 font-sans tracking-tight mt-0.5 uppercase block">PREPAID LIVE PREVIEW</span>
                      </div>
                      <span className="text-sm text-white font-mono font-extrabold">{brand}</span>
                    </div>

                    <div className="w-9 h-7 rounded bg-gradient-to-r from-yellow-500/95 to-yellow-600/90 border border-yellow-400/40 p-0.5 z-10 relative">
                      <div className="w-full h-full border border-yellow-900/10" />
                    </div>

                    <div className="space-y-1 text-left z-10 relative">
                      <p className="text-xs sm:text-sm text-white font-mono tracking-widest font-bold">
                        {activeTheme.prefix} **** **** {Math.floor(1000 + Math.random() * 9000)}
                      </p>
                      <div className="flex justify-between items-center text-[8px] text-[#adff2f] font-mono uppercase">
                        <span className="truncate max-w-[150px] font-bold tracking-wide">{name.trim().toUpperCase() || 'NEW CARD PROXY'}</span>
                        <span>12/12</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Brief spec detail overlay preview */}
              <div className="border border-zinc-900 rounded-xl overflow-hidden text-xs text-left">
                <div className="grid grid-cols-2 py-2 px-3 border-b border-zinc-900 bg-zinc-950/50">
                  <span className="text-zinc-500">Node Identifier</span>
                  <span className="text-white font-mono text-right truncate">NEO-T-{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="grid grid-cols-2 py-2 px-3 border-b border-zinc-900">
                  <span className="text-zinc-500">Retail Cost</span>
                  <span className="text-[#adff2f] font-mono text-right font-bold">${parseFloat(price || '0').toFixed(2)} USD</span>
                </div>
                <div className="grid grid-cols-2 py-2 px-3 border-b border-zinc-900">
                  <span className="text-zinc-500">Threshold Limit</span>
                  <span className="text-white font-mono text-right font-bold">${parseInt(limit || '0').toLocaleString()}/Month</span>
                </div>
                <div className="grid grid-cols-2 py-2 px-3">
                  <span className="text-zinc-500">Delivery Speed</span>
                  <span className="text-[#adff2f] font-mono text-right font-bold">Instant Activation</span>
                </div>
              </div>

            </div>
          </div>

          {/* Form Controls Input Area (Right Area) */}
          <div className="lg:col-span-7">
            <form onSubmit={handleCreateCard} className="bg-zinc-950 p-6 sm:p-8 rounded-2xl border border-zinc-900 space-y-6 text-left">
              
              <div className="flex items-center space-x-2 border-b border-zinc-900 pb-3">
                <Sliders className="w-5 h-5 text-[#adff2f]" />
                <h3 className="text-white text-xs font-bold font-mono uppercase tracking-wider">
                  Prepaid Card Schema Form
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Brand Selector */}
                <div className="space-y-1.5 focus-within:text-white">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Card Issuer Brand</label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value as CardBrand)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 focus:border-[#adff2f]/30 p-2.5 rounded-xl text-white outline-none cursor-pointer focus:ring-1 focus:ring-[#adff2f]/10"
                  >
                    <option value="Mastercard">Mastercard Network</option>
                    <option value="Visa">Visa Alliance</option>
                    <option value="Amex">American Express</option>
                    <option value="Discover">Discover Group</option>
                    <option value="Atmos">Atmos Specialized Credit</option>
                  </select>
                </div>

                {/* Name Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Card Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NeoByte Diamond Visa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 focus:border-[#adff2f]/30 p-2.5 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#adff2f]/10 placeholder:text-zinc-650"
                  />
                </div>

                {/* Price Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Retail Registration Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 45.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 focus:border-[#adff2f]/30 p-2.5 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#adff2f]/10 font-mono"
                  />
                </div>

                {/* Limit Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Credit Limit Volume ($)</label>
                  <input
                    type="number"
                    step="50"
                    required
                    placeholder="e.g. 5000"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 focus:border-[#adff2f]/30 p-2.5 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#adff2f]/10 font-mono"
                  />
                </div>

                {/* Account Holder Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 focus:border-[#adff2f]/30 p-2.5 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#adff2f]/10"
                  />
                </div>

                {/* Custom Card Number Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Display Card Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 5574 **** **** 7378"
                    value={customCardNumber}
                    onChange={(e) => setCustomCardNumber(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 focus:border-[#adff2f]/30 p-2.5 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#adff2f]/10 font-mono"
                  />
                  <p className="text-[8px] text-zinc-500 font-mono">Leave blank to auto-generate based on brand.</p>
                </div>

              </div>

              {/* Image Input Selection Block */}
              <div className="space-y-3 pb-2">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    Card Graphic / Image Upload
                  </label>
                  <span className="text-[8px] font-mono text-[#adff2f] uppercase font-bold">Displays "in place of the card"</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 transition-all text-center cursor-pointer min-h-[110px] ${
                      isDragging
                        ? 'border-[#adff2f] bg-[#122a12]/20'
                        : isUploadedImage
                        ? 'border-emerald-500/50 bg-emerald-950/20'
                        : 'border-zinc-850 hover:border-[#adff2f]/40 bg-zinc-900/40 hover:bg-zinc-900/60'
                    }`}
                    onClick={() => document.getElementById('card-png-upload-element')?.click()}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="card-png-upload-element"
                    />
                    <Image className={`w-5 h-5 mb-1.5 ${isUploadedImage ? 'text-[#adff2f]' : 'text-zinc-500'}`} />
                    <span className="text-[10px] font-sans font-extrabold text-white block">
                      {fileName ? 'Image Uploaded' : 'Drag & Drop Image (PNG, JPG, AVIF)'}
                    </span>
                    <span className="text-[8px] text-zinc-500 font-mono mt-0.5 truncate max-w-full px-2">
                      {fileName ? fileName : 'or click to browse files'}
                    </span>
                  </div>

                  {/* External URL alternative */}
                  <div className="flex flex-col justify-between p-4 bg-zinc-900/20 border border-zinc-850 rounded-xl space-y-2">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-zinc-400 block font-bold uppercase">Or Web Image URL</span>
                      <p className="text-[8px] text-zinc-600 leading-normal font-sans">
                        Type or paste a Card image URL (any format) from any external web repository:
                      </p>
                    </div>
                    <input
                      type="url"
                      placeholder="e.g. https://domain.com/card_graphic.png"
                      value={imageURL}
                      onChange={(e) => {
                        setImageURL(e.target.value);
                        if (e.target.value) {
                          // Default to true for any pasted images since users have PNG template URLs ready
                          setIsUploadedImage(true);
                          setFileName('');
                        }
                      }}
                      className="w-full text-[10px] bg-zinc-950 border border-zinc-850 focus:border-[#adff2f]/30 p-2.5 rounded-lg text-white outline-none font-mono placeholder:text-zinc-700 text-left"
                    />
                  </div>
                </div>

                {/* Explicit full graphic overlay toggle */}
                <div className="flex items-center space-x-3 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900">
                  <input
                    type="checkbox"
                    id="toggle-overlay-suppress"
                    checked={isUploadedImage}
                    onChange={(e) => setIsUploadedImage(e.target.checked)}
                    className="accent-[#adff2f] rounded border-zinc-800 bg-zinc-950 text-black focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <div className="text-left select-none">
                    <label htmlFor="toggle-overlay-suppress" className="block text-[10px] font-sans font-extrabold text-white uppercase cursor-pointer hover:text-[#adff2f] transition-colors">
                      Full Graphic Image Mode (Hide standard text, chip & logo overlays)
                    </label>
                    <p className="text-[8px] text-zinc-500 font-mono mt-0.5">
                      Enable this to display your PNG image purely as-designed. Disabling this synthesizes default credit card number, chip, and bank overlays on top of your background.
                    </p>
                  </div>
                </div>

                {imageURL && (
                  <div className="flex items-center justify-between bg-zinc-950 border border-[#adff2f]/10 p-2 rounded-xl text-[10px] text-[#adff2f] font-sans px-3">
                    <span className="flex items-center space-x-1.5 font-mono truncate">
                      <Check className="w-3.5 h-3.5 text-[#adff2f] shrink-0" />
                      <span className="truncate">{fileName ? `PNG File Loaded: ${fileName}` : `Web Image URL Loaded`}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsUploadedImage(false);
                        setImageURL('');
                        setFileName('');
                      }}
                      className="text-[8px] font-mono text-rose-400 hover:text-rose-300 uppercase underline cursor-pointer shrink-0 ml-2"
                    >
                      Clear Image
                    </button>
                  </div>
                )}
              </div>

              {/* Description box */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Card Specifications Description</label>
                <textarea
                  rows={2}
                  placeholder="Detail custom security credentials, features, or restrictions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 focus:border-[#adff2f]/30 p-2.5 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#adff2f]/10 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Semi-tags input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Tags (Comma-Separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Popular, High Limit, Hot"
                    value={customTags}
                    onChange={(e) => setCustomTags(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 focus:border-[#adff2f]/30 p-2.5 rounded-xl text-white outline-none"
                  />
                </div>

                {/* Country scope */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500">Card Base Country Access</label>
                  <input
                    type="text"
                    placeholder="e.g. United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 focus:border-[#adff2f]/30 p-2.5 rounded-xl text-white outline-none"
                  />
                </div>

              </div>

              {/* Submit Trigger Action */}
              <button
                type="submit"
                id="create-card-btn"
                className={`w-full py-4 font-sans font-extrabold text-xs tracking-widest uppercase rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-4 ${
                  editingCardId 
                    ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20' 
                    : 'bg-[#adff2f] hover:bg-[#bbf04d] text-black shadow-[#adff2f]/10'
                }`}
              >
                {editingCardId ? (
                  <>
                    <Edit className="w-4 h-4 text-black" />
                    <span>SAVE CARD CONFIGURATION CHANGES</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-black" />
                    <span>CONFIRM CARD CONFIGURATION</span>
                  </>
                )}
              </button>

              {editingCardId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCardId(null);
                    setName('');
                    setPrice('49.99');
                    setLimit('5000');
                    setImageURL('');
                    setFileName('');
                    setIsUploadedImage(false);
                    setDescription('');
                    setCustomTags('New, Admin Addition');
                    setCountry('United States');
                    setAddress('733 Bank Road Corporate HQ');
                  }}
                  className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-sans font-extrabold text-[10px] tracking-widest uppercase rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
                >
                  <span>CANCEL CARD EDITING</span>
                </button>
              )}

            </form>
          </div>

        </div>

        {/* Existing Inventory Management (Full Width Below) */}
        <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900 pb-4 gap-4 text-left">
            <h3 className="text-white text-base font-sans font-bold uppercase tracking-wide">
              Live Stock Catalog Index <span className="text-[#adff2f] font-mono">({cards.length})</span>
            </h3>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">
              Immediate changes applied to prepaid listing panel
            </span>
          </div>

          {/* Catalog Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider text-[10px] font-mono">
                  <th className="pb-3 font-semibold text-left">Card Profile</th>
                  <th className="pb-3 font-semibold text-left">Brand</th>
                  <th className="pb-3 font-semibold text-left">Monthly Limit</th>
                  <th className="pb-3 font-semibold text-left">Price ($)</th>
                  <th className="pb-3 font-semibold text-left">Tags</th>
                  <th className="pb-3 font-semibold text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 font-medium">
                {cards.map((card) => (
                  <tr key={card.id} className="hover:bg-zinc-900/20 transition-all text-zinc-300">
                    <td className="py-4">
                      <div className="flex items-center space-x-3 text-left">
                        <div className={`w-10 h-6 rounded bg-gradient-to-br ${card.color} border border-zinc-800 shrink-0 relative overflow-hidden`} >
                          {card.imageURL && (
                            <img src={card.imageURL} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <span className="text-white font-sans text-xs font-bold hover:text-[#adff2f] block">{card.name}</span>
                          <span className="text-[9px] text-[#adff2f] font-mono">{card.cardNumber.split(' ')[0]} **** {card.cardNumber.split(' ')[3] || '7378'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-zinc-400 font-bold uppercase">{card.brand}</td>
                    <td className="py-4 font-mono text-white font-bold">${card.limit.toLocaleString()}</td>
                    <td className="py-4 font-mono font-bold text-[#adff2f]">${card.price.toFixed(2)}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {card.tags.slice(0, 2).map((tg, i) => (
                          <span key={i} className="text-[8px] font-mono bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded font-bold uppercase">
                            {tg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleStartEdit(card)}
                          className="p-2 bg-amber-950/20 hover:bg-amber-950/80 border border-amber-900/30 text-amber-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Edit this card configuration"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCard(card.id)}
                          className="p-2 bg-red-950/20 hover:bg-red-950/80 border border-red-900/30 text-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Delete this card configuration"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

          </>
        ) : activeSubTab === 'active_cards' ? (
          <div className="space-y-6 text-left animate-in fade-in duration-300" id="admin-active-cards-tab">
            
            {/* Header info panel */}
            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-900 space-y-2">
              <h3 className="text-white text-base font-sans font-extrabold uppercase tracking-widest text-[#adff2f]">
                DYNAMIC ACTIVE CARDS SYSTEM VAULT
              </h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Monitor and administer all live or awaiting-dispatch prepaid proxy cards registered by customers. You can adjust credit limits, toggle frozen security status, edit custom internal administrative notes, and revoke profiles securely.
              </p>
            </div>

            {/* Filter and Search Bar controls */}
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Search Cards & Users</label>
                <input
                  type="text"
                  placeholder="e.g. email, holder name, id..."
                  value={activeCardsSearch}
                  onChange={(e) => setActiveCardsSearch(e.target.value)}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-white outline-none focus:border-[#adff2f]/30 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Filter Brand</label>
                <select
                  value={activeCardsBrandFilter}
                  onChange={(e) => setActiveCardsBrandFilter(e.target.value as any)}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-white outline-none focus:border-[#adff2f]/30 font-sans cursor-pointer"
                >
                  <option value="all">All Brands</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Visa">Visa</option>
                  <option value="Amex">Amex</option>
                  <option value="Discover">Discover</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1.5">Filter Delivery Status</label>
                <select
                  value={activeCardsStatusFilter}
                  onChange={(e) => setActiveCardsStatusFilter(e.target.value as any)}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-white outline-none focus:border-[#adff2f]/30 font-sans cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active (Dispatched)</option>
                  <option value="awaiting_dispatch">Awaiting Dispatch (1-Hour Delay)</option>
                </select>
              </div>
            </div>

            {/* Empty view check */}
            {purchasedCards.filter(card => {
              const matchedSearch = !activeCardsSearch.trim() || 
                card.id.toLowerCase().includes(activeCardsSearch.toLowerCase()) ||
                card.accountHolder.toLowerCase().includes(activeCardsSearch.toLowerCase()) ||
                card.ownerEmail.toLowerCase().includes(activeCardsSearch.toLowerCase()) ||
                card.cardNumber.toLowerCase().includes(activeCardsSearch.toLowerCase());
              const matchedBrand = activeCardsBrandFilter === 'all' || card.brand === activeCardsBrandFilter;
              const matchedStatus = activeCardsStatusFilter === 'all' || card.status === activeCardsStatusFilter;
              return matchedSearch && matchedBrand && matchedStatus;
            }).length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 max-w-sm mx-auto bg-zinc-950/60 p-8 rounded-2xl border border-zinc-900">
                <CreditCard className="w-12 h-12 text-zinc-700 mx-auto" />
                <h3 className="text-white text-sm font-sans font-bold uppercase tracking-wider">
                  No Matching Cards Found
                </h3>
                <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                  No purchased client card parameters matched your filter settings inside local state.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {purchasedCards.filter(card => {
                  const matchedSearch = !activeCardsSearch.trim() || 
                    card.id.toLowerCase().includes(activeCardsSearch.toLowerCase()) ||
                    card.accountHolder.toLowerCase().includes(activeCardsSearch.toLowerCase()) ||
                    card.ownerEmail.toLowerCase().includes(activeCardsSearch.toLowerCase()) ||
                    card.cardNumber.toLowerCase().includes(activeCardsSearch.toLowerCase());
                  const matchedBrand = activeCardsBrandFilter === 'all' || card.brand === activeCardsBrandFilter;
                  const matchedStatus = activeCardsStatusFilter === 'all' || card.status === activeCardsStatusFilter;
                  return matchedSearch && matchedBrand && matchedStatus;
                }).map(card => {
                  const isSecretsRevealed = !!revealedCardSecrets[card.id];
                  return (
                    <div 
                      key={card.id}
                      className="bg-zinc-950 p-5 rounded-2xl border border-zinc-900 hover:border-zinc-800 transition-all grid grid-cols-1 md:grid-cols-12 gap-5 animate-in fade-in duration-300"
                    >
                      {/* Left: Card visual preview (5 cols) */}
                      <div className="md:col-span-5 flex flex-col justify-between">
                        <div 
                          className={`relative w-full aspect-[1.58/1] rounded-xl p-4 flex flex-col justify-between overflow-hidden ${
                            card.imageURL 
                              ? 'border-none bg-transparent' 
                              : 'border border-[#adff2f]/10 bg-gradient-to-br ' + (card.color ? card.color.split(' ').filter(c => !c.startsWith('hover:')).join(' ') : 'from-[#112F11] to-[#040C04]')
                          }`}
                          style={card.imageURL && !card.isUploadedImage ? { backgroundImage: `url(${card.imageURL})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                        >
                          {card.isUploadedImage && card.imageURL ? (
                            <img src={card.imageURL} alt="Card preview" className="absolute inset-0 w-full h-full object-cover z-0" referrerPolicy="no-referrer" />
                          ) : (
                            <>
                              {card.imageURL && <div className="absolute inset-0 bg-black/60 z-0" />}
                              <div className="flex items-start justify-between z-10">
                                <div>
                                  <span className="text-[7px] font-mono tracking-widest text-[#adff2f] font-bold block">NEOBYTE BANK</span>
                                  <span className="text-[8px] text-zinc-400 font-sans tracking-tight uppercase block">{card.brand}</span>
                                </div>
                                <span className="text-xs text-white font-mono font-bold">{card.brand}</span>
                              </div>
                              <div className="w-8 h-6 rounded bg-gradient-to-r from-yellow-500/95 to-yellow-600/90 border border-yellow-400/40 p-0.5 z-10 mt-1">
                                <div className="w-full h-full border border-yellow-900/10" />
                              </div>
                              <div className="space-y-0.5 text-left z-10 mt-2">
                                <p className="text-[11px] text-white font-mono tracking-widest font-bold">
                                  {isSecretsRevealed ? card.cardNumber : `${card.cardNumber.split(' ').slice(0, 3).join(' ')} ****`}
                                </p>
                                <div className="flex justify-between items-center text-[7px] text-[#adff2f] font-mono uppercase">
                                  <span className="truncate max-w-[120px] font-bold">{card.accountHolder}</span>
                                  <span>{card.expiry}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Quick action details trigger */}
                        <div className="mt-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setRevealedCardSecrets(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                            className="text-[9px] font-mono font-black uppercase text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 px-2 py-1 rounded bg-zinc-900/40 cursor-pointer"
                          >
                            {isSecretsRevealed ? 'Hide Details' : 'Reveal Details'}
                          </button>

                          <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                            card.status === 'active' 
                              ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900/60' 
                              : 'bg-amber-900/30 text-amber-500 border border-amber-900/60 animate-pulse'
                          }`}>
                            {card.status === 'active' ? 'Active' : 'Awaiting'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Administrative Fields (7 cols) */}
                      <div className="md:col-span-7 space-y-3.5 text-left border-t md:border-t-0 md:border-l border-zinc-900 md:pl-5 pt-3 md:pt-0">
                        {/* Owner Email Block */}
                        <div className="space-y-1">
                          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Assigned Account Email Identifier</span>
                          <span className="text-xs text-white font-mono font-bold truncate block">{card.ownerEmail}</span>
                        </div>

                        {/* Card Parameters Table */}
                        <div className="bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-900 grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
                          <div>
                            <span className="text-[8px] text-zinc-500 block uppercase">EXPIRY</span>
                            <span className="text-white font-bold">{card.expiry}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 block uppercase">CVV CODE</span>
                            <span className="text-[#adff2f] font-bold">{isSecretsRevealed ? card.cvv : '***'}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-500 block uppercase">CARD ID</span>
                            <span className="text-zinc-400 font-bold max-w-[60px] truncate block mx-auto">{card.id.split('-')[1] || card.id}</span>
                          </div>
                        </div>

                        {/* Notes form */}
                        <div className="space-y-1">
                          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Administrative Card Notes</span>
                          <input
                            type="text"
                            value={card.notes || ''}
                            onChange={(e) => {
                              if (onUpdatePurchasedCard) {
                                onUpdatePurchasedCard({
                                  ...card,
                                  notes: e.target.value
                                });
                              }
                            }}
                            placeholder="Add administrative memos here..."
                            className="w-full text-[10px] bg-zinc-900 border border-[#27272a] p-2 rounded-lg text-white outline-none focus:border-[#adff2f]/20 font-sans"
                          />
                        </div>

                        {/* Adjust limit slider */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider">Dynamic Credit limit Threshold</span>
                            <span className="text-[10px] font-sans text-white font-bold">$ {card.limit.toLocaleString()} USD</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="100"
                              max="15000"
                              step="100"
                              value={card.limit}
                              onChange={(e) => {
                                if (onUpdatePurchasedCard) {
                                  onUpdatePurchasedCard({
                                    ...card,
                                    limit: parseInt(e.target.value)
                                  });
                                }
                              }}
                              className="flex-1 accent-[#adff2f] h-1 bg-zinc-900 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Admin Action Rows */}
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdatePurchasedCard) {
                                onUpdatePurchasedCard({
                                  ...card,
                                  isFrozen: !card.isFrozen
                                });
                              }
                            }}
                            className={`px-3 py-1.5 font-mono text-[9px] uppercase font-bold tracking-wider rounded border cursor-pointer transition-all ${
                              card.isFrozen
                                ? 'bg-amber-950/20 text-amber-500 border-amber-900/40 hover:bg-amber-950/40'
                                : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
                            }`}
                          >
                            {card.isFrozen ? '❄️ Frozen / Suspended' : '⚡ Unfrozen / Active'}
                          </button>

                          {onDeletePurchasedCard && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you absolutely sure you want to revoke and delete Card ${card.cardNumber}? This action is permanent.`)) {
                                  onDeletePurchasedCard(card.id);
                                }
                              }}
                              className="p-1 px-2.5 bg-red-950/10 hover:bg-red-950/40 border border-red-900/30 font-mono text-[9px] uppercase font-bold text-rose-500 rounded transition-colors cursor-pointer"
                            >
                              Revoke Card
                            </button>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        ) : activeSubTab === 'support_config' ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <form onSubmit={handleSaveSupportContacts} className="bg-zinc-950 p-6 sm:p-10 rounded-2xl border border-zinc-900 space-y-8 text-left max-w-4xl mx-auto">
              
              <div className="flex items-center space-x-2 border-b border-zinc-900 pb-4">
                <HelpCircle className="w-5 h-5 text-[#adff2f]" />
                <h3 className="text-white text-sm font-sans font-extrabold uppercase tracking-widest">
                  Configure Customer Support Channels
                </h3>
              </div>

              <p className="text-xs text-zinc-400 font-sans leading-relaxed text-left">
                Update the official customer support telephony hotlines and corporate dispatch emails. These options are synchronized automatically and rendered instantly inside the front-end user interfaces, contact portals, and email signatures. All updates are securely stored in the production firestore node.
              </p>

              <div className="space-y-6">
                
                {/* Email config */}
                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider text-left">Corporate Support Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. support@neobytebank.com"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 p-3 pl-10 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans leading-relaxed text-left">
                    This email is displayed globally in the footer, support ticketing terminal, and customer dashboards.
                  </p>
                </div>

                {/* Phone config */}
                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider text-left">Corporate Helpline Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. +1 (888) 555-NEO1"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 p-3 pl-10 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans leading-relaxed text-left">
                    Helpline telephony endpoint shown for real-time contact validation and help inquiries.
                  </p>
                </div>

                {/* Operating Hours config */}
                <div className="space-y-2 text-left">
                  <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider text-left">Operational Operating Hours Mode</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. 24/7/365 Global Coverage"
                      value={supportHours}
                      onChange={(e) => setSupportHours(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 p-3 pl-10 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans leading-relaxed text-left">
                    Operational hours metrics rendered in real-time widgets.
                  </p>
                </div>

              </div>

              {/* Submit Save Button */}
              <div className="pt-6 border-t border-zinc-900 text-left">
                <button
                  type="submit"
                  disabled={isSavingSupport}
                  className="px-6 py-3.5 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-extrabold text-xs tracking-widest uppercase rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-black" />
                  <span>{isSavingSupport ? 'Publishing Changes...' : 'Publish Support Contacts'}</span>
                </button>
              </div>

            </form>
          </div>
        ) : activeSubTab === 'gateways' ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <form onSubmit={handleSaveGateways} className="bg-zinc-950 p-6 sm:p-10 rounded-2xl border border-zinc-900 space-y-8 text-left max-w-4xl mx-auto">
              
              <div className="flex items-center space-x-2 border-b border-zinc-900 pb-4">
                <Sliders className="w-5 h-5 text-[#adff2f]" />
                <h3 className="text-white text-sm font-sans font-extrabold uppercase tracking-widest">
                  Configure Payment Gateway Rotation Pools
                </h3>
              </div>

              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Enter multiple payment destinations. To support flawless dynamic orchestration, NeoByte automatically selects and rotates these endpoints for purchasing users. The system ensures that the same payment destination does not repeat sequentially or recur for the same customer session.
              </p>

              {/* Eversend Section */}
              <div className="space-y-4">
                <div className="border-b border-zinc-900 pb-1.5 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#adff2f] tracking-wider font-extrabold">&bull; EverSend Links (1 to 3 Options)</span>
                  <span className="text-[10px] text-zinc-500 font-sans italic">Custom web link gateways for Mobile Money</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">EverSend Channel Link 1 (Primary)</label>
                    <input
                      type="url"
                      required
                      placeholder="e.g. https://eversend.me/..."
                      value={eversendLink1}
                      onChange={(e) => setEversendLink1(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">EverSend Channel Link 2</label>
                    <input
                      type="url"
                      placeholder="e.g. https://eversend.me/..."
                      value={eversendLink2}
                      onChange={(e) => setEversendLink2(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">EverSend Channel Link 3</label>
                    <input
                      type="url"
                      placeholder="e.g. https://eversend.me/..."
                      value={eversendLink3}
                      onChange={(e) => setEversendLink3(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Cryptocurrency Pool Section */}
              <div className="space-y-4 pt-4">
                <div className="border-b border-zinc-900 pb-1.5 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#adff2f] tracking-wider font-extrabold">&bull; Crypto Wallet Address Pool</span>
                  <span className="text-[10px] text-zinc-500 font-sans italic">Rotated Bitcoin or multi-token addresses</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Bitcoin Address Option 1</label>
                    <input
                      type="text"
                      required
                      placeholder="Primary BTC address"
                      value={cryptoAddr1}
                      onChange={(e) => setCryptoAddr1(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-805 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Bitcoin Address Option 2</label>
                    <input
                      type="text"
                      placeholder="Alternative BTC address 2"
                      value={cryptoAddr2}
                      onChange={(e) => setCryptoAddr2(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-805 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Bitcoin Address Option 3</label>
                    <input
                      type="text"
                      placeholder="Alternative BTC address 3"
                      value={cryptoAddr3}
                      onChange={(e) => setCryptoAddr3(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-805 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* EmailJS Integrated Automated Email System Section */}
              <div className="space-y-4 pt-6 border-t border-zinc-900">
                <div className="border-b border-zinc-900 pb-1.5 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#adff2f] tracking-wider font-extrabold flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-lime-400" />
                    <span>&bull; Automated Email Delivery System</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-sans italic">Custom secure credentials and selected design preview</span>
                </div>

                <p className="text-xs text-zinc-400 font-sans leading-relaxed text-left">
                  NeoByte uses <strong>EmailJS</strong> to provide automated, secure email delivery directly to customers. Emails are sent immediately upon card activation with <strong>zero backend required</strong>. Test the integration below to verify everything is working.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950 p-5 rounded-xl border border-zinc-900 text-left">
                  <div className="space-y-3">
                    <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider text-left">EmailJS Configuration Status</span>
                    <div className="space-y-2 text-[10px] text-zinc-400 font-sans text-left">
                      <p>✓ Service ID: <span className="text-[#adff2f] font-mono">service_y64svye</span></p>
                      <p>✓ Public Key: <span className="text-[#adff2f] font-mono">bXR-dduX0g5wtBQ7F</span></p>
                      <p>✓ Template ID: <span className="text-[#adff2f] font-mono">template_83c1ijv</span></p>
                      <p>✓ Status: <span className="text-emerald-400 font-bold">ACTIVE & READY</span></p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t md:border-t-0 md:border-l border-zinc-900 md:pl-6 pt-4 md:pt-0 text-left">
                    <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-wider text-left">&bull; Email Delivery Test</span>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-sans text-left">
                      Send a test email to verify EmailJS connectivity and delivery.
                    </p>
                    <div className="flex gap-2 text-left">
                      <input
                        type="email"
                        placeholder="test-recipient@domain.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        className="flex-1 text-xs bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                      />
                      <button
                        onClick={handleSendTestEmail}
                        disabled={testEmailStatus === 'sending'}
                        className="px-3 py-2 bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 text-zinc-300 hover:text-white font-bold font-mono text-[10px] uppercase rounded-xl cursor-pointer"
                      >
                        {testEmailStatus === 'sending' ? 'Sending...' : 'Test Send'}
                      </button>
                    </div>
                    {testEmailStatus === 'success' && (
                      <p className="text-[10px] text-emerald-400 font-mono font-bold text-left">&bull; Test email successfully delivered via EmailJS!</p>
                    )}
                    {testEmailStatus === 'error' && (
                      <p className="text-[10px] text-rose-500 font-mono font-bold text-left">&bull; Error: {testEmailError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="pt-6 border-t border-zinc-900">
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-extrabold text-xs tracking-widest uppercase rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-black" />
                  <span>Update Gateway & Email Configurations</span>
                </button>
              </div>

            </form>
          </div>
        ) : activeSubTab === 'images_config' ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-zinc-950 p-6 sm:p-10 rounded-2xl border border-zinc-900 space-y-8 text-left max-w-6xl mx-auto">
              
              <div className="flex items-center space-x-2 border-b border-zinc-900 pb-4">
                <Image className="w-5 h-5 text-[#adff2f]" />
                <h3 className="text-white text-sm font-sans font-extrabold uppercase tracking-widest">
                  PNG Placeholders & Layout Images - Full Configuration
                </h3>
              </div>

              <p className="text-xs text-zinc-400 font-sans leading-relaxed text-left">
                Insert raw URL links (PNG, JPEG, SVG) for key branding and design coordinates on the main site. Your inputs stack cleanly to their design parent frames. Leave any input blank to preserve default vector designs. Live preview updates below as you configure.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                
                {/* Header Logo */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">1. Header Logo Link</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/header_logo.png"
                    value={adminHeaderLogo}
                    onChange={(e) => setAdminHeaderLogo(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                  />
                </div>

                {/* Hero Background Grid Pattern */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">2. Hero Background Pattern</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/cyber_grid.jpg"
                    value={adminHeroBackground}
                    onChange={(e) => setAdminHeroBackground(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                  />
                </div>

                {/* Hero Stack of 3 Cards Image */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">3. Hero Cascade Card Stack (PNG)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/three_stacked_cards.png"
                    value={adminHeroCardsStack}
                    onChange={(e) => setAdminHeroCardsStack(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                  />
                </div>

                {/* Luhn algorithm section graphic */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">4. Algorithmic Banner Graphic (PNG)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/pink_lightning.png"
                    value={adminLightningGraphic}
                    onChange={(e) => setAdminLightningGraphic(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                  />
                </div>

                {/* Section 1 Image */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">5. Online Marketplace Asset (PNG)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/hand_credit_card.png"
                    value={adminMarketplaceImage}
                    onChange={(e) => setAdminMarketplaceImage(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                  />
                </div>

                {/* Testimonial avatar */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">6. ADESUWA Testimonial Avatar (PNG)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/adesuwa_avatar.png"
                    value={adminTestimonialAvatar}
                    onChange={(e) => setAdminTestimonialAvatar(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                  />
                </div>

                {/* Get started shape image */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">7. Get Started Circle Graphic (PNG)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/neon_shapes.png"
                    value={adminGetStartedGraphic}
                    onChange={(e) => setAdminGetStartedGraphic(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                  />
                </div>

                {/* Footer logo */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">8. Footer Logo Link</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/footer_logo.png"
                    value={adminFooterLogo}
                    onChange={(e) => setAdminFooterLogo(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                  />
                </div>

                {/* Payment Mask Logo */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">9. Payment Mask Logo (Eversend Cover)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/mask_logo.png"
                    value={adminPaymentMaskLogo}
                    onChange={(e) => setAdminPaymentMaskLogo(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                  />
                </div>

                {/* Payment Mask Name */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">10. Payment Mask Name (Below Logo)</label>
                  <input
                    type="text"
                    placeholder="e.g. Priscilla Acquah"
                    value={adminPaymentMaskName}
                    onChange={(e) => setAdminPaymentMaskName(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                  />
                </div>

                {/* SEO Preview Image */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">11. Link Preview Image (WhatsApp, Twitter, etc)</label>
                  <input
                    type="text"
                    placeholder="e.g. https://domain.com/social_preview.png"
                    value={adminSeoPreviewImage}
                    onChange={(e) => setAdminSeoPreviewImage(e.target.value)}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                  />
                </div>

                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-1 space-y-4 sticky top-4">
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-4">
                    <h4 className="text-[10px] font-mono text-[#adff2f] uppercase tracking-wider font-bold">LIVE PREVIEW</h4>
                    
                    {/* Header Logo Preview */}
                    {adminHeaderLogo && (
                      <div className="space-y-1">
                        <p className="text-[8px] text-zinc-400 font-mono">1. Header Logo</p>
                        <div className="w-full h-16 bg-black rounded border border-zinc-800 overflow-hidden flex items-center justify-center p-2">
                          <img src={adminHeaderLogo} alt="Header Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}

                    {/* Hero Background Preview */}
                    {adminHeroBackground && (
                      <div className="space-y-1">
                        <p className="text-[8px] text-zinc-400 font-mono">2. Hero Background</p>
                        <div className="w-full h-24 bg-black rounded border border-zinc-800 overflow-hidden" style={{backgroundImage: `url(${adminHeroBackground})`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                      </div>
                    )}

                    {/* Hero Cards Stack Preview */}
                    {adminHeroCardsStack && (
                      <div className="space-y-1">
                        <p className="text-[8px] text-zinc-400 font-mono">3. Cards Stack</p>
                        <div className="w-full h-32 bg-black rounded border border-zinc-800 overflow-hidden flex items-center justify-center p-2">
                          <img src={adminHeroCardsStack} alt="Cards Stack" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}

                    {/* Lightning Graphic Preview */}
                    {adminLightningGraphic && (
                      <div className="space-y-1">
                        <p className="text-[8px] text-zinc-400 font-mono">4. Lightning Banner</p>
                        <div className="w-full h-24 bg-black rounded border border-zinc-800 overflow-hidden flex items-center justify-center p-2">
                          <img src={adminLightningGraphic} alt="Lightning" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}

                    {/* Marketplace Image Preview */}
                    {adminMarketplaceImage && (
                      <div className="space-y-1">
                        <p className="text-[8px] text-zinc-400 font-mono">5. Marketplace</p>
                        <div className="w-full h-24 bg-black rounded border border-zinc-800 overflow-hidden flex items-center justify-center p-2">
                          <img src={adminMarketplaceImage} alt="Marketplace" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}

                    {/* Testimonial Avatar Preview */}
                    {adminTestimonialAvatar && (
                      <div className="space-y-1">
                        <p className="text-[8px] text-zinc-400 font-mono">6. Testimonial Avatar</p>
                        <div className="w-16 h-16 rounded-full border border-zinc-800 overflow-hidden mx-auto flex items-center justify-center bg-black">
                          <img src={adminTestimonialAvatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}

                    {/* Get Started Graphic Preview */}
                    {adminGetStartedGraphic && (
                      <div className="space-y-1">
                        <p className="text-[8px] text-zinc-400 font-mono">7. Get Started</p>
                        <div className="w-full h-32 bg-black rounded border border-zinc-800 overflow-hidden flex items-center justify-center p-2">
                          <img src={adminGetStartedGraphic} alt="Get Started" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}

                    {/* Footer Logo Preview */}
                    {adminFooterLogo && (
                      <div className="space-y-1">
                        <p className="text-[8px] text-zinc-400 font-mono">8. Footer Logo</p>
                        <div className="w-full h-12 bg-black rounded border border-zinc-800 overflow-hidden flex items-center justify-center p-2">
                          <img src={adminFooterLogo} alt="Footer Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}

                    {/* Mask Logo Preview */}
                    {adminPaymentMaskLogo && (
                      <div className="space-y-1">
                        <p className="text-[8px] text-zinc-400 font-mono">9. Payment Mask Logo</p>
                        <div className="w-full h-12 bg-black rounded border border-zinc-800 overflow-hidden flex items-center justify-center p-2">
                          <img src={adminPaymentMaskLogo} alt="Payment Mask Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        {adminPaymentMaskName && <p className="text-[10px] text-zinc-400 text-center font-sans mt-1">{adminPaymentMaskName}</p>}
                      </div>
                    )}

                    {/* SEO Preview Image */}
                    {adminSeoPreviewImage && (
                      <div className="space-y-1">
                        <p className="text-[8px] text-zinc-400 font-mono">11. Link Preview Image</p>
                        <div className="w-full h-24 bg-black rounded border border-zinc-800 overflow-hidden flex items-center justify-center p-2">
                          <img src={adminSeoPreviewImage} alt="SEO Preview Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}

                    {!adminHeaderLogo && !adminHeroBackground && !adminHeroCardsStack && !adminLightningGraphic && !adminMarketplaceImage && !adminTestimonialAvatar && !adminGetStartedGraphic && !adminFooterLogo && (
                      <p className="text-[9px] text-zinc-500 italic">Add image URLs above to preview</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Backup / Recovery */}
              <div className="pt-6 border-t border-zinc-900 space-y-3">
                <span className="block text-[10px] font-mono text-zinc-400 uppercase tracking-wider text-left">&bull; Advanced Configuration Backup Registry (JSON)</span>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-sans text-left">
                  Maintain an exported record, or restore configurations directly to verify alignments. Paste a backup JSON in the section below to restore configurations immediately.
                </p>
                <textarea
                  readOnly
                  value={JSON.stringify({
                    headerLogo: adminHeaderLogo,
                    heroBackground: adminHeroBackground,
                    heroCardsStack: adminHeroCardsStack,
                    lightningGraphic: adminLightningGraphic,
                    marketplaceImage: adminMarketplaceImage,
                    testimonialAvatar: adminTestimonialAvatar,
                    getStartedGraphic: adminGetStartedGraphic,
                    footerLogo: adminFooterLogo,
                    paymentMaskLogo: adminPaymentMaskLogo,
                    paymentMaskName: adminPaymentMaskName,
                    seoPreviewImage: adminSeoPreviewImage,
                  }, null, 2)}
                  className="w-full h-24 text-[11px] bg-zinc-950 border border-zinc-900 p-2 rounded-xl text-zinc-400 outline-none font-mono focus:ring-0 cursor-default select-all"
                />
              </div>

              {/* Submit Save Button */}
              <div className="pt-6 border-t border-zinc-900 flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    if (onUpdateSiteImages) {
                      try {
                        await onUpdateSiteImages({
                          headerLogo: adminHeaderLogo.trim(),
                          heroBackground: adminHeroBackground.trim(),
                          heroCardsStack: adminHeroCardsStack.trim(),
                          lightningGraphic: adminLightningGraphic.trim(),
                          marketplaceImage: adminMarketplaceImage.trim(),
                          testimonialAvatar: adminTestimonialAvatar.trim(),
                          getStartedGraphic: adminGetStartedGraphic.trim(),
                          footerLogo: adminFooterLogo.trim(),
                          paymentMaskLogo: adminPaymentMaskLogo.trim(),
                          paymentMaskName: adminPaymentMaskName.trim(),
                          seoPreviewImage: adminSeoPreviewImage.trim(),
                        });
                        setAlertMessage({ type: 'success', text: 'PNG Placeholders & corporate layout assets successfully updated in Firestore!' });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } catch (err) {
                        setAlertMessage({ type: 'error', text: 'Failed to update corporate layout assets in Firestore.' });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }
                  }}
                  className="px-6 py-3.5 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-extrabold text-xs tracking-widest uppercase rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-black" />
                  <span>Save Image Configuration Links</span>
                </button>
              </div>

            </div>
          </div>
        ) : activeSubTab === 'database_clone' ? (
          <div className="space-y-6">
            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-850 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#adff2f]/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-[#adff2f]/10 rounded-xl">
                  <FileText className="w-6 h-6 text-[#adff2f]" />
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-tight text-lg">Database Inventory Clone</h3>
                  <p className="text-zinc-400 text-xs">Copy your store's cards as text, and paste it into a different store.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Export Section */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wide">Export</h4>
                    <p className="text-xs text-zinc-500">Generates a JSON string of all cards in this store.</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setExportString(JSON.stringify(cards, null, 2));
                    }}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 p-3 rounded-lg text-xs font-bold transition-all"
                  >
                    Generate Export Code
                  </button>
                  
                  {exportString && (
                    <div className="space-y-2">
                      <textarea 
                        readOnly 
                        value={exportString} 
                        className="w-full h-48 bg-black border border-zinc-800 rounded-lg p-3 text-[10px] font-mono text-[#adff2f] outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(exportString);
                          alert('Copied to clipboard!');
                        }}
                        className="w-full bg-[#adff2f]/10 hover:bg-[#adff2f]/20 text-[#adff2f] border border-[#adff2f]/30 p-2 rounded-lg text-xs font-bold transition-all"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  )}
                </div>

                {/* Import Section */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wide">Import</h4>
                    <p className="text-xs text-zinc-500">Paste the JSON string to add cards to this store.</p>
                  </div>

                  <textarea 
                    value={importString}
                    onChange={(e) => setImportString(e.target.value)}
                    placeholder="Paste your export code here..."
                    className="w-full h-48 bg-black border border-zinc-800 focus:border-[#adff2f]/50 rounded-lg p-3 text-[10px] font-mono text-zinc-300 outline-none transition-all"
                  />
                  
                  <button
                    disabled={isImporting || !importString.trim()}
                    onClick={async () => {
                      setIsImporting(true);
                      try {
                        const parsed = JSON.parse(importString);
                        if (!Array.isArray(parsed)) throw new Error("Format is invalid (not an array).");
                        
                        let count = 0;
                        for (const card of parsed) {
                          if (card.id && card.name) {
                            await setDoc(doc(db, 'cards', card.id), card, { merge: true });
                            count++;
                          }
                        }
                        
                        alert(`Successfully imported ${count} cards!`);
                        setImportString('');
                        // The onSnapshot listener in App.tsx will automatically refresh the UI
                      } catch (err: any) {
                        console.error("Import failed", err);
                        if (err.message && err.message.includes('permission')) {
                          alert("Firebase Error: You don't have permission to write to this database. Please check your Firestore Security Rules!");
                        } else if (err.message && err.message.includes('JSON')) {
                          alert("Invalid code format! Ensure you copied it exactly without missing brackets.");
                        } else {
                          alert("Import failed: " + (err.message || "Unknown error"));
                        }
                      }
                      setIsImporting(false);
                    }}
                    className="w-full bg-[#adff2f] hover:bg-[#9be529] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-black p-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                  >
                    {isImporting ? 'Importing...' : 'Start Import'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
