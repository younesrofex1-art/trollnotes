import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NoteTag, TAG_COLORS } from '../types';
import { triggerHaptic } from '../utils';

interface HeaderProps {
  noteCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTag: NoteTag | 'All';
  onSelectTag: (tag: NoteTag | 'All') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenTrollInfo: () => void;
}

const TAG_LIST: (NoteTag | 'All')[] = [
  'All',
  'TrollStore',
  'Personal',
  'Work',
  'Ideas',
  'Jailbreak',
  'General',
];

export const Header: React.FC<HeaderProps> = ({
  noteCount,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  isDark,
  onToggleTheme,
  onOpenTrollInfo,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Controls Row */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.largeTitle, isDark ? styles.textDark : styles.textLight]}>
            TrollNotes
          </Text>
          <Text style={[styles.subTitle, isDark ? styles.subDark : styles.subLight]}>
            {noteCount} {noteCount === 1 ? 'note' : 'notes'} stored locally
          </Text>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('light');
              onToggleTheme();
            }}
            style={[styles.iconButton, isDark ? styles.iconBtnDark : styles.iconBtnLight]}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={isDark ? '#FBBF24' : '#6366F1'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic('light');
              onOpenTrollInfo();
            }}
            style={[styles.trollBadge, isDark ? styles.trollBadgeDark : styles.trollBadgeLight]}
          >
            <Ionicons name="shield-checkmark" size={17} color="#6366F1" />
            <Text style={styles.trollBadgeText}>iOS 15</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* iOS Search Bar */}
      <View
        style={[
          styles.searchBar,
          isDark ? styles.searchBarDark : styles.searchBarLight,
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={isDark ? '#71717A' : '#94A3B8'}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, isDark ? styles.textDark : styles.textLight]}
          placeholder="Search notes or content..."
          placeholderTextColor={isDark ? '#71717A' : '#94A3B8'}
          value={searchQuery}
          onChangeText={onSearchChange}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              onSearchChange('');
            }}
            style={styles.clearBtn}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? '#A1A1AA' : '#94A3B8'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Tags Filter Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagFilterContent}
        style={styles.tagFilterScroll}
      >
        {TAG_LIST.map((t) => {
          const isSelected = selectedTag === t;
          return (
            <TouchableOpacity
              key={t}
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('light');
                onSelectTag(t);
              }}
              style={[
                styles.filterChip,
                isSelected
                  ? styles.filterChipSelected
                  : isDark
                  ? styles.filterChipDark
                  : styles.filterChipLight,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected
                    ? styles.filterChipTextSelected
                    : isDark
                    ? styles.filterChipTextDark
                    : styles.filterChipTextLight,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  largeTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  subLight: {
    color: '#64748B',
  },
  subDark: {
    color: '#94A3B8',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnLight: {
    backgroundColor: '#EEF2FF',
  },
  iconBtnDark: {
    backgroundColor: '#27272A',
  },
  trollBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
  },
  trollBadgeLight: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  trollBadgeDark: {
    backgroundColor: '#1E1B4B',
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  trollBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366F1',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    marginBottom: 14,
  },
  searchBarLight: {
    backgroundColor: '#E2E8F0',
  },
  searchBarDark: {
    backgroundColor: '#1E1E24',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  tagFilterScroll: {
    marginBottom: 8,
  },
  tagFilterContent: {
    gap: 8,
    paddingRight: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  filterChipLight: {
    backgroundColor: '#F1F5F9',
  },
  filterChipDark: {
    backgroundColor: '#27272A',
  },
  filterChipSelected: {
    backgroundColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextLight: {
    color: '#475569',
  },
  filterChipTextDark: {
    color: '#CBD5E1',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  textLight: {
    color: '#0F172A',
  },
  textDark: {
    color: '#F8FAFC',
  },
});
