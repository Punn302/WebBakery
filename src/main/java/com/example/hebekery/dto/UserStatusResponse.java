package com.example.hebekery.dto;

public class UserStatusResponse {
    private boolean loggedIn;
    private UserResponse user;

    public UserStatusResponse() {
    }

    public UserStatusResponse(boolean loggedIn, UserResponse user) {
        this.loggedIn = loggedIn;
        this.user = user;
    }

    public boolean isLoggedIn() {
        return loggedIn;
    }

    public void setLoggedIn(boolean loggedIn) {
        this.loggedIn = loggedIn;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }
}
