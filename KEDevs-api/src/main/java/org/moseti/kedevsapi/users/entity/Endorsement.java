package org.moseti.kedevsapi.users.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.moseti.kedevsapi.shared.entity.BaseEntity;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "endorsements")
public class Endorsement extends BaseEntity {

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", insertable = false, updatable = false)
    private DeveloperProfile recipient;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", insertable = false, updatable = false)
    private User author;

    @Column(nullable = false, length = 200)
    private String content;
}
