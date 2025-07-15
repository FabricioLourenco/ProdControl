import { resourceLimits } from "worker_threads";
import { ProductService } from "../../services/product.service";
import { prisma } from "../../utils/prisma";
import { faker } from "@faker-js/faker/.";
import { ProductFieldsRequiredError } from "../../errors/ProductFieldsRequiredError";
import { ProductAlreadyCreatedError } from "../../errors/ProductAlreadyCreatedError";

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
    })
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

