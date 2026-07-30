package com.fieldservicemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SiteResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String name;
    private String address;
}