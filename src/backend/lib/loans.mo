import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import EmailClient "mo:caffeineai-email/emailClient";
import Common "../types/common";
import LoanTypes "../types/loans";
import AccountingTypes "../types/accounting";
import AccountingLib "accounting";

module {
  // Seeded COA codes used by loan postings.
  let loanReceivableAccount = "200";
  let loanInterestAccount = "400";
  let cashAccount = "100";
  let loanPenaltyAccount = "400";

  func formatNumber(n : Nat) : Text {
    let s = n.toText();
    let len = s.size();
    if (len >= 4) { s } else {
      var pad = "";
      var i = len;
      while (i < 4) {
        pad := pad # "0";
        i += 1;
      };
      pad # s;
    };
  };

  func nextLoanNumber(state : LoanTypes.LoanState) : Text {
    let n = state.nextLoanNumber;
    state.nextLoanNumber := n + 1;
    "LN-" # formatNumber(n + 1);
  };

  func nextInstallmentNumber(state : LoanTypes.LoanState) : Text {
    let n = state.nextInstallmentId;
    state.nextInstallmentId := n + 1;
    "IN-" # formatNumber(n + 1);
  };

  func monthlyInterest(principal : Float, annualRate : Float) : Float {
    principal * (annualRate / 100.0) / 12.0;
  };

  func isOverdue(loan : LoanTypes.Loan, now : Nat) : Bool {
    if (loan.isClosed) { false } else {
      if (loan.disbursedAt == 0) { false } else {
        let months = (now - loan.disbursedAt) / 2_592_000_000_000;
        months > loan.termMonths;
      };
    };
  };

  public func createLoan(
    loans : Map.Map<Common.LoanId, LoanTypes.Loan>,
    state : LoanTypes.LoanState,
    memberId : Common.MemberId,
    principal : Float,
    interestRate : Float,
    method : LoanTypes.LoanMethod,
    termMonths : Nat,
    penaltyMonths : Nat,
    penaltyRate : Float,
  ) : Common.Result<LoanTypes.Loan> {
    if (principal <= 0.0) { return #err("Pokok pinjaman harus lebih dari 0") };
    if (termMonths == 0) { return #err("Jangka waktu harus lebih dari 0") };
    let id = state.nextLoanId;
    state.nextLoanId := id + 1;
    let loan : LoanTypes.Loan = {
      id;
      loanNumber = nextLoanNumber(state);
      memberId;
      principal;
      interestRate;
      method;
      termMonths;
      penaltyMonths;
      penaltyRate;
      disbursedAt = 0;
      remainingPrincipal = principal;
      isClosed = false;
    };
    loans.add(id, loan);
    #ok(loan);
  };

  public func disburseLoan(
    loans : Map.Map<Common.LoanId, LoanTypes.Loan>,
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    accountingState : AccountingTypes.AccountingState,
    loanId : Common.LoanId,
  ) : Common.Result<()> {
    let loan = loans.get(loanId) ?? return #err("Pinjaman tidak ditemukan");
    if (loan.disbursedAt != 0) { return #err("Pinjaman sudah dicairkan") };
    loans.add(loanId, { loan with disbursedAt = Time.now().toNat() });
    ignore AccountingLib.postJournal(
      journals,
      accountingState,
      #loanDisbursement,
      "Pencairan pinjaman " # loan.loanNumber,
      [
        { accountCode = loanReceivableAccount; debit = loan.principal; credit = 0.0 },
        { accountCode = cashAccount; debit = 0.0; credit = loan.principal },
      ],
    );
    #ok(());
  };

  public func recordInstallment(
    loans : Map.Map<Common.LoanId, LoanTypes.Loan>,
    installments : Map.Map<Common.LoanId, LoanTypes.Installment>,
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    accountingState : AccountingTypes.AccountingState,
    state : LoanTypes.LoanState,
    loanId : Common.LoanId,
    amount : Float,
  ) : Common.Result<LoanTypes.Installment> {
    let loan = loans.get(loanId) ?? return #err("Pinjaman tidak ditemukan");
    if (loan.disbursedAt == 0) { return #err("Pinjaman belum dicairkan") };
    if (loan.isClosed) { return #err("Pinjaman sudah lunas") };
    if (amount <= 0.0) { return #err("Jumlah angsuran harus lebih dari 0") };
    let id = state.nextInstallmentId;
    state.nextInstallmentId := id + 1;
    let installment : LoanTypes.Installment = {
      id;
      loanId;
      transactionNumber = nextInstallmentNumber(state);
      amount;
      paidAt = Time.now().toNat();
    };
    installments.add(id, installment);
    if (amount >= loan.remainingPrincipal) {
      loans.add(loanId, { loan with remainingPrincipal = 0.0; isClosed = true });
    } else {
      loans.add(loanId, { loan with remainingPrincipal = loan.remainingPrincipal - amount });
    };
    ignore AccountingLib.postJournal(
      journals,
      accountingState,
      #loanInstallment,
      "Angsuran pinjaman " # loan.loanNumber,
      [
        { accountCode = cashAccount; debit = amount; credit = 0.0 },
        { accountCode = loanReceivableAccount; debit = 0.0; credit = amount },
      ],
    );
    #ok(installment);
  };

  public func calculatePenalty(
    loan : LoanTypes.Loan,
    unpaidMonths : Nat,
  ) : Float {
    if (unpaidMonths > loan.penaltyMonths) {
      loan.remainingPrincipal * (loan.penaltyRate / 100.0);
    } else {
      0.0;
    };
  };

  public func listLoans(
    loans : Map.Map<Common.LoanId, LoanTypes.Loan>,
    memberId : Common.MemberId,
  ) : [LoanTypes.Loan] {
    loans.values().filter(func loan = loan.memberId == memberId).toArray();
  };

  public func listInstallments(
    installments : Map.Map<Common.LoanId, LoanTypes.Installment>,
    loanId : Common.LoanId,
  ) : [LoanTypes.Installment] {
    installments.values().filter(func inst = inst.loanId == loanId).toArray();
  };

  public func postMonthlyInterest(
    loans : Map.Map<Common.LoanId, LoanTypes.Loan>,
    journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>,
    accountingState : AccountingTypes.AccountingState,
  ) : Common.Result<Nat> {
    let now = Time.now().toNat();
    var posted = 0;
    for (loan in loans.values()) {
      if (loan.disbursedAt != 0 and not loan.isClosed) {
        let months = (now - loan.disbursedAt) / 2_592_000_000_000;
        if (months >= 1) {
          let interest = monthlyInterest(loan.remainingPrincipal, loan.interestRate);
          if (interest > 0.0) {
            ignore AccountingLib.postJournal(
              journals,
              accountingState,
              #loanInterest,
              "Bunga pinjaman bulanan " # loan.loanNumber,
              [
                { accountCode = loanReceivableAccount; debit = interest; credit = 0.0 },
                { accountCode = loanInterestAccount; debit = 0.0; credit = interest },
              ],
            );
            posted += 1;
          };
          // Denda otomatis setelah jumlah bulan tunggakan melewati penaltyMonths.
          if (months > loan.penaltyMonths) {
            let penalty = loan.remainingPrincipal * (loan.penaltyRate / 100.0);
            if (penalty > 0.0) {
              ignore AccountingLib.postJournal(
                journals,
                accountingState,
                #penalty,
                "Denda pinjaman " # loan.loanNumber,
                [
                  { accountCode = loanReceivableAccount; debit = penalty; credit = 0.0 },
                  { accountCode = loanPenaltyAccount; debit = 0.0; credit = penalty },
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

  public func sendDueReminders(
    loans : Map.Map<Common.LoanId, LoanTypes.Loan>,
    installments : Map.Map<Common.LoanId, LoanTypes.Installment>,
    memberEmails : Map.Map<Common.MemberId, Text>,
  ) : async Common.Result<Nat> {
    ignore installments;
    let now = Time.now().toNat();
    var sent = 0;
    for (loan in loans.values()) {
      if (isOverdue(loan, now)) {
        switch (memberEmails.get(loan.memberId)) {
          case (?email) {
            if (email.size() > 0) {
              let result = await EmailClient.sendServiceEmail(
                "Anggota Koperasi",
                [email],
                "Pengingat Jatuh Tempo Angsuran",
                "Angsuran pinjaman " # loan.loanNumber # " telah melewati jatuh tempo. Sisa pokok: " # loan.remainingPrincipal.toText(),
              );
              switch (result) {
                case (#ok) { sent += 1 };
                case (#err(_)) {};
              };
            };
          };
          case null {};
        };
      };
    };
    #ok(sent);
  };
};
