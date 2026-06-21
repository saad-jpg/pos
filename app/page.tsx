"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function POSScreen() {
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [barcodeInput, setBarcodeInput] = useState("");
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
    const currentInventory = JSON.parse(localStorage.getItem("products") || "[]");
    const updatedInventory = currentInventory.map((p: any) => {
      const cartItem = cart.find((item) => item.id === p.id);
      return cartItem ? { ...p, qty: p.qty - cartItem.qty } : p;
    });

    localStorage.setItem("products", JSON.stringify(updatedInventory));
    setProducts(updatedInventory);
    window.print();
    setCart([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4 gap-4" onClick={() => barcodeRef.current?.focus()}>
      <input ref={barcodeRef} type="text" className="opacity-0 fixed top-0 left-0" value={barcodeInput}
        onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={handleBarcodeScan} />

      {/* NO-PRINT: Yeh hissa print mein nahi aayega */}
      <div className="no-print flex justify-between items-center bg-white p-4 rounded-xl shadow">
        <h1 className="text-xl font-bold">POS System</h1>
        <Link href="/admin" className="bg-gray-800 text-white px-6 py-2 rounded-lg">Dashboard</Link>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* NO-PRINT: Products Grid */}
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

        {/* PRINT ONLY: Cart/Receipt */}
        <div id="printable-receipt" className="w-96 bg-white rounded-xl shadow p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Current Order</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                <span>{item.name} (x{item.qty})</span>
                <span>Rs. {item.price * item.qty}</span>
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