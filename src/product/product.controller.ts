import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import {
  PaginatedProductEntity,
  ProductEntity,
} from './entities/product.entity';
import { GetPaginatedProductsDto } from './dto/product.dto';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { PaginationInterface } from 'src/shared/interface/paginated-interface';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('products')
  @ApiOperation({ summary: 'Get paginated products' })
  @ApiOkResponse({
    description: 'List of paginated products',
    type: PaginatedProductEntity,
    example: {
      id: 1,
      title: 'Essence Mascara Lash Princess',
      category: 'beauty',
      price: 9.99,
      thumbnail:
        'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    isArray: true,
  })
  @ApiBadRequestResponse({ description: 'Invalid pagination parameters' })
  async getPaginatedProducts(
    @Query() query: GetPaginatedProductsDto,
  ): Promise<PaginationInterface<PaginatedProductEntity[]>> {
    return this.productService.getPaginatedProducts(query);
  }

  @Get('product/:id')
  @ApiOperation({ summary: 'Get product' })
  @ApiOkResponse({
    description: 'Full product data',
    type: PaginatedProductEntity,
    example: {
      id: 1,
      title: 'Essence Mascara Lash Princess',
      description: 'The Essence Mascara Lash Princess is a popular...',
      category: 'beauty',
      price: 9.99,
      rating: 2.56,
      weight: 4,
      images: [
        'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/1.webp',
      ],
      thumbnail:
        'https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  async getProduct(@Param('id') id: number): Promise<ProductEntity> {
    return this.productService.getProduct(id);
  }
}
