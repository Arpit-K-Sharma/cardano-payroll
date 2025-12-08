"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Employee } from "@/lib/types"

interface EmployeeFormProps {
  employee?: Employee
  onSubmit: (data: Employee) => void
  onCancel: () => void
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState<Employee>({
    fullName: employee?.fullName || "",
    phoneNumber: employee?.phoneNumber || "",
    address: employee?.address || "",
    job: employee?.job || "",
    salary: employee?.salary || 0,
    walletAddress: employee?.walletAddress || "",
    email: employee?.email || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{employee ? "Edit Employee" : "Create New Employee"}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
          <Input
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
          <Input
            required
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="+1 234 567 8900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Address</label>
          <Input
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main St, City, State"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Job Title</label>
          <Input
            required
            value={formData.job}
            onChange={(e) => setFormData({ ...formData, job: e.target.value })}
            placeholder="Software Engineer"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Salary</label>
          <Input
            type="number"
            step="0.01"
            required
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
            placeholder="50000.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          <Input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Cardano Wallet Address</label>
        <Input
          required
          value={formData.walletAddress}
          onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
          placeholder="addr1..."
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {employee ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
      </div>
    </form>
  )
}
