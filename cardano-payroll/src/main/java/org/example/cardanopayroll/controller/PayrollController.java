package org.example.cardanopayroll.controller;

import org.example.cardanopayroll.service.PayrollService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @GetMapping("/run-payroll")
    public String runPayroll() {
        payrollService.processMonthlyPayroll();
        return "Payroll triggered successfully!";
    }

    @PostMapping("/record-payroll")
    public ResponseEntity<String> recordPayroll(@RequestBody PayrollRecordRequest request) {
        try {
            payrollService.recordPayrollTransaction(
                request.getEmployees(),
                request.getTxHash(),
                request.getStatus()
            );
            return ResponseEntity.ok("Payroll transaction recorded successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to record payroll: " + e.getMessage());
        }
    }
}
