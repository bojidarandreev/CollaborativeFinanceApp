import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { columns } from '../components/budgets/columns';
import { DataTable } from '../components/ui/data-table';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { AddBudgetForm } from '../components/budgets/AddBudgetForm';

const fetchBudgets = async () => {
  // We join with the categories table to get the category name
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      categories ( name )
    `);

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const BudgetsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: budgets, isLoading, error } = useQuery({
    queryKey: ['budgets'],
    queryFn: fetchBudgets,
  });

  if (isLoading) return <div>Loading budgets...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Budgets</h1>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Budget</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit for a category over a period of time.
              </DialogDescription>
            </DialogHeader>
            <AddBudgetForm setOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
      {budgets && <DataTable columns={columns} data={budgets} />}
    </div>
  );
};

export default BudgetsPage;
