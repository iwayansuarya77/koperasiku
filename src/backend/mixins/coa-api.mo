import Map "mo:core/Map";
import Common "../types/common";
import CoaTypes "../types/coa";
import CoaLib "../lib/coa";

mixin (
  accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
  coaState : CoaTypes.CoaState,
) {
  public shared ({ caller }) func createAccount(name : Text, accountType : Common.AccountType) : async Common.Result<Common.AccountCode> {
    ignore caller;
    #ok(CoaLib.createAccount(accounts, coaState, name, accountType));
  };

  public shared ({ caller }) func updateAccount(account : CoaTypes.Account) : async Common.Result<()> {
    ignore caller;
    CoaLib.updateAccount(accounts, account);
  };

  public shared ({ caller }) func deleteAccount(code : Common.AccountCode) : async Common.Result<()> {
    ignore caller;
    CoaLib.deleteAccount(accounts, code);
  };

  public query ({ caller }) func getAccount(code : Common.AccountCode) : async ?CoaTypes.Account {
    ignore caller;
    CoaLib.getAccount(accounts, code);
  };

  public query ({ caller }) func listAccounts() : async [CoaTypes.Account] {
    ignore caller;
    CoaLib.listAccounts(accounts);
  };
};
