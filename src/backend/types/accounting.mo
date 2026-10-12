import Common "../types/common";

module {
  public type JournalLine = {
    accountCode : Common.AccountCode;
    debit : Float;
    credit : Float;
  };

  public type JournalEntry = {
    id : Common.JournalId;
    transactionNumber : Common.TransactionNumber;
    kind : Common.TransactionKind;
    description : Text;
    lines : [JournalLine];
    createdAt : Common.Timestamp;
  };

  public type LedgerEntry = {
    accountCode : Common.AccountCode;
    transactionNumber : Common.TransactionNumber;
    description : Text;
    debit : Float;
    credit : Float;
    balance : Float;
    createdAt : Common.Timestamp;
  };

  public type TrialBalanceRow = {
    accountCode : Common.AccountCode;
    accountName : Text;
    debit : Float;
    credit : Float;
  };

  public type IncomeStatementRow = {
    accountCode : Common.AccountCode;
    accountName : Text;
    amount : Float;
  };

  public type BalanceSheetRow = {
    accountCode : Common.AccountCode;
    accountName : Text;
    amount : Float;
  };

  public type ShuReport = {
    totalRevenue : Float;
    totalExpense : Float;
    shu : Float;
  };

  public type AccountingState = {
    var nextJournalId : Common.JournalId;
    var nextTransactionNumber : Nat;
  };
};
