import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Italian Irregular Verbs',
  description: 'Practice Italian irregular verb conjugations (present tense)'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
