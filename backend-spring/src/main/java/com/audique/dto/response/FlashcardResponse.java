package com.audique.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class FlashcardResponse {
    private UUID id;
    private String question;
    private String answer;
    private Integer displayOrder;
    private Instant createdAt;
    private Instant updatedAt;

    @JsonProperty("front")
    public String getFront() {
        return question;
    }

    @JsonProperty("back")
    public String getBack() {
        return answer;
    }
}

