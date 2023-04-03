import { Categories, CategoryDoc, CategoryType } from "../../@types/Category";
import { ICategoryRepo } from "../../repository/categoryRepo";

require("dotenv").config();

type CategoryWithId = CategoryType & { _id: string };

export const fakeCategory: CategoryWithId = {
  _id: "6419c1502608ee23ad069047",
  name: "Eletrônicos",
  slug: "eletronics",
  _doc: null,
};

export class MockCategoryRepo implements ICategoryRepo {
  private category: CategoryDoc[];

  constructor(category: CategoryType) {
    this.category = [category] as CategoryDoc[];
  }

  async getCategoryById(id: string) {
    const category =
      this.category.find((category) => category._id.toString() === id) || null;

    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category =
      this.category.find((category) => category.slug === slug) || null;

    return category;
  }

  async getCategories() {
    let categories: Categories[] = [];

    for (let i in this.category) {
      categories.push({
        ...this.category[i],
        img: `mockImage.png`,
      });
    }

    return categories;
  }
}
