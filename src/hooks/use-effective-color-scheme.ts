import { useColorScheme } from 'react-native';

import { useSettings } from '@/src/stores/settings';

export function useEffectiveColorScheme(): 'light' | 'dark' {
  const system = useColorScheme();
  const preference = useSettings((s) => s.theme);
  if (preference === 'system') return system === 'dark' ? 'dark' : 'light';
  return preference;
}
