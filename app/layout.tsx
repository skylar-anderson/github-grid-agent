import type { Metadata } from 'next';
import { ThemeProvider } from './utils/theme-context';
import { BaseStyles } from '@primer/react';

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
      <body>
        <ThemeProvider>
          <BaseStyles>
            {children}
          </BaseStyles>
        </ThemeProvider>
      </body>
    </html>
  );
}
