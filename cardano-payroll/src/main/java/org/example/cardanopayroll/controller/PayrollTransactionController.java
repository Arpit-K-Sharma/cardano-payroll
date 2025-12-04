package org.example.cardanopayroll.controller;

import org.example.cardanopayroll.repository.PayrollTransactionRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class PayrollTransactionController {

    private final PayrollTransactionRepository repository;

    public PayrollTransactionController(PayrollTransactionRepository repository) {
        this.repository = repository;
    }

    // All transactions
    @GetMapping
    public Object all() {
        return repository.findAll();
    }

    // Transactions for one employee
    @GetMapping("/{employeeId}")
    public Object byEmployee(@PathVariable Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }
}
