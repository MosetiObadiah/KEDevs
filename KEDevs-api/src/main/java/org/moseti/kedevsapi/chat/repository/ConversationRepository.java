package org.moseti.kedevsapi.chat.repository;

import org.moseti.kedevsapi.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    Optional<Conversation> findByContactRequestId(UUID contactRequestId);

    @Query("SELECT c FROM Conversation c " +
           "JOIN FETCH c.contactRequest cr " +
           "JOIN FETCH cr.senderUser su " +
           "JOIN FETCH cr.developerProfile dp " +
           "WHERE cr.senderUserId = :userId OR dp.userId = :userId " +
           "ORDER BY c.updatedAt DESC")
    List<Conversation> findAllByUserIdOrderByUpdatedAtDesc(@Param("userId") UUID userId);
}
