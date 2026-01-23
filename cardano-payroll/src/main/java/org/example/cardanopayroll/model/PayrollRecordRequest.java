package org.example.cardanopayroll.dto;

import org.example.cardanopayroll.model.Employee;

import java.util.List;

public class PayrollRecordRequest {
    private List<Employee> employees;
    private String txHash;
    private String status;

    public PayrollRecordRequest() {
    }

    public PayrollRecordRequest(List<Employee> employees, String txHash, String status) {
        this.employees = employees;
        this.txHash = txHash;
        this.status = status;
    }

    public List<Employee> getEmployees() {
        return employees;
    }

    public void setEmployees(List<Employee> employees) {
        this.employees = employees;
    }

    public String getTxHash() {
        return txHash;
    }

    public void setTxHash(String txHash) {
        this.txHash = txHash;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}