export class ProductNotFoundError extends Error {
  constructor(message?: string) {
    super(message ?? 'Produto não encontrado.');
    this.name = 'ProductNotFoundError';
  }
}