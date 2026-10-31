package com.audique.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateLectureRequest {

    @NotBlank(message = "Title must not be blank")
    @Size(max = 500, message = "Title must not exceed 500 characters")
    private String title;
}
