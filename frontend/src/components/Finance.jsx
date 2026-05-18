// src/components/Finance.jsx
import React from 'react';

const Finance = ({ products, expenses }) => {
  const inventoryStats = products.reduce((acc, product) => {
    acc.totalPurchase += product.purchasePrice * product.quantity;
    acc.totalSelling += product.sellingPrice * product.quantity;
    return acc;
  }, { totalPurchase: 0, totalSelling: 0 });

  const getFinanceData = (period) => {
    const now = new Date();
    const filteredExpenses = expenses.filter(exp => {
      if (period === 'daily') {
        return new Date(exp.date).toDateString() === now.toDateString();
      } else if (period === 'weekly') {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return new Date(exp.date) >= weekAgo;
      } else if (period === 'monthly') {
        return new Date(exp.date).getMonth() === now.getMonth();
      }
      return true;
    });
    
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRevenue = inventoryStats.totalSelling;
    const netProfit = totalRevenue - inventoryStats.totalPurchase - totalExpenses;
    
    return { totalExpenses, totalRevenue, netProfit };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['daily', 'weekly', 'monthly'].map(period => {
          const data = getFinanceData(period);
          return (
            <div key={period} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-sm uppercase font-bold text-gray-500 capitalize">{period}</div>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expenses:</span>
                  <span className="font-semibold text-red-600">Rs. {data.totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-semibold text-green-600">Rs. {data.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Net Profit:</span>
                  <span className="font-semibold text-blue-600">Rs. {data.netProfit.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Expenses Record</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{exp.date}</td>
                  <td className="px-6 py-4">{exp.description}</td>
                  <td className="px-6 py-4 text-red-600 font-semibold">Rs. {exp.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">{exp.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;