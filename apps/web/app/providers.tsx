'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type Ctx = { largeText: boolean; toggle: () => void };
const LargeTextContext = createContext<Ctx>({ largeText: false, toggle: () => {} });

export function LargeTextProvider({ children }: { children: React.ReactNode }) {
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText);
  }, [largeText]);

  return (
    <LargeTextContext.Provider value={{ largeText, toggle: () => setLargeText((v) => !v) }}>
      {children}
    </LargeTextContext.Provider>
  );
}

export const useLargeText = () => useContext(LargeTextContext);
