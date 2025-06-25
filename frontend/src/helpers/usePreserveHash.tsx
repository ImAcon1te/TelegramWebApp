import { useEffect } from 'react';

export const usePreserveHash = () => {
  useEffect(() => {
    const currentHash = window.location.hash;

    if (currentHash && currentHash.includes('tgWebAppData')) {
      sessionStorage.setItem('initialHash', currentHash);
    } else {
      const savedHash = sessionStorage.getItem('initialHash');
      if (savedHash) {
        window.location.hash = savedHash;
      }
    }
  }, []);
};