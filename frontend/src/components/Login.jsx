// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, User, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isOpen, setIsOpen] = useState(true);

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

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax/Carousel Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-zoom"
        style={{ 
          backgroundImage: "url('/noorani.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Animated Car Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-bounce-slow text-white/20 text-6xl">🚗</div>
        <div className="absolute bottom-20 right-10 animate-pulse-slow text-white/20 text-6xl">🔧</div>
        <div className="absolute top-1/2 left-5 animate-slide text-white/10 text-5xl">❄️</div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 animate-slideUp">
            {/* Modal Header with Logo */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-center">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-4">
                <span className="text-3xl font-bold text-gray-900">N</span>
              </div>
              <h2 className="text-2xl font-bold text-white">NOORANI</h2>
              <p className="text-gray-300 text-sm mt-1">CAR A/C & AUTOS</p>
              <p className="text-amber-400 text-xs mt-2">Professional Auto Care</p>
            </div>

            {/* Modal Body */}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;