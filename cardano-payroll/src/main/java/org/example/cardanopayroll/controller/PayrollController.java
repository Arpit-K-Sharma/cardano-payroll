package org.example.cardanopayroll.controller;

import org.example.cardanopayroll.service.PayrollService;
import org.springframework.web.bind.annotation.*;
import org.example.cardanopayroll.model.SignedTxRequest;

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




    @PostMapping("/run-wallet-payroll")
    public String runWalletPayroll(@RequestBody SignedTxRequest request) {
        payrollService.processWalletPayroll(request.getSignedTxCbor());
        return "Payroll submitted successfully";
    }




}
