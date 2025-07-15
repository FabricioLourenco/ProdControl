/* eslint-disable @typescript-eslint/no-explicit-any */

import { StatusCodes } from "http-status-codes";
import request from 'supertest'
import app from '../../app';
import { prisma } from "../../utils/prisma";
import { setupTestDB, disconnectTestDB } from "../setup.test.db";
import { ProductAlreadyCreatedError } from "../../errors/ProductAlreadyCreatedError";
import { ProductFieldsRequiredError } from "../../errors/ProductFieldsRequiredError";

const URL = '/products'

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

describe('ProductController', () => {
  describe('POST /products', () => {
    it('deve criar produto com todos os campos preenchidos', async () => {
      // Arrange (preparar)
      const dadosProduto = {
        name        : `Produto ${new Date()}`,
        description : 'Esse é um produto preenchido',
        price       : 50.00,
        stock       : 10,
      };

      // Act (agir)
      const response = await request(app).post(URL).send(dadosProduto);

      // Assert (verificar)
      expect(response.statusCode).toBe(StatusCodes.CREATED);
      expect(response.body).toEqual({
        ...dadosProduto,
        id        : expect.any(Number),
        createdAt : expect.any(String),
        updatedAt : expect.any(String),
      });
    });

    it('deve criar um produto mesmo que a decrição não seja fornecida', async () => {
      // Arrange (preparar)
      const dadosProduto = {
        name  : `Produto Sem Descrição ${new Date().getTime()}`,
        price : 99.99,
        stock : 10,
      };

      // Act (agir)
      const response = await request(app).post(URL).send(dadosProduto);

      // Assert (verificar)
      expect(response.statusCode).toBe(StatusCodes.CREATED);
      expect(response.body.name).toBe(dadosProduto.name);
      expect(response.body.description).toBeNull();
    });

    it('deve retornar erro ao tentar criar um produto com um nome que já existe', async () => {
      // Arrange (preparar)
      const dadosProduto = {
        name: 'Produto Duplicado',
        description: 'Primeira versão do produto.',
        price: 10.00,
        stock: 1,
      };
      await prisma.product.create({ data: dadosProduto });

      // Act (agir)
      const response = await request(app).post(URL).send(dadosProduto);

      // Assert (verificar)
      expect(response.statusCode).toBe(StatusCodes.CONFLICT);
      expect(response.body.message).toBe(new ProductAlreadyCreatedError().message);
    });

    it.each([
      // Arrange (preparar)
      ['name'  , { price: 10, stock: 1 }],
      ['price' , { name: 'Produto Sem Preço', stock: 1 }],
      ['stock' , { name: 'Produto Sem Estoque', price: 10 }],
    ])('deve retornar erro se o campo obrigatório "%s" estiver faltando', async (campoFaltante, dadosInvalidos) => {
      // Act (agir)
      const response = await request(app).post(URL).send(dadosInvalidos);

      // Assert (verificar)
      expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(response.body.message).toBe(new ProductFieldsRequiredError().message);
    });
  });

});