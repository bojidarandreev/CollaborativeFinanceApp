import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { columns } from '../components/transactions/columns';
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
import { AddTransactionForm } from '../components/transactions/AddTransactionForm';
import FileImportButton from '../components/transactions/FileImportButton';
import OcrImportButton from '../components/transactions/OcrImportButton';

const fetchTransactions = async () => {
  // In a real app, you'd probably want to join with accounts to get account name
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const TransactionsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  if (isLoading) return <div>Loading transactions...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Transactions</h1>
      <div className="flex justify-end items-center gap-2 mb-4">
        <OcrImportButton />
        <FileImportButton />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Transaction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Transaction</DialogTitle>
              <DialogDescription>
                Fill in the details for your new transaction.
              </DialogDescription>
            </DialogHeader>
            <AddTransactionForm setOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
      {transactions && <DataTable columns={columns} data={transactions} />}
    </div>
  );
};

export default TransactionsPage;
