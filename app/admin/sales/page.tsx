"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const products = [
  { id: 1, name: "Burger", price: 500 },
  { id: 2, name: "Pizza", price: 1200 },
  { id: 3, name: "Drink", price: 150 },
];

export default function SalesHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem("salesHistory") || "[]"));
  }, []);

  // Delete Single Sale
  const deleteSale = (id: string) => {
    if (confirm("Are you sure you want to delete this sale record?")) {
      const updatedHistory = history.filter((s) => s.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem("salesHistory", JSON.stringify(updatedHistory));
    }
  };

  // Delete All Sales
  const deleteAllSales = () => {
    if (confirm("WARNING: Kya aap saari sales history hamesha ke liye delete karna chahte hain?")) {
      localStorage.removeItem("salesHistory");
      setHistory([]);
    }
  };

  const addToExistingBill = (product: any) => {
    const updatedHistory = history.map((sale) => {
      if (sale.id === editingSale.id) {
        const existingItem = sale.items.find((i: any) => i.id === product.id);
        let newItems;
        if (existingItem) {
          newItems = sale.items.map((i: any) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
        } else {
          newItems = [...sale.items, { ...product, qty: 1 }];
        }
        const newTotal = newItems.reduce((sum: number, i: any) => sum + i.price * i.qty, 0);
        const updatedSale = { ...sale, items: newItems, total: newTotal };
        setEditingSale(updatedSale);
        return updatedSale;
      }
      return sale;
    });

    setHistory(updatedHistory);
    localStorage.setItem("salesHistory", JSON.stringify(updatedHistory));
  };

  const handlePrint = (sale: any) => {
    window.print();
  };

  const filteredHistory = history.filter((sale) => String(sale.id).toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales History</h1>
        <div className="flex gap-2">
          {/* DELETE ALL BUTTON */}
          <button 
            onClick={deleteAllSales}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Delete All
          </button>
          <Link href="/admin" className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-black transition">
            Dashboard
          </Link>
        </div>
      </div>

      <input 
        type="text" 
        placeholder="Search Invoice..." 
        className="w-full md:w-1/3 p-3 mb-6 border rounded-lg" 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
      
      <table className="w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4">ID</th>
            <th className="p-4">Items</th>
            <th className="p-4">Total</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map((sale) => (
            <tr key={sale.id} className="border-t">
              <td className="p-4 font-bold text-blue-600">{sale.id}</td>
              <td className="p-4 text-sm text-gray-600">
                {sale.items.map((i: any) => `${i.name} (x${i.qty})`).join(", ")}
              </td>
              <td className="p-4">Rs. {sale.total}</td>
              <td className="p-4 flex gap-2">
                <button onClick={() => setEditingSale(sale)} className="bg-blue-600 text-white px-3 py-1 rounded">Add</button>
                <button onClick={() => handlePrint(sale)} className="bg-gray-600 text-white px-3 py-1 rounded">Print</button>
                {/* DELETE SINGLE SALE */}
                <button onClick={() => deleteSale(sale.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Editing Modal */}
      {editingSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit {editingSale.id}</h2>
            <div className="mb-4 max-h-40 overflow-y-auto border p-2 rounded bg-gray-50">
              <p className="font-semibold text-sm mb-2">Current Items:</p>
              {editingSale.items.map((i: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm py-1 border-b">
                  <span>{i.name} (x{i.qty})</span>
                  <span>Rs. {i.price * i.qty}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {products.map(p => (
                <button key={p.id} onClick={() => addToExistingBill(p)} className="p-2 border rounded hover:bg-blue-50">
                  {p.name} (+{p.price})
                </button>
              ))}
            </div>
            <div className="border-t pt-4">
              <p className="font-bold text-lg">Total: Rs. {editingSale.total}</p>
              <button onClick={() => setEditingSale(null)} className="mt-4 w-full bg-red-500 text-white py-2 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}