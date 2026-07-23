import './globals.css';
import AuthGate from '@/components/AuthGate';

export const metadata = {
  title: 'Wedding Planner',
  description: 'End-to-end wedding planning tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
