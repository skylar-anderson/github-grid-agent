'use client';

import { IconButton } from '@primer/react';
import { SunIcon, MoonIcon } from '@primer/octicons-react';
import { useTheme } from '../utils/theme-context';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <IconButton
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      icon={theme === 'light' ? MoonIcon : SunIcon}
      onClick={toggleTheme}
      variant="invisible"
    />
  );
};