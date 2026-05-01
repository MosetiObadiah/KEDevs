package org.moseti.kedevsapi.forum.repository;

import org.moseti.kedevsapi.forum.entity.CommentVote;
import org.moseti.kedevsapi.shared.enums.VoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentVoteRepository extends JpaRepository<CommentVote, UUID> {

    Optional<CommentVote> findByCommentIdAndUserId(UUID commentId, UUID userId);

    boolean existsByCommentIdAndUserId(UUID commentId, UUID userId);

    int countByCommentIdAndVoteType(UUID commentId, VoteType voteType);
}
