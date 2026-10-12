import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Common "../types/common";
import SavingsTypes "../types/savings";
import AccountingTypes "../types/accounting";
import AccountingLib "../lib/accounting";

module {
  // Seeded COA codes used by savings postings.
  let savingsLiabilityAccount = "200";
  let savingsInterestExpenseAccount = "500";

  public func compare(a : (Common.MemberId, Common.SavingsId), b : (Common.MemberId, Common.SavingsId)) : Order.Order {
    switch (Nat.compare(a.0, b.0)) {
      case (#equal) { Nat.compare(a.1, b.1) };
      case (other) { other };
    };
  };

  public func createSavingsType(
    savingsTypes : Map.Map<Common.SavingsId, SavingsTypes.SavingsType>,
    state : SavingsTypes.SavingsState,
    name : Text,
    interestRate : Float,
    cashAccountCode : Common.AccountCode,
  ) : Common.SavingsId {
    let id = state.nextSavingsTypeId;
    state.nextSavingsTypeId := id + 1;
    savingsTypes.add(id, {
      id;
      name;
      interestRate;
      cashAccountCode;
      isActive = true;
    });
    id;
  };

  public func updateSavingsType(
    savingsTypes : Map.Map<Common.SavingsId, SavingsTypes.SavingsType>,
    savingsType : SavingsTypes.SavingsType,
  ) : Common.Result<()> {
    switch (savingsTypes.get(savingsType.id)) {
      case null { #err("Jenis simpanan tidak ditemukan") };
      case (?_) {
        savingsTypes.add(savingsType.id, savingsType);
        #ok(());
      };
    };
  };

  public func listSavingsTypes(
    savingsTypes : Map.Map<Common.SavingsId, SavingsTypes.SavingsType>,
  ) : [SavingsTypes.SavingsType] {
    savingsTypes.values().toArray();
  };

  public func recordTransaction(
    transactions : Map.Map<Common.SavingsId, SavingsTypes.SavingsTransaction>,
    balances : Map.Map<(Common.MemberId, Common.SavingsId), SavingsTypes.SavingsBalance>,
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    state : SavingsTypes.SavingsState,
    accountingState : AccountingTypes.AccountingState,
    memberId : Common.MemberId,
    savingsTypeId : Common.SavingsId,
    cashAccountCode : Common.AccountCode,
    amount : Float,
    isDeposit : Bool,
  ) : Common.Result<SavingsTypes.SavingsTransaction> {
    if (amount <= 0.0) {
      return #err("Jumlah harus lebih dari nol");
    };
    let key = (memberId, savingsTypeId);
    let current = switch (balances.get(key)) {
      case (?b) { b.balance };
      case null { 0.0 };
    };
    if (not isDeposit and current < amount) {
      return #err("Saldo tidak mencukupi");
    };
    let newBalance = if (isDeposit) { current + amount } else { current - amount };
    balances.add(key, { memberId; savingsTypeId; balance = newBalance });
    let id = state.nextSavingsTransactionId;
    state.nextSavingsTransactionId := id + 1;
    let transactionNumber = state.nextTransactionNumber.toText();
    state.nextTransactionNumber := state.nextTransactionNumber + 1;
    let transaction : SavingsTypes.SavingsTransaction = {
      id;
      transactionNumber;
      memberId;
      savingsTypeId;
      cashAccountCode;
      amount;
      isDeposit;
      createdAt = Time.now().toNat();
    };
    transactions.add(id, transaction);
    if (isDeposit) {
      ignore AccountingLib.postJournal(
        journals,
        accountingState,
        #savingsDeposit,
        "Simpanan anggota " # transactionNumber,
        [
          { accountCode = cashAccountCode; debit = amount; credit = 0.0 },
          { accountCode = savingsLiabilityAccount; debit = 0.0; credit = amount },
        ],
      );
    } else {
      ignore AccountingLib.postJournal(
        journals,
        accountingState,
        #savingsWithdrawal,
        "Penarikan simpanan " # transactionNumber,
        [
          { accountCode = savingsLiabilityAccount; debit = amount; credit = 0.0 },
          { accountCode = cashAccountCode; debit = 0.0; credit = amount },
        ],
      );
    };
    #ok(transaction);
  };

  public func getBalance(
    balances : Map.Map<(Common.MemberId, Common.SavingsId), SavingsTypes.SavingsBalance>,
    memberId : Common.MemberId,
    savingsTypeId : Common.SavingsId,
  ) : Float {
    switch (balances.get((memberId, savingsTypeId))) {
      case (?b) { b.balance };
      case null { 0.0 };
    };
  };

  public func listTransactions(
    transactions : Map.Map<Common.SavingsId, SavingsTypes.SavingsTransaction>,
    memberId : Common.MemberId,
  ) : [SavingsTypes.SavingsTransaction] {
    transactions.values().filter(func t = t.memberId == memberId).toArray();
  };

  public func listBalances(
    balances : Map.Map<(Common.MemberId, Common.SavingsId), SavingsTypes.SavingsBalance>,
    memberId : Common.MemberId,
  ) : [SavingsTypes.SavingsBalance] {
    balances.values().filter(func b = b.memberId == memberId).toArray();
  };

  public func importInitialBalances(
    balances : Map.Map<(Common.MemberId, Common.SavingsId), SavingsTypes.SavingsBalance>,
    rows : [(Common.MemberId, Common.SavingsId, Float)],
  ) : Common.Result<Nat> {
    var count = 0;
    for ((memberId, savingsTypeId, balance) in rows.values()) {
      balances.add((memberId, savingsTypeId), { memberId; savingsTypeId; balance });
      count += 1;
    };
    #ok(count);
  };

  public func postMonthlyInterest(
    savingsTypes : Map.Map<Common.SavingsId, SavingsTypes.SavingsType>,
    balances : Map.Map<(Common.MemberId, Common.SavingsId), SavingsTypes.SavingsBalance>,
    transactions : Map.Map<Common.SavingsId, SavingsTypes.SavingsTransaction>,
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    savingsState : SavingsTypes.SavingsState,
    accountingState : AccountingTypes.AccountingState,
  ) : Common.Result<Nat> {
    var posted = 0;
    for (entry in balances.entries()) {
      let (memberId, savingsTypeId) = entry.0;
      let balance = entry.1;
      switch (savingsTypes.get(savingsTypeId)) {
        case null {};
        case (?savingsType) {
          if (savingsType.isActive and balance.balance > 0.0 and savingsType.interestRate > 0.0) {
            let interest = balance.balance * savingsType.interestRate;
            if (interest > 0.0) {
              let newBalance = balance.balance + interest;
              balances.add((memberId, savingsTypeId), { memberId; savingsTypeId; balance = newBalance });
              let id = savingsState.nextSavingsTransactionId;
              savingsState.nextSavingsTransactionId := id + 1;
              let transactionNumber = savingsState.nextTransactionNumber.toText();
              savingsState.nextTransactionNumber := savingsState.nextTransactionNumber + 1;
              transactions.add(id, {
                id;
                transactionNumber;
                memberId;
                savingsTypeId;
                cashAccountCode = savingsType.cashAccountCode;
                amount = interest;
                isDeposit = true;
                createdAt = Time.now().toNat();
              });
              ignore AccountingLib.postJournal(
                journals,
                accountingState,
                #savingsInterest,
                "Bunga simpanan " # savingsType.name,
                [
                  { accountCode = savingsInterestExpenseAccount; debit = interest; credit = 0.0 },
                  { accountCode = savingsLiabilityAccount; debit = 0.0; credit = interest },
                ],
              );
              posted += 1;
            };
          };
        };
      };
    };
    #ok(posted);
  };
};
