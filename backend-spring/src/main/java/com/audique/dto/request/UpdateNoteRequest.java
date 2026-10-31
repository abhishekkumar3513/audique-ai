package com.audique.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNoteRequest {

    @Size(max = 500, message = "Heading must not exceed 500 characters")
    private String heading;

    @NotBlank(message = "Content must not be blank")
    private String content;
}
