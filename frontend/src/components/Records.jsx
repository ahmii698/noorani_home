// src/components/Records.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Records = ({ invoices, darkMode }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(invoices.map(inv => ({
      'Invoice #': inv.invoiceNo,
      'Date': new Date(inv.date).toLocaleDateString(),
      'Customer Name': inv.customer?.name || 'Walk-in',
      'Phone': inv.customer?.phone || 'N/A',
      'Car Number': inv.customer?.carNumber || 'N/A',
      'Services': inv.items.map(i => i.name).join(', '),
      'Total': `Rs. ${inv.total.toLocaleString()}`,
      'Paid': `Rs. ${inv.paidAmount?.toLocaleString() || inv.total.toLocaleString()}`,
      'Remaining': `Rs. ${inv.remainingAmount?.toLocaleString() || 0}`,
      'Status': inv.status || 'Paid'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Records');
    XLSX.writeFile(wb, `All_Records.xlsx`);
    toast.success('Exported to Excel');
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    doc.text('All Invoice Records - Noorani Car AC', 14, 10);
    doc.autoTable({
      head: [['Invoice #', 'Date', 'Customer', 'Phone', 'Car No', 'Services', 'Total', 'Status']],
      body: invoices.map(inv => [
        inv.invoiceNo,
        new Date(inv.date).toLocaleDateString(),
        inv.customer?.name || 'Walk-in',
        inv.customer?.phone || 'N/A',
        inv.customer?.carNumber || 'N/A',
        inv.items.map(i => i.name).join(', ').substring(0, 30) + '...',
        `Rs. ${inv.total.toLocaleString()}`,
        inv.status || 'Paid'
      ]),
      startY: 20,
    });
    doc.save(`All_Records.pdf`);
    toast.success('Exported to PDF');
  };

  const viewInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const printSingleInvoice = () => {
    if (!selectedInvoice) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${selectedInvoice.invoiceNo}</title>
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
              <p><strong>Name:</strong> ${selectedInvoice.customer?.name || 'Walk-in Customer'}</p>
              <p><strong>Phone:</strong> ${selectedInvoice.customer?.phone || 'N/A'}</p>
              <p><strong>Car Number:</strong> ${selectedInvoice.customer?.carNumber || 'N/A'}</p>
              <p><strong>Car Model:</strong> ${selectedInvoice.customer?.carModel || 'N/A'}</p>
            </div>
            
            <div class="invoice-details">
              <p><strong>Invoice #:</strong> ${selectedInvoice.invoiceNo}</p>
              <p><strong>Date:</strong> ${new Date(selectedInvoice.date).toLocaleString()}</p>
            </div>
            
            <table>
              <thead>
                <tr><th>#</th><th>Service</th><th>Category</th><th>Price (PKR)</th></tr>
              </thead>
              <tbody>
                ${selectedInvoice.items.map((item, idx) => `
                  <tr>
                    <td>${idx+1}</td>
                    <td>${item.name}</td>
                    <td>${item.category || 'Service'}</td>
                    <td>Rs. ${item.price.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="payment-details">
              <h4>💰 PAYMENT DETAILS</h4>
              <p><strong>Total Amount:</strong> Rs. ${selectedInvoice.total.toLocaleString()}</p>
              <p><strong>Paid Amount:</strong> Rs. ${(selectedInvoice.paidAmount || selectedInvoice.total).toLocaleString()}</p>
              <p><strong>Payment Method:</strong> ${selectedInvoice.paymentMethod || 'Cash'}</p>
              <p><strong>Remaining Balance:</strong> Rs. ${(selectedInvoice.remainingAmount || 0).toLocaleString()}</p>
              <p><strong>Payment Status:</strong> ${selectedInvoice.status === 'Paid' ? '✅ FULLY PAID' : '⚠️ PARTIAL PAYMENT'}</p>
            </div>
            
            <div class="total-row">Total Amount: Rs. ${selectedInvoice.total.toLocaleString()}</div>
            
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
    toast.success('Invoice sent to printer');
  };

  return (
    <>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
        <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">📊 All Invoices Records</h3>
            <p className="text-xs text-orange-100 mt-1">Total Invoices: {invoices.length}</p>
          </div>
          {invoices.length > 0 && (
            <div className="flex gap-3">
              <button onClick={exportToExcel} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition flex items-center gap-1">
                📊 Excel
              </button>
              <button onClick={exportToPDF} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition flex items-center gap-1">
                📄 PDF
              </button>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Invoice #</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Date</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Customer</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Car Number</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Services</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Total</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase`}>Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <span className="text-6xl">📭</span>
                    <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No invoices found</p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Create your first invoice from the Billing section</p>
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{inv.invoiceNo}</td>
                    <td className={darkMode ? 'text-gray-300' : ''}>{new Date(inv.date).toLocaleDateString()}</td>
                    <td className={darkMode ? 'text-gray-300' : ''}>{inv.customer?.name || 'Walk-in'}</td>
                    <td className={darkMode ? 'text-gray-300' : ''}>{inv.customer?.carNumber || 'N/A'}</td>
                    <td className={darkMode ? 'text-gray-300' : ''}>
                      {inv.items.map(i => i.name).slice(0, 2).join(', ')}
                      {inv.items.length > 2 && ` +${inv.items.length - 2} more`}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">Rs. {inv.total.toLocaleString()}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        inv.status === 'Paid' 
                          ? 'bg-green-100 text-green-700' 
                          : inv.status === 'Partial'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {inv.status === 'Paid' ? '✅ Paid' : inv.status === 'Partial' ? '⚠️ Partial' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewInvoiceDetails(inv)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition flex items-center gap-1"
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {isModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Modal Header */}
            <div className={`sticky top-0 flex justify-between items-center p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-t-2xl`}>
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Invoice Details
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedInvoice.invoiceNo}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={printSingleInvoice}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  🖨️ Print
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <h3 className={`font-semibold text-lg mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  👤 Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedInvoice.customer?.name || 'Walk-in Customer'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedInvoice.customer?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Car Number Plate</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedInvoice.customer?.carNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Car Model</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedInvoice.customer?.carModel || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Invoice Date</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {new Date(selectedInvoice.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Services Table */}
              <div>
                <h3 className={`font-semibold text-lg mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  🛠️ Services Provided
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm">#</th>
                        <th className="px-4 py-2 text-left text-sm">Service Name</th>
                        <th className="px-4 py-2 text-left text-sm">Category</th>
                        <th className="px-4 py-2 text-right text-sm">Price</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 text-sm">{idx + 1}</td>
                          <td className={`px-4 py-2 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {item.name}
                          </td>
                          <td className={`px-4 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.category || 'Service'}
                          </td>
                          <td className="px-4 py-2 text-sm text-right font-semibold text-green-600">
                            Rs. {item.price.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right font-bold">Total:</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">
                          Rs. {selectedInvoice.total.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Details */}
              <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                <h3 className={`font-semibold text-lg mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  💰 Payment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Amount</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Rs. {selectedInvoice.total.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Paid Amount</p>
                    <p className={`text-xl font-bold text-green-600`}>
                      Rs. {(selectedInvoice.paidAmount || selectedInvoice.total).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment Method</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {selectedInvoice.paymentMethod || 'Cash'} 💵
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Remaining Balance</p>
                    <p className={`text-xl font-bold ${(selectedInvoice.remainingAmount || 0) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      Rs. {(selectedInvoice.remainingAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedInvoice.status === 'Paid' 
                        ? 'bg-green-100 text-green-700' 
                        : selectedInvoice.status === 'Partial'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedInvoice.status === 'Paid' ? '✅ FULLY PAID' : selectedInvoice.status === 'Partial' ? '⚠️ PARTIAL PAYMENT' : 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 flex justify-end gap-3 p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-b-2xl`}>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                Close
              </button>
              <button
                onClick={printSingleInvoice}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                🖨️ Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Records;