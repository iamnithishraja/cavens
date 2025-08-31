import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  FlatList,
  StyleSheet as RNStyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import TextField from "../../ui/TextField";
import { MenuItemFull, MenuCategoryId } from "./types";
import ImageUploader from "@/components/ui/ImageUploader";

const CATEGORY_OPTIONS: MenuCategoryId[] = [
  "Appetizers & Snacks",
  "Main Courses & Mains",
  "Vegetarian & Plant-Based",
  "Seafood",
  "Desserts & Sweets",
  "Beverages & Drinks",
  "Combos",
  "Other",
];

// Category Picker Component
const CategoryPicker: React.FC<{
  visible: boolean;
  onSelect: (category: MenuCategoryId) => void;
  onClose: () => void;
}> = ({ visible, onSelect, onClose }) => {
  if (!visible) return null;

  return (
    <SafeAreaView style={styles.pickerRoot} edges={["bottom"]}>
      <Pressable style={styles.pickerScrim} onPress={onClose} />
      
      <View style={styles.pickerSheet}>
        <View style={styles.pickerHandle} />
        <Text style={styles.pickerTitle}>Choose Category</Text>

        <FlatList
          data={CATEGORY_OPTIONS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable style={styles.categoryOption} onPress={() => onSelect(item)}>
              <Text style={styles.categoryOptionText}>{item}</Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.categorySeparator} />}
        />
      </View>
    </SafeAreaView>
  );
};

type Props = {
  items: MenuItemFull[];
  onAddItem: () => void;
  onUpdateItem: (
    itemId: string,
    field: keyof MenuItemFull,
    value: string | MenuCategoryId
  ) => void;
  onRemoveItem: (itemId: string) => void;
  happyHourTimings: string;
  setHappyHourTimings: (value: string) => void;
};

const MenuSection: React.FC<Props> = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}) => {
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const openCategoryPicker = (itemId: string) => {
    setSelectedItemId(itemId);
    setCategoryPickerVisible(true);
  };

  const selectCategory = (category: MenuCategoryId) => {
    if (selectedItemId) {
      onUpdateItem(selectedItemId, "category", category);
      if (category === "Other") {
        onUpdateItem(selectedItemId, "customCategory", "");
      }
    }
    setCategoryPickerVisible(false);
    setSelectedItemId(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Menu</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddItem}>
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No menu items added yet</Text>
          <Text style={styles.emptyStateSubtext}>Tap &quot;Add Item&quot; to get started</Text>
        </View>
      )}

      {items.map((item, index) => (
        <View key={item.id} style={styles.menuItem}>
          {/* Item Header */}
          <View style={styles.itemHeader}>
            <View style={styles.itemNumber}>
              <Text style={styles.itemNumberText}>{String(index + 1).padStart(2, '0')}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemoveItem(item.id)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Category Selection */}
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => openCategoryPicker(item.id)}
          >
            <Text style={styles.categoryLabel}>CATEGORY</Text>
            <Text style={styles.categoryValue}>
              {item.category === "Other"
                ? item.customCategory || "Other"
                : item.category}
            </Text>
          </TouchableOpacity>

          {/* Custom Category Input */}
          {item.category === "Other" && (
            <View style={styles.customCategoryContainer}>
              <TextField
                label="Custom Category"
                value={item.customCategory || ""}
                onChangeText={(value) =>
                  onUpdateItem(item.id, "customCategory", value)
                }
                placeholder="Enter category name"
              />
            </View>
          )}

          {/* Item Name and Price */}
          <View style={styles.nameAndPrice}>
            <View style={styles.nameContainer}>
              <TextField
                label="Item Name"
                value={item.name}
                onChangeText={(value) => onUpdateItem(item.id, "name", value)}
                placeholder="Enter item name"
              />
            </View>
            <View style={styles.priceContainer}>
              <TextField
                label="Price"
                value={item.price}
                onChangeText={(value) => onUpdateItem(item.id, "price", value)}
                placeholder="AED 10"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <TextField
              label="Description"
              value={item.description}
              onChangeText={(value) => onUpdateItem(item.id, "description", value)}
              placeholder="Brief description of the item"
            />
          </View>

          {/* Image Upload */}
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>ITEM IMAGE</Text>
            <ImageUploader
              label=""
              multiple={false}
              existingUrls={item.itemImage ? [item.itemImage] : []}
              onUploaded={(urls) =>
                onUpdateItem(item.id, "itemImage", urls[0] || "")
              }
              squareSize={80}
              fileNamePrefix={`menu-item-${
                item.name
                  ? item.name.toLowerCase().replace(/\s+/g, "-") + "-"
                  : ""
              }`}
            />
          </View>

          {/* Separator Line */}
          {index < items.length - 1 && <View style={styles.itemSeparator} />}
        </View>
      ))}

      {/* Category Picker Modal */}
      <CategoryPicker
        visible={categoryPickerVisible}
        onSelect={selectCategory}
        onClose={() => setCategoryPickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: Colors.button.text,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  menuItem: {
    marginBottom: 40,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  itemNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  itemNumberText: {
    color: Colors.button.text,
    fontSize: 14,
    fontWeight: "700",
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: Colors.error,
    fontSize: 18,
    fontWeight: "300",
  },
  categoryButton: {
    marginBottom: 20,
  },
  categoryLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  categoryValue: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  customCategoryContainer: {
    marginBottom: 20,
  },
  nameAndPrice: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  nameContainer: {
    flex: 2,
  },
  priceContainer: {
    flex: 1,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: Colors.separator,
    marginTop: 20,
  },
  
  // Category Picker Styles
  pickerRoot: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  pickerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  pickerSheet: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  pickerHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    marginBottom: 20,
  },
  pickerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
  },
  categoryOption: {
    paddingVertical: 16,
  },
  categoryOptionText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  categorySeparator: {
    height: 1,
    backgroundColor: Colors.separator,
  },
});

export default MenuSection;