import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProductNotFoundError } from '../errors/ProductNotFoundError';
import { ProductFieldsRequiredError } from '../errors/ProductFieldsRequiredError';
import { ProductService } from '../services/product.service';
import { ProductAlreadyCreatedError } from '../errors/ProductAlreadyCreatedError';

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(StatusCodes.CREATED).json(product);
  } catch (error) {
    if (error instanceof ProductFieldsRequiredError)
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message })
    else if (error instanceof ProductAlreadyCreatedError)
      res.status(StatusCodes.CONFLICT).json({ message: error.message })
    else {
      console.error('Erro ao criar produto:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erro no servidor' });
    }
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await ProductService.getProducts();
    res.json(products);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erro no servidor' });
  }
}

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await ProductService.getProductById(parseInt(req.params.id));
    res.json(product);
  } catch (error) {
    if (error instanceof ProductNotFoundError)
      res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
    else {
      console.error('Erro ao buscar produto:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erro no servidor' });
    }
  }
}

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedProduct = await ProductService.updateProduct(parseInt(req.params.id), req.body);
    res.json(updatedProduct);
  } catch(error) {
    if (error instanceof ProductAlreadyCreatedError)
      res.status(StatusCodes.CONFLICT).json({ message: error.message })
    else if (error instanceof ProductNotFoundError)
      res.status(StatusCodes.BAD_REQUEST).json({ message: error.message })
    else {
      console.error('Erro ao atualizar produto:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erro no servidor' });
    }
  }
}

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    await ProductService.deleteProduct(parseInt(req.params.id));
    res.status(StatusCodes.NO_CONTENT).send();
  } catch(error) {
    if (error instanceof ProductNotFoundError) {
      res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
    } else {
      console.error('Erro ao deletar produto:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erro no servidor' });
    }
  }
}
