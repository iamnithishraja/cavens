import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';

type Club = {
  _id: string;
  name: string;
  typeOfVenue?: string;
  address?: string;
  city?: string;
  logoUrl?: string;
  coverBannerUrl?: string;
  photos?: string[];
  clubImages?: string[];
  rating?: number;
  operatingDays?: string[];
  phone?: string;
  email?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  club?: Club | null;
  onView?: (club: Club) => void;
  inline?: boolean; // when true, render as inline sheet and allow map touches outside
};

const ClubQuickViewModal: React.FC<Props> = ({ visible, onClose, club, onView, inline = false }) => {
  if (!club) return null;
  const image = club.coverBannerUrl || club.clubImages?.[0] || club.photos?.[0] || club.logoUrl || undefined;

  if (inline) {
    if (!visible) return null;
    return (
      <View style={styles.inlineContainer} pointerEvents="box-none">
        <ScrollView 
          style={styles.inlineSheet} 
          contentContainerStyle={styles.inlineScrollContent}
          pointerEvents="auto"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grabber} />
          
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.thumbWrap}>
              {image ? (
                <Image source={{ uri: image }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbPlaceholder} />
              )}
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.title} numberOfLines={1}>{club.name}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {club.typeOfVenue || ''}{club.city ? ` • ${club.city}` : ''}
              </Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.viewBtn} onPress={() => onView && onView(club)} activeOpacity={0.9}>
                <Text style={styles.viewBtnText}>VIEW EVENTS</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeIconBtnInline} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Body */}
          {/* Address */}
          {club.address ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address</Text>
              <Text style={styles.address}>{club.address}</Text>
            </View>
          ) : null}

          {/* Rating and Operating Days */}
          <View style={styles.badgeRow}>
            {typeof club.rating === 'number' ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>★ {club.rating.toFixed(1)}</Text>
              </View>
            ) : null}
            {Array.isArray(club.operatingDays) && club.operatingDays.length > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {club.operatingDays.slice(0,3).join(', ')}{club.operatingDays.length > 3 ? '…' : ''}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Contact Information */}
          {(club.phone || club.email) ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <View style={styles.contactBox}>
                {club.phone ? (
                  <Text style={styles.contactText}>📞 {club.phone}</Text>
                ) : null}
                {club.email ? (
                  <Text style={styles.contactText}>✉️ {club.email}</Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ScrollView 
          style={styles.sheet} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grabber} />
          
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.thumbWrap}>
              {image ? (
                <Image source={{ uri: image }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbPlaceholder} />
              )}
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.title} numberOfLines={1}>{club.name}</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {club.typeOfVenue || ''}{club.city ? ` • ${club.city}` : ''}
              </Text>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.viewBtn} onPress={() => onView && onView(club)} activeOpacity={0.9}>
                <Text style={styles.viewBtnText}>VIEW EVENTS</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeIconBtnInline} hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}>
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Body */}
          {/* Address */}
          {club.address ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address</Text>
              <Text style={styles.address}>{club.address}</Text>
            </View>
          ) : null}

          {/* Rating and Operating Days */}
          <View style={styles.badgeRow}>
            {typeof club.rating === 'number' ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>★ {club.rating.toFixed(1)}</Text>
              </View>
            ) : null}
            {Array.isArray(club.operatingDays) && club.operatingDays.length > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {club.operatingDays.slice(0,3).join(', ')}{club.operatingDays.length > 3 ? '…' : ''}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Contact Information */}
          {(club.phone || club.email) ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <View style={styles.contactBox}>
                {club.phone ? (
                  <Text style={styles.contactText}>📞 {club.phone}</Text>
                ) : null}
                {club.email ? (
                  <Text style={styles.contactText}>✉️ {club.email}</Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '80%', // Changed from height to maxHeight and increased to 50%
    backgroundColor: Colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  inlineSheet: {
    maxHeight: 280, // Changed from height to maxHeight for inline version
    backgroundColor: Colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 20, // Add bottom padding for scroll
  },
  inlineScrollContent: {
    paddingBottom: 20, // Add bottom padding for inline scroll
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.withOpacity.white10,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Add margin to separate from content
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerContent: {
    flex: 1,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  thumb: { 
    width: '100%', 
    height: '100%',
    resizeMode: 'cover',
  },
  thumbPlaceholder: { 
    flex: 1,
    backgroundColor: Colors.withOpacity.white10,
  },
  title: { 
    color: Colors.textPrimary, 
    fontSize: 18, 
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: { 
    color: Colors.textSecondary, 
    fontSize: 12, 
    fontWeight: '700',
  },
  viewBtn: {
    marginLeft: 8,
    backgroundColor: Colors.button.background,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  viewBtnText: { 
    color: Colors.button.text, 
    fontWeight: '800', 
    fontSize: 12 
  },
  scrollBody: {
    flex: 1, // Take remaining space
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  address: { 
    color: Colors.textSecondary, 
    fontSize: 13, 
    lineHeight: 18,
  },
  badgeRow: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  badge: { 
    backgroundColor: Colors.background, 
    borderWidth: 1, 
    borderColor: Colors.withOpacity.white10, 
    borderRadius: 999, 
    paddingHorizontal: 10, 
    paddingVertical: 6,
  },
  badgeText: { 
    color: Colors.textPrimary, 
    fontSize: 12, 
    fontWeight: '700',
  },
  contactBox: { 
    gap: 6,
  },
  contactText: { 
    color: Colors.textSecondary, 
    fontSize: 13,
    lineHeight: 18,
  },
  closeIconBtn: { position: 'absolute', right: 10, top: 10, backgroundColor: Colors.background, borderRadius: 14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.withOpacity.white10, zIndex: 10 },
  closeIconBtnInline: { backgroundColor: Colors.background, borderRadius: 10, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.withOpacity.white10 },
  closeIconText: { 
    color: Colors.textPrimary, 
    fontSize: 14, 
    fontWeight: '800',
  },
  inlineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ClubQuickViewModal;