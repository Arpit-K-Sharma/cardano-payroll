package org.example.cardanopayroll.scheduler;

import org.example.cardanopayroll.service.PayrollService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PayrollScheduler {

    private final PayrollService payrollService;

    public PayrollScheduler(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @Scheduled(cron = "0 0 10 1 * ?")
    public void runMonthlyPayroll() {
        System.out.println("Starting monthly payroll...");
        payrollService.processMonthlyPayroll();
        System.out.println("Payroll completed.");
    }
}
