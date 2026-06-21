"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  // todaySales ko state se hata diya
  const [stats, setStats] = useState({ revenue: 0, cost: 0, profit: 0 });
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setIsAuthChecked(true);

    const sales = JSON.parse(localStorage.getItem("salesHistory") || "[]");
    
    const totals = sales.reduce((acc: any, s: any) => {
      acc.revenue += (s.total || 0);
      
      if (s.items && Array.isArray(s.items)) {
        s.items.forEach((item: any) => {
          acc.cost += ((item.cost || 0) * (item.qty || 0));
        });
      }
      return acc;
    }, { revenue: 0, cost: 0 });

    setStats({
      revenue: totals.revenue,
      cost: totals.cost,
      profit: totals.revenue - totals.cost
    });
  }, [router]);

  if (!isAuthChecked) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button onClick={() => { localStorage.removeItem("isLoggedIn"); router.push("/login"); }} 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
          Logout
        </button>
      </header>

      {/* Financial Summary Cards - Ab sirf 3 cards hain */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-blue-600 text-white rounded-xl shadow-sm">
          <h3 className="font-bold text-sm opacity-80">Total Revenue</h3>
          <p className="text-2xl font-bold">Rs. {stats.revenue.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-red-500 text-white rounded-xl shadow-sm">
          <h3 className="font-bold text-sm opacity-80">Total Cost</h3>
          <p className="text-2xl font-bold">Rs. {stats.cost.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-green-700 text-white rounded-xl shadow-sm">
          <h3 className="font-bold text-sm opacity-80">Net Profit</h3>
          <p className="text-2xl font-bold">Rs. {stats.profit.toLocaleString()}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/" className="p-8 bg-white rounded-xl border hover:border-orange-500 shadow-sm transition text-center">
          <h2 className="text-2xl font-semibold text-orange-600">POS Screen</h2>
        </Link>
        <Link href="/admin/sales" className="p-8 bg-white rounded-xl border hover:border-blue-500 shadow-sm transition text-center">
          <h2 className="text-2xl font-semibold text-blue-600">Sales History</h2>
        </Link>
        <Link href="/admin/inventory" className="p-8 bg-white rounded-xl border hover:border-purple-500 shadow-sm transition text-center">
          <h2 className="text-2xl font-semibold text-purple-600">Inventory</h2>
        </Link>
      </div>
    </div>
  );
}