// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import Inventory from './Inventory';
import Finance from './Finance';
import Billing from './Billing';
import Records from './Records';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('inventory');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  });

  // Apply dark mode to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  const [products, setProducts] = useState([
    { id: 1, name: 'AC Compressor', purchasePrice: 15000, sellingPrice: 22000, quantity: 10 },
    { id: 2, name: 'Cooling Coil', purchasePrice: 5000, sellingPrice: 8500, quantity: 15 },
    { id: 3, name: 'AC Gas (R134a)', purchasePrice: 1200, sellingPrice: 2500, quantity: 30 },
    { id: 4, name: 'Blower Motor', purchasePrice: 3500, sellingPrice: 6000, quantity: 8 },
  ]);
  
  const [services] = useState([
    { id: 1, name: 'AC Gas Refill', price: 2000, category: 'AC Service', icon: '🆒' },
    { id: 2, name: 'AC Compressor Repair', price: 5000, category: 'Repair', icon: '🔧' },
    { id: 3, name: 'Full AC Service', price: 8000, category: 'Service', icon: '🛠️' },
    { id: 4, name: 'Leak Detection', price: 1500, category: 'Diagnostic', icon: '🔍' },
    { id: 5, name: 'Condenser Cleaning', price: 2500, category: 'Maintenance', icon: '🧹' },
    { id: 6, name: 'AC Filter Change', price: 800, category: 'Replacement', icon: '🔄' },
    { id: 7, name: 'Engine Tuning', price: 3500, category: 'Tuning', icon: '⚡' },
    { id: 8, name: 'Performance Tuning', price: 7000, category: 'Tuning', icon: '🚀' },
  ]);
  
  const [cart, setCart] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses] = useState([
    { id: 1, description: 'Shop Rent', amount: 25000, date: '2024-01-15', type: 'Monthly' },
    { id: 2, description: 'Electricity Bill', amount: 5000, date: '2024-01-20', type: 'Monthly' },
    { id: 3, description: 'Tools Purchase', amount: 12000, date: '2024-01-10', type: 'One-time' },
  ]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    toast.success('Logged out');
    navigate('/');
  };

  const menuTitles = {
    inventory: 'Inventory Management',
    finance: 'Financial Overview',
    billing: 'Billing System',
    record: 'Records Archive'
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex h-screen">
        <Sidebar 
          activeMenu={activeMenu} 
          setActiveMenu={setActiveMenu} 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          darkMode={darkMode}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with Toggle Button and Dark/Light Mode */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm px-8 py-4 flex justify-between items-center`}>
            <div className="flex items-center gap-4">
              {/* Sidebar Toggle Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'}`}
              >
                <span className="text-2xl">{isSidebarOpen ? '◀' : '☰'}</span>
              </button>
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {menuTitles[activeMenu]}
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {activeMenu === 'inventory' && 'Manage products, track purchases and sales'}
                  {activeMenu === 'finance' && 'Monitor daily, weekly and monthly finances'}
                  {activeMenu === 'billing' && 'Create bills, print invoices, export data'}
                  {activeMenu === 'record' && 'View all transaction history'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Dark/Light Mode Toggle Button */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition ${
                  darkMode 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900' 
                    : 'bg-gray-800 hover:bg-gray-900 text-white'
                }`}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
              <button 
                onClick={handleLogout} 
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Content - Yahan sab components ko props pass kiye hain */}
          <div className={`flex-1 overflow-y-auto p-8 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            {activeMenu === 'inventory' && (
              <Inventory 
                products={products} 
                setProducts={setProducts} 
                darkMode={darkMode} 
              />
            )}
            {activeMenu === 'finance' && (
              <Finance 
                products={products} 
                expenses={expenses} 
                darkMode={darkMode} 
              />
            )}
            {activeMenu === 'billing' && (
              <Billing 
                services={services} 
                invoices={invoices} 
                setInvoices={setInvoices} 
                cart={cart} 
                setCart={setCart} 
                products={products}
                setProducts={setProducts}  // ← YEH LINE ADD KARO (IMPORTANT)
                darkMode={darkMode} 
              />
            )}
            {activeMenu === 'record' && (
              <Records 
                invoices={invoices} 
                darkMode={darkMode} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;