import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Common "../types/common";
import CoaTypes "../types/coa";

module {
  func typePrefix(accountType : Common.AccountType) : Text {
    switch (accountType) {
      case (#asset) { "1" };
      case (#liability) { "2" };
      case (#equity) { "3" };
      case (#revenue) { "4" };
      case (#expense) { "5" };
    };
  };

  public func createAccount(
    accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
    state : CoaTypes.CoaState,
    name : Text,
    accountType : Common.AccountType,
  ) : Common.AccountCode {
    let seq = state.nextAccountCode;
    state.nextAccountCode := seq + 1;
    let code = typePrefix(accountType).concat(seq.toText());
    accounts.add(code, { code; name; accountType; isActive = true });
    code;
  };

  public func updateAccount(
    accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
    account : CoaTypes.Account,
  ) : Common.Result<()> {
    switch (accounts.get(account.code)) {
      case null { #err("Akun tidak ditemukan") };
      case (?_) {
        accounts.add(account.code, account);
        #ok(());
      };
    };
  };

  public func deleteAccount(
    accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
    code : Common.AccountCode,
  ) : Common.Result<()> {
    switch (accounts.get(code)) {
      case null { #err("Akun tidak ditemukan") };
      case (?_) {
        accounts.remove(code);
        #ok(());
      };
    };
  };

  public func getAccount(
    accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
    code : Common.AccountCode,
  ) : ?CoaTypes.Account {
    accounts.get(code);
  };

  public func listAccounts(
    accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
  ) : [CoaTypes.Account] {
    let result = List.empty<CoaTypes.Account>();
    for (a in accounts.values()) {
      result.add(a);
    };
    result.toArray();
  };
};
