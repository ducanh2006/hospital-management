package com.hospital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hospital.entity.Account;
import com.hospital.repository.AccountRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class AccountService {

    @Autowired
    private AccountRepository repo;

    public List<Account> findAll() {
        return repo.findAll();
    }

    public Optional<Account> findById(Integer id) {
        if(id == null){
            throw new IllegalArgumentException("Account id must not be null");
        }
        return repo.findById(id);
    }

    public Account save(Account account) {
         if (account == null) {
            throw new IllegalArgumentException("Account must not be null");
        }
        return repo.save(account);
    }

    public void deleteById(Integer id) {
         if (id == null) {
            throw new IllegalArgumentException("Account id must not be null");
        }
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Account not found with id=" + id);
        }
        repo.deleteById(id);
    }

    public Optional<Account> findByUsername(String username) {
        return repo.findByUsername(username);
    }
}
