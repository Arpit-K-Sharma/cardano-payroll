package org.example.cardanopayroll.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class PayrollTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String txHash;

    private String walletAddress;

    private Double amount;

    private LocalDateTime timestamp;

    private String status;

    @ManyToOne
    private Employee employee;

}
