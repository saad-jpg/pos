"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [restaurantName, setRestaurantName] = useState(""); // Naya state
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      localStorage.setItem("isLoggedIn", "true");
      // Restaurant ka naam save karein, agar khali ho to default set karein
      localStorage.setItem("restName", restaurantName || "Subhan Fast Food");
      router.push("/admin");
    } else {
      alert("Invalid Password!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
        
        <input 
          type="text" 
          className="w-full border p-3 rounded-lg mb-4" 
          placeholder="Restaurant Name (Optional)"
          onChange={(e) => setRestaurantName(e.target.value)}
        />

        <input 
          type="password" 
          className="w-full border p-3 rounded-lg mb-4" 
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">
          Login
        </button>
      </form>
    </div>
  );
}