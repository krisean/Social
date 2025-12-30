/**
 * Theme Context and Provider
 * Manages theme state and provides theme toggle functionality
 */

// #region agent log - ThemeProvider imports
fetch('http://127.0.0.1:7242/ingest/339ce828-5f9b-4ebe-8fc8-4666788034c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ThemeProvider.tsx:6',message:'Starting ThemeProvider import',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'theme-import-debug'})}).catch(()=>{});
// #endregion

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// #region agent log - Theme import attempt
fetch('http://127.0.0.1:7242/ingest/339ce828-5f9b-4ebe-8fc8-4666788034c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ThemeProvider.tsx:12',message:'About to import themes',data:{timestamp:Date.now()},sessionId:'debug-session',runId:'theme-import-debug'})}).catch(()=>{});
// #endregion

import { lightTheme, darkTheme } from '../theme';
import type { Theme } from '../theme';

// #region agent log - Theme import result
fetch('http://127.0.0.1:7242/ingest/339ce828-5f9b-4ebe-8fc8-4666788034c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ThemeProvider.tsx:16',message:'Theme imports completed',data:{lightTheme:!!lightTheme,darkTheme:!!darkTheme,timestamp:Date.now()},sessionId:'debug-session',runId:'theme-import-debug'})}).catch(()=>{});
// #endregion

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // #region agent log - ThemeProvider initialization
  fetch('http://127.0.0.1:7242/ingest/339ce828-5f9b-4ebe-8fc8-4666788034c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ThemeProvider.tsx:24',message:'ThemeProvider function called',data:{lightTheme:typeof lightTheme,darkTheme:typeof darkTheme,timestamp:Date.now()},sessionId:'debug-session',runId:'theme-import-debug'})}).catch(()=>{});
  // #endregion

  // Load theme from localStorage or default to light
  const [theme, setTheme] = useState<Theme>(() => {
    // #region agent log - useState initializer
    fetch('http://127.0.0.1:7242/ingest/339ce828-5f9b-4ebe-8fc8-4666788034c5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ThemeProvider.tsx:29',message:'useState initializer called',data:{stored:localStorage.getItem('app-theme'),timestamp:Date.now()},sessionId:'debug-session',runId:'theme-import-debug'})}).catch(()=>{});
    // #endregion

    const stored = localStorage.getItem('app-theme');
    return stored === 'dark' ? darkTheme : lightTheme;
  });

  const isDark = theme.name === 'dark';

  const toggleTheme = () => {
    setTheme((current) => {
      const newTheme = current.name === 'light' ? darkTheme : lightTheme;
      localStorage.setItem('app-theme', newTheme.name);
      return newTheme;
    });
  };

  // Update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-text-primary', theme.colors.text.primary);
    root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);

    // Update color-scheme for native browser elements
    root.style.colorScheme = theme.name === 'dark' ? 'dark' : 'light';

    // Set data-theme attribute for CSS selectors
    root.setAttribute('data-theme', theme.name);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

