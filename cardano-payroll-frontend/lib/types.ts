export interface Employee {
  id?: number
  fullName: string
  phoneNumber: string
  address: string
  job: string
  salary: number
  walletAddress: string
  email: string
}

export interface PayrollTransaction {
  id?: number
  txHash?: string
  walletAddress: string
  amount: number
  timestamp?: string
  status: string
  employee: Employee
}

export interface PayrollSubmission {
  employeeId: number
  amount: number
  walletAddress: string
}
