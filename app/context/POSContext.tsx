"use client";
import { createContext, useState, useEffect } from "react";

export const POSContext = createContext<any>(null);

export const POSProvider = ({ children }: { children: React.ReactNode }) => {
  const [menu, setMenu] = useState([{ id: 1, name: "Biryani", price: 350 }]);
  const [cart, setCart] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    const savedSales = localStorage.getItem("mySales");
    if (savedSales) setSales(JSON.parse(savedSales));
  }, []);

  return (
    <POSContext.Provider value={{ menu, setMenu, cart, setCart, sales, setSales }}>
      {children}
    </POSContext.Provider>
  );
};