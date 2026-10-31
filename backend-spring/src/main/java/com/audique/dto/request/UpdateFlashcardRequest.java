package com.audique.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFlashcardRequest {

    @NotBlank(message = "Question must not be blank")
    private String question;

    @NotBlank(message = "Answer must not be blank")
    private String answer;
}
