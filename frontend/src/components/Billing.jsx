// src/components/Billing.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Billing = ({ services, invoices, setInvoices, cart, setCart }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) acc[service.category] = [];
    acc[service.category].push(service);
    return acc;
  }, {});

  const addToBill = (service) => {
    setCart([...cart, { ...service, quantity: 1 }]);
    toast.success(`${service.name} added`);
  };

  const removeFromBill = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const billTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const printBill = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Invoice</title>
        <style>
          body { font-family: Arial; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; }
        </style>
        </head>
        <body>
          <div class="header"><h2>NOORANI CAR AC & AUTOS</h2></div>
          <table><thead><tr><th>#</th><th>Service</th><th>Price</th></tr></thead>
          <tbody>${cart.map((item, idx) => `<tr><td>${idx+1}</td><td>${item.name}</td><td>Rs. ${item.price.toLocaleString()}</td></tr>`).join('')}</tbody>
          </table>
          <div class="total">Total: Rs. ${billTotal.toLocaleString()}</div>
        </body>
      </html>
    `);
    printWindow.print();
    printWindow.close();
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(cart);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bill');
    XLSX.writeFile(wb, `Bill_${Date.now()}.xlsx`);
    toast.success('Exported to Excel');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Invoice', 14, 10);
    doc.autoTable({
      head: [['Service', 'Price']],
      body: cart.map(item => [item.name, `Rs. ${item.price.toLocaleString()}`]),
      startY: 20,
    });
    doc.save(`Bill_${Date.now()}.pdf`);
    toast.success('Exported to PDF');
  };

  const saveInvoice = () => {
    const newInvoice = {
      id: invoices.length + 1,
      invoiceNo: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      items: [...cart],
      total: billTotal,
    };
    setInvoices([...invoices, newInvoice]);
    setCart([]);
    toast.success('Invoice saved');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600">
          <h3 className="text-lg font-semibold text-white">Services</h3>
        </div>
        <div className="p-4 max-h-[600px] overflow-y-auto">
          {Object.keys(groupedServices).map(category => (
            <div key={category} className="mb-4">
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="w-full flex justify-between items-center p-3 bg-gray-100 rounded-lg"
              >
                <span className="font-semibold">{category}</span>
                <span>{expandedCategory === category ? '▼' : '▶'}</span>
              </button>
              {expandedCategory === category && (
                <div className="mt-2 space-y-2 ml-4">
                  {groupedServices[category].map(service => (
                    <div key={service.id} onClick={() => addToBill(service)} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50">
                      <span>{service.icon} {service.name}</span>
                      <span className="text-blue-600">Rs. {service.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-green-600">
          <h3 className="text-lg font-semibold text-white">Current Bill</h3>
        </div>
        <div className="p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <span className="text-6xl">🛒</span>
              <p className="mt-2">Empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>{item.name}</span>
                    <div><span className="mr-4">Rs. {item.price.toLocaleString()}</span>
                    <button onClick={() => removeFromBill(item.id)} className="text-red-500">✕</button></div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">Rs. {billTotal.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button onClick={saveInvoice} className="px-4 py-2 bg-blue-500 text-white rounded-lg">💾 Save</button>
                  <button onClick={printBill} className="px-4 py-2 bg-gray-500 text-white rounded-lg">🖨️ Print</button>
                  <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg">📊 Excel</button>
                  <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg">📄 PDF</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;