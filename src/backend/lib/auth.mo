import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Common "../types/common";
import AuthTypes "../types/auth";

module {
  // Deterministic salted hash. Not cryptographic, but stable and sufficient
  // for the cooperative's internal login.
  public func hashPassword(password : Text) : Text {
    let salt = "koperasi::v1::";
    let combined = salt.concat(password);
    var h : Nat = 5381;
    for (c in combined.toIter()) {
      h := (h * 33 + c.toNat32().toNat()) % 1_000_000_007;
    };
    h.toText();
  };

  public func verifyPassword(password : Text, passwordHash : Text) : Bool {
    hashPassword(password) == passwordHash;
  };

  public func createUser(
    users : Map.Map<Common.UserId, AuthTypes.UserAccount>,
    state : AuthTypes.AuthState,
    username : Text,
    password : Text,
    role : Common.Role,
  ) : Common.UserId {
    let id = state.nextUserId;
    state.nextUserId := id + 1;
    users.add(id, {
      id;
      username;
      passwordHash = hashPassword(password);
      role;
      isActive = true;
      createdAt = Time.now().toNat();
    });
    id;
  };

  public func findByUsername(
    users : Map.Map<Common.UserId, AuthTypes.UserAccount>,
    username : Text,
  ) : ?AuthTypes.UserAccount {
    var found : ?AuthTypes.UserAccount = null;
    for (u in users.values()) {
      if (u.username == username) {
        found := ?u;
      };
    };
    found;
  };

  public func login(
    users : Map.Map<Common.UserId, AuthTypes.UserAccount>,
    state : AuthTypes.AuthState,
    username : Text,
    password : Text,
  ) : Common.Result<AuthTypes.UserAccountView> {
    switch (findByUsername(users, username)) {
      case null { #err("Username tidak ditemukan") };
      case (?user) {
        if (not user.isActive) {
          return #err("Akun tidak aktif");
        };
        if (not verifyPassword(password, user.passwordHash)) {
          return #err("Password salah");
        };
        state.currentSession := ?user.id;
        #ok(toView(user));
      };
    };
  };

  public func changePassword(
    users : Map.Map<Common.UserId, AuthTypes.UserAccount>,
    userId : Common.UserId,
    oldPassword : Text,
    newPassword : Text,
  ) : Common.Result<()> {
    switch (users.get(userId)) {
      case null { #err("Akun tidak ditemukan") };
      case (?user) {
        if (not verifyPassword(oldPassword, user.passwordHash)) {
          return #err("Password lama salah");
        };
        users.add(userId, {
          id = user.id;
          username = user.username;
          passwordHash = hashPassword(newPassword);
          role = user.role;
          isActive = user.isActive;
          createdAt = user.createdAt;
        });
        #ok(());
      };
    };
  };

  public func listUsers(
    users : Map.Map<Common.UserId, AuthTypes.UserAccount>,
  ) : [AuthTypes.UserAccountView] {
    let result = List.empty<AuthTypes.UserAccountView>();
    for (u in users.values()) {
      result.add(toView(u));
    };
    result.toArray();
  };

  public func toView(user : AuthTypes.UserAccount) : AuthTypes.UserAccountView {
    {
      id = user.id;
      username = user.username;
      role = user.role;
      isActive = user.isActive;
      createdAt = user.createdAt;
    };
  };
};
