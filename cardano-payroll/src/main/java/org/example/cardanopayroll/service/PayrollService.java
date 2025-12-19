package org.example.cardanopayroll.service;
import org.example.cardanopayroll.model.Employee;
import org.example.cardanopayroll.model.PayrollTransaction;
import org.example.cardanopayroll.repository.EmployeeRepository;
import org.example.cardanopayroll.repository.PayrollTransactionRepository;
import org.example.cardanopayroll.utils.CardanoTxUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

        // Prepare batch transaction data
        Map<String, PayrollTransaction> txMap = new HashMap<>();
        StringBuilder paymentData = new StringBuilder();
        for (Employee emp : employees) {
            PayrollTransaction tx = new PayrollTransaction();
            tx.setEmployee(emp);
            tx.setWalletAddress(emp.getWalletAddress());
            tx.setAmount(emp.getSalary());
            tx.setTimestamp(LocalDateTime.now());
            tx.setStatus("PENDING");

            txMap.put(emp.getWalletAddress(), tx);

            if (!paymentData.isEmpty()) {
                paymentData.append(";");
            }
            paymentData.append(emp.getWalletAddress())
                    .append(",")
                    .append(emp.getSalary());

            System.out.println("Queued: " + emp.getSalary() + " ADA to " + emp.getWalletAddress());
        }

        System.out.println("Processing batch payment for " + employees.size() + " employees...");

        try {
            // Send all payments in one transaction
            String txHash = cardanoTxUtil.sendBatchADA(paymentData.toString());
            System.out.println("Batch transaction successful! TX Hash: " + txHash);

            // Update all transactions with success status
            for (PayrollTransaction tx : txMap.values()) {
                tx.setTxHash(txHash);
                tx.setStatus("SUCCESS");
                transactionRepository.save(tx);
            }
        }catch (Exception e) {
            System.out.println("Batch transaction failed: " + e.getMessage());

            // Mark all as failed
            for (PayrollTransaction tx : txMap.values()) {
                tx.setTxHash("FAILED");
                tx.setStatus("FAILED");
                transactionRepository.save(tx);
            }
        }
        }
    }


