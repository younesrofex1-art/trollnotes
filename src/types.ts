export type NoteTag = 'General' | 'Personal' | 'Work' | 'Ideas' | 'TrollStore' | 'Jailbreak';

export interface Note {
  id: string;
  title: string;
  content: string;
  tag: NoteTag;
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
  color?: string;
}

export type ThemeMode = 'system' | 'light' | 'dark';

export const TAG_COLORS: Record<NoteTag, { bg: string; text: string; darkBg: string; darkText: string }> = {
  General: { bg: '#E2E8F0', text: '#334155', darkBg: '#334155', darkText: '#E2E8F0' },
  Personal: { bg: '#FEF3C7', text: '#92400E', darkBg: '#78350F', darkText: '#FDE68A' },
  Work: { bg: '#DBEAFE', text: '#1E40AF', darkBg: '#1E3A8A', darkText: '#BFDBFE' },
  Ideas: { bg: '#FCE7F3', text: '#9D174D', darkBg: '#831843', darkText: '#FBCFE8' },
  TrollStore: { bg: '#EDE9FE', text: '#5B21B6', darkBg: '#4C1D95', darkText: '#DDD6FE' },
  Jailbreak: { bg: '#DCFCE7', text: '#166534', darkBg: '#14532D', darkText: '#BBF7D0' },
};
