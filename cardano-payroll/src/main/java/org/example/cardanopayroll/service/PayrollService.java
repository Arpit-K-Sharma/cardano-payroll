package org.example.cardanopayroll.service;
import org.example.cardanopayroll.model.Employee;
import org.example.cardanopayroll.model.PayrollTransaction;
import org.example.cardanopayroll.repository.EmployeeRepository;
import org.example.cardanopayroll.repository.PayrollTransactionRepository;
import org.example.cardanopayroll.utils.CardanoTxUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PayrollService {

    private final EmployeeRepository employeeRepository;
    private final CardanoTxUtil cardanoTxUtil;

    private final PayrollTransactionRepository transactionRepository;


    public PayrollService(EmployeeRepository employeeRepository, CardanoTxUtil cardanoTxUtil, PayrollTransactionRepository transactionRepository) {
        this.employeeRepository = employeeRepository;
        this.cardanoTxUtil = cardanoTxUtil;
        this.transactionRepository = transactionRepository;
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public void processMonthlyPayroll() {
        List<Employee> employees = getAllEmployees();
        for (Employee emp : employees) {
            PayrollTransaction tx = new PayrollTransaction();
            tx.setEmployee(emp);
            tx.setWalletAddress(emp.getWalletAddress());
            tx.setAmount(emp.getSalary());
            tx.setTimestamp(LocalDateTime.now());

            System.out.println("Sending " + emp.getSalary() + " ADA to " + emp.getWalletAddress());
            try {
                String txHash = cardanoTxUtil.sendADA(emp.getWalletAddress(), emp.getSalary());
                System.out.println("Transaction successful! TX Hash: " + txHash);
                tx.setTxHash(txHash);
                tx.setStatus("SUCCESS");
            } catch (Exception e) {
                tx.setTxHash("FAILED");
                tx.setStatus("FAILED");
                System.out.println("Transaction failed for " + emp.getFullName() + ": " + e.getMessage());
            }
            transactionRepository.save(tx);
        }
    }


}
