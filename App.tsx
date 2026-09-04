import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note, NoteTag } from './src/types';
import { getStoredNotes, saveStoredNotes, INITIAL_NOTES } from './src/storage';
import { triggerHaptic } from './src/utils';
import { Header } from './src/components/Header';
import { NoteCard } from './src/components/NoteCard';
import { NoteEditorModal } from './src/components/NoteEditorModal';
import { TrollStoreModal } from './src/components/TrollStoreModal';

export default function App() {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<'system' | 'light' | 'dark'>('system');
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<NoteTag | 'All'>('All');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isTrollInfoOpen, setIsTrollInfoOpen] = useState(false);

  const isDark =
    themePreference === 'system'
      ? systemColorScheme === 'dark'
      : themePreference === 'dark';

  // Load initial notes from storage
  useEffect(() => {
    (async () => {
      const stored = await getStoredNotes();
      setNotes(stored);
    })();
  }, []);

  const updateAndPersistNotes = (updated: Note[]) => {
    setNotes(updated);
    saveStoredNotes(updated);
  };

  const handleToggleTheme = () => {
    setThemePreference((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleCreateNote = () => {
    triggerHaptic('medium');
    setEditingNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleSaveNote = (data: {
    title: string;
    content: string;
    tag: NoteTag;
    isPinned: boolean;
  }) => {
    if (editingNote) {
      // Update existing
      const updated = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: data.title,
              content: data.content,
              tag: data.tag,
              isPinned: data.isPinned,
              updatedAt: Date.now(),
            }
          : n
      );
      updateAndPersistNotes(updated);
    } else {
      // Create new
      const newNote: Note = {
        id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: data.title,
        content: data.content,
        tag: data.tag,
        isPinned: data.isPinned,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      updateAndPersistNotes([newNote, ...notes]);
    }
  };

  const handleTogglePin = (noteId: string) => {
    const updated = notes.map((n) =>
      n.id === noteId ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n
    );
    updateAndPersistNotes(updated);
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    updateAndPersistNotes(updated);
  };

  const handleResetDefaults = () => {
    updateAndPersistNotes(INITIAL_NOTES);
  };

  // Filter and search notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === 'All' || note.tag === selectedTag;
      return matchesSearch && matchesTag;
    });
  }, [notes, searchQuery, selectedTag]);

  const { pinnedNotes, regularNotes } = useMemo(() => {
    const pinned: Note[] = [];
    const regular: Note[] = [];
    for (const note of filteredNotes) {
      if (note.isPinned) {
        pinned.push(note);
      } else {
        regular.push(note);
      }
    }
    return { pinnedNotes: pinned, regularNotes: regular };
  }, [filteredNotes]);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        isDark ? styles.backgroundDark : styles.backgroundLight,
      ]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header with Search and Tags */}
      <Header
        noteCount={notes.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenTrollInfo={() => setIsTrollInfoOpen(true)}
      />

      {/* Main List */}
      <FlatList
        data={[...pinnedNotes, ...regularNotes]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          pinnedNotes.length > 0 ? (
            <View style={styles.sectionHeaderContainer}>
              <Text
                style={[
                  styles.sectionHeaderText,
                  isDark ? styles.sectionTextDark : styles.sectionTextLight,
                ]}
              >
                PINNED NOTES
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          const showOtherHeader =
            pinnedNotes.length > 0 &&
            index === pinnedNotes.length &&
            regularNotes.length > 0;

          return (
            <View>
              {showOtherHeader && (
                <View style={styles.sectionHeaderContainer}>
                  <Text
                    style={[
                      styles.sectionHeaderText,
                      isDark ? styles.sectionTextDark : styles.sectionTextLight,
                    ]}
                  >
                    ALL NOTES
                  </Text>
                </View>
              )}
              <NoteCard
                note={item}
                isDark={isDark}
                onPress={handleEditNote}
                onTogglePin={handleTogglePin}
                onDelete={handleDeleteNote}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={56}
              color={isDark ? '#3F3F46' : '#CBD5E1'}
            />
            <Text
              style={[styles.emptyTitle, isDark ? styles.textDark : styles.textLight]}
            >
              {searchQuery ? 'No Matching Notes' : 'No Notes Yet'}
            </Text>
            <Text
              style={[
                styles.emptySubtitle,
                isDark ? styles.subDark : styles.subLight,
              ]}
            >
              {searchQuery
                ? `Couldn't find any notes matching "${searchQuery}".`
                : 'Tap the button below to compose your first note!'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button for New Note */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleCreateNote}
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Note Editor Modal */}
      <NoteEditorModal
        visible={isEditorOpen}
        note={editingNote}
        isDark={isDark}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveNote}
      />

      {/* TrollStore Info / Diagnostics Modal */}
      <TrollStoreModal
        visible={isTrollInfoOpen}
        notes={notes}
        isDark={isDark}
        onClose={() => setIsTrollInfoOpen(false)}
        onResetDefaults={handleResetDefaults}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backgroundLight: {
    backgroundColor: '#F8FAFC',
  },
  backgroundDark: {
    backgroundColor: '#0F0F12',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  sectionHeaderContainer: {
    paddingTop: 10,
    paddingBottom: 6,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  sectionTextLight: {
    color: '#64748B',
  },
  sectionTextDark: {
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  textLight: {
    color: '#0F172A',
  },
  textDark: {
    color: '#F8FAFC',
  },
  subLight: {
    color: '#64748B',
  },
  subDark: {
    color: '#94A3B8',
  },
});
