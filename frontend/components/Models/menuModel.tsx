import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, TextInput, FlatList } from 'react-native';
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

type LocalMenuItem = MenuItem & { nameLower?: string; descriptionLower?: string; categoryLower?: string };

const MenuModal: React.FC<MenuModalProps> = ({ visible, onClose, title = 'Menu', items }) => {
  const insets = useSafeAreaInsets();

  const allItems = useMemo<LocalMenuItem[]>(() => {
    const provided = items || [];
    // Map incoming categories: merge Appetisers + Snacks under a combined display category as needed
    return provided.map(i => {
      const lower = (i.category || '').toLowerCase();
      const merged = lower.includes('appet') || lower.includes('snack') ? 'Appetisers & Snacks' : (i.category || i.customCategory || 'Others');
      const nameLower = (i.name || '').toLowerCase();
      const descriptionLower = (i.description || '').toLowerCase();
      const categoryLower = (merged || '').toLowerCase();
      return { ...i, category: merged, nameLower, descriptionLower, categoryLower };
    });
  }, [items]);

  // Build categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    let hasAppetisersSnacks = false;
    for (const i of allItems) {
      const lower = (i.category || '').toLowerCase();
      if (lower.includes('appet') || lower.includes('snack')) hasAppetisersSnacks = true;
      if (i.category) set.add(i.category);
      if (i.customCategory) set.add(i.customCategory);
    }
    const arr = Array.from(set);
    // Ensure merged category appears once and in front
    const mergedTitle = 'Appetisers & Snacks';
    const withoutMerged = arr.filter(c => (c || '').toLowerCase() !== 'appetisers' && (c || '').toLowerCase() !== 'snacks' && c !== mergedTitle);
    const ordered = hasAppetisersSnacks ? [mergedTitle, ...withoutMerged] : withoutMerged;
    return ['All', ...ordered];
  }, [allItems]);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const buildRegex = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.length === 0) return null;
    const escaped = trimmed
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, ".*?");
    return new RegExp(escaped, 'i');
  };

  const visibleItems = useMemo(() => {
    const pattern = buildRegex(searchQuery);
    const selectedLower = selectedCategory.toLowerCase();
    return allItems.filter(i => {
      const inCategory = selectedCategory === 'All' ? true : (i.categoryLower === selectedLower ||
        (selectedLower === 'appetisers & snacks' && ((i.categoryLower || '').includes('appet') || (i.categoryLower || '').includes('snack'))));
      if (!pattern) return inCategory;
      return inCategory && ([
        i.name,
        i.description,
        i.category,
        i.customCategory,
      ].some((f) => pattern.test(f || '')));
    });
  }, [allItems, selectedCategory, searchQuery]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity style={styles.nextButton} onPress={onClose} activeOpacity={0.9}>
              <Text style={styles.nextText}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={visibleItems}
            keyExtractor={(item, index) => item._id || `${index}-${item.name}`}
            renderItem={({ item }) => (
              <View style={styles.card}>
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
                  {(item.category || item.customCategory) ? (
                    <Text style={styles.category}>{item.category || item.customCategory}</Text>
                  ) : null}
                </View>
                <View style={styles.actions}>
                  <Text style={styles.price}>AED {item.price}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={(
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No items found</Text>
              </View>
            )}
            ListHeaderComponent={(
              <View>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                  <TextInput
                    placeholder="Search items"
                    placeholderTextColor={Colors.textMuted}
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                    autoCapitalize="none"
                    selectionColor={Colors.primary}
                  />
                </View>
                {/* Category Pills */}
                {categories.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryPillsRow}
                  >
                    {categories.map(c => {
                      const isActive = selectedCategory === c;
                      return (
                        <TouchableOpacity
                          key={c}
                          onPress={() => setSelectedCategory(c)}
                          activeOpacity={0.9}
                          style={[styles.pillButton, isActive && styles.pillButtonActive]}
                        >
                          <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{c}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}
              </View>
            )}
            ListFooterComponent={(
              <View style={styles.footerContainer}>
                <Text style={styles.footerNote}>Prices inclusive of taxes. Images are for illustration only.</Text>
              </View>
            )}
            contentContainerStyle={styles.content}
            style={styles.flatList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            initialNumToRender={10}
            maxToRenderPerBatch={15}
            windowSize={10}
            updateCellsBatchingPeriod={16}
          />
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
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.2,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  nextButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  nextText: {
    color: Colors.button?.text || '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  flatList: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
  },
  categoryPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingRight: 8,
  },
  pillButton: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.withOpacity.white10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  pillButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 12,
  },
  pillTextActive: {
    color: Colors.button?.text || '#000',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.withOpacity.black30,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 0.5,
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
  actions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: Colors.textPrimary,
  },
  footerContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  footerNote: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default MenuModal;