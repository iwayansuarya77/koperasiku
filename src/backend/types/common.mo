module {
  public type UserId = Nat;
  public type Timestamp = Nat;
  public type TransactionNumber = Text;
  public type AccountCode = Text;
  public type MemberId = Nat;
  public type LoanId = Nat;
  public type SavingsId = Nat;
  public type JournalId = Nat;

  public type Role = {
    #admin;
    #kasir;
    #supervisor;
  };

  public type AccountType = {
    #asset;
    #liability;
    #equity;
    #revenue;
    #expense;
  };

  public type TransactionKind = {
    #savingsDeposit;
    #savingsWithdrawal;
    #loanDisbursement;
    #loanInstallment;
    #cashIn;
    #cashOut;
    #savingsInterest;
    #loanInterest;
    #penalty;
    #manualJournal;
  };

  public type Result<T> = {
    #ok : T;
    #err : Text;
  };
};
