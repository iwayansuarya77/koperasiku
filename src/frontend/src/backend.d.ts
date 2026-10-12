import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Account {
    code: AccountCode;
    name: string;
    isActive: boolean;
    accountType: AccountType;
}
export type AccountCode = string;
export interface BalanceSheetRow {
    accountCode: AccountCode;
    accountName: string;
    amount: number;
}
export interface CashFlowPoint {
    balance: number;
    date: Timestamp;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface DashboardStats {
    memberCount: bigint;
    totalSavings: number;
    totalLoans: number;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface IncomeStatementRow {
    accountCode: AccountCode;
    accountName: string;
    amount: number;
}
export interface Installment {
    id: LoanId;
    loanId: LoanId;
    transactionNumber: TransactionNumber;
    amount: number;
    paidAt: Timestamp;
}
export interface JournalEntry {
    id: JournalId;
    kind: TransactionKind;
    createdAt: Timestamp;
    description: string;
    transactionNumber: TransactionNumber;
    lines: Array<JournalLine>;
}
export type JournalId = bigint;
export interface JournalLine {
    credit: number;
    accountCode: AccountCode;
    debit: number;
}
export interface LedgerEntry {
    balance: number;
    createdAt: Timestamp;
    description: string;
    transactionNumber: TransactionNumber;
    credit: number;
    accountCode: AccountCode;
    debit: number;
}
export interface Loan {
    id: LoanId;
    memberId: MemberId;
    method: LoanMethod;
    principal: number;
    penaltyMonths: bigint;
    remainingPrincipal: number;
    penaltyRate: number;
    isClosed: boolean;
    termMonths: bigint;
    interestRate: number;
    disbursedAt: Timestamp;
    loanNumber: string;
}
export type LoanId = bigint;
export interface Member {
    id: MemberId;
    name: string;
    joinedAt: Timestamp;
    memberNumber: string;
    isActive: boolean;
    email: string;
    address: string;
    phone: string;
}
export type MemberId = bigint;
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
export type Result_1 = {
    __kind__: "ok";
    ok: bigint;
} | {
    __kind__: "err";
    err: string;
};
export type Result_10 = {
    __kind__: "ok";
    ok: AccountCode;
} | {
    __kind__: "err";
    err: string;
};
export type Result_11 = {
    __kind__: "ok";
    ok: number;
} | {
    __kind__: "err";
    err: string;
};
export type Result_2 = {
    __kind__: "ok";
    ok: SavingsTransaction;
} | {
    __kind__: "err";
    err: string;
};
export type Result_3 = {
    __kind__: "ok";
    ok: Installment;
} | {
    __kind__: "err";
    err: string;
};
export type Result_4 = {
    __kind__: "ok";
    ok: JournalId;
} | {
    __kind__: "err";
    err: string;
};
export type Result_5 = {
    __kind__: "ok";
    ok: UserAccountView;
} | {
    __kind__: "err";
    err: string;
};
export type Result_6 = {
    __kind__: "ok";
    ok: UserId;
} | {
    __kind__: "err";
    err: string;
};
export type Result_7 = {
    __kind__: "ok";
    ok: SavingsId;
} | {
    __kind__: "err";
    err: string;
};
export type Result_8 = {
    __kind__: "ok";
    ok: MemberId;
} | {
    __kind__: "err";
    err: string;
};
export type Result_9 = {
    __kind__: "ok";
    ok: Loan;
} | {
    __kind__: "err";
    err: string;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__2 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface SavingsBalance {
    memberId: MemberId;
    balance: number;
    savingsTypeId: SavingsId;
}
export type SavingsId = bigint;
export interface SavingsTransaction {
    id: SavingsId;
    memberId: MemberId;
    createdAt: Timestamp;
    transactionNumber: TransactionNumber;
    savingsTypeId: SavingsId;
    isDeposit: boolean;
    amount: number;
    cashAccountCode: AccountCode;
}
export interface SavingsType {
    id: SavingsId;
    name: string;
    isActive: boolean;
    interestRate: number;
    cashAccountCode: AccountCode;
}
export interface ShuReport {
    shu: number;
    totalRevenue: number;
    totalExpense: number;
}
export type Timestamp = bigint;
export type TransactionNumber = string;
export interface TrialBalanceRow {
    credit: number;
    accountCode: AccountCode;
    accountName: string;
    debit: number;
}
export interface UserAccountView {
    id: UserId;
    username: string;
    createdAt: Timestamp;
    role: Role;
    isActive: boolean;
}
export type UserId = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum AccountType {
    revenue = "revenue",
    liability = "liability",
    expense = "expense",
    asset = "asset",
    equity = "equity"
}
export enum LoanMethod {
    anuitas = "anuitas",
    menurun = "menurun"
}
export enum Role {
    supervisor = "supervisor",
    admin = "admin",
    kasir = "kasir"
}
export enum TransactionKind {
    loanInterest = "loanInterest",
    penalty = "penalty",
    savingsInterest = "savingsInterest",
    cashOut = "cashOut",
    loanInstallment = "loanInstallment",
    savingsDeposit = "savingsDeposit",
    savingsWithdrawal = "savingsWithdrawal",
    cashIn = "cashIn",
    loanDisbursement = "loanDisbursement",
    manualJournal = "manualJournal"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignUserRole(userId: UserId, role: Role): Promise<Result>;
    backupDatabase(): Promise<string>;
    calculatePenalty(loanId: LoanId, unpaidMonths: bigint): Promise<Result_11>;
    changeOwnPassword(oldPassword: string, newPassword: string): Promise<Result>;
    clearTransactionData(confirmation: string): Promise<Result>;
    closeMonth(period: string): Promise<Result>;
    closeYear(period: string): Promise<Result>;
    createAccount(name: string, accountType: AccountType): Promise<Result_10>;
    createLoan(memberId: MemberId, principal: number, interestRate: number, method: LoanMethod, termMonths: bigint, penaltyMonths: bigint, penaltyRate: number): Promise<Result_9>;
    createMember(memberNumber: string, name: string, address: string, phone: string, email: string): Promise<Result_8>;
    createSavingsType(name: string, interestRate: number, cashAccountCode: AccountCode): Promise<Result_7>;
    createUserAccount(username: string, password: string, role: Role): Promise<Result_6>;
    deleteAccount(code: AccountCode): Promise<Result>;
    deleteMember(memberId: MemberId): Promise<Result>;
    disburseLoan(loanId: LoanId): Promise<Result>;
    execute(qJson: string): Promise<Result__1>;
    getAccount(code: AccountCode): Promise<Account | null>;
    getApiDoc(): Promise<string>;
    getBalanceSheet(): Promise<Array<BalanceSheetRow>>;
    getCallerRole(): Promise<Role | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCashFlow(days: bigint): Promise<Array<LedgerEntry>>;
    getCashFlow30Days(): Promise<Array<CashFlowPoint>>;
    getDashboardStats(): Promise<DashboardStats>;
    getIncomeStatement(): Promise<Array<IncomeStatementRow>>;
    getLedger(accountCode: AccountCode): Promise<Array<LedgerEntry>>;
    getLogo(): Promise<string>;
    getMember(memberId: MemberId): Promise<Member | null>;
    getSavingsBalance(memberId: MemberId, savingsTypeId: SavingsId): Promise<number>;
    getShu(): Promise<ShuReport>;
    getTrialBalance(): Promise<Array<TrialBalanceRow>>;
    importInitialSavingsBalances(rows: Array<[MemberId, SavingsId, number]>): Promise<Result_1>;
    isCallerAdmin(): Promise<boolean>;
    listAccounts(): Promise<Array<Account>>;
    listInstallments(loanId: LoanId): Promise<Array<Installment>>;
    listJournals(): Promise<Array<JournalEntry>>;
    listLoans(memberId: MemberId): Promise<Array<Loan>>;
    listMembers(): Promise<Array<Member>>;
    listSavingsBalances(memberId: MemberId): Promise<Array<SavingsBalance>>;
    listSavingsTransactions(memberId: MemberId): Promise<Array<SavingsTransaction>>;
    listSavingsTypes(): Promise<Array<SavingsType>>;
    listUserAccounts(): Promise<Array<UserAccountView>>;
    login(username: string, password: string): Promise<Result_5>;
    logout(): Promise<void>;
    postCashEntry(description: string, lines: Array<JournalLine>, isCashIn: boolean): Promise<Result_4>;
    postManualJournal(description: string, lines: Array<JournalLine>): Promise<Result_4>;
    postMonthlyLoanInterest(): Promise<Result_1>;
    postMonthlySavingsInterest(): Promise<Result_1>;
    recordInstallment(loanId: LoanId, amount: number): Promise<Result_3>;
    recordSavingsTransaction(memberId: MemberId, savingsTypeId: SavingsId, cashAccountCode: AccountCode, amount: number, isDeposit: boolean): Promise<Result_2>;
    schema(): Promise<string>;
    searchMembers(term: string): Promise<Array<Member>>;
    sendDueReminders(): Promise<Result_1>;
    updateAccount(account: Account): Promise<Result>;
    updateMember(member: Member): Promise<Result>;
    updateSavingsType(savingsType: SavingsType): Promise<Result>;
    uploadLogo(logoUrl: string): Promise<Result>;
}
