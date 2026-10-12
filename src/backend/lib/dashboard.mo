import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Common "../types/common";
import DashboardTypes "../types/dashboard";
import MemberTypes "../types/members";
import SavingsTypes "../types/savings";
import LoanTypes "../types/loans";
import AccountingTypes "../types/accounting";
import CoaTypes "../types/coa";

module {
  let dayNanos : Nat = 86_400_000_000_000;

  public func stats(
    members : Map.Map<Common.MemberId, MemberTypes.Member>,
    balances : Map.Map<(Common.MemberId, Common.SavingsId), SavingsTypes.SavingsBalance>,
    loans : Map.Map<Common.LoanId, LoanTypes.Loan>,
  ) : DashboardTypes.DashboardStats {
    var totalSavings = 0.0;
    for (balance in balances.values()) {
      totalSavings += balance.balance;
    };
    var totalLoans = 0.0;
    for (loan in loans.values()) {
      if (not loan.isClosed) {
        totalLoans += loan.remainingPrincipal;
      };
    };
    {
      memberCount = members.size();
      totalSavings;
      totalLoans;
    };
  };

  public func cashFlow30Days(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    cashAccountCode : Common.AccountCode,
  ) : [DashboardTypes.CashFlowPoint] {
    let now = Time.now().toNat();
    let start = if (now > 30 * dayNanos) { now - 30 * dayNanos } else { 0 };
    // Daily net movement for the cash account, keyed by day index.
    let daily = Map.empty<Nat, Float>();
    for (journal in journals.values()) {
      if (journal.createdAt >= start) {
        let dayIndex = (journal.createdAt - start) / dayNanos;
        var movement = 0.0;
        for (line in journal.lines.values()) {
          if (line.accountCode == cashAccountCode) {
            movement += line.debit - line.credit;
          };
        };
        if (movement != 0.0) {
          let current = daily.get(dayIndex) ?? 0.0;
          daily.add(dayIndex, current + movement);
        };
      };
    };
    // Running balance across the 30-day window.
    var running = 0.0;
    let points = daily.entries().map(
      func((dayIndex, movement)) {
        running += movement;
        { date = start + dayIndex * dayNanos; balance = running };
      }
    ).toArray();
    points.sort(func(a, b) = Nat.compare(a.date, b.date));
  };

  public func setLogo(
    state : DashboardTypes.DashboardState,
    logoUrl : Text,
  ) : () {
    state.logoUrl := logoUrl;
  };

  public func getLogo(state : DashboardTypes.DashboardState) : Text {
    state.logoUrl;
  };

  public func closeMonth(
    state : DashboardTypes.DashboardState,
    period : Text,
    userId : Common.UserId,
  ) : Common.Result<()> {
    if (period.size() == 0) {
      return #err("Periode harus diisi");
    };
    state.lastMonthlyClose := ?{
      period;
      closedAt = Time.now().toNat();
      closedBy = userId;
    };
    #ok(());
  };

  public func closeYear(
    state : DashboardTypes.DashboardState,
    period : Text,
    userId : Common.UserId,
  ) : Common.Result<()> {
    if (period.size() == 0) {
      return #err("Periode harus diisi");
    };
    state.lastYearlyClose := ?{
      period;
      closedAt = Time.now().toNat();
      closedBy = userId;
    };
    #ok(());
  };

  public func backup(
    members : Map.Map<Common.MemberId, MemberTypes.Member>,
    accounts : Map.Map<Common.AccountCode, CoaTypes.Account>,
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
  ) : Text {
    var out = "{\"members\":[";
    var first = true;
    for (member in members.values()) {
      if (not first) { out #= "," };
      first := false;
      out #= "{\"id\":" # member.id.toText()
        # ",\"memberNumber\":\"" # member.memberNumber
        # "\",\"name\":\"" # member.name
        # "\",\"address\":\"" # member.address
        # "\",\"phone\":\"" # member.phone
        # "\",\"email\":\"" # member.email
        # "\",\"joinedAt\":" # member.joinedAt.toText()
        # ",\"isActive\":" # (if (member.isActive) { "true" } else { "false" })
        # "}";
    };
    out #= "],\"accounts\":[";
    first := true;
    for (account in accounts.values()) {
      if (not first) { out #= "," };
      first := false;
      out #= "{\"code\":\"" # account.code
        # "\",\"name\":\"" # account.name
        # "\",\"accountType\":\"" # accountTypeText(account.accountType)
        # "\",\"isActive\":" # (if (account.isActive) { "true" } else { "false" })
        # "}";
    };
    out #= "],\"journals\":[";
    first := true;
    for (journal in journals.values()) {
      if (not first) { out #= "," };
      first := false;
      out #= "{\"id\":" # journal.id.toText()
        # ",\"transactionNumber\":\"" # journal.transactionNumber
        # "\",\"kind\":\"" # kindText(journal.kind)
        # "\",\"description\":\"" # journal.description
        # "\",\"createdAt\":" # journal.createdAt.toText()
        # ",\"lines\":[";
      var firstLine = true;
      for (line in journal.lines.values()) {
        if (not firstLine) { out #= "," };
        firstLine := false;
        out #= "{\"accountCode\":\"" # line.accountCode
          # "\",\"debit\":" # line.debit.toText()
          # ",\"credit\":" # line.credit.toText()
          # "}";
      };
      out #= "]}";
    };
    out #= "]}";
    out;
  };

  public func clearTransactions(
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    savingsTransactions : Map.Map<Common.SavingsId, SavingsTypes.SavingsTransaction>,
    installments : Map.Map<Common.LoanId, LoanTypes.Installment>,
  ) : () {
    journals.clear();
    savingsTransactions.clear();
    installments.clear();
  };

  func accountTypeText(accountType : Common.AccountType) : Text {
    switch (accountType) {
      case (#asset) { "asset" };
      case (#liability) { "liability" };
      case (#equity) { "equity" };
      case (#revenue) { "revenue" };
      case (#expense) { "expense" };
    };
  };

  func kindText(kind : Common.TransactionKind) : Text {
    switch (kind) {
      case (#savingsDeposit) { "savingsDeposit" };
      case (#savingsWithdrawal) { "savingsWithdrawal" };
      case (#loanDisbursement) { "loanDisbursement" };
      case (#loanInstallment) { "loanInstallment" };
      case (#cashIn) { "cashIn" };
      case (#cashOut) { "cashOut" };
      case (#savingsInterest) { "savingsInterest" };
      case (#loanInterest) { "loanInterest" };
      case (#penalty) { "penalty" };
      case (#manualJournal) { "manualJournal" };
    };
  };
};
