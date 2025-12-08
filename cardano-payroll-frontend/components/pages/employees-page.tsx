"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmployeeForm } from "@/components/forms/employee-form"
import { EmployeeTable } from "@/components/tables/employee-table"
import { Employee } from "@/lib/types"
import { Plus } from "lucide-react"

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8080/api/getAllEmployees")
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveEmployee = async (formData: any) => {
    try {
      if (editingEmployee) {
        const response = await fetch(`http://localhost:8080/api/updateEmployee/${editingEmployee.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (response.ok) {
          setEditingEmployee(null)
          fetchEmployees()
        }
      } else {
        const response = await fetch("http://localhost:8080/api/createEmployee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        if (response.ok) {
          setShowForm(false)
          fetchEmployees()
        }
      }
    } catch (error) {
      console.error("Error saving employee:", error)
    }
  }

  const handleDeleteEmployee = async (id?: number) => {
    if (id === undefined) {
      console.error("Cannot delete employee without a valid id")
      return
    }
    try {
      const response = await fetch(`http://localhost:8080/api/deleteEmployee/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchEmployees()
      }
    } catch (error) {
      console.error("Error deleting employee:", error)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Employees</h2>
          <p className="text-muted-foreground">Manage your organization's employees</p>
        </div>
        <Button
          onClick={() => {
            setEditingEmployee(null)
            setShowForm(!showForm)
          }}
          className="gap-2"
        >
          <Plus size={20} />
          Add Employee
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-8">
          <EmployeeForm
            employee={editingEmployee || undefined}
            onSubmit={handleSaveEmployee}
            onCancel={() => {
              setShowForm(false)
              setEditingEmployee(null)
            }}
          />
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      ) : (
        <Card>
          <EmployeeTable
            employees={employees}
            onEdit={(employee) => {
              setEditingEmployee(employee)
              setShowForm(true)
            }}
            onDelete={handleDeleteEmployee}
          />
        </Card>
      )}
    </div>
  )
}
