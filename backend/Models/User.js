class User {
  constructor({ username, password, createdAt }) {
    this.username = username;
    this.password = password;
    this.createdAt = createdAt;
  }

  getUser() {
    // Logic to get a user from the database
  }

  createUser() {
    // Logic to create a new user in the database
  }

  updateUser() {
    // Logic to update a user in the database
  }

  deleteUser() {
    // Logic to delete a user from the database
  }

}

module.exports = User;