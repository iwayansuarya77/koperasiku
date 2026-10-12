import Common "../types/common";

module {
  public type UserAccount = {
    id : Common.UserId;
    username : Text;
    passwordHash : Text;
    role : Common.Role;
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type UserAccountView = {
    id : Common.UserId;
    username : Text;
    role : Common.Role;
    isActive : Bool;
    createdAt : Common.Timestamp;
  };

  public type AuthState = {
    var nextUserId : Common.UserId;
    var currentSession : ?Common.UserId;
  };
};
