export type Category = {
  name: string;
  slug: string;
  _doc: any;
};

export type Categories = {
  img: string;
} & Category;
