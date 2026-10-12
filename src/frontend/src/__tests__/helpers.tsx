import type {
  Account,
  AccountType,
  Member,
  Role,
  SavingsBalance,
  SavingsTransaction,
  SavingsType,
  UserAccountView,
} from "@/backend";
import { vi } from "vitest";

/**
 * A typed local actor mock. Every method the app's hooks call is present, so a
 * test that forgets to stub one fails loudly instead of silently resolving
 * `undefined`. This is a mock seam: it proves the frontend's own wiring, never
 * that the real canister implements any of it.
 */
export type ActorMock = {
  getCallerRole: ReturnType<typeof vi.fn>;
  login: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  changeOwnPassword: ReturnType<typeof vi.fn>;
  listUserAccounts: ReturnType<typeof vi.fn>;
  createUserAccount: ReturnType<typeof vi.fn>;
  assignUserRole: ReturnType<typeof vi.fn>;
  getLogo: ReturnType<typeof vi.fn>;
  uploadLogo: ReturnType<typeof vi.fn>;
  closeMonth: ReturnType<typeof vi.fn>;
  closeYear: ReturnType<typeof vi.fn>;
  backupDatabase: ReturnType<typeof vi.fn>;
  clearTransactionData: ReturnType<typeof vi.fn>;
  listMembers: ReturnType<typeof vi.fn>;
  searchMembers: ReturnType<typeof vi.fn>;
  createMember: ReturnType<typeof vi.fn>;
  updateMember: ReturnType<typeof vi.fn>;
  deleteMember: ReturnType<typeof vi.fn>;
  listAccounts: ReturnType<typeof vi.fn>;
  createAccount: ReturnType<typeof vi.fn>;
  updateAccount: ReturnType<typeof vi.fn>;
  deleteAccount: ReturnType<typeof vi.fn>;
  listSavingsTypes: ReturnType<typeof vi.fn>;
  createSavingsType: ReturnType<typeof vi.fn>;
  updateSavingsType: ReturnType<typeof vi.fn>;
  listSavingsBalances: ReturnType<typeof vi.fn>;
  listSavingsTransactions: ReturnType<typeof vi.fn>;
  recordSavingsTransaction: ReturnType<typeof vi.fn>;
  importInitialSavingsBalances: ReturnType<typeof vi.fn>;
  postMonthlySavingsInterest: ReturnType<typeof vi.fn>;
  listLoans: ReturnType<typeof vi.fn>;
  listInstallments: ReturnType<typeof vi.fn>;
  createLoan: ReturnType<typeof vi.fn>;
  disburseLoan: ReturnType<typeof vi.fn>;
  recordInstallment: ReturnType<typeof vi.fn>;
  calculatePenalty: ReturnType<typeof vi.fn>;
  sendDueReminders: ReturnType<typeof vi.fn>;
  postMonthlyLoanInterest: ReturnType<typeof vi.fn>;
  getDashboardStats: ReturnType<typeof vi.fn>;
  getCashFlow30Days: ReturnType<typeof vi.fn>;
  listJournals: ReturnType<typeof vi.fn>;
  getLedger: ReturnType<typeof vi.fn>;
  postManualJournal: ReturnType<typeof vi.fn>;
  postCashEntry: ReturnType<typeof vi.fn>;
  getTrialBalance: ReturnType<typeof vi.fn>;
  getIncomeStatement: ReturnType<typeof vi.fn>;
  getBalanceSheet: ReturnType<typeof vi.fn>;
  getShu: ReturnType<typeof vi.fn>;
};

export function createActorMock(overrides: Partial<ActorMock> = {}): ActorMock {
  const base: ActorMock = {
    getCallerRole: vi.fn(async () => null as Role | null),
    login: vi.fn(async () => ({ __kind__: "ok", ok: {} as UserAccountView })),
    logout: vi.fn(async () => undefined),
    changeOwnPassword: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    listUserAccounts: vi.fn(async () => [] as UserAccountView[]),
    createUserAccount: vi.fn(async () => ({ __kind__: "ok", ok: 1n })),
    assignUserRole: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    getLogo: vi.fn(async () => ""),
    uploadLogo: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    closeMonth: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    closeYear: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    backupDatabase: vi.fn(async () => "{}"),
    clearTransactionData: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    listMembers: vi.fn(async () => [] as Member[]),
    searchMembers: vi.fn(async () => [] as Member[]),
    createMember: vi.fn(async () => ({ __kind__: "ok", ok: 1n })),
    updateMember: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    deleteMember: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    listAccounts: vi.fn(async () => [] as Account[]),
    createAccount: vi.fn(async () => ({ __kind__: "ok", ok: "100" })),
    updateAccount: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    deleteAccount: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    listSavingsTypes: vi.fn(async () => [] as SavingsType[]),
    createSavingsType: vi.fn(async () => ({ __kind__: "ok", ok: 1n })),
    updateSavingsType: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    listSavingsBalances: vi.fn(async () => [] as SavingsBalance[]),
    listSavingsTransactions: vi.fn(async () => [] as SavingsTransaction[]),
    recordSavingsTransaction: vi.fn(async () => ({ __kind__: "ok", ok: {} })),
    importInitialSavingsBalances: vi.fn(async () => ({
      __kind__: "ok",
      ok: 0n,
    })),
    postMonthlySavingsInterest: vi.fn(async () => ({ __kind__: "ok", ok: 0n })),
    listLoans: vi.fn(async () => []),
    listInstallments: vi.fn(async () => []),
    createLoan: vi.fn(async () => ({ __kind__: "ok", ok: {} })),
    disburseLoan: vi.fn(async () => ({ __kind__: "ok", ok: null })),
    recordInstallment: vi.fn(async () => ({ __kind__: "ok", ok: {} })),
    calculatePenalty: vi.fn(async () => ({ __kind__: "ok", ok: 0 })),
    sendDueReminders: vi.fn(async () => ({ __kind__: "ok", ok: 0n })),
    postMonthlyLoanInterest: vi.fn(async () => ({ __kind__: "ok", ok: 0n })),
    getDashboardStats: vi.fn(async () => ({
      memberCount: 0n,
      totalSavings: 0,
      totalLoans: 0,
    })),
    getCashFlow30Days: vi.fn(async () => []),
    listJournals: vi.fn(async () => []),
    getLedger: vi.fn(async () => []),
    postManualJournal: vi.fn(async () => ({ __kind__: "ok", ok: 1n })),
    postCashEntry: vi.fn(async () => ({ __kind__: "ok", ok: 1n })),
    getTrialBalance: vi.fn(async () => []),
    getIncomeStatement: vi.fn(async () => []),
    getBalanceSheet: vi.fn(async () => []),
    getShu: vi.fn(async () => ({ shu: 0, totalRevenue: 0, totalExpense: 0 })),
  };
  return { ...base, ...overrides };
}

export function makeMember(overrides: Partial<Member> = {}): Member {
  return {
    id: 0n,
    name: "Budi",
    joinedAt: 1_700_000_000_000_000_000n,
    memberNumber: "A-0001",
    isActive: true,
    email: "budi@contoh.id",
    address: "Jl. Melati",
    phone: "+62811",
    ...overrides,
  };
}

export function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    code: "100",
    name: "Kas",
    isActive: true,
    accountType: "asset" as AccountType,
    ...overrides,
  };
}

export function makeSavingsType(
  overrides: Partial<SavingsType> = {},
): SavingsType {
  return {
    id: 1n,
    name: "Sukarela",
    isActive: true,
    interestRate: 3,
    cashAccountCode: "100",
    ...overrides,
  };
}
