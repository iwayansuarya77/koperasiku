import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Common "../types/common";
import AccountingTypes "../types/accounting";
import CoaTypes "../types/coa";

module {
  public func nextTransactionNumber(state : AccountingTypes.AccountingState) : Common.TransactionNumber {
    state.nextTransactionNumber += 1;
    "TRX-" # state.nextTransactionNumber.toText();
  };

  public func postJournal(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    state : AccountingTypes.AccountingState,
    kind : Common.TransactionKind,
    description : Text,
    lines : [AccountingTypes.JournalLine],
  ) : Common.JournalId {
    let id = state.nextJournalId;
    state.nextJournalId += 1;
    let entry : AccountingTypes.JournalEntry = {
      id;
      transactionNumber = nextTransactionNumber(state);
      kind;
      description;
      lines;
      createdAt = Time.now().toNat();
    };
    journals.add(id, entry);
    id;
  };

  public func postManualJournal(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    state : AccountingTypes.AccountingState,
    description : Text,
    lines : [AccountingTypes.JournalLine],
  ) : Common.Result<Common.JournalId> {
    if (lines.size() == 0) {
      return #err("Jurnal harus memiliki minimal satu baris");
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
    #ok(postJournal(journals, state, #manualJournal, description, lines));
  };

  public func listJournals(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
  ) : [AccountingTypes.JournalEntry] {
    journals.values().toArray().sort(func(a, b) = Nat.compare(b.id, a.id));
  };

  public func ledgerForAccount(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    code : Common.AccountCode,
  ) : [AccountingTypes.LedgerEntry] {
    let all = journals.values().toArray().sort(func(a, b) = Nat.compare(a.id, b.id));
    let result = List.empty<AccountingTypes.LedgerEntry>();
    var balance = 0.0;
    for (entry in all.values()) {
      for (line in entry.lines.values()) {
        if (line.accountCode == code) {
          balance += line.debit - line.credit;
          result.add({
            accountCode = code;
            transactionNumber = entry.transactionNumber;
            description = entry.description;
            debit = line.debit;
            credit = line.credit;
            balance;
            createdAt = entry.createdAt;
          });
        };
      };
    };
    result.toArray();
  };

  func totalsForAccount(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    code : Common.AccountCode,
  ) : (Float, Float) {
    var debit = 0.0;
    var credit = 0.0;
    for (entry in journals.values()) {
      for (line in entry.lines.values()) {
        if (line.accountCode == code) {
          debit += line.debit;
          credit += line.credit;
        };
      };
    };
    (debit, credit);
  };

  public func trialBalance(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
  ) : [AccountingTypes.TrialBalanceRow] {
    let rows = List.empty<AccountingTypes.TrialBalanceRow>();
    for (account in accounts.values()) {
      let (debit, credit) = totalsForAccount(journals, account.code);
      if (debit != 0.0 or credit != 0.0) {
        rows.add({
          accountCode = account.code;
          accountName = account.name;
          debit;
          credit;
        });
      };
    };
    rows.toArray().sort(func(a, b) = Text.compare(a.accountCode, b.accountCode));
  };

  public func incomeStatement(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
  ) : [AccountingTypes.IncomeStatementRow] {
    let rows = List.empty<AccountingTypes.IncomeStatementRow>();
    for (account in accounts.values()) {
      switch (account.accountType) {
        case (#revenue) {
          let (debit, credit) = totalsForAccount(journals, account.code);
          rows.add({ accountCode = account.code; accountName = account.name; amount = credit - debit });
        };
        case (#expense) {
          let (debit, credit) = totalsForAccount(journals, account.code);
          rows.add({ accountCode = account.code; accountName = account.name; amount = debit - credit });
        };
        case (_) {};
      };
    };
    rows.toArray().sort(func(a, b) = Text.compare(a.accountCode, b.accountCode));
  };

  public func balanceSheet(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
  ) : [AccountingTypes.BalanceSheetRow] {
    let rows = List.empty<AccountingTypes.BalanceSheetRow>();
    for (account in accounts.values()) {
      switch (account.accountType) {
        case (#asset) {
          let (debit, credit) = totalsForAccount(journals, account.code);
          rows.add({ accountCode = account.code; accountName = account.name; amount = debit - credit });
        };
        case (#liability or #equity) {
          let (debit, credit) = totalsForAccount(journals, account.code);
          rows.add({ accountCode = account.code; accountName = account.name; amount = credit - debit });
        };
        case (_) {};
      };
    };
    rows.toArray().sort(func(a, b) = Text.compare(a.accountCode, b.accountCode));
  };

  public func shu(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
  ) : AccountingTypes.ShuReport {
    var totalRevenue = 0.0;
    var totalExpense = 0.0;
    for (account in accounts.values()) {
      let (debit, credit) = totalsForAccount(journals, account.code);
      switch (account.accountType) {
        case (#revenue) { totalRevenue += credit - debit };
        case (#expense) { totalExpense += debit - credit };
        case (_) {};
      };
    };
    { totalRevenue; totalExpense; shu = totalRevenue - totalExpense };
  };

  public func cashFlow(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    cashAccountCode : Common.AccountCode,
    days : Nat,
  ) : [AccountingTypes.LedgerEntry] {
    let now = Time.now().toNat();
    let cutoff = if (now > days * 86_400_000_000_000) {
      now - days * 86_400_000_000_000;
    } else {
      0;
    };
    let all = journals.values().toArray().sort(func(a, b) = Nat.compare(a.id, b.id));
    let result = List.empty<AccountingTypes.LedgerEntry>();
    var balance = 0.0;
    for (entry in all.values()) {
      for (line in entry.lines.values()) {
        if (line.accountCode == cashAccountCode) {
          balance += line.debit - line.credit;
          if (entry.createdAt >= cutoff) {
            result.add({
              accountCode = cashAccountCode;
              transactionNumber = entry.transactionNumber;
              description = entry.description;
              debit = line.debit;
              credit = line.credit;
              balance;
              createdAt = entry.createdAt;
            });
          };
        };
      };
    };
    result.toArray();
  };
};
