import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note, NoteTag, TAG_COLORS } from '../types';
import { triggerHaptic } from '../utils';

interface NoteEditorModalProps {
  visible: boolean;
  note: Note | null;
  isDark: boolean;
  onClose: () => void;
  onSave: (noteData: { title: string; content: string; tag: NoteTag; isPinned: boolean }) => void;
}

const ALL_TAGS: NoteTag[] = ['General', 'Personal', 'Work', 'Ideas', 'TrollStore', 'Jailbreak'];

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  visible,
  note,
  isDark,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState<NoteTag>('General');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTag(note.tag);
      setIsPinned(note.isPinned);
    } else {
      setTitle('');
      setContent('');
      setTag('General');
      setIsPinned(false);
    }
  }, [note, visible]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }
    triggerHaptic('success');
    onSave({
      title: title.trim() || 'Untitled Note',
      content: content.trim(),
      tag,
      isPinned,
    });
    onClose();
  };

  const insertSnippet = (snippet: string) => {
    triggerHaptic('light');
    setContent((prev) => (prev ? `${prev}\n${snippet}` : snippet));
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* iOS Top Nav Bar */}
          <View style={[styles.navbar, isDark ? styles.borderDark : styles.borderLight]}>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                onClose();
              }}
              style={styles.navButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                triggerHaptic('light');
                setIsPinned(!isPinned);
              }}
              style={styles.pinButton}
            >
              <Ionicons
                name={isPinned ? 'pin' : 'pin-outline'}
                size={22}
                color={isPinned ? '#EAB308' : isDark ? '#A1A1AA' : '#71717A'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.navButton, styles.saveButton]}
            >
              <Text style={styles.saveText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Tags Selector */}
          <View style={styles.tagsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagScrollContent}
            >
              {ALL_TAGS.map((t) => {
                const isSelected = t === tag;
                const colors = TAG_COLORS[t];
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => {
                      triggerHaptic('light');
                      setTag(t);
                    }}
                    style={[
                      styles.tagChip,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? colors.darkBg
                            : colors.bg
                          : isDark
                          ? '#27272A'
                          : '#F1F5F9',
                        borderColor: isSelected
                          ? isDark
                            ? colors.darkText
                            : colors.text
                          : 'transparent',
                        borderWidth: isSelected ? 1.5 : 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagChipText,
                        {
                          color: isSelected
                            ? isDark
                              ? colors.darkText
                              : colors.text
                            : isDark
                            ? '#A1A1AA'
                            : '#64748B',
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {t}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Editor Body */}
          <ScrollView style={styles.editorArea} keyboardShouldPersistTaps="handled">
            <TextInput
              style={[styles.titleInput, isDark ? styles.textDark : styles.textLight]}
              placeholder="Note Title"
              placeholderTextColor={isDark ? '#52525B' : '#94A3B8'}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            <TextInput
              style={[styles.contentInput, isDark ? styles.textDark : styles.textLight]}
              placeholder="Start typing your note here..."
              placeholderTextColor={isDark ? '#52525B' : '#94A3B8'}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>

          {/* Quick Toolbar */}
          <View style={[styles.toolbar, isDark ? styles.toolbarDark : styles.toolbarLight]}>
            <View style={styles.snippetGroup}>
              <TouchableOpacity
                onPress={() => insertSnippet('• ')}
                style={styles.toolBtn}
              >
                <Ionicons name="list" size={19} color={isDark ? '#E2E8F0' : '#334155'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => insertSnippet('[ ] ')}
                style={styles.toolBtn}
              >
                <Ionicons
                  name="checkbox-outline"
                  size={19}
                  color={isDark ? '#E2E8F0' : '#334155'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => insertSnippet(`📅 ${new Date().toLocaleDateString()}`)}
                style={styles.toolBtn}
              >
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={isDark ? '#E2E8F0' : '#334155'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => insertSnippet('```\n// Code snippet\n```')}
                style={styles.toolBtn}
              >
                <Ionicons name="code-slash" size={19} color={isDark ? '#E2E8F0' : '#334155'} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.counterText, isDark ? styles.counterDark : styles.counterLight]}>
              {wordCount} words · {charCount} chars
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#121214',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  borderLight: {
    borderBottomColor: '#E2E8F0',
  },
  borderDark: {
    borderBottomColor: '#27272A',
  },
  navButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#EF4444',
  },
  pinButton: {
    padding: 6,
  },
  saveButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tagsContainer: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
  },
  tagScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagChipText: {
    fontSize: 13,
  },
  editorArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 250,
  },
  textLight: {
    color: '#0F172A',
  },
  textDark: {
    color: '#F8FAFC',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolbarLight: {
    backgroundColor: '#F8FAFC',
    borderTopColor: '#E2E8F0',
  },
  toolbarDark: {
    backgroundColor: '#1E1E24',
    borderTopColor: '#27272A',
  },
  snippetGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  toolBtn: {
    padding: 6,
    borderRadius: 8,
  },
  counterText: {
    fontSize: 12,
  },
  counterLight: {
    color: '#94A3B8',
  },
  counterDark: {
    color: '#71717A',
  },
});
