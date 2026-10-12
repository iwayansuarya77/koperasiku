import Map "mo:core/Map";
import Common "../types/common";
import AccountingTypes "../types/accounting";
import CoaTypes "../types/coa";
import AccountingLib "../lib/accounting";

mixin (
  journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
  accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
  accountingState : AccountingTypes.AccountingState,
) {
  public shared ({ caller }) func postManualJournal(description : Text, lines : [AccountingTypes.JournalLine]) : async Common.Result<Common.JournalId> {
    ignore caller;
    AccountingLib.postManualJournal(journals, accountingState, description, lines);
  };

  public shared ({ caller }) func postCashEntry(description : Text, lines : [AccountingTypes.JournalLine], isCashIn : Bool) : async Common.Result<Common.JournalId> {
    ignore caller;
    let kind : Common.TransactionKind = if (isCashIn) { #cashIn } else { #cashOut };
    if (lines.size() == 0) {
      return #err("Kas harus memiliki minimal satu baris");
    };
    var totalDebit = 0.0;
    var totalCredit = 0.0;
    for (line in lines.values()) {
      totalDebit += line.debit;
      totalCredit += line.credit;
    };
    if (totalDebit != totalCredit) {
      return #err("Total debit dan kredit harus seimbang");
    };
    #ok(AccountingLib.postJournal(journals, accountingState, kind, description, lines));
  };

  public query ({ caller }) func listJournals() : async [AccountingTypes.JournalEntry] {
    ignore caller;
    AccountingLib.listJournals(journals);
  };

  public query ({ caller }) func getLedger(accountCode : Common.AccountCode) : async [AccountingTypes.LedgerEntry] {
    ignore caller;
    AccountingLib.ledgerForAccount(journals, accountCode);
  };

  public query ({ caller }) func getTrialBalance() : async [AccountingTypes.TrialBalanceRow] {
    ignore caller;
    AccountingLib.trialBalance(journals, accounts);
  };

  public query ({ caller }) func getIncomeStatement() : async [AccountingTypes.IncomeStatementRow] {
    ignore caller;
    AccountingLib.incomeStatement(journals, accounts);
  };

  public query ({ caller }) func getBalanceSheet() : async [AccountingTypes.BalanceSheetRow] {
    ignore caller;
    AccountingLib.balanceSheet(journals, accounts);
  };

  public query ({ caller }) func getShu() : async AccountingTypes.ShuReport {
    ignore caller;
    AccountingLib.shu(journals, accounts);
  };

  public query ({ caller }) func getCashFlow(days : Nat) : async [AccountingTypes.LedgerEntry] {
    ignore caller;
    AccountingLib.cashFlow(journals, "100", days);
  };
};
