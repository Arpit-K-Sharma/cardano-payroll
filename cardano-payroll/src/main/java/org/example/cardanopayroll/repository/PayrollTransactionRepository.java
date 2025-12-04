package org.example.cardanopayroll.repository;

import org.example.cardanopayroll.model.PayrollTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PayrollTransactionRepository extends JpaRepository<PayrollTransaction, Long> {
    List<PayrollTransaction> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
