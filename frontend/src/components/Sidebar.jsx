// src/components/Sidebar.jsx
import React from 'react';

const Sidebar = ({ activeMenu, setActiveMenu, isOpen, setIsOpen, darkMode }) => {
  const menuItems = [
    { id: 'inventory', label: 'Inventory', icon: '📦' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'billing', label: 'Billing', icon: '🧾' },
    { id: 'record', label: 'Records', icon: '📊' },
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-40
        w-72 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl
        transition-all duration-300 h-full
        ${isOpen ? 'left-0' : '-left-72 lg:left-0 lg:w-20'}
      `}>
        {/* Logo */}
        <div className={`p-6 border-b border-gray-700 ${!isOpen && 'lg:px-2'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <span className="text-white text-2xl">❄️</span>
            </div>
            {isOpen && (
              <div>
                <h1 className="text-white text-xl font-bold">NOORANI</h1>
                <p className="text-gray-400 text-xs">CAR A/C & AUTOS</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="p-4">
          {isOpen && <p className="text-gray-500 text-xs uppercase tracking-wider mb-4 px-4">Main Menu</p>}
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300 ${
                activeMenu === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              } ${!isOpen && 'lg:justify-center'}`}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              {isOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className={`absolute bottom-0 w-full p-4 border-t border-gray-700 ${!isOpen && 'lg:px-2'}`}>
          <button
            onClick={() => {
              localStorage.removeItem('isLoggedIn');
              window.location.href = '/';
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white transition-all duration-300 ${!isOpen && 'lg:justify-center'}`}
          >
            <span className="text-xl shrink-0">🚪</span>
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;