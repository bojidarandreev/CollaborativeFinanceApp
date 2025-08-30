import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { Budget, Transaction } from '../types';
import { Progress } from '../components/ui/progress';

const fetchBudgets = async (): Promise<Budget[]> => {
    const { data, error } = await supabase.from('budgets').select('*, categories ( name )');
    if (error) throw new Error(error.message);
    return data || [];
}

const fetchTransactions = async (): Promise<Transaction[]> => {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) throw new Error(error.message);
    return data || [];
}

const DashboardPage = () => {
  const { data: budgets, isLoading: isLoadingBudgets } = useQuery({ queryKey: ['budgets'], queryFn: fetchBudgets });
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({ queryKey: ['transactions'], queryFn: fetchTransactions });

  if (isLoadingBudgets || isLoadingTransactions) {
    return <div>Loading dashboard data...</div>
  }

  // Basic data processing to calculate spending per budget
  const budgetWithSpending = budgets?.map(budget => {
    const relevantTransactions = transactions?.filter(t =>
      t.category_id === budget.category_id &&
      new Date(t.date) >= new Date(budget.period_start) &&
      new Date(t.date) <= new Date(budget.period_end)
    ) || [];

    const spent = relevantTransactions.reduce((sum, t) => sum + t.amount, 0);
    const progress = (spent / budget.amount) * 100;

    return {
      ...budget,
      spent,
      progress,
    }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <h2 className="text-xl font-semibold mb-2">My Budgets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetWithSpending?.map(budget => (
          <div key={budget.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{budget.categories?.name || 'Uncategorized'}</span>
              <span className="text-sm text-gray-500">${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}</span>
            </div>
            <Progress value={budget.progress} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
