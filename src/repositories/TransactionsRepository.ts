import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance | null> {
    const transactions = await this.find();
    const resultBalance = transactions.reduce(
      (accumulator: Balance, { type, value }: Transaction): Balance => {
        if (type === 'income') {
          return {
            ...accumulator,
            income: accumulator.income + value,
          };
        }
        if (type === 'outcome') {
          return {
            ...accumulator,
            outcome: accumulator.outcome + value,
          };
        }
        return accumulator;
      },
      { outcome: 0, income: 0, total: 0 } as Balance,
    );

    if (!resultBalance) {
      return null;
    }
    resultBalance.total = resultBalance.income - resultBalance.outcome;

    return resultBalance;
  }
}

export default TransactionsRepository;
