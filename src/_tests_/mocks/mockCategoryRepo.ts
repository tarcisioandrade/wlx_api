import { CategoryType, CategoryDoc } from "../../@types/Category";
import { ICategoryRepo } from "../../repository/categoryRepo";

type CategoryWithId = CategoryType & { _id: string };

export const fakeCategory: CategoryWithId = {
  _id: "6418592cae6ab60490031ca2",
  name: "Eletrônicos",
  slug: "eletronics",
  _doc: null
}

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
}
