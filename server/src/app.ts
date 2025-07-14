// src/app.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors'; // Para permitir requisições do frontend

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições
app.use(cors()); // Permite que o frontend (em outra porta) se comunique com o backend

// Rotas de produtos (CRUD simples)

// GET /products - Listar todos os produtos
app.get('/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
});

// GET /products/:id - Obter um produto por ID
app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produto.' });
    }
});

// POST /products - Criar um novo produto
app.post('/products', async (req, res) => {
    const { name, description, price, stock } = req.body;
    if (!name || !price || !stock) {
        return res.status(400).json({ error: 'Nome, preço e estoque são obrigatórios.' });
    }
    try {
        const newProduct = await prisma.product.create({
            data: { name, description, price, stock },
        });
        res.status(201).json(newProduct);
    } catch (error: any) {
        if (error.code === 'P2002') { // Erro de unique constraint (nome já existe)
            return res.status(409).json({ error: 'Já existe um produto com este nome.' });
        }
        res.status(500).json({ error: 'Erro ao criar produto.' });
    }
});

// PUT /products/:id - Atualizar um produto
app.put('/products/:id', async (req, res) => {
    const id = +req.params.id;
    const { name, description, price, stock } = req.body;
    if (!name || !price || !stock)
        return res.status(400).json({ error: 'Nome, preço e estoque são obrigatórios.' });
    try {
        const p = await prisma.product.update({
            where: { id },
            data: { name, description, price: +price, stock: +stock }
        });
        res.json(p)
    } catch (error: any) {
        if (error.code === 'P2025') return res.status(404).json({ error: 'Produto não encontrado.' });
        res.status(500).json({ error: 'Erro.' });
    }
});

// DELETE /products/:id - Deletar um produto
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.product.delete({
            where: { id: parseInt(id) },
        });
        res.status(204).send(); // 204 No Content para deleção bem-sucedida
    } catch (error: any) {
        if (error.code === 'P2025') { // Erro de registro não encontrado para delete
            return res.status(404).json({ error: 'Produto não encontrado para exclusão.' });
        }
        res.status(500).json({ error: 'Erro ao excluir produto.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});