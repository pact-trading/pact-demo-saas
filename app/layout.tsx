import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Draftboard', description: 'A demo SaaS that bills subscriptions in USDT on Whitechain through Pact.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="top">
          <div className="wrap">
            <a className="brand" href="/">Draftboard</a>
            <nav className="nav">
              <a href="/">Pricing</a>
              <a href="/account">My account</a>
              <a href="/admin">Subscribers (admin)</a>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="wrap">Testnet demo. Subscriptions renew in USDT on Whitechain Sepolia through Pact.</footer>
      </body>
    </html>
  );
}
