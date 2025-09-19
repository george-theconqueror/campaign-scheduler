'use client';

import { createContext, useState, ReactNode } from 'react';

interface ExcludedSegmentsContextType {
  excludedSegments: string[];
  setExcludedSegments: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ExcludedSegmentsContext = createContext<ExcludedSegmentsContextType | undefined>(undefined);

interface ExcludedSegmentsProviderProps {
  children: ReactNode;
}

export function ExcludedSegmentsProvider({ children }: ExcludedSegmentsProviderProps) {
  const [excludedSegments, setExcludedSegments] = useState<string[]>([]);

  return (
    <ExcludedSegmentsContext.Provider value={{ excludedSegments, setExcludedSegments }}>
      {children}
    </ExcludedSegmentsContext.Provider>
  );
}

