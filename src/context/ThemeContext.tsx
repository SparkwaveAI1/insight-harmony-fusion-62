import React, { createContext, useContext } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

interface ThemeContextType {
  // Add theme-related context properties if needed
}

const ThemeContext = createContext<ThemeContextType>({});

export const useTheme = () => {
  return useContext(ThemeContext);
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeContext.Provider value={{}}>
        {children}
      </ThemeContext.Provider>
    </NextThemeProvider>
  );
};