package com.fieldservicemanagement.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SiteRequest {
    private Long customerId;
    private String name;
    private String address;
}