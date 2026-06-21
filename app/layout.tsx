import { POSProvider } from "./context/POSContext";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <POSProvider>{children}</POSProvider>
      </body>
    </html>
  );
}