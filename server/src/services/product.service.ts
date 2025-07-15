import { prisma } from '../utils/prisma';
import { ProductAlreadyCreatedError } from '../errors/ProductAlreadyCreatedError';
import { ProductFieldsRequiredError } from '../errors/ProductFieldsRequiredError';
import { ProductNotFoundError } from '../errors/ProductNotFoundError';

export class ProductService {
  static validProduct(
    data: {
      name  : string;
      price : number;
      stock : number;
    }
  ): boolean {
    return !!(data.name && data.price && data.stock);
  }

  static async createProduct(
    data: {
      name         : string;
      description? : string;
      price        : number;
      stock        : number;
    }
  ) {
    if (!this.validProduct(data))
      throw new ProductFieldsRequiredError();

    try {
      const product = await prisma.product.create({
        data: {
          name        : data.name,
          description : data.description,
          price       : data.price,
          stock       : data.stock,
        }
      })

      return product;
    } catch(error: any) {
      if (error.code === 'P2002')
        throw new ProductAlreadyCreatedError();
    }
  }

  static async getProducts() {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return products;
  }

  static async getProductById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product)
      throw new ProductNotFoundError();

    return product;
  }

  static async updateProduct(
    id: number,
    data: {
      name         : string;
      description? : string;
      price        : number;
      stock        : number;
    }
  ) {
    try {
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          name        : data.name,
          description : data.description,
          price       : data.price,
          stock       : data.stock,
        },
      });

      return updatedProduct;
    } catch(error: any) {
      if (error.code === 'P2025')
        throw new ProductNotFoundError();
      if (error.code === 'P2002')
        throw new ProductAlreadyCreatedError();
    }
  }

  static async deleteProduct(id: number) {
    try {
      await prisma.product.delete({
        where: { id }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new ProductNotFoundError();
      }
      throw error;
    }
  }
}