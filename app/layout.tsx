import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '🕵🏻‍♂️ Grid Agent',
  description: 'Build a grid.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
