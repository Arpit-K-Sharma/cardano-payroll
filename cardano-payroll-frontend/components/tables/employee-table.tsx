"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Edit2 } from "lucide-react"
import { Employee } from "@/lib/types"

interface EmployeeTableProps {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDelete: (id?: number) => void
}

export function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Wallet Address</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b border-border hover:bg-muted transition-colors">
              <td className="px-6 py-4 text-sm text-foreground">{employee.fullName}</td>
              <td className="px-6 py-4 text-sm text-muted-foreground">{employee.email}</td>
              <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                {employee.walletAddress.slice(0, 20)}...
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(employee)}>
                    <Edit2 size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(employee.id)} disabled={employee.id === undefined}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
