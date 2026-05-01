package org.moseti.kedevsapi.payments.repository;

import org.moseti.kedevsapi.payments.entity.SearchToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SearchTokenRepository extends JpaRepository<SearchToken, UUID> {

    @Query("SELECT t FROM SearchToken t WHERE t.employerId = :employerId AND t.usedCount < t.totalUses ORDER BY t.createdAt ASC")
    List<SearchToken> findByEmployerIdAndUsedCountLessThanTotalUses(@Param("employerId") UUID employerId);

    @Query("SELECT COUNT(t) FROM SearchToken t WHERE t.employerId = :employerId AND t.usedCount < t.totalUses")
    int countByEmployerIdAndUsedCountLessThanTotalUses(@Param("employerId") UUID employerId);
}
