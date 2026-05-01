package org.moseti.kedevsapi.forum.repository;

import org.moseti.kedevsapi.forum.entity.CommentFlag;
import org.moseti.kedevsapi.shared.enums.CommentFlagStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentFlagRepository extends JpaRepository<CommentFlag, UUID> {

    List<CommentFlag> findByCommentId(UUID commentId);

    boolean existsByCommentIdAndFlaggedById(UUID commentId, UUID flaggedById);

    Page<CommentFlag> findByStatus(CommentFlagStatus status, Pageable pageable);

    int countByCommentIdAndStatus(UUID commentId, CommentFlagStatus status);
}
