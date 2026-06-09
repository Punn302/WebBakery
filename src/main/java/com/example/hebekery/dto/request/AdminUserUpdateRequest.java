package com.example.hebekery.dto.request;

public class AdminUserUpdateRequest {
    private String role;
    private Boolean active;
    private Boolean resetDefaultPassword;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Boolean getResetDefaultPassword() { return resetDefaultPassword; }
    public void setResetDefaultPassword(Boolean resetDefaultPassword) { this.resetDefaultPassword = resetDefaultPassword; }
}
