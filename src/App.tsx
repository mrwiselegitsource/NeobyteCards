/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { CardListing } from './components/CardListing';
import { MarketingSections } from './components/MarketingSections';
import { CardDetail } from './components/CardDetail';
import { Checkout } from './components/Checkout';
import { PaymentPortal } from './components/PaymentPortal';
import { LoginSection } from './components/LoginSection';
import { AdminDashboard } from './components/AdminDashboard';
import { PrepaidCard, User, PurchasedCard, SiteImagesConfig } from './types';
import { INITIAL_CARDS } from './data/cards';
import { ShieldCheck, Mail, Globe, Users, FileText, CheckCircle, Smartphone, X } from 'lucide-react';
import { db, auth, incrementVisitorCount, OperationType, handleFirestoreError } from './firebase';
import { doc, setDoc, deleteDoc, collection, getDocs, query, where, getDocFromServer, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { CustomerSupport, SupportContacts } from './components/CustomerSupport';
import { sendEmail } from './lib/emailService';


export default function App() {

  // Store available cards and filters - local device catalog seeded on mount or customized in the admin panel
  const [cards, setCards] = useState<PrepaidCard[]>(() => {
    const saved = localStorage.getItem('neobyte_cards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    // Set fallback seed
    localStorage.setItem('neobyte_cards', JSON.stringify(INITIAL_CARDS));
    return INITIAL_CARDS;
  });

  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  // central store for site layout PNG elements placeholder links
  const [siteImages, setSiteImages] = useState<SiteImagesConfig>(() => {
    try {
      const saved = localStorage.getItem('neobyte_site_images');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return {
      headerLogo: '',
      heroBackground: '',
      heroCardsStack: '',
      lightningGraphic: '',
      marketplaceImage: '',
      testimonialAvatar: '',
      getStartedGraphic: '',
      footerLogo: '',
    };
  });

  
  // User Authentication State - tracked locally on current device
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('neobyte_user_auth');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          return parsed;
        }
      } catch (e) {}
    }
    return { username: '', email: '', isLoggedIn: false };
  });

  // Tab & Routing State
  const [activeTab, setActiveTab] = useState<'shop' | 'admin' | 'login'>(() => {
    try {
      const savedTab = localStorage.getItem('neobyte_active_tab');
      if (savedTab === 'shop' || savedTab === 'admin' || savedTab === 'login') {
        // Only return admin if explicitly logged in as admin
        if (savedTab === 'admin') {
          const auth = localStorage.getItem('neobyte_user_auth');
          if (auth && JSON.parse(auth).isAdmin) return 'admin';
          return 'shop';
        }
        return savedTab;
      }
    } catch (e) {}

    // Fallback logic
    const savedAuth = localStorage.getItem('neobyte_user_auth');
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed && parsed.isLoggedIn) {
          return 'shop';
        }
      } catch (e) {}
    }
    return 'login';
  });

  useEffect(() => {
    localStorage.setItem('neobyte_active_tab', activeTab);
  }, [activeTab]);
  const [viewState, setViewState] = useState<'catalog' | 'detail' | 'checkout' | 'payment_portal'>(() => {
    try {
      const saved = localStorage.getItem('neobyte_view_state');
      if (saved) return saved as any;
    } catch (e) {}
    return 'catalog';
  });
  
  const [selectedCard, setSelectedCard] = useState<PrepaidCard | null>(() => {
    try {
      const saved = localStorage.getItem('neobyte_selected_card');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    localStorage.setItem('neobyte_view_state', viewState);
  }, [viewState]);

  useEffect(() => {
    if (selectedCard) {
      localStorage.setItem('neobyte_selected_card', JSON.stringify(selectedCard));
    } else {
      localStorage.removeItem('neobyte_selected_card');
    }
  }, [selectedCard]);

  // States for dynamic system notifications
  const [successToast, setSuccessToast] = useState<{ message: string; description?: string } | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<{ isOpen: boolean; email: string; cardName: string } | null>(null);

  // Customer Support Dynamic Configuration State
  const [supportContacts, setSupportContacts] = useState<SupportContacts>(() => {
    try {
      const saved = localStorage.getItem('neobyte_support_contacts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      email: 'support@neobytebank.com',
      phone: '+1 (888) 555-NEO1',
      operatingHours: '24/7/365 Global Coverage'
    };
  });

  // Load Support & Site Images settings from Firestore on mount
  useEffect(() => {
    const fetchSupportContacts = async () => {
      try {
        const supportRef = doc(db, 'settings', 'support');
        const snap = await getDoc(supportRef);
        if (snap.exists()) {
          const data = snap.data() as SupportContacts;
          setSupportContacts(data);
          localStorage.setItem('neobyte_support_contacts', JSON.stringify(data));
        }
      } catch (err) {
        console.error('Failed to load support contacts from Firestore:', err);
      }
    };

    const fetchSiteImages = async () => {
      try {
        const imagesRef = doc(db, 'settings', 'siteImages');
        const snap = await getDoc(imagesRef);
        if (snap.exists()) {
          const data = snap.data() as SiteImagesConfig;
          setSiteImages(data);
          localStorage.setItem('neobyte_site_images', JSON.stringify(data));
        }
      } catch (err) {
        console.error('Failed to load site images from Firestore:', err);
      }
    };

    fetchSupportContacts();
    fetchSiteImages();
  }, []);

  // Update SEO image when siteImages change
  useEffect(() => {
    if (siteImages) {
      const ogImage = document.getElementById('og-image');
      if (ogImage) {
        ogImage.setAttribute('content', siteImages.seoPreviewImage || siteImages.headerLogo || 'https://neobytebankcards.vercel.app/logo.png');
      }
    }
  }, [siteImages]);

  const handleUpdateSupportContacts = async (newContacts: SupportContacts) => {
    try {
      const supportRef = doc(db, 'settings', 'support');
      await setDoc(supportRef, newContacts);
      setSupportContacts(newContacts);
      localStorage.setItem('neobyte_support_contacts', JSON.stringify(newContacts));
      return true;
    } catch (err) {
      console.error('Failed to update support contacts:', err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/support');
      // Still update locally even if Firestore fails
      setSupportContacts(newContacts);
      localStorage.setItem('neobyte_support_contacts', JSON.stringify(newContacts));
      return false;
    }
  };

  const handleUpdateSiteImages = async (newImages: SiteImagesConfig) => {
    try {
      const imagesRef = doc(db, 'settings', 'siteImages');
      await setDoc(imagesRef, newImages);
      setSiteImages(newImages);
      localStorage.setItem('neobyte_site_images', JSON.stringify(newImages));
      return true;
    } catch (err) {
      console.error('Failed to update site images:', err);
      handleFirestoreError(err, OperationType.WRITE, 'settings/siteImages');
      // Still update locally even if Firestore fails
      setSiteImages(newImages);
      localStorage.setItem('neobyte_site_images', JSON.stringify(newImages));
      return false;
    }
  };

  const handleSupportTicketSubmit = async (name: string, email: string, message: string): Promise<boolean> => {
    try {
      // 1. Save ticket in Firestore
      const ticketRef = doc(db, 'support_tickets', `ticket_${Date.now()}`);
      await setDoc(ticketRef, {
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
        status: 'open'
      });

      // 2. Send notification email via Nodemailer to customer
      sendEmail('welcome', email, {
        name,
        siteUrl: window.location.origin,
      }).catch(err => console.error('Support ticket email error:', err));

      return true;
    } catch (err) {
      console.error('Error registering support ticket:', err);
      handleFirestoreError(err, OperationType.CREATE, 'support_tickets');
      return false;
    }
  };

  // Local Wallet storage for cataloged instances, partition by user email
  const [allPurchasedCards, setAllPurchasedCards] = useState<PurchasedCard[]>(() => {
    const saved = localStorage.getItem('neobyte_purchasedCards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {}
    }
    const initial = [
      {
        id: 'purchased-1',
        brand: 'Mastercard' as const,
        name: 'NeoByte Classic MasterCard',
        price: 50.00,
        limit: 3800,
        cardNumber: '5574 4291 0834 7378',
        expiry: '03/2029',
        cvv: '812',
        accountHolder: 'Emelyan Melilkus',
        purchaseDate: '2026-05-18',
        isFrozen: false,
        notes: 'Amazon Web Services node subscription',
        ownerEmail: 'manmagic550@yahoo.com'
      },
      {
        id: 'purchased-2',
        brand: 'Visa' as const,
        name: 'Atmos Visa Signature',
        price: 50.00,
        limit: 42000,
        cardNumber: '4204 5582 3912 6269',
        expiry: '10/2027',
        cvv: '109',
        accountHolder: 'Forrest Vincent',
        purchaseDate: '2026-05-24',
        isFrozen: false,
        notes: 'Google AdWords agency checkout baseline',
        ownerEmail: 'manmagic550@yahoo.com'
      }
    ];
    localStorage.setItem('neobyte_purchasedCards', JSON.stringify(initial));
    return initial;
  });

  // Dynamically compute the active user's cards based on their session email
  const purchasedCards = allPurchasedCards.filter(card => {
    if (user.isLoggedIn) {
      return (card as any).ownerEmail === user.email;
    } else {
      return !(card as any).ownerEmail || (card as any).ownerEmail === 'guest';
    }
  });

  // Automated background dispatch processor for 1-hour delay cards
  useEffect(() => {
    const checkAndDispatchCards = async () => {
      let changed = false;
      const updatedCards = await Promise.all(
        allPurchasedCards.map(async (card) => {
          if (card.status === 'awaiting_dispatch') {
            const timestamp = card.purchaseTimestamp || 0;
            const fiveMinutes = 5 * 60 * 1000;
            const elapsed = Date.now() - timestamp;
            
            if (timestamp > 0 && elapsed >= fiveMinutes) {
              changed = true;
              
              const activeCard = {
                ...card,
                status: 'active' as const,
                cvv: card.cvv === '***' ? Math.floor(100 + Math.random() * 900).toString() : card.cvv
              };

              // Trigger email dispatch of active credentials via Nodemailer
              if (card.ownerEmail && card.ownerEmail !== 'guest') {
                sendEmail('card_activation', card.ownerEmail, {
                  cardHolder: activeCard.accountHolder,
                  cardBrand: activeCard.brand,
                  cardNumber: activeCard.cardNumber,
                  expiry: activeCard.expiry,
                  cvv: activeCard.cvv,
                  limit: activeCard.limit,
                  purchaseDate: activeCard.purchaseDate,
                }).catch(err => console.error('Card activation email error:', err));
              }

              // Update in Firestore
              if (auth.currentUser) {
                try {
                  await setDoc(doc(db, 'purchasedCards', activeCard.id), {
                    ...activeCard,
                    ownerId: auth.currentUser.uid
                  });
                } catch (err) {
                  console.error('Failed to sync active card to Firestore:', err);
                }
              }

              return activeCard;
            }
          }
          return card;
        })
      );

      if (changed) {
        setAllPurchasedCards(updatedCards);
        localStorage.setItem('neobyte_purchasedCards', JSON.stringify(updatedCards));
      }
    };

    const interval = setInterval(() => {
      checkAndDispatchCards();
    }, 5000);

    checkAndDispatchCards();

    return () => clearInterval(interval);
  }, [allPurchasedCards]);

  // Legal Modal trigger
  const [legalModal, setLegalModal] = useState<{
    isOpen: boolean;
    title: string;
    type: 'privacy' | 'terms' | 'contact';
  }>({
    isOpen: false,
    title: '',
    type: 'privacy'
  });

  // Contact Support State
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Load state from local storage securely & establish local database interfaces
  useEffect(() => {
    // 1. Connection check as required by Firebase skill guidelines
    const checkConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    checkConnection();

    // 2. Fetch remote visitor counter using Firestore
    const getVisitorCount = async () => {
      try {
        const count = await incrementVisitorCount();
        setVisitorCount(count);
      } catch (e) {
        const savedCount = localStorage.getItem('neobyte_visitor_count');
        const currentCount = savedCount ? parseInt(savedCount, 10) + 1 : 1642;
        localStorage.setItem('neobyte_visitor_count', currentCount.toString());
        setVisitorCount(currentCount);
      }
    };
    getVisitorCount();

    // 3. Sync cards collection from Firestore cards path
    const fetchCards = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'cards'));
        const dbCards: PrepaidCard[] = [];
        querySnapshot.forEach((doc) => {
          dbCards.push(doc.data() as PrepaidCard);
        });
        if (dbCards.length > 0) {
          setCards(dbCards);
          localStorage.setItem('neobyte_cards', JSON.stringify(dbCards));
        } else {
          // Firestore catalog is flat / empty - seed initial batch if possible
          for (const card of INITIAL_CARDS) {
            try {
              await setDoc(doc(db, 'cards', card.id), card);
            } catch (seedErr) {
              // Gracefully bypass if rules block local client during flat seeding
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load inventory from Firestore, using local fallback:', error);
      }
    };
    fetchCards();

    // 4. Seed default accounts inside local storage browser configurations
    const usersStr = localStorage.getItem('neobyte_registered_users');
    let registeredUsers = [];
    if (usersStr) {
      try {
        registeredUsers = JSON.parse(usersStr);
      } catch (e) {
        registeredUsers = [];
      }
    }
    const hasAdmin = registeredUsers.some((u: any) => u.email.toLowerCase() === 'bankadmin@admin.com');
    const hasUser = registeredUsers.some((u: any) => u.email.toLowerCase() === 'manmagic550@yahoo.com');

    if (!hasAdmin || !hasUser) {
      const seedUsers = [...registeredUsers];
      if (!hasAdmin) {
        seedUsers.push({
          email: 'bankadmin@admin.com',
          username: 'bankadmin',
          password: '1234',
          firstName: 'Bank',
          lastName: 'Administrator'
        });
      }
      if (!hasUser) {
        seedUsers.push({
          email: 'manmagic550@yahoo.com',
          username: 'manmagic550',
          password: 'password123',
          firstName: 'Magic',
          lastName: 'Man'
        });
      }
      localStorage.setItem('neobyte_registered_users', JSON.stringify(seedUsers));
    }
  }, []);

  // 5. Query and sync user-specific purchased cards from remote Firestore
  useEffect(() => {
    const fetchPurchasedCards = async (uid: string) => {
      try {
        const q = query(
          collection(db, 'purchasedCards'),
          where('ownerId', '==', uid)
        );
        const querySnapshot = await getDocs(q);
        const fetched: PurchasedCard[] = [];
        querySnapshot.forEach((doc) => {
          fetched.push(doc.data() as PurchasedCard);
        });

        if (fetched.length > 0) {
          setAllPurchasedCards((prev) => {
            const merged = [...fetched];
            prev.forEach((localCard) => {
              if (!merged.some(c => c.id === localCard.id)) {
                merged.push(localCard);
              }
            });
            localStorage.setItem('neobyte_purchasedCards', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (error) {
        console.warn('Failed to query remote purchasedCards collection:', error);
      }
    };

    // Firebase Auth State change subscription
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const uEmail = firebaseUser.email || '';
        let uName = firebaseUser.displayName || uEmail.split('@')[0] || 'User';
        let uFirst = uName.split(' ')[0];
        let uLast = uName.split(' ').slice(1).join(' ') || 'User';

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.username) uName = data.username;
            if (data.firstName) uFirst = data.firstName;
            if (data.lastName) uLast = data.lastName;
          }
        } catch (err) {
          console.warn('Could not restore user Firestore profile:', err);
        }

        const freshUser: User = {
          username: uName,
          email: uEmail,
          firstName: uFirst,
          lastName: uLast,
          isLoggedIn: true
        };
        setUser(freshUser);
        localStorage.setItem('neobyte_user_auth', JSON.stringify(freshUser));
        fetchPurchasedCards(firebaseUser.uid);
      }
    });

    // If currently logged in as a Firebase user on mount, sync immediately
    if (user.isLoggedIn && auth.currentUser) {
      fetchPurchasedCards(auth.currentUser.uid);
    }

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (username: string, email: string, firstName?: string, lastName?: string, isNewSignup?: boolean) => {
    const freshUser: User = { username, email, firstName, lastName, isLoggedIn: true };
    setUser(freshUser);
    localStorage.setItem('neobyte_user_auth', JSON.stringify(freshUser));
    
    if (isNewSignup) {
      setSuccessToast({
        message: "SYSTEM RECORD: REGISTRATION SUCCESSFUL",
        description: `Welcome! Your cyber credentials ${username} (${email}) are registered. You can now select standard or custom prepaid card profiles.`
      });
    } else {
      setSuccessToast({
        message: "SECURE ACCOUNT NODE ONLINE",
        description: `Authenticated node: Welcome back IP profile client ${username}.`
      });
    }
    
    // Switch to prepaid store view
    setActiveTab('shop');
    
    // Automatically fade toast after 5 seconds
    setTimeout(() => {
      setSuccessToast(null);
    }, 6000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }
    const defaultUser: User = { username: '', email: '', isLoggedIn: false };
    setUser(defaultUser);
    localStorage.removeItem('neobyte_user_auth');
    setActiveTab('shop');
  };

  const handleSelectCard = (card: PrepaidCard) => {
    setSelectedCard(card);
    setViewState('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPayment = () => {
    setViewState('payment_portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentValidated = async (notes?: string, screenshot?: string | null) => {
    if (!selectedCard) return;

    const billingEmail = user.isLoggedIn && user.email ? user.email : '';
    const ownerIdVal = auth.currentUser ? auth.currentUser.uid : 'guest';

    const newPurchase: PurchasedCard = {
      id: `purchased-${Date.now()}`,
      brand: selectedCard.brand,
      name: selectedCard.name,
      price: selectedCard.price,
      limit: selectedCard.limit,
      cardNumber: selectedCard.cardNumber,
      expiry: selectedCard.expiry,
      cvv: '***',
      accountHolder: selectedCard.accountHolder,
      purchaseDate: new Date().toISOString().split('T')[0],
      isFrozen: false,
      notes: notes || `Created: Customized spent threshold set to $${selectedCard.limit}`,
      ownerEmail: billingEmail || 'guest',
      imageURL: selectedCard.imageURL,
      isUploadedImage: selectedCard.isUploadedImage,
      color: selectedCard.color,
      status: 'awaiting_dispatch',
      paymentScreenshot: screenshot || null,
      paymentMethod: notes || 'Direct Gateway Node',
      ownerId: ownerIdVal,
      purchaseTimestamp: Date.now()
    };

    const updated = [newPurchase, ...allPurchasedCards];
    setAllPurchasedCards(updated);
    localStorage.setItem('neobyte_purchasedCards', JSON.stringify(updated));

    // Synchronize to Firestore purchasedCards collection
    if (auth.currentUser) {
      const path = `purchasedCards/${newPurchase.id}`;
      try {
        await setDoc(doc(db, 'purchasedCards', newPurchase.id), {
          ...newPurchase,
          ownerId: auth.currentUser.uid
        });
      } catch (error) {
        console.error('Failed to sync new purchased card to Firestore:', error);
        try {
          handleFirestoreError(error, OperationType.WRITE, path);
        } catch {}
      }
    }

    // Automated Immediate Order Receipt Email via Nodemailer
    if (billingEmail) {
      const orderNum = newPurchase.id.replace('purchased-', '').substring(0, 8).toUpperCase();
      sendEmail('purchase_confirmation', billingEmail, {
        name: user.firstName || user.username,
        cardName: newPurchase.name,
        cardBrand: newPurchase.brand,
        cardHolder: newPurchase.accountHolder,
        limit: newPurchase.limit,
        price: newPurchase.price,
        purchaseDate: newPurchase.purchaseDate,
        orderId: orderNum,
      }).catch(err => console.error('Purchase confirmation email error:', err));
    }

    // Direct fallback to shop/cards list
    setViewState('catalog');
    setActiveTab('shop');
    setSelectedCard(null);

    // Present clear confirmation Toast
    setSuccessToast({
      message: 'TRANSACTION REGISTERED',
      description: `Your payment verification screenshot was submitted successfully. The prepaid proxy card parameters will complete secure gateway activation within 5 minutes. A confirmation notice has been sent to your client email address.`
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFreezeToggle = async (id: string) => {
    const updated = allPurchasedCards.map(c => c.id === id ? { ...c, isFrozen: !c.isFrozen } : c);
    setAllPurchasedCards(updated);
    localStorage.setItem('neobyte_purchasedCards', JSON.stringify(updated));

    if (auth.currentUser) {
      const matchCard = updated.find(c => c.id === id);
      if (matchCard) {
        const path = `purchasedCards/${id}`;
        try {
          await setDoc(doc(db, 'purchasedCards', id), {
            ...matchCard,
            ownerId: auth.currentUser.uid
          });
        } catch (error) {
          console.error('Failed to sync freeze state update to Firestore:', error);
          try {
            handleFirestoreError(error, OperationType.UPDATE, path);
          } catch {}
        }
      }
    }
  };

  const handleUpdateLimit = async (id: string, limit: number) => {
    const updated = allPurchasedCards.map(c => c.id === id ? { ...c, limit } : c);
    setAllPurchasedCards(updated);
    localStorage.setItem('neobyte_purchasedCards', JSON.stringify(updated));

    if (auth.currentUser) {
      const matchCard = updated.find(c => c.id === id);
      if (matchCard) {
        const path = `purchasedCards/${id}`;
        try {
          await setDoc(doc(db, 'purchasedCards', id), {
            ...matchCard,
            ownerId: auth.currentUser.uid
          });
        } catch (error) {
          console.error('Failed to sync limit update to Firestore:', error);
          try {
            handleFirestoreError(error, OperationType.UPDATE, path);
          } catch {}
        }
      }
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    const updated = allPurchasedCards.map(c => c.id === id ? { ...c, notes } : c);
    setAllPurchasedCards(updated);
    localStorage.setItem('neobyte_purchasedCards', JSON.stringify(updated));

    if (auth.currentUser) {
      const matchCard = updated.find(c => c.id === id);
      if (matchCard) {
        const path = `purchasedCards/${id}`;
        try {
          await setDoc(doc(db, 'purchasedCards', id), {
            ...matchCard,
            ownerId: auth.currentUser.uid
          });
        } catch (error) {
          console.error('Failed to sync notes update to Firestore:', error);
          try {
            handleFirestoreError(error, OperationType.UPDATE, path);
          } catch {}
        }
      }
    }
  };

  const handleDeleteCard = async (id: string) => {
    const updated = allPurchasedCards.filter(c => c.id !== id);
    setAllPurchasedCards(updated);
    localStorage.setItem('neobyte_purchasedCards', JSON.stringify(updated));

    if (auth.currentUser) {
      const path = `purchasedCards/${id}`;
      try {
        await deleteDoc(doc(db, 'purchasedCards', id));
      } catch (error) {
        console.error('Failed to delete virtual card from Firestore:', error);
        try {
          handleFirestoreError(error, OperationType.DELETE, path);
        } catch {}
      }
    }
  };

  const handleOpenPrivacyTerms = (title: string, type: 'privacy' | 'terms' | 'contact') => {
    setSupportSuccess(false);
    setLegalModal({ isOpen: true, title, type });
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSuccess(true);
    setSupportMessage('');
    setTimeout(() => {
      setLegalModal({ isOpen: false, title: '', type: 'privacy' });
      setSupportSuccess(false);
    }, 2500);
  };

  const isAdmin = user.isLoggedIn && (
    user.email.toLowerCase().trim() === 'mrwiselegitsource@proton.me' ||
    user.email.toLowerCase().trim() === 'mrwiselegitsource@gmail.com' ||
    user.email.toLowerCase().trim() === 'bankadmin@admin.com'
  );

  // Force login requirement - redirect to login if trying to access protected pages
  useEffect(() => {
    if (!user.isLoggedIn && (activeTab === 'shop' || activeTab === 'admin')) {
      setActiveTab('login');
    }
  }, [user.isLoggedIn, activeTab]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between">
      
      {/* Dynamic Header */}
      <Header
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        siteImages={siteImages}
        setActiveTab={(tab) => {
          if (!user.isLoggedIn && (tab === 'shop' || tab === 'admin')) {
            setActiveTab('login');
          } else {
            setActiveTab(tab);
            if (tab === 'shop') {
              setViewState('catalog');
            }
          }
        }}
      />

      {/* Main Port Layout */}
      <main className="flex-1">
        {activeTab === 'shop' ? (
          <>
            {viewState === 'catalog' && (
              <>
                <Hero 
                  siteImages={siteImages}
                  onScrollToCards={() => {
                    const element = document.getElementById('card-catalog-section');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                />
                
                {/* Danger Notice Display */}
                <div className="bg-[#0a0a0a] py-16 px-4 border-y border-[#adff2f]/10">
                  <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-[#FF5722] text-3xl md:text-4xl lg:text-5xl font-sans font-extrabold uppercase tracking-tight leading-tight">
                      DANGER! THE NEOBYTE VIRTUAL CREDIT CARD IS<br className="hidden md:block" /> HIGHLY ENGAGING
                    </h2>
                    <p className="text-zinc-300 text-base md:text-lg font-sans max-w-3xl mx-auto leading-relaxed tracking-wide">
                      Users find themselves exploring endless opportunities — streaming, shopping, and subscribing — all powered by seamless, encrypted transactions.
                    </p>
                  </div>
                </div>

                <CardListing
                  cards={cards}
                  onSelectCard={handleSelectCard}
                />

                <MarketingSections 
                  siteImages={siteImages}
                  onGetStarted={() => {
                    if (!user.isLoggedIn) {
                      setActiveTab('login');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      const element = document.getElementById('card-catalog-section');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />
              </>
            )}

            {viewState === 'detail' && selectedCard && (
              <CardDetail
                card={selectedCard}
                loggedInName={user.isLoggedIn ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : undefined}
                onBackToStore={() => setViewState('catalog')}
                onProceedToCheckout={(customizedCard) => {
                  setSelectedCard(customizedCard);
                  // Auto redirect or prompt auth if wanted, otherwise proceed seamlessly
                  setViewState('checkout');
                }}
              />
            )}

            {viewState === 'checkout' && selectedCard && (
              <Checkout
                card={selectedCard}
                user={user}
                onBackToDetail={() => setViewState('detail')}
                onProceedToPayment={() => handleProceedToPayment()}
              />
            )}

            {viewState === 'payment_portal' && selectedCard && (
              <PaymentPortal
                card={selectedCard}
                onPaymentValidated={handlePaymentValidated}
                onBackToCheckout={() => setViewState('checkout')}
                siteImages={siteImages}
              />
            )}
          </>
        ) : activeTab === 'login' ? (
          <LoginSection
            onLoginSuccess={handleLoginSuccess}
            onGoToShop={() => setActiveTab('shop')}
          />
        ) : activeTab === 'admin' && isAdmin ? (
          <AdminDashboard
            cards={cards}
            onAddCard={async (newCard) => {
              const updated = [newCard, ...cards];
              setCards(updated);
              localStorage.setItem('neobyte_cards', JSON.stringify(updated));
              try {
                await setDoc(doc(db, 'cards', newCard.id), newCard);
              } catch (err) {
                console.error('Failed to add card to Firestore inventory:', err);
              }
            }}
            onDeleteCard={async (id) => {
              const updated = cards.filter(c => c.id !== id);
              setCards(updated);
              localStorage.setItem('neobyte_cards', JSON.stringify(updated));
              try {
                await deleteDoc(doc(db, 'cards', id));
              } catch (err) {
                console.error('Failed to delete card from Firestore inventory:', err);
              }
            }}
            onUpdateCard={async (updatedCard) => {
              const updated = cards.map(c => c.id === updatedCard.id ? updatedCard : c);
              setCards(updated);
              localStorage.setItem('neobyte_cards', JSON.stringify(updated));
              try {
                await setDoc(doc(db, 'cards', updatedCard.id), updatedCard);
              } catch (err) {
                console.error('Failed to update card in Firestore inventory:', err);
              }
            }}
            purchasedCards={allPurchasedCards}
            onUpdatePurchasedCard={async (updatedCard) => {
              const updated = allPurchasedCards.map(c => c.id === updatedCard.id ? updatedCard : c);
              setAllPurchasedCards(updated);
              localStorage.setItem('neobyte_purchasedCards', JSON.stringify(updated));
              try {
                await setDoc(doc(db, 'purchasedCards', updatedCard.id), {
                  ...updatedCard,
                  ownerId: updatedCard.ownerId || auth.currentUser?.uid || 'guest'
                });
              } catch (err) {
                console.error('Failed to sync purchased card update to Firestore:', err);
              }
            }}
            onDeletePurchasedCard={handleDeleteCard}
            supportContacts={supportContacts}
            onUpdateSupportContacts={handleUpdateSupportContacts}
            siteImages={siteImages}
            onUpdateSiteImages={handleUpdateSiteImages}
          />
        ) : (
          <div className="py-20 text-center text-zinc-500 font-mono text-xs">
            UNAUTHORIZED ACCESS. RETURNING TO MAIN PORTAL...
            {(() => { setTimeout(() => setActiveTab('shop'), 2000); return null; })()}
          </div>
        )}
      </main>

      {/* Footer layout */}
      <Footer onOpenPrivacyTerms={handleOpenPrivacyTerms} visitorCount={visitorCount} siteImages={siteImages} />

      {/* Success Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-55 max-w-sm w-full bg-[#0a110a] border border-[#adff2f]/30 rounded-2xl p-4 shadow-[0_4px_30px_rgba(173,255,47,0.15)] flex items-start space-x-3.5 animate-in slide-in-from-bottom duration-300">
          <div className="p-2 bg-[#122812] border border-[#adff2f]/20 rounded-xl text-[#adff2f]">
            <CheckCircle className="w-5 h-5 text-[#adff2f]" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-white text-xs font-sans font-bold uppercase tracking-wider">{successToast.message}</h4>
            <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-relaxed">{successToast.description}</p>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-zinc-500 hover:text-white shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Checkout Success 5-10 Minutes Verification Notice */}


      {/* Compliance Information Modals overlays fallback */}
      {legalModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" id="legal-modal-overlay">
          <div className="relative w-full max-w-2xl bg-[#090F09] border border-[#adff2f]/20 rounded-2xl p-6 md:p-8 text-white shadow-2xl transition-all max-h-[85vh] overflow-y-auto">
            
            <button
              onClick={() => setLegalModal({ isOpen: false, title: '', type: 'privacy' })}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 mb-6 border-b border-zinc-900 pb-3">
              <ShieldCheck className="w-6 h-6 text-[#adff2f]" />
              <h2 className="text-lg font-sans font-bold uppercase tracking-tight text-white">{legalModal.title}</h2>
            </div>

            {legalModal.type === 'privacy' && (
              <div className="space-y-4 text-xs text-zinc-400 font-sans leading-relaxed text-left">
                <p className="text-[#adff2f] font-mono uppercase font-bold text-[10px]">1. Cryptographic Security Standards</p>
                <p>
                  NeoByte Technologies and its bank subsidiaries process your personal details strictly inside end-to-end symmetric encryption loops. We do not transmit identifiers to external credit unions or centralized reporting servers without authorization.
                </p>
                <p className="text-[#adff2f] font-mono uppercase font-bold text-[10px]">2. Cookie & Metadata Ingress</p>
                <p>
                  We store session keys inside persistent parameters standard client structures. Cookies are limited to authenticating custom account logins and maintaining persistent state arrays.
                </p>
                <p className="text-[#adff2f] font-mono uppercase font-bold text-[10px]">3. Transaction Log Preservation</p>
                <p>
                  Sufficient details of purchased virtual card proxy nodes are stored securely. All CVV, balance modifications, and freezing events remain locked under individual biometrics hashes.
                </p>
              </div>
            )}

            {legalModal.type === 'terms' && (
              <div className="space-y-4 text-xs text-zinc-400 font-sans leading-relaxed text-left">
                <p className="text-[#adff2f] font-mono uppercase font-bold text-[10px]">1. Purchase Conditions</p>
                <p>
                  By creating and confirming names for a virtual prepaid credit card, you acknowledge that prices represent immediate activation parameters and customized limit baseline adjustments. All allocations are immediate.
                </p>
                <p className="text-[#adff2f] font-mono uppercase font-bold text-[10px]">2. Acceptable Usage & Trials</p>
                <p>
                  Virtual credit proxies are calibrated primarily for subscription setups, cloud developers testing API interfaces, trial bypass channels, and commercial ads agencies billing structures. You agree not to execute illegal transfer operations.
                </p>
                <p className="text-[#adff2f] font-mono uppercase font-bold text-[10px]">3. Luhn Compliance Liability</p>
                <p>
                  Cards conform to mathematical Luhn (Mod 10) structures. We guarantee format and structural conformity, and maintain consistent proxy support for accepted global merchant networks.
                </p>
              </div>
            )}

            {legalModal.type === 'contact' && (
              <div className="space-y-4 text-left">
                <p className="text-xs text-zinc-400 font-sans">
                  Need terminal assistance? Transmit your secure message directly to our cybersecurity operators. All submissions are monitored.
                </p>

                {supportSuccess ? (
                  <div className="p-4 bg-[#122812]/40 border border-[#adff2f]/30 text-[#adff2f] rounded-xl text-center font-mono text-xs">
                    Support message securely transmitted! Your ticket hash is: NBT-{Math.floor(1000 + Math.random() * 9000)}.
                  </div>
                ) : (
                  <form onSubmit={handleSupportSubmit} className="space-y-4 text-xs font-sans">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-wide text-zinc-500 mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={supportName}
                          onChange={(e) => setSupportName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono tracking-wide text-zinc-500 mb-1">Secure Email</label>
                        <input
                          type="email"
                          required
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-900 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono tracking-wide text-zinc-500 mb-1">Message Description</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Detail your request or support question..."
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-900 p-2.5 rounded-xl text-white outline-none focus:border-[#adff2f]/30 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#adff2f] hover:bg-[#bbf04d] text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                    >
                      Transmit Support Signal
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="pt-6 border-t border-zinc-900 text-center mt-6">
              <button
                onClick={() => setLegalModal({ isOpen: false, title: '', type: 'privacy' })}
                className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs uppercase"
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
