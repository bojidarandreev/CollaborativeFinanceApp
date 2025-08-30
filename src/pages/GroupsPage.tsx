import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { columns } from '../components/groups/columns';
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
import { AddGroupForm } from '../components/groups/AddGroupForm';

const fetchGroups = async () => {
  // RLS policy "Groups viewable by members" will ensure we only get groups
  // the current user is a member of.
  const { data, error } = await supabase
    .from('groups')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }
  return data;
};

const GroupsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: groups, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  });

  if (isLoading) return <div>Loading groups...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Groups</h1>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Group</DialogTitle>
              <DialogDescription>
                Groups allow you to share accounts and budgets with others.
              </DialogDescription>
            </DialogHeader>
            <AddGroupForm setOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </div>
      {groups && <DataTable columns={columns} data={groups} />}
    </div>
  );
};

export default GroupsPage;
