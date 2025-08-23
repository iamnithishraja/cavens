import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    name: String,
    price: String,
    itemImage: String,
    description: String,
    category: String,
    customCategory: String,
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export { menuItemSchema };
export default MenuItem;