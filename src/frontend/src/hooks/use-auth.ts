import { type Role, createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCallerRole() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async (): Promise<Role | null> => {
      if (!actor) return null;
      return actor.getCallerRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogin() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.login(username, password);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["callerRole"] });
    },
  });
}

export function useLogout() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend belum siap");
      await actor.logout();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
}

export function useChangeOwnPassword() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string;
      newPassword: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.changeOwnPassword(oldPassword, newPassword);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
  });
}

export function useUserAccounts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["userAccounts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUserAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateUserAccount() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      password,
      role,
    }: {
      username: string;
      password: string;
      role: Role;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.createUserAccount(username, password, role);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userAccounts"] });
    },
  });
}

export function useAssignUserRole() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: bigint; role: Role }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.assignUserRole(userId, role);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["userAccounts"] });
    },
  });
}

export function useLogo() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["logo"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getLogo();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadLogo() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (logoUrl: string) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.uploadLogo(logoUrl);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["logo"] });
    },
  });
}

export function useCloseMonth() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (period: string) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.closeMonth(period);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
}

export function useCloseYear() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (period: string) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.closeYear(period);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
}

export function useBackupDatabase() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.backupDatabase();
    },
  });
}

export function useClearTransactionData() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (confirmation: string) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.clearTransactionData(confirmation);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
}
