import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { columns } from '../components/accounts/columns';
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
import { AddAccountForm } from '../components/accounts/AddAccountForm';


const fetchAccounts = async () => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const AccountsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });

  if (isLoading) return <div>Loading accounts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Accounts</h1>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Account</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Account</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new financial account.
              </DialogDescription>
            </DialogHeader>
            <AddAccountForm setOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
      {accounts && <DataTable columns={columns} data={accounts} />}
    </div>
  );
};

export default AccountsPage;
