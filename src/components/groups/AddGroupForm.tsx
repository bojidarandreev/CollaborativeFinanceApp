"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "../ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { Input } from "../ui/input"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "../../lib/supabaseClient"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Group name must be at least 2 characters.",
  }),
})

// When creating a group, we also need to add the creator as the owner in group_members
const addGroup = async (values: z.infer<typeof formSchema>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Use an RPC call to handle this transactionally
  const { error } = await supabase.rpc('create_group_and_add_owner', {
    group_name: values.name,
    owner_id: user.id
  });

  if (error) {
    throw new Error(error.message);
  }
};

export function AddGroupForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setOpen(false);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Family Finances" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Adding...' : 'Create Group'}
        </Button>
      </form>
    </Form>
  )
}
