export class ProductAlreadyCreatedError extends Error {
  constructor(message?: string) {
    super(message ?? 'Já existe um produto com este nome.');
    this.name = 'ProductAlreadyCreatedError';
  }
}