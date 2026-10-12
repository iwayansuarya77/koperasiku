import Map "mo:core/Map";
import Common "../types/common";
import SavingsTypes "../types/savings";
import AccountingTypes "../types/accounting";
import SavingsLib "../lib/savings";

mixin (
  savingsTypes : Map.Map<Common.SavingsId, SavingsTypes.SavingsType>,
  savingsTransactions : Map.Map<Common.SavingsId, SavingsTypes.SavingsTransaction>,
  savingsBalances : Map.Map<(Common.MemberId, Common.SavingsId), SavingsTypes.SavingsBalance>,
  savingsState : SavingsTypes.SavingsState,
  journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
  accountingState : AccountingTypes.AccountingState,
) {
  public shared ({ caller }) func createSavingsType(name : Text, interestRate : Float, cashAccountCode : Common.AccountCode) : async Common.Result<Common.SavingsId> {
    ignore caller;
    #ok(SavingsLib.createSavingsType(savingsTypes, savingsState, name, interestRate, cashAccountCode));
  };

  public shared ({ caller }) func updateSavingsType(savingsType : SavingsTypes.SavingsType) : async Common.Result<()> {
    ignore caller;
    SavingsLib.updateSavingsType(savingsTypes, savingsType);
  };

  public query ({ caller }) func listSavingsTypes() : async [SavingsTypes.SavingsType] {
    ignore caller;
    SavingsLib.listSavingsTypes(savingsTypes);
  };

  public shared ({ caller }) func recordSavingsTransaction(memberId : Common.MemberId, savingsTypeId : Common.SavingsId, cashAccountCode : Common.AccountCode, amount : Float, isDeposit : Bool) : async Common.Result<SavingsTypes.SavingsTransaction> {
    ignore caller;
    SavingsLib.recordTransaction(savingsTransactions, savingsBalances, journals, savingsState, accountingState, memberId, savingsTypeId, cashAccountCode, amount, isDeposit);
  };

  public query ({ caller }) func getSavingsBalance(memberId : Common.MemberId, savingsTypeId : Common.SavingsId) : async Float {
    ignore caller;
    SavingsLib.getBalance(savingsBalances, memberId, savingsTypeId);
  };

  public query ({ caller }) func listSavingsTransactions(memberId : Common.MemberId) : async [SavingsTypes.SavingsTransaction] {
    ignore caller;
    SavingsLib.listTransactions(savingsTransactions, memberId);
  };

  public query ({ caller }) func listSavingsBalances(memberId : Common.MemberId) : async [SavingsTypes.SavingsBalance] {
    ignore caller;
    SavingsLib.listBalances(savingsBalances, memberId);
  };

  public shared ({ caller }) func importInitialSavingsBalances(rows : [(Common.MemberId, Common.SavingsId, Float)]) : async Common.Result<Nat> {
    ignore caller;
    SavingsLib.importInitialBalances(savingsBalances, rows);
  };

  public shared ({ caller }) func postMonthlySavingsInterest() : async Common.Result<Nat> {
    ignore caller;
    SavingsLib.postMonthlyInterest(savingsTypes, savingsBalances, savingsTransactions, journals, savingsState, accountingState);
  };
};
