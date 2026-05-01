package org.moseti.kedevsapi.forum.repository;

import org.moseti.kedevsapi.forum.entity.ForumComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ForumCommentRepository extends JpaRepository<ForumComment, UUID> {

    Page<ForumComment> findByJobIdAndParentCommentIdIsNullAndIsHiddenFalse(UUID jobId, Pageable pageable);

    Page<ForumComment> findByParentCommentIdAndIsHiddenFalse(UUID parentCommentId, Pageable pageable);

    Page<ForumComment> findByJobIdAndParentCommentIdIsNullAndIsHiddenFalseOrderByUpvoteCountDesc(UUID jobId, Pageable pageable);

    Page<ForumComment> findByAuthorId(UUID authorId, Pageable pageable);

    int countByJobIdAndIsHiddenFalse(UUID jobId);

    int countByParentCommentIdAndIsHiddenFalse(UUID parentCommentId);

    Optional<ForumComment> findByIdAndAuthorId(UUID id, UUID authorId);
}
