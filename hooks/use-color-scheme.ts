import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * React Native can report 'unspecified' (or null), so normalize to 'light' | 'dark'.
 */
export function useColorScheme(): 'light' | 'dark' {
  return useRNColorScheme() === 'dark' ? 'dark' : 'light';
}
