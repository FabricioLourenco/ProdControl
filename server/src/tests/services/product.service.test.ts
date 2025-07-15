import { resourceLimits } from "worker_threads";
import { ProductService } from "../../services/product.service";
import { prisma } from "../../utils/prisma";
import { faker } from "@faker-js/faker/.";
import { ProductFieldsRequiredError } from "../../errors/ProductFieldsRequiredError";
import { ProductAlreadyCreatedError } from "../../errors/ProductAlreadyCreatedError";
import { ProductNotFoundError } from "../../errors/ProductNotFoundError";

jest.mock('../../utils/prisma', () => ({
  prisma: {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
  }
}));

describe('ProducService', () => {
  const ProductsMock = [
    { id: 1, name: 'Produto 1', description: '', price: 10.00, stock: 1 },
    { id: 2, name: 'Produto 2', description: '', price: 20.00, stock: 2 },
    { id: 3, name: 'Produto 3', description: '', price: 30.00, stock: 3 },
    { id: 4, name: 'Produto 4', description: '', price: 40.00, stock: 4 },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('deve criar produto com todos os campos preenchidos', async () => {
      // Arrange (preparar)
      const dadosValidos = {
        name: 'Produto Válido',
        description: 'Produto Válido',
        price: 50.00,
        stock: 10,
      };

      const produtoCriadoMock = {
        id: 1,
        ...dadosValidos,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.product.create as jest.Mock).mockResolvedValue(produtoCriadoMock);

      // Act (agir)
      const produto = await ProductService.createProduct(dadosValidos);

      // Assert (verificar)
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          ...dadosValidos,
        }
      });

      expect(produto).toEqual(produtoCriadoMock);
    });

    it('deve aceitar descrição nula', async () => {
      // Arrange (preparar)
      const dadosEntrada = {
        name  : 'Produto',
        price : 50.00,
        stock : 5,
      };
      const produtoEsperado = { id: 1, ...dadosEntrada };

      (prisma.product.create as jest.Mock).mockResolvedValue(produtoEsperado);

      // Act (agir)
      const resultado = await ProductService.createProduct(dadosEntrada);

      // Assert (verificar)
      expect(resultado?.description).toBeUndefined();
    });

      it('deve lançar erro se o campo "name" estiver ausente', async () => {
    // Arrange (preparar)
    const dadosInvalidos = { price: 50.00, stock: 10 };

    // Act (agir) & Assert(verificar)
    await expect(ProductService.createProduct(dadosInvalidos as any))
      .rejects
      .toThrow(ProductFieldsRequiredError);
  });

  it('deve lançar erro se o campo "price" estiver ausente', async () => {
    // Arrange (preparar)
    const dadosInvalidos = { name: 'Produto', stock: 10 };

    // Act (agir) & Assert(verificar)
    await expect(ProductService.createProduct(dadosInvalidos as any))
      .rejects
      .toThrow(ProductFieldsRequiredError);
  });

  it('deve lançar erro se o campo "stock" estiver ausente', async () => {
    // Arrange (preparar)
    const dadosInvalidos = { name: 'Produto', price: 50.00 };

    // Act (agir) & Assert(verificar)
    await expect(ProductService.createProduct(dadosInvalidos as any))
      .rejects
      .toThrow(ProductFieldsRequiredError);
  });

    it('deve lançar erro se um produto com o mesmo nome já existir', async () => {
      // Arrange (preparar)
      const dadosProdutoExistente = {
        name  : 'Produto que já existe',
        price : 150.00,
        stock : 15,
      };

      (prisma.product.create as jest.Mock).mockRejectedValue({
        code: 'P2002',
        meta: { target: ['name'] },
      });

      // Act (agir) & Assert (verificar)
      await expect(ProductService.createProduct(dadosProdutoExistente))
        .rejects
        .toThrow(ProductAlreadyCreatedError);
    });
  });

  describe('updateProduct', () => {
    it('deve atualizar o produto com os dados fornecidos', async () => {
      // Arrange (preparar)
      const dadosAtualizacao = {
        name        : 'Produto Atualizado',
        description : 'Nova Descrição',
        price       : 10.00,
        stock       : 5,
      };

      const produtoAtualizado = {
        id: 1,
        ...dadosAtualizacao,
      };

      (prisma.product.update as jest.Mock).mockResolvedValue(produtoAtualizado);

      // Act (agir)
      const resultado = await ProductService.updateProduct(1, dadosAtualizacao);

      // Assert (verificar)
      expect(prisma.product.update).toHaveBeenCalledWith({
        where : { id: 1 },
        data  : { ...dadosAtualizacao },
      });

      expect(resultado).toEqual(produtoAtualizado);
    });

    it('deve permitir atualização do produto sem descrição', async () => {
      // Arrange (preparar)
      const dadosAtualizacao = {
        name        : 'Produto Atualizado',
        price       : 10.00,
        stock       : 5,
      };

      const produtoAtualizado = {
        id: 1,
        ...dadosAtualizacao,
      };

      (prisma.product.update as jest.Mock).mockResolvedValue(produtoAtualizado);

      // Act (agir)
      const resultado = await ProductService.updateProduct(1, dadosAtualizacao);

      // Assert (verificar)
      expect(resultado).toEqual(produtoAtualizado);
    });

    it('deve lançar erro ao tentar atualizar um produto que não existe', async () => {
      // Arrange (preparar)
      const dadosAtualizacao = {
        name: 'Nome qualquer',
        price: 10.00,
        stock: 1,
      };
      (prisma.product.update as jest.Mock).mockRejectedValue({
        code: 'P2025',
      });

      // Act (agir) & Assert (verificar)
      await expect(ProductService.updateProduct(999, dadosAtualizacao))
        .rejects
        .toThrow(ProductNotFoundError);
    });

    it('deve lançar erro ao tentar atualizar para um nome que já existe', async () => {
      // Arrange (preparar)
      const dadosAtualizacao = {
        name: 'Produto 2',
        price: 10.00,
        stock: 5,
      };
      (prisma.product.update as jest.Mock).mockRejectedValue({
        code: 'P2002',
        meta: { target: ['name'] },
      });

      // Act (agir) & Assert (verificar)
      await expect(ProductService.updateProduct(1, dadosAtualizacao))
        .rejects
        .toThrow(ProductAlreadyCreatedError);
    });
  });

  describe('deleteProduct', () => {
    it('deve deletar um produto existente', async () => {
      // Arrange (preparar)
      const productId = 1;
      (prisma.product.delete as jest.Mock).mockResolvedValue({});

      // Act (agir)
      await ProductService.deleteProduct(productId);

      // Assert (verificar)
      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prisma.product.delete).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro ao tentar deletar produto inexistente', async () => {
      // Arrange (preparar)
      const productId = 999;
      (prisma.product.delete as jest.Mock).mockRejectedValue({
        code: 'P2025',
      });

      // Act (agir) & Assert (verificar)
      await expect(ProductService.deleteProduct(productId))
        .rejects
        .toThrow(ProductNotFoundError);
    });
  });
});

