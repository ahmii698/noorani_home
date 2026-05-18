// src/components/Records.jsx
import React from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Records = ({ invoices }) => {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(invoices.map(inv => ({
      'Invoice #': inv.invoiceNo,
      'Date': new Date(inv.date).toLocaleDateString(),
      'Services': inv.items.map(i => i.name).join(', '),
      'Total': `Rs. ${inv.total.toLocaleString()}`
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Records');
    XLSX.writeFile(wb, `All_Records.xlsx`);
    toast.success('Exported to Excel');
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    doc.text('All Invoice Records', 14, 10);
    doc.autoTable({
      head: [['Invoice #', 'Date', 'Services', 'Total']],
      body: invoices.map(inv => [
        inv.invoiceNo,
        new Date(inv.date).toLocaleDateString(),
        inv.items.map(i => i.name).join(', '),
        `Rs. ${inv.total.toLocaleString()}`
      ]),
      startY: 20,
    });
    doc.save(`All_Records.pdf`);
    toast.success('Exported to PDF');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">All Invoices</h3>
        {invoices.length > 0 && (
          <div className="flex gap-3">
            <button onClick={exportToExcel} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm">📊 Excel</button>
            <button onClick={exportToPDF} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm">📄 PDF</button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">📭 No invoices found</td></tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{inv.invoiceNo}</td>
                  <td className="px-6 py-4">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{inv.items.map(i => i.name).join(', ')}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">Rs. {inv.total.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Records;