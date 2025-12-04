package org.example.cardanopayroll.controller;

import org.example.cardanopayroll.service.PayrollService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
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
}
