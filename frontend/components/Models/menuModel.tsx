import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import type { MenuItem } from '@/components/event/types';

type MenuModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  items: MenuItem[];
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, title = 'Menu', items }) => {
  // Group items by category, with explicit sections first
  const appetisers = (items || []).filter(i => (i.category || '').toLowerCase().includes('appet'));
  const snacks = (items || []).filter(i => (i.category || '').toLowerCase().includes('snack'));
  const others = (items || []).filter(i => !appetisers.includes(i) && !snacks.includes(i));
  const [selectedCategory, setSelectedCategory] = useState<'appetisers' | 'snacks' | null>(null);
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 16 }]} showsVerticalScrollIndicator={false}>
            {items && items.length > 0 ? (
              <>
                {/* Top category filter buttons */}
                <View style={styles.categoryFilterRow}>
                  <TouchableOpacity
                    style={[styles.categoryButton, selectedCategory === 'appetisers' && styles.categoryButtonActive]}
                    onPress={() => setSelectedCategory(prev => prev === 'appetisers' ? null : 'appetisers')}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.categoryButtonText, selectedCategory === 'appetisers' && styles.categoryButtonTextActive]}>Appetisers</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.categoryButton, selectedCategory === 'snacks' && styles.categoryButtonActive]}
                    onPress={() => setSelectedCategory(prev => prev === 'snacks' ? null : 'snacks')}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.categoryButtonText, selectedCategory === 'snacks' && styles.categoryButtonTextActive]}>Snacks</Text>
                  </TouchableOpacity>
                </View>

                {(selectedCategory === null || selectedCategory === 'appetisers') && appetisers.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeading}>Appetisers</Text>
                    {appetisers.map((item, index) => (
                      <View key={item._id || `app-${index}`} style={styles.card}>
                        {item.itemImage ? (
                          <Image source={{ uri: item.itemImage }} style={styles.image} />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Image 
                              source={{ uri: 'https://img.icons8.com/ios/50/CCCCCC/cutlery.png' }}
                              style={styles.placeholderIcon}
                            />
                          </View>
                        )}
                        <View style={styles.info}>
                          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                          {item.description ? (
                            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                          ) : null}
                          <View style={styles.metaRow}>
                            {item.category ? (
                              <Text style={styles.category}>{item.category}</Text>
                            ) : <View />}
                            <Text style={styles.price}>AED {item.price}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                {(selectedCategory === null || selectedCategory === 'snacks') && snacks.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeading}>Snacks</Text>
                    {snacks.map((item, index) => (
                      <View key={item._id || `sn-${index}`} style={styles.card}>
                        {item.itemImage ? (
                          <Image source={{ uri: item.itemImage }} style={styles.image} />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Image 
                              source={{ uri: 'https://img.icons8.com/ios/50/CCCCCC/cutlery.png' }}
                              style={styles.placeholderIcon}
                            />
                          </View>
                        )}
                        <View style={styles.info}>
                          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                          {item.description ? (
                            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                          ) : null}
                          <View style={styles.metaRow}>
                            {item.category ? (
                              <Text style={styles.category}>{item.category}</Text>
                            ) : <View />}
                            <Text style={styles.price}>AED {item.price}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                {selectedCategory === null && others.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeading}>Others</Text>
                    {others.map((item, index) => (
                      <View key={item._id || `ot-${index}`} style={styles.card}>
                        {item.itemImage ? (
                          <Image source={{ uri: item.itemImage }} style={styles.image} />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Image 
                              source={{ uri: 'https://img.icons8.com/ios/50/CCCCCC/cutlery.png' }}
                              style={styles.placeholderIcon}
                            />
                          </View>
                        )}
                        <View style={styles.info}>
                          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                          {item.description ? (
                            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                          ) : null}
                          <View style={styles.metaRow}>
                            {item.category ? (
                              <Text style={styles.category}>{item.category}</Text>
                            ) : <View />}
                            <Text style={styles.price}>AED {item.price}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No menu available</Text>
              </View>
            )}
          </ScrollView>
          {/* Bottom spacer to avoid nav bar gap */}
          <View style={{ height: insets.bottom, backgroundColor: Colors.background }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.button?.background || Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeText: {
    color: Colors.button?.text || Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  categoryFilterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  categoryButtonTextActive: {
    color: Colors.button?.text || Colors.textPrimary,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionHeading: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.withOpacity.black30,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  placeholderIcon: {
    width: 28,
    height: 28,
    tintColor: Colors.textMuted,
  },
  info: {
    flex: 1,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  price: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: Colors.textMuted,
  },
});

export default MenuModal;

 