package com.hospital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hospital.entity.Account;
import com.hospital.repository.AccountRepository;

@Service
public class AccountService {

    @Autowired
    private AccountRepository repo;

    public List<Account> findAll() {
        return repo.findAll();
    }

    public Optional<Account> findById(Integer id) {
        return repo.findById(id);
    }

    public Account save(Account account) {
        return repo.save(account);
    }

    public void deleteById(Integer id) {
        repo.deleteById(id);
    }

    public Optional<Account> findByUsername(String username) {
        return repo.findByUsername(username);
    }
}
