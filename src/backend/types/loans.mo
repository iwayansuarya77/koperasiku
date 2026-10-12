import Common "../types/common";

module {
  public type LoanMethod = {
    #anuitas;
    #menurun;
  };

  public type Loan = {
    id : Common.LoanId;
    loanNumber : Text;
    memberId : Common.MemberId;
    principal : Float;
    interestRate : Float;
    method : LoanMethod;
    termMonths : Nat;
    penaltyMonths : Nat;
    penaltyRate : Float;
    disbursedAt : Common.Timestamp;
    remainingPrincipal : Float;
    isClosed : Bool;
  };

  public type Installment = {
    id : Common.LoanId;
    loanId : Common.LoanId;
    transactionNumber : Common.TransactionNumber;
    amount : Float;
    paidAt : Common.Timestamp;
  };

  public type LoanState = {
    var nextLoanId : Common.LoanId;
    var nextInstallmentId : Common.LoanId;
    var nextLoanNumber : Nat;
  };
};
