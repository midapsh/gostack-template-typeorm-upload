import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import CategoryRepository from '../repositories/CategoryRepository';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface Response {
  id: string;
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Response> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();
    if (!balance || (type === 'outcome' && balance.total < value)) {
      throw new AppError('Your income is lower than your outcome', 401);
    }
    const categoryRepository = getCustomRepository(CategoryRepository);

    const findCategory = await categoryRepository.findOne({
      where: { category },
    });

    const curCategory =
      findCategory ||
      transactionsRepository.create({
        title: category,
      });

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: curCategory.id,
    });

    const response = {
      id: transaction.id,
      title: transaction.title,
      value: transaction.value,
      type: transaction.type,
      category,
    };

    return response;
  }
}

export default CreateTransactionService;
