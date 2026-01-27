"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Edit2, Check } from "lucide-react"
import { useState } from "react"
import { Employee } from "@/lib/types"

interface EmployeeTableProps {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDelete: (id?: number) => void
}

export function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null)
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Salary (₳)</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Wallet Address</th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b border-border hover:bg-muted transition-colors">
              <td className="px-6 py-4 text-sm text-foreground">{employee.fullName}</td>
              <td className="px-6 py-4 text-sm text-muted-foreground">{employee.email}</td>
              <td className="px-6 py-4 text-sm text-foreground">{employee.salary?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              <td className="px-6 py-4 text-sm font-mono text-muted-foreground flex items-center gap-2">
                <span title={employee.walletAddress}>{employee.walletAddress.slice(0, 20)}...</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="p-1 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(employee.walletAddress)
                    setCopiedId(employee.id ?? null)
                    setTimeout(() => setCopiedId(null), 1200)
                  }}
                  title="Copy address"
                  style={{ cursor: 'pointer' }}
                >
                  {copiedId === employee.id ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><rect width="14" height="14" x="5" y="5" stroke="currentColor" strokeWidth="2" rx="2"/><path stroke="currentColor" strokeWidth="2" d="M7 3h10a2 2 0 0 1 2 2v10"/></svg>
                  )}
                </Button>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(employee)} className="cursor-pointer">
                    <Edit2 size={16} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(employee.id)} disabled={employee.id === undefined} className="cursor-pointer">
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
