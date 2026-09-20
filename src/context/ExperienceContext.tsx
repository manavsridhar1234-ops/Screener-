import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ExperienceLevel } from '../types';

interface ExperienceContextType {
  experienceLevel: ExperienceLevel;
  setExperienceLevel: (level: ExperienceLevel) => void;
  toggleExperienceLevel: () => void;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [experienceLevel, setExperienceLevelState] = useState<ExperienceLevel>(() => {
    try {
      const saved = localStorage.getItem('equitylens_experience_level');
      if (saved === 'beginner' || saved === 'pro') return saved;
    } catch {}
    return 'beginner';
  });

  const setExperienceLevel = (level: ExperienceLevel) => {
    setExperienceLevelState(level);
    try {
      localStorage.setItem('equitylens_experience_level', level);
    } catch {}
  };

  const toggleExperienceLevel = () => {
    setExperienceLevel(experienceLevel === 'beginner' ? 'pro' : 'beginner');
  };

  return (
    <ExperienceContext.Provider value={{ experienceLevel, setExperienceLevel, toggleExperienceLevel }}>
      {children}
    </ExperienceContext.Provider>
  );
};

export function useExperience() {
  const context = useContext(ExperienceContext);
  if (!context) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
}
