// src/components/Finance.jsx - Updated Order
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';
import { format } from 'date-fns';

const Finance = ({ products, expenses: initialExpenses, onAddExpense, onUpdateExpense, darkMode }) => {
  const [expenses, setExpenses] = useState(initialExpenses || []);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'Operational',
    category: 'Other'
  });
  
  const [editingCell, setEditingCell] = useState({ expenseId: null, field: null, value: '' });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [compareYear, setCompareYear] = useState(null);
  const [chartType, setChartType] = useState('line');
  
  const [reminders, setReminders] = useState([
    { id: 1, type: 'salary', date: '2026-05-25', description: 'Employee Salary - Week 4', amount: 50000, recurring: 'monthly' },
    { id: 2, type: 'bill', date: '2026-05-20', description: 'Electricity Bill', amount: 8000, recurring: 'monthly' },
    { id: 3, type: 'bill', date: '2026-05-22', description: 'Internet Bill', amount: 3000, recurring: 'monthly' },
    { id: 4, type: 'rent', date: '2026-05-28', description: 'Shop Rent', amount: 25000, recurring: 'monthly' }
  ]);

  const expenseTypes = ['Operational', 'Salary', 'Rent', 'Utilities', 'Marketing', 'Maintenance', 'Tax', 'Other'];
  const expenseCategories = ['Office', 'Staff', 'Infrastructure', 'Marketing', 'Supplies', 'Travel', 'Software', 'Other'];

  useEffect(() => {
    setExpenses(initialExpenses);
  }, [initialExpenses]);

  const inventoryStats = products.reduce((acc, product) => {
    acc.totalPurchase += product.purchasePrice * product.quantity;
    acc.totalSelling += product.sellingPrice * product.quantity;
    acc.totalProfit += (product.sellingPrice - product.purchasePrice) * product.quantity;
    return acc;
  }, { totalPurchase: 0, totalSelling: 0, totalProfit: 0 });

  const getPeriodStats = (period) => {
    const now = new Date();
    let filteredExpenses = [];
    
    if (period === 'daily') {
      filteredExpenses = expenses.filter(exp => new Date(exp.date).toDateString() === now.toDateString());
    } else if (period === 'weekly') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      filteredExpenses = expenses.filter(exp => new Date(exp.date) >= weekAgo);
    } else if (period === 'monthly') {
      filteredExpenses = expenses.filter(exp => new Date(exp.date).getMonth() === now.getMonth() && new Date(exp.date).getFullYear() === now.getFullYear());
    } else if (period === 'yearly') {
      filteredExpenses = expenses.filter(exp => new Date(exp.date).getFullYear() === now.getFullYear());
    }
    
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRevenue = inventoryStats.totalSelling;
    const netProfit = totalRevenue - inventoryStats.totalPurchase - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    
    return { totalExpenses, totalRevenue, netProfit, profitMargin, count: filteredExpenses.length };
  };

  const getMonthlyData = (year) => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(year, i, 1);
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === i && expDate.getFullYear() === year;
      });
      
      const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const monthRevenue = inventoryStats.totalSelling / 12;
      const monthPurchase = inventoryStats.totalPurchase / 12;
      const monthProfit = monthRevenue - monthPurchase - totalExpenses;
      
      months.push({
        month: format(monthDate, 'MMM'),
        monthIndex: i,
        year: year,
        expenses: totalExpenses,
        revenue: monthRevenue,
        profit: monthProfit,
        purchase: monthPurchase
      });
    }
    return months;
  };

  const getCategoryBreakdown = () => {
    const categories = {};
    expenses.forEach(exp => {
      const category = exp.category || 'Other';
      categories[category] = (categories[category] || 0) + exp.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const getTypeBreakdown = () => {
    const types = {};
    expenses.forEach(exp => {
      types[exp.type] = (types[exp.type] || 0) + exp.amount;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  };

  const getUpcomingReminders = () => {
    const today = new Date();
    const next30Days = new Date(today.setDate(today.getDate() + 30));
    return reminders.filter(r => new Date(r.date) <= next30Days).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.date) {
      toast.error('Please fill all required fields');
      return;
    }

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (editingExpense) {
      const updatedExpense = { ...editingExpense, ...formData, amount: amountNum };
      onUpdateExpense(updatedExpense);
      toast.success('Expense updated successfully!');
    } else {
      const newExpense = {
        id: Date.now(),
        ...formData,
        amount: amountNum
      };
      onAddExpense(newExpense);
      toast.success('Expense added successfully!');
    }

    setFormData({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'Operational', category: 'Other' });
    setEditingExpense(null);
    setShowExpenseForm(false);
  };

  const startInlineEdit = (expenseId, field, currentValue) => {
    setEditingCell({ expenseId, field, value: currentValue });
  };

  const saveInlineEdit = (expenseId, field) => {
    let newValue = editingCell.value;
    
    if (field === 'amount') {
      newValue = parseFloat(editingCell.value);
      if (isNaN(newValue) || newValue <= 0) {
        toast.error('Please enter a valid amount');
        setEditingCell({ expenseId: null, field: null, value: '' });
        return;
      }
    }
    
    const expenseToUpdate = expenses.find(e => e.id === expenseId);
    const updatedExpense = { ...expenseToUpdate, [field]: newValue };
    onUpdateExpense(updatedExpense);
    toast.success(`${field} updated successfully!`);
    setEditingCell({ expenseId: null, field: null, value: '' });
  };

  const exportToExcel = () => {
    const exportData = expenses.map(e => ({
      Date: e.date,
      Description: e.description,
      Amount: `Rs. ${e.amount.toLocaleString()}`,
      Type: e.type,
      Category: e.category || 'Other'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Finance_Report');
    XLSX.writeFile(wb, `Finance_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Exported to Excel');
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    doc.text('Finance Report', 14, 10);
    doc.autoTable({
      head: [['Date', 'Description', 'Amount', 'Type', 'Category']],
      body: expenses.map(e => [e.date, e.description, `Rs. ${e.amount.toLocaleString()}`, e.type, e.category || 'Other']),
      startY: 20,
    });
    doc.save(`Finance_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('Exported to PDF');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

  const periodStats = {
    daily: getPeriodStats('daily'),
    weekly: getPeriodStats('weekly'),
    monthly: getPeriodStats('monthly'),
    yearly: getPeriodStats('yearly')
  };

  const monthlyData = getMonthlyData(selectedYear);
  const categoryData = getCategoryBreakdown();
  const typeData = getTypeBreakdown();
  const upcomingReminders = getUpcomingReminders();

  const compareData = compareYear ? monthlyData.map((m, i) => ({
    month: m.month,
    current: m.expenses,
    previous: getMonthlyData(compareYear)[i]?.expenses || 0
  })) : [];

  return (
    <div className={`space-y-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* 1. Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">Today's Expenses</p>
          <p className="text-3xl font-bold mt-2">Rs. {periodStats.daily.totalExpenses.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">{periodStats.daily.count} transactions</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">This Week</p>
          <p className="text-3xl font-bold mt-2">Rs. {periodStats.weekly.totalExpenses.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">Weekly expenses</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">This Month</p>
          <p className="text-3xl font-bold mt-2">Rs. {periodStats.monthly.totalExpenses.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">Monthly expenses</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm opacity-90">Net Profit (Monthly)</p>
          <p className="text-3xl font-bold mt-2">Rs. {periodStats.monthly.netProfit.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">Margin: {periodStats.monthly.profitMargin.toFixed(1)}%</p>
        </div>
      </div>

      {/* 2. Upcoming Payments & Reminders */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-lg font-semibold">📅 Upcoming Payments & Reminders</h3>
          <p className="text-sm opacity-70 mt-1">Salary, bills, and other recurring payments due in next 30 days</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Description</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th></tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {upcomingReminders.map(reminder => {
                const daysLeft = Math.ceil((new Date(reminder.date) - new Date()) / (1000 * 60 * 60 * 24));
                return (<tr key={reminder.id}><td className="px-6 py-4">{format(new Date(reminder.date), 'dd MMM yyyy')}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${reminder.type === 'salary' ? 'bg-green-100 text-green-700' : reminder.type === 'rent' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{reminder.type.toUpperCase()}</span></td><td className="px-6 py-4">{reminder.description}</td><td className="px-6 py-4 font-semibold text-red-600">Rs. {reminder.amount.toLocaleString()}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${daysLeft <= 3 ? 'bg-red-100 text-red-700' : daysLeft <= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{daysLeft <= 0 ? 'Overdue' : `${daysLeft} days left`}</span></td></tr>);
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Expenses Record - 3rd number par */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center flex-wrap gap-3`}>
          <h3 className="text-lg font-semibold">📝 Expenses Record</h3>
          <div className="flex gap-3">
            <button onClick={() => { setEditingExpense(null); setFormData({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'Operational', category: 'Other' }); setShowExpenseForm(true); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">➕ Add Expense</button>
            <button onClick={exportToExcel} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">📊 Excel</button>
            <button onClick={exportToPDF} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">📄 PDF</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Description</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">Category</th></tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {expenses.map(exp => (
                <tr key={exp.id}>
                  <td className="px-6 py-4">{editingCell.expenseId === exp.id && editingCell.field === 'date' ? <input type="date" value={editingCell.value} onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })} onBlur={() => saveInlineEdit(exp.id, 'date')} className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`} autoFocus /> : <div onDoubleClick={() => startInlineEdit(exp.id, 'date', exp.date)} className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2 py-1 rounded">{exp.date}</div>}</td>
                  <td className="px-6 py-4">{editingCell.expenseId === exp.id && editingCell.field === 'description' ? <input type="text" value={editingCell.value} onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })} onBlur={() => saveInlineEdit(exp.id, 'description')} className={`px-2 py-1 border rounded w-48 ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`} autoFocus /> : <div onDoubleClick={() => startInlineEdit(exp.id, 'description', exp.description)} className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2 py-1 rounded">{exp.description}</div>}</td>
                  <td className="px-6 py-4">{editingCell.expenseId === exp.id && editingCell.field === 'amount' ? <input type="number" value={editingCell.value} onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })} onBlur={() => saveInlineEdit(exp.id, 'amount')} className={`w-32 px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`} autoFocus step="0.01" min="0" /> : <div onDoubleClick={() => startInlineEdit(exp.id, 'amount', exp.amount)} className="cursor-pointer font-semibold text-red-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2 py-1 rounded">Rs. {exp.amount.toLocaleString()}</div>}</td>
                  <td className="px-6 py-4">{editingCell.expenseId === exp.id && editingCell.field === 'type' ? <select value={editingCell.value} onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })} onBlur={() => saveInlineEdit(exp.id, 'type')} className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`} autoFocus>{expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}</select> : <div onDoubleClick={() => startInlineEdit(exp.id, 'type', exp.type)} className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2 py-1 rounded"><span className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700">{exp.type}</span></div>}</td>
                  <td className="px-6 py-4">{editingCell.expenseId === exp.id && editingCell.field === 'category' ? <select value={editingCell.value} onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })} onBlur={() => saveInlineEdit(exp.id, 'category')} className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`} autoFocus>{expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}</select> : <div onDoubleClick={() => startInlineEdit(exp.id, 'category', exp.category || 'Other')} className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2 py-1 rounded">{exp.category || 'Other'}</div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Charts - 4th number par */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex gap-3">
            <button onClick={() => setChartType('line')} className={`px-4 py-2 rounded-lg ${chartType === 'line' ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>📈 Line Chart</button>
            <button onClick={() => setChartType('bar')} className={`px-4 py-2 rounded-lg ${chartType === 'bar' ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>📊 Bar Chart</button>
            <button onClick={() => setChartType('area')} className={`px-4 py-2 rounded-lg ${chartType === 'area' ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>📉 Area Chart</button>
            <button onClick={() => setChartType('composed')} className={`px-4 py-2 rounded-lg ${chartType === 'composed' ? 'bg-blue-500 text-white' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>📊 Composed</button>
          </div>
          <div className="flex gap-3">
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>{[2022, 2023, 2024, 2025, 2026].map(year => <option key={year} value={year}>{year}</option>)}</select>
            <select value={compareYear || ''} onChange={(e) => setCompareYear(e.target.value ? parseInt(e.target.value) : null)} className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}><option value="">No Comparison</option>{[2022, 2023, 2024, 2025, 2026].filter(y => y !== selectedYear).map(year => <option key={year} value={year}>Compare with {year}</option>)}</select>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {compareYear ? (<BarChart data={compareData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="current" name={`${selectedYear} Expenses`} fill="#8884D8" /><Bar dataKey="previous" name={`${compareYear} Expenses`} fill="#82CA9D" /></BarChart>) : chartType === 'line' ? (<LineChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="expenses" stroke="#FF6B6B" name="Expenses" strokeWidth={2} /><Line type="monotone" dataKey="revenue" stroke="#4ECDC4" name="Revenue" strokeWidth={2} /><Line type="monotone" dataKey="profit" stroke="#45B7D1" name="Profit" strokeWidth={2} /></LineChart>) : chartType === 'bar' ? (<BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="expenses" fill="#FF6B6B" name="Expenses" /><Bar dataKey="revenue" fill="#4ECDC4" name="Revenue" /><Bar dataKey="profit" fill="#45B7D1" name="Profit" /></BarChart>) : chartType === 'area' ? (<AreaChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Area type="monotone" dataKey="expenses" stackId="1" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.6} /><Area type="monotone" dataKey="revenue" stackId="1" stroke="#4ECDC4" fill="#4ECDC4" fillOpacity={0.6} /></AreaChart>) : (<ComposedChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="expenses" barSize={20} fill="#FF6B6B" /><Line type="monotone" dataKey="profit" stroke="#45B7D1" strokeWidth={2} /></ComposedChart>)}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Pie Charts - 5th number par */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
          <h3 className="text-lg font-semibold mb-4">🥧 Expenses by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884D8" dataKey="value">{categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6`}>
          <h3 className="text-lg font-semibold mb-4">🥧 Expenses by Type</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={typeData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884D8" dataKey="value">{typeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} rounded-2xl shadow-xl max-w-md w-full`}>
            <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
              <h3 className="text-xl font-semibold">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button onClick={() => { setShowExpenseForm(false); setEditingExpense(null); }} className="text-2xl">×</button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-2">Date *</label><input type="date" name="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`} required /></div>
              <div><label className="block text-sm font-medium mb-2">Description *</label><input type="text" name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`} placeholder="Enter description" required /></div>
              <div><label className="block text-sm font-medium mb-2">Amount (Rs.) *</label><input type="number" name="amount" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`} placeholder="Enter amount" min="0" step="0.01" required /></div>
              <div><label className="block text-sm font-medium mb-2">Type</label><select name="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}>{expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-2">Category</label><select name="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={`w-full px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}>{expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="flex gap-3 pt-4"><button type="button" onClick={() => { setShowExpenseForm(false); setEditingExpense(null); }} className="flex-1 px-4 py-2 bg-gray-300 rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg">{editingExpense ? 'Update' : 'Add'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;