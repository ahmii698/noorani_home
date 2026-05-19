// src/components/Billing.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Billing = ({ services, invoices, setInvoices, cart, setCart, products, setProducts, darkMode }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  // Customer Details State
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    carNumber: '',
    carModel: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Customer History State
  const [customerHistory, setCustomerHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Payment State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {});

  // Check stock for a product
  const getProductStock = (serviceId) => {
    const product = products.find(p => p.id === serviceId);
    return product ? product.quantity : 0;
  };

  // Search customer history when phone number changes
  useEffect(() => {
    if (customerDetails.phone && customerDetails.phone.length >= 4) {
      const history = invoices.filter(inv => 
        inv.customer?.phone === customerDetails.phone
      ).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
      
      setCustomerHistory(history);
      setShowHistory(history.length > 0);
      
      // Auto-fill name and car number if customer exists
      if (history.length > 0) {
        const lastInvoice = history[0];
        if (lastInvoice.customer) {
          if (!customerDetails.name) {
            setCustomerDetails(prev => ({ ...prev, name: lastInvoice.customer.name || '' }));
          }
          if (!customerDetails.carNumber) {
            setCustomerDetails(prev => ({ ...prev, carNumber: lastInvoice.customer.carNumber || '' }));
          }
          if (!customerDetails.carModel) {
            setCustomerDetails(prev => ({ ...prev, carModel: lastInvoice.customer.carModel || '' }));
          }
          toast.success(`Welcome back ${lastInvoice.customer.name}!`, { duration: 2000 });
        }
      }
    } else {
      setShowHistory(false);
      setCustomerHistory([]);
    }
  }, [customerDetails.phone, invoices]);

  const addToBill = (service) => {
    const currentStock = getProductStock(service.id);
    if (currentStock <= 0) {
      toast.error(`${service.name} is out of stock!`);
      return;
    }
    
    const alreadyInCart = cart.find(item => item.id === service.id);
    if (alreadyInCart) {
      toast.error(`${service.name} already added to bill`);
      return;
    }
    
    setCart([...cart, { ...service, quantity: 1 }]);
    toast.success(`${service.name} added`);
  };

  const removeFromBill = (id) => {
    setCart(cart.filter(item => item.id !== id));
    toast.success('Removed from bill');
  };

  const billTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const paidAmount = parseFloat(paymentAmount) || 0;
  const remainingAmount = billTotal - paidAmount;
  const isFullyPaid = remainingAmount <= 0;

  const printBill = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Noorani Car AC - Invoice</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; background: #fff; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1a1a2e; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #1a1a2e; }
            .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
            .customer-info { margin: 20px 0; padding: 15px; background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); border-radius: 12px; }
            .customer-info h4 { margin-bottom: 10px; color: #1a1a2e; }
            .customer-info p { margin: 5px 0; font-size: 14px; }
            .invoice-details { display: flex; justify-content: space-between; margin: 20px 0; padding: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #1a1a2e; color: white; }
            .payment-details { margin: 20px 0; padding: 15px; background: #e8f4f8; border-radius: 12px; }
            .total-row { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; padding-top: 10px; border-top: 2px solid #333; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #666; }
            .signature { margin-top: 50px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <div class="logo">❄️ NOORANI CAR A/C & AUTOS</div>
              <p class="subtitle">Professional Auto Care Service</p>
              <p>123 Main Street, City | Phone: +92 300 1234567</p>
              <p>Email: info@nooraniac.com</p>
            </div>
            
            <div class="customer-info">
              <h4>📋 CUSTOMER INFORMATION</h4>
              <p><strong>Name:</strong> ${customerDetails.name}</p>
              <p><strong>Phone:</strong> ${customerDetails.phone}</p>
              <p><strong>Car Number:</strong> ${customerDetails.carNumber}</p>
              <p><strong>Car Model:</strong> ${customerDetails.carModel || 'N/A'}</p>
            </div>
            
            <div class="invoice-details">
              <p><strong>Invoice #:</strong> INV-${Date.now()}</p>
              <p><strong>Date:</strong> ${customerDetails.date}</p>
            </div>
            
            <table>
              <thead>
                <tr><th>#</th><th>Service</th><th>Category</th><th>Price (PKR)</th></tr>
              </thead>
              <tbody>
                ${cart.map((item, idx) => `
                  <tr>
                    <td>${idx+1}</td>
                    <td>${item.name}</td>
                    <td>${item.category}</td>
                    <td>Rs. ${item.price.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="payment-details">
              <h4>💰 PAYMENT DETAILS</h4>
              <p><strong>Total Amount:</strong> Rs. ${billTotal.toLocaleString()}</p>
              <p><strong>Paid Amount:</strong> Rs. ${paidAmount.toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
              <p><strong>Remaining Balance:</strong> Rs. ${remainingAmount.toLocaleString()}</p>
              <p><strong>Payment Status:</strong> ${isFullyPaid ? '✅ FULLY PAID' : '⚠️ PENDING'}</p>
            </div>
            
            <div class="total-row">Total Amount: Rs. ${billTotal.toLocaleString()}</div>
            
            <div class="signature">
              <p>Customer Signature: _________________</p>
              <p>Authorized Signature: _________________</p>
            </div>
            
            <div class="footer">Thank you for choosing Noorani Car AC & Autos! Drive Safe 🚗</div>
          </div>
        </body>
      </html>
    `);
    printWindow.print();
    printWindow.close();
    toast.success('Bill printed');
  };

  const exportToExcel = () => {
    const exportData = [
      {
        'Invoice #': `INV-${Date.now()}`,
        'Date': customerDetails.date,
        'Customer Name': customerDetails.name,
        'Phone': customerDetails.phone,
        'Car Number': customerDetails.carNumber,
        'Car Model': customerDetails.carModel || 'N/A',
        'Total Amount': `Rs. ${billTotal.toLocaleString()}`,
        'Paid Amount': `Rs. ${paidAmount.toLocaleString()}`,
        'Remaining': `Rs. ${remainingAmount.toLocaleString()}`,
        'Payment Method': paymentMethod.toUpperCase(),
        'Status': isFullyPaid ? 'FULLY PAID' : 'PENDING'
      },
      ...cart.map((item, idx) => ({
        'S.No': idx + 1,
        'Service': item.name,
        'Category': item.category,
        'Price': `Rs. ${item.price.toLocaleString()}`
      }))
    ];
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bill');
    XLSX.writeFile(wb, `Bill_${customerDetails.name}_${Date.now()}.xlsx`);
    toast.success('Exported to Excel');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPos = 10;
    
    doc.setFontSize(20);
    doc.setTextColor(26, 26, 46);
    doc.text('NOORANI CAR AC & AUTOS', 14, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Professional Auto Care Service', 14, yPos);
    yPos += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Customer: ${customerDetails.name}`, 14, yPos);
    yPos += 7;
    doc.text(`Phone: ${customerDetails.phone}`, 14, yPos);
    yPos += 7;
    doc.text(`Car Number: ${customerDetails.carNumber}`, 14, yPos);
    yPos += 7;
    doc.text(`Date: ${customerDetails.date}`, 14, yPos);
    yPos += 15;
    
    doc.autoTable({
      startY: yPos,
      head: [['#', 'Service', 'Category', 'Price']],
      body: cart.map((item, idx) => [
        idx + 1,
        item.name,
        item.category,
        `Rs. ${item.price.toLocaleString()}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [26, 26, 46] }
    });
    
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Amount: Rs. ${billTotal.toLocaleString()}`, 14, finalY);
    doc.text(`Paid Amount: Rs. ${paidAmount.toLocaleString()}`, 14, finalY + 7);
    doc.text(`Remaining: Rs. ${remainingAmount.toLocaleString()}`, 14, finalY + 14);
    doc.text(`Status: ${isFullyPaid ? 'FULLY PAID' : 'PENDING'}`, 14, finalY + 21);
    
    doc.save(`Bill_${customerDetails.name}_${Date.now()}.pdf`);
    toast.success('Exported to PDF');
  };

  const handlePayment = () => {
    if (cart.length === 0) {
      toast.error('No services in bill');
      return;
    }
    
    if (!customerDetails.name || !customerDetails.phone || !customerDetails.carNumber) {
      toast.error('Please fill customer details (Name, Phone, Car Number)');
      return;
    }
    
    if (!paymentAmount || paidAmount <= 0) {
      toast.error('Please enter payment amount');
      return;
    }
    
    if (paidAmount > billTotal) {
      toast.error('Payment amount cannot exceed total amount');
      return;
    }
    
    // Stock minus karo
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        const newQuantity = product.quantity - 1;
        return {
          ...product,
          quantity: newQuantity >= 0 ? newQuantity : 0
        };
      }
      return product;
    });
    
    setProducts(updatedProducts);
    
    // Save invoice with customer details and payment
    const newInvoice = {
      id: Date.now(),
      invoiceNo: `INV-${Date.now()}`,
      date: customerDetails.date,
      customer: { ...customerDetails },
      items: [...cart],
      total: billTotal,
      paidAmount: paidAmount,
      remainingAmount: remainingAmount,
      paymentMethod: paymentMethod,
      status: isFullyPaid ? 'Paid' : 'Partial'
    };
    setInvoices([...invoices, newInvoice]);
    
    // Clear cart only, keep customer details for next billing
    setCart([]);
    setPaymentAmount('');
    setPaymentMethod('cash');
    
    toast.success(`Payment successful! ${isFullyPaid ? 'Bill fully paid' : 'Partial payment received'}`);
  };

  return (
    <div className="space-y-6">
      {/* Customer Details Section */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">Customer Details</h3>
              <p className="text-xs text-cyan-100 mt-1">Enter customer information - Phone number auto-searches history</p>
            </div>
            <div className="text-white text-right">
              <p className="text-xs opacity-80">Date</p>
              <input
                type="date"
                value={customerDetails.date}
                onChange={(e) => setCustomerDetails({...customerDetails, date: e.target.value})}
                className="px-3 py-1 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                📞 Phone Number * (Type to search history)
              </label>
              <input
                type="tel"
                value={customerDetails.phone}
                onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value, name: '', carNumber: '', carModel: ''})}
                placeholder="Enter phone number"
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                👤 Customer Name *
              </label>
              <input
                type="text"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                placeholder="Enter customer name"
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                🚗 Car Number Plate *
              </label>
              <input
                type="text"
                value={customerDetails.carNumber}
                onChange={(e) => setCustomerDetails({...customerDetails, carNumber: e.target.value})}
                placeholder="e.g., ABC-1234"
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                🚙 Car Model (Optional)
              </label>
              <input
                type="text"
                value={customerDetails.carModel}
                onChange={(e) => setCustomerDetails({...customerDetails, carModel: e.target.value})}
                placeholder="e.g., Toyota Corolla 2020"
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300'
                }`}
              />
            </div>
          </div>
          
          {/* Customer History Section */}
          {showHistory && customerHistory.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                  📜 Previous Visits ({customerHistory.length})
                </h4>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Hide
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-purple-200 dark:border-purple-800">
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-left py-2 px-2">Services</th>
                      <th className="text-left py-2 px-2">Total</th>
                      <th className="text-left py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerHistory.map((inv, idx) => (
                      <tr key={inv.id} className="border-b border-purple-100 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                        <td className="py-2 px-2 text-xs">{new Date(inv.date).toLocaleDateString()}</td>
                        <td className="py-2 px-2 text-xs">
                          {inv.items.map(i => i.name).slice(0, 2).join(', ')}
                          {inv.items.length > 2 && ` +${inv.items.length - 2}`}
                        </td>
                        <td className="py-2 px-2 font-semibold text-green-600">Rs. {inv.total.toLocaleString()}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {customerHistory.length >= 10 && (
                <p className="text-xs text-gray-500 mt-2 text-center">Showing last 10 visits</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Services and Bill Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Section */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
          <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600">
            <h3 className="text-lg font-semibold text-white">🛠️ Available Services</h3>
            <p className="text-xs text-purple-100 mt-1">Click on any service to add to bill</p>
          </div>
          <div className={`p-4 max-h-[500px] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {Object.keys(groupedServices).map(category => (
              <div key={category} className="mb-3">
                <button
                  onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl transition ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className="font-semibold">{category}</span>
                  <span className="text-gray-500">{expandedCategory === category ? '▲' : '▼'}</span>
                </button>
                {expandedCategory === category && (
                  <div className="mt-2 space-y-2 ml-4">
                    {groupedServices[category].map(service => {
                      const stock = getProductStock(service.id);
                      const isOutOfStock = stock <= 0;
                      return (
                        <div 
                          key={service.id} 
                          onClick={() => !isOutOfStock && addToBill(service)}
                          className={`flex justify-between items-center p-3 rounded-xl transition ${
                            isOutOfStock 
                              ? 'opacity-50 cursor-not-allowed'
                              : darkMode 
                                ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer' 
                                : 'bg-gray-50 hover:bg-blue-50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{service.icon}</span>
                            <div>
                              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {service.name}
                              </span>
                              {isOutOfStock && (
                                <span className="ml-2 text-xs text-red-500">(Out of Stock)</span>
                              )}
                              {stock < 5 && stock > 0 && (
                                <span className="ml-2 text-xs text-yellow-500">(Only {stock} left)</span>
                              )}
                            </div>
                          </div>
                          <span className="text-blue-600 font-bold text-lg">Rs. {service.price.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bill Section */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
          <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600">
            <h3 className="text-lg font-semibold text-white">🧾 Current Bill</h3>
            <p className="text-xs text-green-100 mt-1">{cart.length} service(s) added</p>
          </div>
          <div className="p-4">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-7xl">🛒</span>
                <p className={`mt-4 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No services added yet</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Click on any service to add to bill</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
                  {cart.map((item, idx) => (
                    <div key={item.id} className={`flex justify-between items-center p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                          {idx + 1}
                        </span>
                        <div>
                          <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          Rs. {item.price.toLocaleString()}
                        </span>
                        <button 
                          onClick={() => removeFromBill(item.id)} 
                          className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white transition flex items-center justify-center text-xl"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Items:</span>
                    <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{cart.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">Rs. {billTotal.toLocaleString()}</span>
                  </div>

                  {/* Payment Section */}
                  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>💵 Payment Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Amount</label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder="Enter amount"
                          className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-green-500 outline-none ${
                            darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="cash">💵 Cash</option>
                          <option value="card">💳 Card</option>
                          <option value="bank">🏦 Bank Transfer</option>
                          <option value="online">📱 Online Payment</option>
                        </select>
                      </div>
                    </div>
                    
                    {paidAmount > 0 && (
                      <div className="mt-3 pt-3 border-t dark:border-gray-600">
                        <div className="flex justify-between text-sm">
                          <span>Paid:</span>
                          <span className="text-green-600 font-semibold">Rs. {paidAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>Remaining:</span>
                          <span className={`font-semibold ${remainingAmount > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            Rs. {remainingAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>Status:</span>
                          <span className={`font-semibold ${isFullyPaid ? 'text-green-600' : 'text-orange-500'}`}>
                            {isFullyPaid ? '✅ FULLY PAID' : '⚠️ PARTIAL'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handlePayment} 
                      className="px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition shadow-lg"
                    >
                      💰 PAY NOW
                    </button>
                    <button 
                      onClick={printBill} 
                      className="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition shadow-lg"
                    >
                      🖨️ PRINT BILL
                    </button>
                    <button 
                      onClick={exportToExcel} 
                      className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg"
                    >
                      📊 EXCEL
                    </button>
                    <button 
                      onClick={exportToPDF} 
                      className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition shadow-lg"
                    >
                      📄 PDF
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;