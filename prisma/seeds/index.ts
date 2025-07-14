import { PrismaClient } from '.prisma/client';
import { ProductSeed } from './product';

class Seed {
  constructor(
    private productsSeed: ProductSeed,
  ) {}

  main = async () => {
    const prisma = new PrismaClient();

    const products = await this.productsSeed.getData();
    await prisma.user.createMany({ data: products });

    await prisma.$disconnect();
  };
}

const product_seed_instance = new ProductSeed();

const seed = new Seed(
  product_seed_instance,
);
seed.main();
