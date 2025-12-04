package org.example.cardanopayroll;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CardanoPayrollApplication {

	public static void main(String[] args) {
		SpringApplication.run(CardanoPayrollApplication.class, args);
	}

}
