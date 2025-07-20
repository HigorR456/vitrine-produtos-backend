import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class GetPaginatedProductsDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @ApiPropertyOptional({
    description: 'Number of products per page',
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;

  @ApiPropertyOptional({
    enum: ['id', 'title', 'price', 'category', 'rating'],
    default: 'rating',
  })
  @IsIn(['id', 'title', 'price', 'category', 'rating'])
  @IsOptional()
  sortBy: 'id' | 'title' | 'price' | 'category' | 'rating' = 'rating';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    enum: [
      'beauty',
      'fragrances',
      'furniture',
      'groceries',
      'home-decoration',
      'kitchen-accessories',
      'laptops',
      'mens-shirts',
    ],
    default: 'asc',
  })
  @IsIn([
    'beauty',
    'fragrances',
    'furniture',
    'groceries',
    'home-decoration',
    'kitchen-accessories',
    'laptops',
    'mens-shirts',
  ])
  @IsOptional()
  category:
    | 'beauty'
    | 'fragrances'
    | 'furniture'
    | 'groceries'
    | 'home-decoration'
    | 'kitchen-accessories'
    | 'laptops'
    | 'mens-shirts';
}
