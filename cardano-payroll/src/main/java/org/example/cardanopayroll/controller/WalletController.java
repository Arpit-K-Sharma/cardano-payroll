package org.example.cardanopayroll.controller;

import org.example.cardanopayroll.service.WalletService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/wallet/balance")
    public String getBalance(@RequestParam String address) {
        try {
            return walletService.getWalletBalance(address);
        } catch (IOException e) {
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/wallet/transactions")
    public String getTransactions(@RequestParam String address) {
        try {
            return walletService.getWalletTransactions(address);
        } catch (IOException e) {
            return "Error: " + e.getMessage();
        }
    }
}
