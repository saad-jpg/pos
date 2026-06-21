"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function POSScreen() {
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [invoiceId, setInvoiceId] = useState<string>(""); 
  const barcodeRef = useRef<HTMLInputElement>(null);

  const loadInventory = () => {
    const savedProducts = JSON.parse(localStorage.getItem("products") || "[]");
    setProducts(savedProducts);
  };

  useEffect(() => {
    loadInventory();
    window.addEventListener("focus", loadInventory);
    barcodeRef.current?.focus();
    return () => window.removeEventListener("focus", loadInventory);
  }, []);

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          const product = products.find(p => p.id === id);
          if (newQty > (product?.qty || 0)) { alert("Not enough stock!"); return item; }
          return { ...item, qty: newQty > 0 ? newQty : 1 };
        }
        return item;
      }).filter(item => item.qty > 0)
    );
  };

  const handleBarcodeScan = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const product = products.find((p) => p.barcode === barcodeInput);
      if (product) {
        addToCart(product);
      } else {
        alert("Product not found!");
      }
      setBarcodeInput("");
    }
  };

  const categories = ["All", ...new Set(products.map((p) => p.category || "General"))];
  const filteredProducts = selectedCategory === "All" ? products : products.filter((p) => (p.category || "General") === selectedCategory);

  const addToCart = (product: any) => {
    if (product.qty <= 0) return alert("Out of stock!");
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.qty >= product.qty) { alert("Not enough stock!"); return prev; }
        return prev.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newId = "INV-" + Date.now();
    setInvoiceId(newId);

    const currentInventory = JSON.parse(localStorage.getItem("products") || "[]");
    const updatedInventory = currentInventory.map((p: any) => {
      const cartItem = cart.find((item) => item.id === p.id);
      return cartItem ? { ...p, qty: p.qty - cartItem.qty } : p;
    });
    localStorage.setItem("products", JSON.stringify(updatedInventory));
    setProducts(updatedInventory);

    const newSale = {
      id: newId,
      date: new Date().toLocaleString(),
      items: cart,
      total: total
    };
    const existingHistory = JSON.parse(localStorage.getItem("salesHistory") || "[]");
    localStorage.setItem("salesHistory", JSON.stringify([...existingHistory, newSale]));

    // --- PRINT BILL LOGIC ---
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow?.document.write(`
      <html>
        <head>
          <style>
            body { font-family: sans-serif; padding: 20px; font-size: 14px; }
            .header { text-align: center; margin-bottom: 20px; }
            .item-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total-row { font-weight: bold; border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2 style="margin:0;">Subhan Fast Food</h2>
            <p style="margin:0;">Invoice: ${newId}</p>
            <p>${new Date().toLocaleString()}</p>
          </div>
          <hr/>
          <div>
            ${cart.map(item => `
              <div class="item-row">
                <span>${item.name} x ${item.qty}</span>
                <span>Rs. ${item.price * item.qty}</span>
              </div>
            `).join('')}
          </div>
          <div class="item-row total-row">
            <span>Total:</span>
            <span>Rs. ${total}</span>
          </div>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();

    setCart([]);
    setInvoiceId("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 gap-4" onClick={() => barcodeRef.current?.focus()}>
      <input ref={barcodeRef} type="text" className="opacity-0 fixed top-0 left-0" value={barcodeInput}
        onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={handleBarcodeScan} />

      <div className="no-print flex justify-between items-center bg-white p-4 rounded-xl shadow">
        <h1 className="text-xl font-bold">POS System</h1>
        <Link href="/admin" className="bg-gray-800 text-white px-6 py-2 rounded-lg">Dashboard</Link>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="no-print flex-1 bg-white rounded-xl shadow p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Products</h2>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium ${selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((p) => (
              <button key={p.id} onClick={() => addToCart(p)} className="p-4 border rounded-lg hover:bg-blue-50 text-left">
                <div className="font-semibold">{p.name}</div>
                <div className="text-gray-500 text-sm">Rs. {p.price}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-96 bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Current Order</h2>
          {invoiceId && <p className="text-xs font-mono mb-2 text-gray-500">Invoice: {invoiceId}</p>}
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                    <p>{item.name}</p>
                    <p className="text-xs text-gray-500">Rs. {item.price} x {item.qty}</p>
                </div>
                <div className="flex items-center gap-2 no-print">
                    <button onClick={() => updateQty(item.id, -1)} className="px-2 bg-gray-200 rounded">-</button>
                    <span className="font-bold w-6 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="px-2 bg-gray-200 rounded">+</button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-lg font-bold"><span>Total:</span><span>Rs. {total}</span></div>
            <button onClick={handleCheckout} disabled={cart.length === 0}
              className="no-print w-full bg-green-600 text-white py-3 mt-4 rounded-lg font-semibold hover:bg-green-700">
              Checkout & Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}