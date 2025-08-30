"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "../ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
    message: "Account name must be at least 2 characters.",
  }),
  institution: z.string().optional(),
  currency: z.string().length(3, {
    message: "Currency must be a 3-letter code (e.g., USD).",
  }),
  type: z.string().optional(),
})

const addAccount = async (values: z.infer<typeof formSchema>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase.from('accounts').insert({ ...values, user_id: user.id });
  if (error) {
    throw new Error(error.message);
  }
};

export function AddAccountForm({ setOpen }: { setOpen: (open: boolean) => void }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addAccount,
    onSuccess: () => {
      // Invalidate and refetch the accounts query
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      console.log("Account added successfully!");
      setOpen(false); // Close the dialog on success
    },
    onError: (error) => {
        console.error("Error adding account:", error.message);
        // Here you could show an error message to the user
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      institution: "",
      currency: "USD",
      type: "checking",
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
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chase Checking" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="institution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institution</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chase Bank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <Input placeholder="e.g., USD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Checking" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Adding...' : 'Add Account'}
        </Button>
      </form>
    </Form>
  )
}
