import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type OldActor = {};

  type UserAccount = {
    id : Nat;
    username : Text;
    passwordHash : Text;
    role : { #admin; #kasir; #supervisor };
    isActive : Bool;
    createdAt : Nat;
  };

  type AuthState = { var nextUserId : Nat; var currentSession : ?Nat };

  type Member = {
    id : Nat;
    memberNumber : Text;
    name : Text;
    address : Text;
    phone : Text;
    email : Text;
    joinedAt : Nat;
    isActive : Bool;
  };

  type MemberState = { var nextMemberId : Nat };

  type Account = {
    code : Text;
    name : Text;
    accountType : { #asset; #liability; #equity; #revenue; #expense };
    isActive : Bool;
  };

  type CoaState = { var nextAccountCode : Nat };

  type SavingsType = {
    id : Nat;
    name : Text;
    interestRate : Float;
    cashAccountCode : Text;
    isActive : Bool;
  };

  type SavingsTransaction = {
    id : Nat;
    transactionNumber : Text;
    memberId : Nat;
    savingsTypeId : Nat;
    cashAccountCode : Text;
    amount : Float;
    isDeposit : Bool;
    createdAt : Nat;
  };

  type SavingsBalance = { memberId : Nat; savingsTypeId : Nat; balance : Float };

  type SavingsState = {
    var nextSavingsTypeId : Nat;
    var nextSavingsTransactionId : Nat;
    var nextTransactionNumber : Nat;
  };

  type Loan = {
    id : Nat;
    loanNumber : Text;
    memberId : Nat;
    principal : Float;
    interestRate : Float;
    method : { #anuitas; #menurun };
    termMonths : Nat;
    penaltyMonths : Nat;
    penaltyRate : Float;
    disbursedAt : Nat;
    remainingPrincipal : Float;
    isClosed : Bool;
  };

  type Installment = {
    id : Nat;
    loanId : Nat;
    transactionNumber : Text;
    amount : Float;
    paidAt : Nat;
  };

  type LoanState = {
    var nextLoanId : Nat;
    var nextInstallmentId : Nat;
    var nextLoanNumber : Nat;
  };

  type JournalLine = { accountCode : Text; debit : Float; credit : Float };

  type JournalEntry = {
    id : Nat;
    transactionNumber : Text;
    kind : {
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
    description : Text;
    lines : [JournalLine];
    createdAt : Nat;
  };

  type AccountingState = { var nextJournalId : Nat; var nextTransactionNumber : Nat };

  type PeriodClose = { period : Text; closedAt : Nat; closedBy : Nat };

  type DashboardState = {
    var logoUrl : Text;
    var lastMonthlyClose : ?PeriodClose;
    var lastYearlyClose : ?PeriodClose;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    users : Map.Map<Nat, UserAccount>;
    authState : AuthState;
    members : Map.Map<Nat, Member>;
    memberState : MemberState;
    accounts : Map.Map<Text, Account>;
    coaState : CoaState;
    savingsTypes : Map.Map<Nat, SavingsType>;
    savingsTransactions : Map.Map<Nat, SavingsTransaction>;
    savingsBalances : Map.Map<(Nat, Nat), SavingsBalance>;
    savingsState : SavingsState;
    loans : Map.Map<Nat, Loan>;
    installments : Map.Map<Nat, Installment>;
    loanState : LoanState;
    memberEmails : Map.Map<Nat, Text>;
    journals : Map.Map<Nat, JournalEntry>;
    accountingState : AccountingState;
    dashboardState : DashboardState;
  };

  // Deterministic salted hash — must match lib/auth.mo hashPassword.
  func hashPassword(password : Text) : Text {
    let salt = "koperasi::v1::";
    let combined = salt.concat(password);
    var h : Nat = 5381;
    for (c in combined.toIter()) {
      h := (h * 33 + c.toNat32().toNat()) % 1_000_000_007;
    };
    h.toText();
  };

  public func migration(_ : OldActor) : NewActor {
    let users = Map.empty<Nat, UserAccount>();
    users.add(0, {
      id = 0;
      username = "admin";
      passwordHash = hashPassword("admin123");
      role = #admin;
      isActive = true;
      createdAt = 0;
    });

    let accounts = Map.empty<Text, Account>();
    accounts.add("100", { code = "100"; name = "Kas"; accountType = #asset; isActive = true });
    accounts.add("200", { code = "200"; name = "Simpanan Anggota"; accountType = #liability; isActive = true });
    accounts.add("300", { code = "300"; name = "Ekuitas"; accountType = #equity; isActive = true });
    accounts.add("400", { code = "400"; name = "Pendapatan Bunga"; accountType = #revenue; isActive = true });
    accounts.add("500", { code = "500"; name = "Beban Operasional"; accountType = #expense; isActive = true });

    {
      accessControlState = AccessControl.initState();
      users;
      authState = { var nextUserId = 1; var currentSession = null };
      members = Map.empty();
      memberState = { var nextMemberId = 0 };
      accounts;
      coaState = { var nextAccountCode = 0 };
      savingsTypes = Map.empty();
      savingsTransactions = Map.empty();
      savingsBalances = Map.empty();
      savingsState = { var nextSavingsTypeId = 0; var nextSavingsTransactionId = 0; var nextTransactionNumber = 0 };
      loans = Map.empty();
      installments = Map.empty();
      loanState = { var nextLoanId = 0; var nextInstallmentId = 0; var nextLoanNumber = 0 };
      memberEmails = Map.empty();
      journals = Map.empty();
      accountingState = { var nextJournalId = 0; var nextTransactionNumber = 0 };
      dashboardState = { var logoUrl = ""; var lastMonthlyClose = null; var lastYearlyClose = null };
    };
  };
};
