import type { SectionType } from './types';

export const SECTION_PALETTE: Record<
  SectionType,
  { bg: string; fg: string; border: string }
> = {
  topic:    { bg: '#E6F0FF', fg: '#1E40AF', border: '#BFD3FF' },
  question: { bg: '#F3E8FF', fg: '#6B21A8', border: '#DDC9F4' },
  exercise: { bg: '#FFEFD5', fg: '#9A3412', border: '#FAD3A2' },
  vocab:    { bg: '#DCFCE7', fg: '#166534', border: '#B6EBC9' },
  grammar:  { bg: '#FEE2E2', fg: '#991B1B', border: '#F8C5C5' },
};
