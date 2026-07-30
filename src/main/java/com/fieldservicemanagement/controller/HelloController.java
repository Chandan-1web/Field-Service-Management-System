package com.fieldservicemanagement.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class HelloController {

    @GetMapping("/")
    public String home() {
        return "index"; // looks for templates/index.html
    }

   @GetMapping("/api/test/protected")
@ResponseBody
public String protectedRoute() {
    return "You are authenticated! This is a protected endpoint.";
}

@GetMapping("/api/test/manager-only")
@ResponseBody
@org.springframework.security.access.prepost.PreAuthorize("hasRole('MANAGER')")
public String managerOnlyRoute() {
    return "Welcome Manager! This route is restricted to MANAGER role only.";
}
}