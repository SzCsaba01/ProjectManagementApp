class LoginResponseDTO {
    constructor(
        userId,
        username,
        email,
        firstName,
        lastName,
        avatar,
        roles,
        permissions,
        selectedProjectId,
    ) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.avatar = avatar;
        this.roles = roles;
        this.permissions = permissions;
        this.selectedProjectId = selectedProjectId;
    }
}

export default LoginResponseDTO;
