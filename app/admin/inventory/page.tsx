"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["General"]);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState("low");
  const [editingItem, setEditingItem] = useState<any>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [newCatInput, setNewCatInput] = useState("");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("products") || "[]");
    const savedCats = JSON.parse(localStorage.getItem("categories") || '["General"]');
    setProducts(saved);
    setCategories(savedCats);
  }, []);

  const openEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQty(item.qty.toString());
    setCost(item.cost.toString());
    setPrice(item.price.toString());
    setShowModal(true);
  };

  const saveItem = () => {
    if (!name || !qty || !cost || !price) return alert("Fill all fields!");
    
    let updated;
    if (editingItem) {
      updated = products.map(p => p.id === editingItem.id ? 
        { ...p, name, category, qty: Number(qty), cost: Number(cost), price: Number(price) } : p);
    } else {
      const newItem = { id: Date.now(), name, category, qty: Number(qty), cost: Number(cost), price: Number(price) };
      updated = [...products, newItem];
    }
    
    setProducts(updated);
    localStorage.setItem("products", JSON.stringify(updated));
    resetForm();
  };

  const resetForm = () => {
    setName(""); setQty(""); setCost(""); setPrice(""); setCategory("General");
    setEditingItem(null);
    setShowModal(false);
  };

  const addCategory = () => {
    if (newCatInput && !categories.includes(newCatInput)) {
      const updated = [...categories, newCatInput];
      setCategories(updated);
      localStorage.setItem("categories", JSON.stringify(updated));
      setNewCatInput("");
    }
  };

  const deleteItem = (id: number) => {
    if (confirm("Are you sure?")) {
      const updated = products.filter((p) => p.id !== id);
      setProducts(updated);
      localStorage.setItem("products", JSON.stringify(updated));
    }
  };

  const addQuantity = (id: number) => {
    const amount = prompt("Enter quantity to add:");
    if (amount && !isNaN(Number(amount))) {
      const updated = products.map((p) => p.id === id ? { ...p, qty: p.qty + Number(amount) } : p);
      setProducts(updated);
      localStorage.setItem("products", JSON.stringify(updated));
    }
  };

  const lowItemsCount = products.filter(p => p.qty <= 10).length;
  const filteredProducts = view === "low" ? products.filter((p) => p.qty <= 10) : products;
  const totalInvestment = products.reduce((sum, p) => sum + (Number(p.qty) * Number(p.cost)), 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-6">Inventory Menu</h2>
        <Link href="/admin" className="block p-3 bg-gray-800 text-white rounded-lg text-center font-bold">← Dashboard</Link>
        <button onClick={() => { setEditingItem(null); setShowModal(true); }} className="w-full text-left p-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">+ Add Item</button>
        <div className="flex flex-col gap-2 mt-2">
            <button onClick={() => setView("low")} className={`text-left p-3 rounded-lg font-bold ${view === 'low' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700'}`}>⚠️ Low ({lowItemsCount})</button>
            <button onClick={() => setView("stock")} className={`text-left p-3 rounded-lg ${view === 'stock' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>📦 All Stock</button>
            <button onClick={() => setView("expenses")} className={`text-left p-3 rounded-lg ${view === 'expenses' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700'}`}>💸 Expenses</button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold capitalize">{view} Management</h1>
          <div className="bg-white px-6 py-2 rounded-full border shadow-sm font-bold">Total Invested: Rs. {totalInvestment.toLocaleString()}</div>
        </div>

        {view === "expenses" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const total = products.filter(p => p.category === cat).reduce((sum, p) => sum + (p.qty * p.cost), 0);
              return (
                <div key={cat} className="p-6 bg-red-50 border border-red-200 rounded-xl">
                  <h3 className="text-sm font-bold text-red-600 uppercase">{cat}</h3>
                  <p className="text-2xl font-bold">Rs. {total.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <table className="w-full bg-white text-left shadow-sm border">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Cost</th>
                <th className="p-4">Price</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-4">{p.name}</td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4">{p.qty}</td>
                  <td className="p-4">Rs. {Number(p.cost).toLocaleString()}</td>
                  <td className="p-4">Rs. {Number(p.price).toLocaleString()}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-blue-600 font-bold hover:underline">Edit</button>
                    <button onClick={() => deleteItem(p.id)} className="text-red-600 font-bold hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4">{editingItem ? "Edit Item" : "Add Item"}</h2>
            <div className="flex gap-2 mb-2">
              <input className="border p-2 rounded flex-1" placeholder="New Cat" value={newCatInput} onChange={(e) => setNewCatInput(e.target.value)} />
              <button onClick={addCategory} className="bg-blue-600 text-white px-3 rounded">+</button>
            </div>
            <input className="w-full border p-2 mb-2 rounded" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <select className="w-full border p-2 mb-2 rounded" value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input className="w-full border p-2 mb-2 rounded" type="number" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
            <input className="w-full border p-2 mb-2 rounded" type="number" placeholder="Cost" value={cost} onChange={(e) => setCost(e.target.value)} />
            <input className="w-full border p-2 mb-4 rounded" type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={saveItem} className="flex-1 bg-green-600 text-white py-2 rounded font-bold">Save</button>
              <button onClick={resetForm} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}