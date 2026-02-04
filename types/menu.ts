export interface MenuItem {
  id?: string; // Made optional
  name: string;
  price: string;
  description?: string;
}

export interface MenuCategory {
  id?: string; // Made optional
  categoryName: string;
  items: MenuItem[];
}

export interface MenuData {
  restaurantName?: string;
  categories: MenuCategory[];
}
