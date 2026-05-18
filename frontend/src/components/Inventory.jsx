// src/components/Inventory.jsx
import React from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Inventory = ({ products, setProducts }) => {
  const inventoryStats = products.reduce((acc, product) => {
    acc.totalPurchase += product.purchasePrice * product.quantity;
    acc.totalSelling += product.sellingPrice * product.quantity;
    acc.totalProfit += (product.sellingPrice - product.purchasePrice) * product.quantity;
    return acc;
  }, { totalPurchase: 0, totalSelling: 0, totalProfit: 0 });

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    toast.success('Exported to Excel');
  };

  const exportToPDF = (data, title) => {
    const doc = new jsPDF('landscape');
    doc.text(title, 14, 10);
    doc.autoTable({
      head: [['Product', 'Purchase Price', 'Selling Price', 'Quantity', 'Purchase Total', 'Selling Total', 'Profit']],
      body: data.map(p => [
        p.name,
        `Rs. ${p.purchasePrice.toLocaleString()}`,
        `Rs. ${p.sellingPrice.toLocaleString()}`,
        p.quantity,
        `Rs. ${(p.purchasePrice * p.quantity).toLocaleString()}`,
        `Rs. ${(p.sellingPrice * p.quantity).toLocaleString()}`,
        `Rs. ${((p.sellingPrice - p.purchasePrice) * p.quantity).toLocaleString()}`
      ]),
      startY: 20,
    });
    doc.save(`${title}.pdf`);
    toast.success('Exported to PDF');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">Total Purchase</p>
          <p className="text-3xl font-bold mt-2">Rs. {inventoryStats.totalPurchase.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">Total Selling</p>
          <p className="text-3xl font-bold mt-2">Rs. {inventoryStats.totalSelling.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">Total Profit</p>
          <p className="text-3xl font-bold mt-2">Rs. {inventoryStats.totalProfit.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Products Inventory</h3>
          <div className="flex gap-3">
            <button onClick={() => exportToExcel(products, 'Inventory_Report')} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm">📊 Excel</button>
            <button onClick={() => exportToPDF(products, 'Inventory_Report')} className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm">📄 PDF</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selling</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selling Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4">Rs. {product.purchasePrice.toLocaleString()}</td>
                  <td className="px-6 py-4">Rs. {product.sellingPrice.toLocaleString()}</td>
                  <td className="px-6 py-4">{product.quantity}</td>
                  <td className="px-6 py-4">Rs. {(product.purchasePrice * product.quantity).toLocaleString()}</td>
                  <td className="px-6 py-4">Rs. {(product.sellingPrice * product.quantity).toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">
                    Rs. {((product.sellingPrice - product.purchasePrice) * product.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;