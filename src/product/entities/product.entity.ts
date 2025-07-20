export class ProductEntity {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  weight: number;
  images: string[];
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class PaginatedProductEntity {
  id: number;
  title: string;
  category: string;
  price: number;
  thumbnail: string;
}
