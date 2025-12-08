"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PayrollSubmission } from "@/lib/types"

interface PayrollFormProps {
  onSubmit: (data: PayrollSubmission) => void
  onCancel: () => void
}

export function PayrollForm({ onSubmit, onCancel }: PayrollFormProps) {
  const [formData, setFormData] = useState<PayrollSubmission>({
    employeeId: 0,
    amount: 0,
    walletAddress: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({ employeeId: 0, amount: 0, walletAddress: "" })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Process Payroll</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Employee ID</label>
          <Input
            type="number"
            required
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: parseInt(e.target.value) || 0 })}
            placeholder="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Amount (ADA)</label>
          <Input
            type="number"
            step="0.01"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            placeholder="250.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Wallet Address</label>
          <Input
            required
            value={formData.walletAddress}
            onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
            placeholder="addr1..."
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Process Payment
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
      </div>
    </form>
  )
}
