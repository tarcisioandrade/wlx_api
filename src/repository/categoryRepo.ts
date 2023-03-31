import { Categories, CategoryDoc } from "../@types/Category";
import Category from "../models/Category";

export interface ICategoryRepo {
  getCategoryById(id: string): Promise<CategoryDoc | null>;
  getCategoryBySlug(slug: string): Promise<CategoryDoc | null>;
  getCategories(): Promise<Categories[]>;
}

export class CategoryRepo implements ICategoryRepo {
  async getCategoryById(id: string) {
    const category = await Category.findById(id);

    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ slug });

    return category;
  }

  async getCategories() {
    const categs = await Category.find();
    let categories: Categories[] = [];

    for (let i in categs) {
      categories.push({
        ...categs[i]._doc,
        img: `${process.env.BASE}/assets/images/${categs[i].slug}.png`,
      });
    }
    return categories;
  }
}
