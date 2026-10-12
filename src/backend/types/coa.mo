import Common "../types/common";

module {
  public type Account = {
    code : Common.AccountCode;
    name : Text;
    accountType : Common.AccountType;
    isActive : Bool;
  };

  public type CoaState = {
    var nextAccountCode : Nat;
  };
};
