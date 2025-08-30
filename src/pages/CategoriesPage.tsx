import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { columns } from '../components/categories/columns';
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
import { AddCategoryForm } from '../components/categories/AddCategoryForm';

const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const CategoriesPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Categories</h1>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Category</DialogTitle>
              <DialogDescription>
                Create a new category to organize your transactions.
              </DialogDescription>
            </DialogHeader>
            <AddCategoryForm setOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
      {categories && <DataTable columns={columns} data={categories} />}
    </div>
  );
};

export default CategoriesPage;
