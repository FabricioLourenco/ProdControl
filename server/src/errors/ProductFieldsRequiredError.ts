export class ProductFieldsRequiredError extends Error {
  constructor(message?: string) {
    super(message ?? 'Nome, preço e estoque são obrigatórios.');
    this.name = 'ProductFieldsRequiredError';
  }
}