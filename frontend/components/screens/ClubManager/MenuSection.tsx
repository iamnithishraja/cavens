import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Pressable, FlatList, TextInput, StyleSheet as RNStyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import TextField from "../../ui/TextField";
import { MenuItemFull, MenuCategoryId } from "./types";

const CATEGORY_OPTIONS: MenuCategoryId[] = [
  "Appetizers & Snacks",
  "Main Courses & Mains",
  "Vegetarian & Plant-Based",
  "Seafood",
  "Desserts & Sweets",
  "Beverages & Drinks",
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
      {/* Scrim to allow closing by tapping outside */}
      <Pressable style={styles.pickerScrim} onPress={onClose} />

      {/* Half-height bottom sheet */}
      <LinearGradient
        colors={Colors.gradients.card as [string, string]}
        style={styles.pickerSheet}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.pickerGrabber} />
        <Text style={styles.pickerTitle}>Choose Category</Text>
        
        <FlatList
          data={CATEGORY_OPTIONS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable style={styles.pickerRow} onPress={() => onSelect(item)}>
              <Text style={styles.pickerRowText}>{item}</Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.pickerSep} />}
          style={{ flexGrow: 0 }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

type Props = {
  items: MenuItemFull[];
  onAddItem: () => void;
  onUpdateItem: (itemId: string, field: keyof MenuItemFull, value: string | MenuCategoryId) => void;
  onRemoveItem: (itemId: string) => void;
  happyHourTimings: string;
  setHappyHourTimings: (value: string) => void;
};

const MenuSection: React.FC<Props> = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  happyHourTimings,
  setHappyHourTimings,
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
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Interactive Menu</Text>

      <View style={styles.sectionSpacing}>
        <TextField
          label="Happy Hour Timings"
          value={happyHourTimings}
          onChangeText={setHappyHourTimings}
          placeholder="e.g. 6 PM - 8 PM, 50% off selected drinks"
        />
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>Menu Items</Text>
        <TouchableOpacity style={styles.addMenuItemBtn} onPress={onAddItem}>
          <Text style={styles.addMenuItemText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      {items.map((item) => (
        <View key={item.id} style={styles.menuItemCard}>
          <LinearGradient colors={Colors.gradients.card as [string, string]} style={styles.menuItemGradient}>
            <View style={styles.topRow}>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => openCategoryPicker(item.id)}
              >
                <Text style={styles.categorySelectorLabel}>Category</Text>
                <Text style={styles.categorySelectorText}>
                  {item.category === "Other" ? item.customCategory || "Other" : item.category}
                </Text>
              </TouchableOpacity>
              <View style={styles.namePriceRow}>
                <View style={styles.nameInput}>
                  <TextField
                    label="Item Name"
                    value={item.name}
                    onChangeText={(value) => onUpdateItem(item.id, "name", value)}
                    placeholder="e.g. Chicken Wings"
                  />
                </View>
                <View style={styles.priceInput}>
                  <TextField
                    label="Price"
                    value={item.price}
                    onChangeText={(value) => onUpdateItem(item.id, "price", value)}
                    placeholder="₹650"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.removeMenuItemBtn} onPress={() => onRemoveItem(item.id)}>
                <Text style={styles.removeMenuItemText}>×</Text>
              </TouchableOpacity>
            </View>



            {item.category === "Other" && (
              <View style={{ marginTop: 12 }}>
                <TextField
                  label="Custom Category"
                  value={item.customCategory || ""}
                  onChangeText={(value) => onUpdateItem(item.id, "customCategory", value)}
                  placeholder="Enter category"
                />
              </View>
            )}

            <TextField
              label="Description"
              value={item.description}
              onChangeText={(value) => onUpdateItem(item.id, "description", value)}
              placeholder="Short description about the item"
            />
          </LinearGradient>
        </View>
      ))}

      {/* Category Picker Modal */}
      {categoryPickerVisible && (
        <CategoryPicker
          visible={categoryPickerVisible}
          onSelect={selectCategory}
          onClose={() => setCategoryPickerVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  sectionSpacing: { marginBottom: 24 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLabel: { color: Colors.textPrimary, fontWeight: "700" },
  addMenuItemBtn: {
    backgroundColor: Colors.accentYellow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addMenuItemText: { color: Colors.button.text, fontSize: 12, fontWeight: "700" },
  menuItemCard: { marginBottom: 16, borderRadius: 16, overflow: "hidden" },
  menuItemGradient: {
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    borderRadius: 16,
  },
  topRow: { gap: 12, marginBottom: 12 },
  namePriceRow: { flexDirection: "row", gap: 12 },
  nameInput: { flex: 3 },
  priceInput: { flex: 1 },
  removeMenuItemBtn: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  removeMenuItemText: { color: "#FF6B6B", fontSize: 14, fontWeight: "800" },
  categorySelector: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  categorySelectorLabel: { color: Colors.textSecondary, fontSize: 11, marginBottom: 4 },
  categorySelectorText: { color: Colors.textPrimary, fontWeight: "600" },
  dropdown: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderBlue },
  dropdownItemText: { color: Colors.textPrimary },
  dropdownClose: { padding: 12, alignItems: "center" },
  dropdownCloseText: { color: Colors.textSecondary, fontWeight: "600" },
  
  // Category Picker Styles
  pickerRoot: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  pickerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7,11,20,0.35)",
  },
  pickerSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderTopColor: Colors.borderBlue,
    borderTopWidth: RNStyleSheet.hairlineWidth,
    maxHeight: "75%",
  },
  pickerGrabber: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.borderBlue,
    marginBottom: 8,
    opacity: 0.8,
  },
  pickerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  pickerRowText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  pickerSep: {
    height: RNStyleSheet.hairlineWidth,
    backgroundColor: Colors.borderBlue,
  },
});

export default MenuSection;

