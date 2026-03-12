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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;600;700&family=Chivo:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
