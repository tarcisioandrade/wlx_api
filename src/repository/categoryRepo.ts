import { CategoryDoc } from "../@types/Category";
import Category from "../models/Category";

export interface ICategoryRepo {
  getCategoryById(id: string): Promise<CategoryDoc | null>;
}

export class CategoryRepo implements ICategoryRepo {
  async getCategoryById(id: string) {
    const category = await Category.findById(id);

    return category;
  }
}
