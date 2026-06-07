package com.example.hebekery.dto.request;

public class AdminUserUpdateRequest {
    private String role;
    private Boolean active;
    private String newPassword;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}
