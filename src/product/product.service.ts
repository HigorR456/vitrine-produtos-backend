import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetPaginatedProductsDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private ormService: PrismaService) {}

  async getPaginatedProducts({ page, limit, sortBy, sortOrder, category }: GetPaginatedProductsDto) {
    const products = await this.ormService.product.findMany({
      orderBy: {
        [sortBy]: sortOrder,
      },
      take: limit,
      skip: (page - 1) * limit,
      ...(category && { where: { category } })
    });

    const total = await this.ormService.product.count({
      ...(category && { where: { category } })
    });

    const return_object = {
      data: products,
      total,
    }

    return return_object;
  }

  async getProduct(id: number) {
    return await this.ormService.product.findUnique({
      where: {
        id,
      }
    })
  }
}
