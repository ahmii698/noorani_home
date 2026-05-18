// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, User, LogIn, Lock } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isOpen, setIsOpen] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (credentials.email && credentials.password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify({ name: 'Noorani', email: credentials.email }));
      toast.success('Login Successful!');
      navigate('/dashboard');
    } else {
      toast.error('Please enter email and password');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (resetEmail) {
      // Abhi frontend demo hai - backend lagane ke baad OTP email hoga
      toast.success(`Reset link sent to ${resetEmail} (Demo mode - Backend pending)`);
      setForgotPassword(false);
      setResetEmail('');
    } else {
      toast.error('Please enter your email address');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-zoom"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=1600')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark Overlay for better readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="relative z-10 w-full max-w-md px-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 animate-slideUp">
            {/* Modal Header with Logo */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg mb-4">
                <span className="text-4xl font-bold text-white">❄️</span>
              </div>
              <h2 className="text-2xl font-bold text-white">NOORANI</h2>
              <p className="text-gray-300 text-sm mt-1">CAR A/C & AUTOS</p>
              <p className="text-amber-400 text-xs mt-2">Professional Auto Care</p>
            </div>

            {/* Modal Body - Login Form */}
            {!forgotPassword ? (
              <div className="p-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={credentials.email}
                      onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-5 h-5" />
                    Login to Dashboard
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                  <p>Demo: admin@noorani.com / 123456</p>
                </div>
              </div>
            ) : (
              /* Forgot Password Form */
              <div className="p-6">
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="text-center mb-4">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Reset Password</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Enter your email address and we'll send you a reset link
                    </p>
                  </div>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    Send Reset Link
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotPassword(false)}
                    className="w-full text-gray-600 hover:text-gray-800 text-sm py-2 transition"
                  >
                    ← Back to Login
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;