import Common "../types/common";

module {
  public type SavingsType = {
    id : Common.SavingsId;
    name : Text;
    interestRate : Float;
    cashAccountCode : Common.AccountCode;
    isActive : Bool;
  };

  public type SavingsTransaction = {
    id : Common.SavingsId;
    transactionNumber : Common.TransactionNumber;
    memberId : Common.MemberId;
    savingsTypeId : Common.SavingsId;
    cashAccountCode : Common.AccountCode;
    amount : Float;
    isDeposit : Bool;
    createdAt : Common.Timestamp;
  };

  public type SavingsBalance = {
    memberId : Common.MemberId;
    savingsTypeId : Common.SavingsId;
    balance : Float;
  };

  public type SavingsState = {
    var nextSavingsTypeId : Common.SavingsId;
    var nextSavingsTransactionId : Common.SavingsId;
    var nextTransactionNumber : Nat;
  };
};
