"use client"

import React, { useState, useEffect } from 'react';
import * as Papa from 'papaparse';
import * as XLSX from 'exceljs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { Category } from '../../types';

interface FileImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

const REQUIRED_FIELDS = ["date", "description", "amount"];

const FileImportDialog: React.FC<FileImportDialogProps> = ({ isOpen, onClose, file }) => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch categories for the default category selector
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw new Error(error.message);
        return data || [];
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: { transactions: any[], categoryId: string | null }) => {
      const { transactions, categoryId } = data;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const transactionsToInsert = transactions.map(t => ({
        ...t,
        user_id: user.id,
        account_id: 'placeholder-account-id', // TODO: Need to let user select an account
        category_id: categoryId === 'none' ? null : categoryId,
      }));

      const { error } = await supabase.from('transactions').insert(transactionsToInsert);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onClose();
    },
    onError: (error) => {
      alert(`Error importing transactions: ${error.message}`);
    }
  });

  const handleMappingChange = (appField: string, fileHeader: string) => {
    setMapping(prev => ({ ...prev, [appField]: fileHeader }));
  };

  const handleImport = () => {
    const transformedData = data.map(row => ({
      date: row[mapping.date],
      description: row[mapping.description],
      amount: parseFloat(row[mapping.amount]),
    }));
    // TODO: Add validation
    mutation.mutate({ transactions: transformedData, categoryId: selectedCategoryId });
  }

  useEffect(() => {
    if (file) {
      parseFile(file);
    }
  }, [file]);

  const parseFile = async (file: File) => {
    const reader = new FileReader();
    if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            setHeaders(result.meta.fields || []);
            setData(result.data);
          },
        });
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx')) {
        const workbook = new XLSX.Workbook();
        const buffer = await file.arrayBuffer();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        const jsonData: any[] = [];
        const headerRow = worksheet.getRow(1).values as string[];
        setHeaders(headerRow.filter(h => h)); // Filter out empty header cells

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                let rowData: any = {};
                row.eachCell((cell, colNumber) => {
                    rowData[headerRow[colNumber]] = cell.value;
                });
                jsonData.push(rowData);
            }
        });
        setData(jsonData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Map the columns from your file to the required transaction fields.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Column Mapping UI */}
            <div className="space-y-4">
                <h3 className="font-bold mb-2">Map Columns</h3>
                <p className="text-sm text-gray-500">Select which columns from your file correspond to our fields.</p>

                {REQUIRED_FIELDS.map(field => (
                    <div key={field} className="flex items-center justify-between">
                        <span className="font-semibold capitalize">{field}</span>
                        <Select onValueChange={(value) => handleMappingChange(field, value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select column..." />
                            </SelectTrigger>
                            <SelectContent>
                                {headers.map(header => (
                                    <SelectItem key={header} value={header}>{header}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ))}

                <div className="flex items-center justify-between">
                    <span className="font-semibold">Default Category</span>
                    <Select onValueChange={(value) => setSelectedCategoryId(value)} disabled={isLoadingCategories}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {categories?.map(category => (
                                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Data Preview Table */}
            <div>
                <h3 className="font-bold mb-2">Data Preview</h3>
                <div className="overflow-auto h-64 border rounded-md">
                    {/* A simple table to preview first 5 rows */}
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                {headers.map(h => <th key={h} className="p-2 border-b text-left">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 5).map((row, i) => (
                                <tr key={i} className="border-b">
                                    {headers.map(h => <td key={h} className="p-2">{row[h]}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleImport} disabled={mutation.isPending}>
                {mutation.isPending ? 'Importing...' : `Import ${data.length} Transactions`}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileImportDialog;
