export interface MenuItem {
  id: string;
  name: string;
  price: string;
  description?: string;
}

export interface MenuCategory {
  id: string;
  categoryName: string;
  items: MenuItem[];
}

export interface MenuData {
  restaurantName?: string;
  categories: MenuCategory[];
}
