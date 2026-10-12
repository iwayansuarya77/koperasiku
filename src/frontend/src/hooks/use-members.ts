import { type Member, createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMembers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["members"],
    queryFn: async (): Promise<Member[]> => {
      if (!actor) return [];
      return actor.listMembers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchMembers(term: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["members", "search", term],
    queryFn: async (): Promise<Member[]> => {
      if (!actor) return [];
      return actor.searchMembers(term);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMember() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      memberNumber: string;
      name: string;
      address: string;
      phone: string;
      email: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.createMember(
        input.memberNumber,
        input.name,
        input.address,
        input.phone,
        input.email,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useUpdateMember() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (member: Member) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.updateMember(member);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useDeleteMember() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.deleteMember(memberId);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
