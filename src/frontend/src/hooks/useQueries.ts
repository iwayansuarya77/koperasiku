import {
  type Account,
  type BalanceSheetRow,
  type IncomeStatementRow,
  type JournalEntry,
  type JournalLine,
  type LedgerEntry,
  type LoanMethod,
  type SavingsTransaction,
  type ShuReport,
  type TrialBalanceRow,
  createActor,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useDashboardStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCashFlow30Days() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["cashFlow30Days"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCashFlow30Days();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useJournals() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["journals"],
    queryFn: async (): Promise<JournalEntry[]> => {
      if (!actor) return [];
      return actor.listJournals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAccounts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async (): Promise<Account[]> => {
      if (!actor) return [];
      return actor.listAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLedger(accountCode: string | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["ledger", accountCode ?? "none"],
    queryFn: async (): Promise<LedgerEntry[]> => {
      if (!actor || !accountCode) return [];
      return actor.getLedger(accountCode);
    },
    enabled: !!actor && !isFetching && !!accountCode,
  });
}

export function usePostManualJournal() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      description: string;
      lines: JournalLine[];
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.postManualJournal(
        input.description,
        input.lines,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["journals"] });
      void queryClient.invalidateQueries({ queryKey: ["ledger"] });
    },
  });
}

export function usePostCashEntry() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      description: string;
      lines: JournalLine[];
      isCashIn: boolean;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.postCashEntry(
        input.description,
        input.lines,
        input.isCashIn,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["journals"] });
      void queryClient.invalidateQueries({ queryKey: ["ledger"] });
    },
  });
}

export function useMembers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["members"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLoans(memberId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["loans", memberId?.toString() ?? "all"],
    queryFn: async () => {
      if (!actor || memberId === null) return [];
      return actor.listLoans(memberId);
    },
    enabled: !!actor && !isFetching && memberId !== null,
  });
}

export function useInstallments(loanId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["installments", loanId?.toString() ?? "none"],
    queryFn: async () => {
      if (!actor || loanId === null) return [];
      return actor.listInstallments(loanId);
    },
    enabled: !!actor && !isFetching && loanId !== null,
  });
}

export function useCreateLoan() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      memberId: bigint;
      principal: number;
      interestRate: number;
      method: LoanMethod;
      termMonths: bigint;
      penaltyMonths: bigint;
      penaltyRate: number;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.createLoan(
        input.memberId,
        input.principal,
        input.interestRate,
        input.method,
        input.termMonths,
        input.penaltyMonths,
        input.penaltyRate,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

export function useDisburseLoan() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (loanId: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.disburseLoan(loanId);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

export function useRecordInstallment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      loanId,
      amount,
    }: {
      loanId: bigint;
      amount: number;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.recordInstallment(loanId, amount);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["loans"] });
      void queryClient.invalidateQueries({ queryKey: ["installments"] });
    },
  });
}

export function useCalculatePenalty() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      loanId,
      unpaidMonths,
    }: {
      loanId: bigint;
      unpaidMonths: bigint;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.calculatePenalty(loanId, unpaidMonths);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
  });
}

export function useSendDueReminders() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.sendDueReminders();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
  });
}

export function usePostMonthlyLoanInterest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.postMonthlyLoanInterest();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["loans"] });
    },
  });
}

export function useSavingsTypes() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["savingsTypes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSavingsTypes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSavingsBalances(memberId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["savingsBalances", memberId?.toString() ?? "none"],
    queryFn: async () => {
      if (!actor || memberId === null) return [];
      return actor.listSavingsBalances(memberId);
    },
    enabled: !!actor && !isFetching && memberId !== null,
  });
}

export function useSavingsTransactions(memberId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["savingsTransactions", memberId?.toString() ?? "none"],
    queryFn: async () => {
      if (!actor || memberId === null) return [];
      return actor.listSavingsTransactions(memberId);
    },
    enabled: !!actor && !isFetching && memberId !== null,
  });
}

export function useCreateSavingsType() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      interestRate: number;
      cashAccountCode: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.createSavingsType(
        input.name,
        input.interestRate,
        input.cashAccountCode,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["savingsTypes"] });
    },
  });
}

export function useUpdateSavingsType() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (savingsType: {
      id: bigint;
      name: string;
      interestRate: number;
      cashAccountCode: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.updateSavingsType(savingsType);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["savingsTypes"] });
    },
  });
}

export function useRecordSavingsTransaction() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      memberId: bigint;
      savingsTypeId: bigint;
      cashAccountCode: string;
      amount: number;
      isDeposit: boolean;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.recordSavingsTransaction(
        input.memberId,
        input.savingsTypeId,
        input.cashAccountCode,
        input.amount,
        input.isDeposit,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["savingsBalances"] });
      void queryClient.invalidateQueries({ queryKey: ["savingsTransactions"] });
    },
  });
}

export function useImportInitialSavingsBalances() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Array<[bigint, bigint, number]>) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.importInitialSavingsBalances(rows);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["savingsBalances"] });
      void queryClient.invalidateQueries({ queryKey: ["savingsTransactions"] });
    },
  });
}

export function usePostMonthlySavingsInterest() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.postMonthlySavingsInterest();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["savingsBalances"] });
      void queryClient.invalidateQueries({ queryKey: ["savingsTransactions"] });
    },
  });
}

export function useTrialBalance() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["trialBalance"],
    queryFn: async (): Promise<TrialBalanceRow[]> => {
      if (!actor) return [];
      return actor.getTrialBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIncomeStatement() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["incomeStatement"],
    queryFn: async (): Promise<IncomeStatementRow[]> => {
      if (!actor) return [];
      return actor.getIncomeStatement();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBalanceSheet() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["balanceSheet"],
    queryFn: async (): Promise<BalanceSheetRow[]> => {
      if (!actor) return [];
      return actor.getBalanceSheet();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useShu() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["shu"],
    queryFn: async (): Promise<ShuReport | null> => {
      if (!actor) return null;
      return actor.getShu();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMemberSavingsTransactions(memberId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["memberSavingsTransactions", memberId?.toString() ?? "none"],
    queryFn: async (): Promise<SavingsTransaction[]> => {
      if (!actor || memberId === null) return [];
      return actor.listSavingsTransactions(memberId);
    },
    enabled: !!actor && !isFetching && memberId !== null,
  });
}
