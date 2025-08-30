"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Group } from "../../types"
import { MoreHorizontal } from "lucide-react"
import { Button } from "../ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "../ui/dropdown-menu"

export const columns: ColumnDef<Group>[] = [
  {
    accessorKey: "name",
    header: "Group Name",
  },
  {
    // In a real app, we'd show member avatars or count here
    header: "Members",
    cell: () => {
        return "..."
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Manage Members</DropdownMenuItem>
            <DropdownMenuItem>Edit Group</DropdownMenuItem>
            <DropdownMenuItem>Delete Group</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
