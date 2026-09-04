import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note, TAG_COLORS } from '../types';
import { formatDate, triggerHaptic } from '../utils';

interface NoteCardProps {
  note: Note;
  isDark: boolean;
  onPress: (note: Note) => void;
  onTogglePin: (noteId: string) => void;
  onDelete: (noteId: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isDark,
  onPress,
  onTogglePin,
  onDelete,
}) => {
  const tagColor = TAG_COLORS[note.tag] || TAG_COLORS.General;

  const handleDelete = () => {
    triggerHaptic('warning');
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title || 'Untitled'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            triggerHaptic('medium');
            onDelete(note.id);
          },
        },
      ]
    );
  };

  const handlePin = () => {
    triggerHaptic('light');
    onTogglePin(note.id);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        triggerHaptic('light');
        onPress(note);
      }}
      style={[
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        note.isPinned && (isDark ? styles.pinnedBorderDark : styles.pinnedBorderLight),
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          {note.isPinned && (
            <Ionicons
              name="pin"
              size={15}
              color="#EAB308"
              style={styles.pinIcon}
            />
          )}
          <Text
            numberOfLines={1}
            style={[styles.title, isDark ? styles.textDark : styles.textLight]}
          >
            {note.title || 'Untitled Note'}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={handlePin}
            style={styles.actionBtn}
          >
            <Ionicons
              name={note.isPinned ? 'pin' : 'pin-outline'}
              size={18}
              color={note.isPinned ? '#EAB308' : isDark ? '#71717A' : '#A1A1AA'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={handleDelete}
            style={styles.actionBtn}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={isDark ? '#71717A' : '#A1A1AA'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text
        numberOfLines={3}
        style={[styles.contentPreview, isDark ? styles.contentDark : styles.contentLight]}
      >
        {note.content || 'No content...'}
      </Text>

      <View style={styles.footerRow}>
        <View
          style={[
            styles.tagBadge,
            { backgroundColor: isDark ? tagColor.darkBg : tagColor.bg },
          ]}
        >
          <Text
            style={[
              styles.tagText,
              { color: isDark ? tagColor.darkText : tagColor.text },
            ]}
          >
            {note.tag}
          </Text>
        </View>

        <Text style={[styles.timestamp, isDark ? styles.timeDark : styles.timeLight]}>
          {formatDate(note.updatedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardDark: {
    backgroundColor: '#1E1E24',
    borderColor: '#2A2A32',
  },
  pinnedBorderLight: {
    borderColor: '#FDE047',
    borderWidth: 1.5,
  },
  pinnedBorderDark: {
    borderColor: '#854D0E',
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  pinIcon: {
    marginRight: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
    flex: 1,
  },
  textLight: {
    color: '#0F172A',
  },
  textDark: {
    color: '#F8FAFC',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 2,
  },
  contentPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  contentLight: {
    color: '#64748B',
  },
  contentDark: {
    color: '#94A3B8',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  timeLight: {
    color: '#94A3B8',
  },
  timeDark: {
    color: '#64748B',
  },
});
