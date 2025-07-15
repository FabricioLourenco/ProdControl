/* eslint-disable @typescript-eslint/no-explicit-any */

import { StatusCodes } from "http-status-codes";
import request from 'supertest'
import app from '../../app';
import { prisma } from "../../utils/prisma";
import { setupTestDB, disconnectTestDB } from "../setup.test.db";
import { ProductAlreadyCreatedError } from "../../errors/ProductAlreadyCreatedError";
import { ProductFieldsRequiredError } from "../../errors/ProductFieldsRequiredError";
import { ProductNotFoundError } from "../../errors/ProductNotFoundError";

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

  describe('PUT /products/:id', () => {
    it('deve atualizar um produto existente com sucesso', async () => {
      // Arrange (preparar)
      const produtoOriginal = await prisma.product.create({
        data: {
          name: `Produto Original ${new Date().getTime()}`,
          description: 'Descrição original',
          price: 100.00,
          stock: 20,
        }
      });

      const dadosAtualizacao = {
        name: `Produto Atualizado ${new Date().getTime()}`,
        description: 'Descrição atualizada',
        price: 150.50,
        stock: 25,
      };

      // Act (agir)
      const response = await request(app)
        .put(`${URL}/${produtoOriginal.id}`)
        .send(dadosAtualizacao);

      // Assert (verificar)
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toEqual({
        id: produtoOriginal.id,
        ...dadosAtualizacao,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(new Date(produtoOriginal.updatedAt).getTime());
    });

    it('deve retornar erro ao tentar atualizar um produto que não existe', async () => {
        // Arrange (preparar)
        const idInexistente = 999999;
        const dadosAtualizacao = {
            name: 'Nome qualquer',
            description: 'Descrição qualquer',
            price: 10.00,
            stock: 1,
        };

        // Act (agir)
        const response = await request(app)
            .put(`${URL}/${idInexistente}`)
            .send(dadosAtualizacao);

        // Assert (verificar)
        expect(response.statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(response.body.message).toBe(new ProductNotFoundError().message);
    });

    it('deve retornar erro ao tentar atualizar um produto com um nome de outro que já existe', async () => {
        // Arrange (preparar)
        const produto1 = await prisma.product.create({
            data: {
                name: `Produto A ${new Date().getTime()}`,
                price: 10.00,
                stock: 1,
            }
        });
        const produto2 = await prisma.product.create({
            data: {
                name: `Produto B ${new Date().getTime()}`,
                price: 20.00,
                stock: 2,
            }
        });

        const dadosAtualizacao = {
            name: produto2.name,
            price: 15.00,
            stock: 5,
        };

        // Act (agir)
        const response = await request(app)
            .put(`${URL}/${produto1.id}`)
            .send(dadosAtualizacao);

        // Assert (verificar)
        expect(response.statusCode).toBe(StatusCodes.CONFLICT);
        expect(response.body.message).toBe(new ProductAlreadyCreatedError().message);
    });
  });

  describe('DELETE /products/:id', () => {
    it('deve deletar um produto existente', async () => {
      // Arrange (preparar)
      const product = await prisma.product.create({
        data: {
          name: `Produto para Deletar ${new Date().getTime()}`,
          price: 10.00,
          stock: 1,
        }
      });

      // Act (agir)
      const response = await request(app)
        .delete(`${URL}/${product.id}`);

      // Assert (verificar)
      expect(response.statusCode).toBe(StatusCodes.NO_CONTENT);

      const deletedProduct = await prisma.product.findUnique({
        where: { id: product.id }
      });
      expect(deletedProduct).toBeNull();
    });

    it('deve retornar erro ao tentar deletar um produto inexistente', async () => {
      // Arrange (preparar)
      const idInexistente = 999999;

      // Act (agir)
      const response = await request(app)
        .delete(`${URL}/${idInexistente}`);

      // Assert (verificar)
      expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
      expect(response.body.message).toBe(new ProductNotFoundError().message);
    });
  });
});