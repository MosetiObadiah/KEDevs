package org.moseti.kedevsapi.users.repository;

import org.moseti.kedevsapi.shared.enums.Role;
import org.moseti.kedevsapi.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByGoogleId(String googleId);
    
    boolean existsByEmail(String email);

    List<User> findByRole(Role role);
}

