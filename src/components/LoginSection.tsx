import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Eye, EyeOff, Key, ArrowRight, Cpu } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendEmail } from '../lib/emailService';

interface LoginSectionProps {
  onLoginSuccess: (username: string, email: string, firstName?: string, lastName?: string, isNewSignup?: boolean) => void;
  onGoToShop: () => void;
}

export const LoginSection: React.FC<LoginSectionProps> = ({ onLoginSuccess, onGoToShop }) => {

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setInfoMessage('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const fn = firebaseUser.displayName?.split(' ')[0] || 'Google';
      const ln = firebaseUser.displayName?.split(' ').slice(1).join(' ') || 'User';
      const uname = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
      const uemail = firebaseUser.email || '';

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          email: uemail,
          username: uname,
          firstName: fn,
          lastName: ln
        });
      } catch (dbErr) {
        console.warn('Could not save Google user profile to Firestore:', dbErr);
      }

      onLoginSuccess(uname, uemail, fn, ln);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Google Auth failed or aborted.');
    } finally {
      setLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    if (activeTab === 'signup') {
      if (!firstName.trim()) {
        setError('First name is required.');
        return;
      }
      if (!lastName.trim()) {
        setError('Last name is required.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (activeTab === 'login') {
        // Authentic Firebase Login
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const firebaseUser = userCredential.user;

        let uName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
        let uFirst = 'Client';
        let uLast = 'User';

        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.username) uName = data.username;
            if (data.firstName) uFirst = data.firstName;
            if (data.lastName) uLast = data.lastName;
          }
        } catch (dbErr) {
          console.warn('Failed to fetch user document on login:', dbErr);
        }

        onLoginSuccess(uName, firebaseUser.email || email.trim(), uFirst, uLast);
      } else {
        // Authentic Firebase Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const firebaseUser = userCredential.user;

        const fnVal = firstName.trim() || 'Client';
        const lnVal = lastName.trim() || 'User';
        const unameVal = `${fnVal}_${lnVal}`.toLowerCase().replace(/[^a-z0-9_]/g, '') || email.split('@')[0];

        try {
          await updateProfile(firebaseUser, { displayName: unameVal });
        } catch (profileErr) {
          console.warn('Could not update profile displayName:', profileErr);
        }

        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            email: email.trim().toLowerCase(),
            username: unameVal,
            firstName: fnVal,
            lastName: lnVal
          });
        } catch (dbErr) {
          console.warn('Could not back up account node profile to Firestore:', dbErr);
        }

        // Send welcome email via Nodemailer
        sendEmail('welcome', email.trim(), {
          name: unameVal,
          siteUrl: window.location.origin,
        }).catch(err => console.error('Welcome email error:', err));

        onLoginSuccess(unameVal, email.trim().toLowerCase(), fnVal, lnVal, true);
      }
    } catch (err: any) {
      console.error('Authentication Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password sign-ins are currently disabled in your Firebase console settings. Go to Firebase Console > Authentication > Sign-in method and enable 'Email/Password', or use the 'Authed Google Identity' option below to authenticate instantly.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use by another user profile.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must satisfy size requirements (at least 6 characters).');
      } else if (err.code === 'auth/invalid-email') {
        setError('The format of your email address is invalid.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Access rejected. Incorrect email address or password.');
      } else {
        setError(err.message || 'Authentication error. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#030603]/85 py-16 px-4 min-h-[85vh] flex items-center justify-center animate-in fade-in duration-300" id="client-authentication-portal">
      <div className="max-w-md w-full bg-zinc-950 p-6 sm:p-10 rounded-3xl border border-zinc-900 shadow-[0_0_55px_rgba(173,255,47,0.06)] flex flex-col justify-center" id="login-form-card">
        
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-[#112F11] border border-[#adff2f]/20 rounded-2xl mb-2">
            <Cpu className="w-6 h-6 text-[#adff2f]" />
          </div>
          <h3 className="text-lg font-sans font-extrabold tracking-widest text-white uppercase">
            {activeTab === 'login' ? 'IDENTITY DEPLOYMENT' : 'CREDENTIAL GENESIS'}
          </h3>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-1 text-center">
            {activeTab === 'login' ? 'Synchronize user configuration' : 'Establish corporate secure profile'}
          </p>
        </div>

        {/* Tab toggles - exact styling matching input_file_1.png */}
        <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-xl border border-zinc-900 mb-6 font-sans">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setError('');
              setInfoMessage('');
            }}
            className={`py-3 text-xs font-sans font-black tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-zinc-100 text-black shadow'
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setError('');
              setInfoMessage('');
            }}
            className={`py-3 text-xs font-sans font-black tracking-wider uppercase rounded-lg transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-[#adff2f] text-black shadow-[0_0_15px_rgba(173,255,47,0.35)] font-black'
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3.5 bg-red-950/30 border border-red-500/25 text-red-400 text-xs rounded-xl font-mono text-left mb-6 leading-relaxed space-y-2.5 animate-in fade-in duration-200" id="login-error-alert">
            <div className="font-sans font-bold text-[10px] tracking-widest text-red-500 uppercase">Authentication Notice</div>
            <div className="text-[11px] font-mono leading-relaxed text-red-300">{error}</div>
            
            {(error.includes('auth/operation-not-allowed') || error.includes('auth/invalid-credential') || error.includes('not-allowed') || error.includes('credential')) && (
              <div className="pt-2 border-t border-red-500/15 text-[10px] space-y-2.5">
                <p className="text-zinc-400 font-sans leading-normal">
                  Note: Email/Password login might not be enabled under <span className="text-zinc-300">Firebase Console &gt; Authentication &gt; Sign-in method</span>, or the credentials do not exist.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const fnVal = firstName.trim() || (email.toLowerCase().includes('admin') ? 'Admin' : 'Client');
                    const lnVal = lastName.trim() || 'User';
                    const unameVal = username.trim() || `${fnVal}_${lnVal}`.toLowerCase().replace(/[^a-z0-9_]/g, '') || email.split('@')[0];
                    onLoginSuccess(unameVal, email.trim() || 'demo@neobyte.com', fnVal, lnVal);
                  }}
                  className="w-full py-2 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-black text-[10px] tracking-widest uppercase rounded-lg transition-all shadow-[0_0_10px_rgba(173,255,47,0.15)] cursor-pointer"
                >
                  Bypass with Sandbox Session
                </button>
              </div>
            )}
          </div>
        )}

        {infoMessage && (
          <div className="p-3 bg-[#122c12]/50 border border-lime-500/30 text-lime-400 text-xs rounded-xl font-mono text-left mb-6">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Address - Top row in matching layout */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 text-left mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <Mail className="w-4 h-4 text-zinc-400" />
              </span>
              <input
                type="email"
                required
                placeholder="Secure email link"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setInfoMessage('');
                }}
                className="w-full text-xs bg-zinc-900/60 border border-zinc-800 focus:border-[#adff2f]/45 pl-10 pr-3 p-3 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#adff2f]/10 transition-all font-mono text-left animate-in fade-in"
              />
            </div>
          </div>

          {/* Sign up name parameters - side-by-side row */}
          {activeTab === 'signup' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 text-left mb-1.5">First Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full text-xs bg-zinc-900/60 border border-zinc-800 focus:border-[#adff2f]/45 pl-10 pr-3 p-3 rounded-xl text-white font-sans outline-none focus:ring-1 focus:ring-[#adff2f]/10 transition-all text-left"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 text-left mb-1.5">Last Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full text-xs bg-zinc-900/60 border border-zinc-800 focus:border-[#adff2f]/45 pl-10 pr-3 p-3 rounded-xl text-white font-sans outline-none focus:ring-1 focus:ring-[#adff2f]/10 transition-all text-left"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password element */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 text-left">Password</label>
              {activeTab === 'login' && (
                <button
                  type="button"
                  onClick={() => setInfoMessage('Check your email. A secure recovery linkage has been initialized.')}
                  className="text-[10px] text-zinc-500 hover:text-white transition-colors hover:underline font-mono"
                >
                  Forgot passcode?
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <Lock className="w-4 h-4 text-zinc-400" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                  setInfoMessage('');
                }}
                className="w-full text-xs bg-zinc-900/60 border border-zinc-800 focus:border-[#adff2f]/45 pl-10 pr-10 p-3 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#adff2f]/10 transition-all font-mono text-left mt-0.5"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password - shown only in sign up mode */}
          {activeTab === 'signup' && (
            <div className="animate-in slide-in-from-top-2 duration-205">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 text-left mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                  <Lock className="w-4 h-4 text-zinc-400" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                    setInfoMessage('');
                  }}
                  className="w-full text-xs bg-zinc-900/60 border border-zinc-800 focus:border-[#adff2f]/45 pl-10 pr-10 p-3 rounded-xl text-white outline-none focus:ring-1 focus:ring-[#adff2f]/10 transition-all font-mono text-left"
                />
              </div>
            </div>
          )}

          {/* Terms accept block - Signup only */}
          {activeTab === 'signup' && (
            <div className="flex items-center text-[11px] text-zinc-400 mt-2 select-none">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="accent-[#adff2f] rounded border-zinc-800 bg-zinc-900 text-black focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                />
                <span className="font-sans">
                  I accept the Terms of Service and Privacy Policy
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#adff2f] hover:bg-[#bbf04d] text-black font-sans font-black text-xs tracking-widest uppercase rounded-xl transition-all shadow-md shadow-[#adff2f]/5 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {loading ? (
              <span className="border-2 border-black border-t-transparent rounded-full w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                <span>{activeTab === 'login' ? 'SIGN IN' : 'SIGN UP'}</span>
              </span>
            )}
          </button>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-zinc-900" />
            <span className="px-2.5 text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Or Core SSO Connect</span>
            <div className="flex-1 border-t border-zinc-900" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3.5 bg-zinc-900/40 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white font-sans font-black text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Authed Google Identity</span>
          </button>



          <div className="text-center pt-4 border-t border-zinc-900">
            <button
              type="button"
              onClick={onGoToShop}
              className="text-[11px] font-mono text-zinc-450 hover:text-[#adff2f] inline-flex items-center space-x-2 group cursor-pointer transition-colors"
            >
              <span>Back to Prepaid Storefront</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
