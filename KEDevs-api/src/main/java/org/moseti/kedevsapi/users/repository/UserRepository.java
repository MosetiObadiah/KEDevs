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

    long countByRole(Role role);

    long countByCreatedAtAfter(java.time.LocalDateTime since);

    long countByRoleAndCreatedAtAfter(Role role, java.time.LocalDateTime since);

    @org.springframework.data.jpa.repository.Query("SELECT CAST(u.createdAt AS DATE) as signupDate, " +
            "COUNT(u) as total, " +
            "SUM(CASE WHEN u.role = 'DEVELOPER' THEN 1 ELSE 0 END), " +
            "SUM(CASE WHEN u.role = 'EMPLOYER' THEN 1 ELSE 0 END) " +
            "FROM User u WHERE u.createdAt >= :since " +
            "GROUP BY CAST(u.createdAt AS DATE) ORDER BY signupDate ASC")
    List<Object[]> findSignupTrends(@org.springframework.data.repository.query.Param("since") java.time.LocalDateTime since);
}

