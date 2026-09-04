import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from './types';

const STORAGE_KEY = '@trollnotes_notes_v1';

export const INITIAL_NOTES: Note[] = [
  {
    id: 'ts-welcome',
    title: '🎉 Welcome to TrollNotes on iOS 15!',
    content: `You have successfully built and installed TrollNotes using TrollStore!

Key TrollStore benefits:
• Permanent install with zero 7-day revokes
• Full CoreTrust fakesigning support
• Works seamlessly on iOS 15.0 - 15.8.x
• Unrestricted JIT and custom entitlement options

Try creating a note, pinning it, or categorizing with tags!`,
    tag: 'TrollStore',
    isPinned: true,
    createdAt: Date.now() - 3600 * 1000 * 24,
    updatedAt: Date.now() - 3600 * 1000 * 2,
  },
  {
    id: 'ts-cheatsheet',
    title: '⚡ TrollStore & iOS 15 Quick Sheet',
    content: `TrollStore exploits CoreTrust (CVE-2022-26766) to permanently sign any Mach-O binary.

Useful Commands & Entitlements:
- JIT compilation enabled via com.apple.security.get-task-allow
- Rootless architecture compatibility
- IPA distribution without paid Apple Developer Account`,
    tag: 'Jailbreak',
    isPinned: true,
    createdAt: Date.now() - 3600 * 1000 * 48,
    updatedAt: Date.now() - 3600 * 1000 * 12,
  },
  {
    id: 'ideas-1',
    title: '💡 App ideas for TrollStore',
    content: `• System utility monitor
• File manager with sandbox container access
• Retro game emulator with full JIT speed
• Native package manager frontend`,
    tag: 'Ideas',
    isPinned: false,
    createdAt: Date.now() - 3600 * 1000 * 72,
    updatedAt: Date.now() - 3600 * 1000 * 24,
  },
  {
    id: 'todo-today',
    title: '📝 Today\'s Checklist',
    content: `[x] Set up Expo React Native on Linux
[x] Configure iOS 15 deployment target (15.0)
[x] Build unsigned IPA package
[ ] Install IPA via TrollStore
[ ] Enjoy permanent sideloading without revokes!`,
    tag: 'Personal',
    isPinned: false,
    createdAt: Date.now() - 3600 * 1000 * 10,
    updatedAt: Date.now() - 3600 * 1000 * 1,
  },
];

export async function getStoredNotes(): Promise<Note[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await saveStoredNotes(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_NOTES;
  } catch (error) {
    console.error('Failed to load notes from storage:', error);
    return INITIAL_NOTES;
  }
}

export async function saveStoredNotes(notes: Note[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save notes to storage:', error);
  }
}
