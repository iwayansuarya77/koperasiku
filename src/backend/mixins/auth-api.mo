import Map "mo:core/Map";
import Common "../types/common";
import AuthTypes "../types/auth";
import AuthLib "../lib/auth";

mixin (
  users : Map.Map<Common.UserId, AuthTypes.UserAccount>,
  authState : AuthTypes.AuthState,
) {
  // The current session is the only source of the caller's cooperative role.
  func isAdminSession() : Bool {
    switch (authState.currentSession) {
      case null { false };
      case (?userId) {
        switch (users.get(userId)) {
          case null { false };
          case (?user) { user.role == #admin };
        };
      };
    };
  };

  public shared ({ caller }) func login(username : Text, password : Text) : async Common.Result<AuthTypes.UserAccountView> {
    ignore caller;
    AuthLib.login(users, authState, username, password);
  };

  public shared ({ caller }) func logout() : async () {
    ignore caller;
    authState.currentSession := null;
  };

  public shared ({ caller }) func changeOwnPassword(oldPassword : Text, newPassword : Text) : async Common.Result<()> {
    switch (authState.currentSession) {
      case null { #err("Belum login") };
      case (?userId) { AuthLib.changePassword(users, userId, oldPassword, newPassword) };
    };
  };

  public shared ({ caller }) func createUserAccount(username : Text, password : Text, role : Common.Role) : async Common.Result<Common.UserId> {
    ignore caller;
    if (not isAdminSession()) {
      return #err("Hanya admin yang dapat membuat akun");
    };
    switch (AuthLib.findByUsername(users, username)) {
      case (?_) { #err("Username sudah digunakan") };
      case null { #ok(AuthLib.createUser(users, authState, username, password, role)) };
    };
  };

  public shared ({ caller }) func assignUserRole(userId : Common.UserId, role : Common.Role) : async Common.Result<()> {
    ignore caller;
    if (not isAdminSession()) {
      return #err("Hanya admin yang dapat mengubah hak akses");
    };
    switch (users.get(userId)) {
      case null { #err("Akun tidak ditemukan") };
      case (?user) {
        users.add(userId, {
          id = user.id;
          username = user.username;
          passwordHash = user.passwordHash;
          role;
          isActive = user.isActive;
          createdAt = user.createdAt;
        });
        #ok(());
      };
    };
  };

  public query ({ caller }) func listUserAccounts() : async [AuthTypes.UserAccountView] {
    ignore caller;
    AuthLib.listUsers(users);
  };

  public query ({ caller }) func getCallerRole() : async ?Common.Role {
    ignore caller;
    switch (authState.currentSession) {
      case null { null };
      case (?userId) {
        switch (users.get(userId)) {
          case null { null };
          case (?user) { ?user.role };
        };
      };
    };
  };
};
