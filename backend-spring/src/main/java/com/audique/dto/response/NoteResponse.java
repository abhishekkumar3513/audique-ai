package com.audique.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponse {
    private UUID id;
    private String heading;
    private String content;
    private Integer displayOrder;
    private Instant createdAt;
    private Instant updatedAt;
}

