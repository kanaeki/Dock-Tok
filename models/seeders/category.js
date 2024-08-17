const { default: mongoose } = require("mongoose");
const { Category } = require("../category");

async function seedCategories() {
  try {
    const existCategory = await Category.findOne({ name: "Uncategorized" });
    if (!existCategory) {
      await Category.create({
        name: "Uncategorized",
        description: "Uncategorized",
      });
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  seedCategories,
};
