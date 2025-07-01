'use client';

import React from 'react';
import { IconButton } from '@primer/react';
import { SunIcon, MoonIcon } from '@primer/octicons-react';
import { useTheme } from './ThemeContext';

export const ThemeSwitcher: React.FC = () => {
  const { colorMode, toggleColorMode } = useTheme();

  return (
    <IconButton
      aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
      icon={colorMode === 'light' ? MoonIcon : SunIcon}
      variant="invisible"
      onClick={toggleColorMode}
    />
  );
};