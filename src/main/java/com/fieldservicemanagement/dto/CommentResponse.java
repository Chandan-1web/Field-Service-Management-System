package com.fieldservicemanagement.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class CommentResponse {

    private Long id;

    private String authorName;

    private String authorRole;

    private String comment;

    private LocalDateTime createdAt;
}