package org.example.cardanopayroll.service;

import org.example.cardanopayroll.model.Employee;
import org.example.cardanopayroll.repository.EmployeeRepository;
import org.example.cardanopayroll.repository.PayrollTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PayrollTransactionRepository transactionRepository;


    public EmployeeService(EmployeeRepository employeeRepository, PayrollTransactionRepository transactionRepository) {
        this.employeeRepository = employeeRepository;
        this.transactionRepository = transactionRepository;
    }

    public Employee createEmployee(Employee employee){
        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees(){
        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(Long id){
        return employeeRepository.findById(id);
    }

    public Employee updateEmployee(Long id, Employee employeeDetails){
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Employee not found with id "+ id));

        if (employeeDetails.getFullName() != null) {
            employee.setFullName(employeeDetails.getFullName());
        }

        if (employeeDetails.getJob() != null) {
            employee.setJob(employeeDetails.getJob());
        }

        if (employeeDetails.getSalary() != null) {
            employee.setSalary(employeeDetails.getSalary());
        }

        if (employeeDetails.getWalletAddress() != null) {
            employee.setWalletAddress(employeeDetails.getWalletAddress());
        }

        if (employeeDetails.getPhoneNumber() != null) {
            employee.setPhoneNumber(employeeDetails.getPhoneNumber());
        }

        if (employeeDetails.getEmail() != null) {
            employee.setEmail(employeeDetails.getEmail());
        }

        return employeeRepository.save(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id " + id));
        transactionRepository.deleteByEmployeeId(id);
        employeeRepository.delete(employee);
    }

}
