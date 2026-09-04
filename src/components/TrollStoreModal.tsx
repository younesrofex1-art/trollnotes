import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../types';
import { triggerHaptic } from '../utils';

interface TrollStoreModalProps {
  visible: boolean;
  notes: Note[];
  isDark: boolean;
  onClose: () => void;
  onResetDefaults: () => void;
}

export const TrollStoreModal: React.FC<TrollStoreModalProps> = ({
  visible,
  notes,
  isDark,
  onClose,
  onResetDefaults,
}) => {
  const handleExport = () => {
    triggerHaptic('success');
    const jsonStr = JSON.stringify(notes, null, 2);
    Alert.alert(
      'Notes Export',
      `Exported ${notes.length} notes (${jsonStr.length} bytes).\n\nIn TrollStore, apps have direct access to their container sandbox and persistence.`,
      [{ text: 'OK' }]
    );
  };

  const handleReset = () => {
    triggerHaptic('warning');
    Alert.alert(
      'Reset Sample Notes',
      'This will reset notes to the initial TrollStore & iOS 15 sample notes. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            triggerHaptic('medium');
            onResetDefaults();
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}
      >
        {/* Header */}
        <View style={[styles.navBar, isDark ? styles.borderDark : styles.borderLight]}>
          <Text style={[styles.navTitle, isDark ? styles.textDark : styles.textLight]}>
            TrollStore & iOS 15 Info
          </Text>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light');
              onClose();
            }}
            style={styles.closeBtn}
          >
            <Ionicons
              name="close-circle"
              size={26}
              color={isDark ? '#94A3B8' : '#64748B'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Badge Banner */}
          <View style={[styles.bannerCard, isDark ? styles.bannerDark : styles.bannerLight]}>
            <View style={styles.bannerIconWrapper}>
              <Ionicons name="shield-checkmark" size={32} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>TrollStore Compatible</Text>
              <Text style={styles.bannerSubtitle}>
                Targeted for iOS 15.0 - 15.8.x with CoreTrust fakesigning support.
              </Text>
            </View>
          </View>

          {/* Diagnostics Section */}
          <Text style={[styles.sectionTitle, isDark ? styles.sectionDark : styles.sectionLight]}>
            ENVIRONMENT DETAILS
          </Text>
          <View style={[styles.infoGroup, isDark ? styles.groupDark : styles.groupLight]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDark ? styles.labelDark : styles.labelLight]}>
                Bundle Identifier
              </Text>
              <Text style={[styles.infoValue, isDark ? styles.valueDark : styles.valueLight]}>
                com.trollstore.trollnotes
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDark ? styles.labelDark : styles.labelLight]}>
                Target Deployment
              </Text>
              <Text style={[styles.infoValue, isDark ? styles.valueDark : styles.valueLight]}>
                iOS 15.0+
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDark ? styles.labelDark : styles.labelLight]}>
                Platform OS
              </Text>
              <Text style={[styles.infoValue, isDark ? styles.valueDark : styles.valueLight]}>
                {Platform.OS.toUpperCase()} {Platform.Version}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDark ? styles.labelDark : styles.labelLight]}>
                Signing Method
              </Text>
              <Text style={[styles.infoValue, { color: '#10B981', fontWeight: '700' }]}>
                TrollStore (Permanent)
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDark ? styles.labelDark : styles.labelLight]}>
                Notes Stored
              </Text>
              <Text style={[styles.infoValue, isDark ? styles.valueDark : styles.valueLight]}>
                {notes.length} notes
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, isDark ? styles.sectionDark : styles.sectionLight]}>
            UTILITIES & ACTIONS
          </Text>
          <View style={[styles.infoGroup, isDark ? styles.groupDark : styles.groupLight]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleExport}
              style={styles.actionRow}
            >
              <Ionicons name="download-outline" size={20} color="#6366F1" style={{ marginRight: 12 }} />
              <Text style={[styles.actionRowText, isDark ? styles.textDark : styles.textLight]}>
                Export Notes Data (JSON)
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleReset}
              style={styles.actionRow}
            >
              <Ionicons name="refresh-outline" size={20} color="#EF4444" style={{ marginRight: 12 }} />
              <Text style={[styles.actionRowText, { color: '#EF4444' }]}>
                Reset Sample Notes
              </Text>
            </TouchableOpacity>
          </View>

          {/* TrollStore Info Box */}
          <View style={styles.tipBox}>
            <Text style={styles.tipHeading}>Why TrollStore?</Text>
            <Text style={styles.tipText}>
              Apps installed via TrollStore behave like system-level applications. They don't expire after 7 days, don't require an Apple ID, and have access to JIT and private entitlements without a jailbreak.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#0F0F12',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  borderLight: {
    borderBottomColor: '#E2E8F0',
  },
  borderDark: {
    borderBottomColor: '#27272A',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 2,
  },
  content: {
    padding: 16,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 14,
  },
  bannerLight: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  bannerDark: {
    backgroundColor: '#1E1B4B',
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  bannerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionLight: {
    color: '#64748B',
  },
  sectionDark: {
    color: '#94A3B8',
  },
  infoGroup: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
  },
  groupLight: {
    backgroundColor: '#FFFFFF',
  },
  groupDark: {
    backgroundColor: '#1C1C1E',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 15,
  },
  labelLight: {
    color: '#334155',
  },
  labelDark: {
    color: '#CBD5E1',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  valueLight: {
    color: '#0F172A',
  },
  valueDark: {
    color: '#F8FAFC',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  actionRowText: {
    fontSize: 15,
    fontWeight: '600',
  },
  textLight: {
    color: '#0F172A',
  },
  textDark: {
    color: '#F8FAFC',
  },
  tipBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  tipHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
