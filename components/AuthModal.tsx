import React, { useState } from 'react';
import { X, Mail, ArrowRight, User, Lock, Phone, AlertCircle, Loader } from 'lucide-react';
import { signUp, signIn } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (details: { name: string, email: string, phone?: string, userId: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const { success, user, error: signInError } = await signIn(email, password);
        
        if (!success || signInError) {
          setError(signInError?.message || 'Failed to sign in. Please check your credentials.');
          setLoading(false);
          return;
        }

        if (user) {
          onSuccess({
            name: user.user_metadata?.name || email.split('@')[0],
            email: user.email || '',
            phone: user.user_metadata?.phone,
            userId: user.id,
          });
          onClose();
        }
      } else {
        // Sign up
        const { success, user, error: signUpError } = await signUp(email, password, {
          name,
          phone: phone || undefined,
          role: 'buyer',
        });

        if (!success || signUpError) {
          setError(signUpError?.message || 'Failed to create account. Please try again.');
          setLoading(false);
          return;
        }

        if (user) {
          onSuccess({
            name,
            email,
            phone: phone || undefined,
            userId: user.id,
          });
          onClose();
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    // Clear fields on mode toggle
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  }

  return (
     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={onClose} 
              disabled={loading}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
                <X size={24} />
            </button>
            
            <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isLogin ? 'Welcome Back to Pambo' : 'Join Pambo Today'}
                </h2>
                <p className="text-gray-500 mb-6">
                    {isLogin ? 'Sign in to your account to continue.' : 'Create your account to start buying and selling.'}
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition disabled:opacity-50"
                                    placeholder="e.g. John Doe"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="email"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition disabled:opacity-50"
                                placeholder="your@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>
                     {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number (Optional)</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input 
                                    type="tel"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition disabled:opacity-50"
                                    placeholder="e.g. 0712345678"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                         <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="password"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition disabled:opacity-50"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                          <>
                            <Loader size={18} className="animate-spin" />
                            {isLogin ? 'Signing in...' : 'Creating account...'}
                          </>
                        ) : (
                          <>
                            {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={18} />
                          </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button 
                        onClick={toggleMode}
                        disabled={loading}
                        className="text-orange-600 font-bold hover:underline disabled:opacity-50"
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </div>
            </div>
        </div>
     </div>
  );
}