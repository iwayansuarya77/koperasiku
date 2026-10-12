import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
    }));
    return;
  }
  // `[baseline, current]`, the same install contract the hosted deploy uses for
  // a converted project. The upgrade replays the chain from the legacy schema.
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BASELINE_WASM,
  });
  await pic.upgradeCanister({
    canisterId: installed.canisterId,
    wasm: BACKEND_WASM,
    arg: new Uint8Array(),
  });
  ({ actor, canisterId } = installed);
});

afterAll(async () => {
  await pic?.tearDown();
});

describe("backend public API", () => {
  it("answers empty-state reads instead of trapping", async () => {
    await expect(actor.listMembers()).resolves.toEqual([]);
    await expect(actor.listAccounts()).resolves.toEqual([]);
    await expect(actor.listSavingsTypes()).resolves.toEqual([]);
    await expect(actor.listJournals()).resolves.toEqual([]);
    await expect(actor.listUserAccounts()).resolves.toEqual([]);
    await expect(actor.getCallerRole()).resolves.toBeNull();
    await expect(actor.getLogo()).resolves.toBe("");
  });

  it("logs in the seeded admin and reports the admin role", async () => {
    const result = await actor.login("admin", "admin123");
    expect(result.__kind__).toBe("ok");
    if (result.__kind__ === "ok") {
      expect(result.ok.username).toBe("admin");
      expect(result.ok.role).toBe("admin");
    }
    await expect(actor.getCallerRole()).resolves.toBe("admin");
  });

  it("round-trips a member through the real canister", async () => {
    const id = await actor.createMember(
      "A-0001",
      "Ada",
      "Jl. Mawar",
      "+62800",
      "ada@contoh.id",
    );
    expect(id.__kind__).toBe("ok");
    const members = await actor.listMembers();
    expect(members).toHaveLength(1);
    expect(members[0]).toMatchObject({ name: "Ada", memberNumber: "A-0001" });
    const found = await actor.searchMembers("Ada");
    expect(found).toHaveLength(1);
  });

  it("round-trips a savings deposit and reports the balance", async () => {
    const typeId = await actor.createSavingsType("Sukarela", 3, "100");
    expect(typeId.__kind__).toBe("ok");
    if (typeId.__kind__ !== "ok") return;

    const tx = await actor.recordSavingsTransaction(
      0n,
      typeId.ok,
      "100",
      250000,
      true,
    );
    expect(tx.__kind__).toBe("ok");
    if (tx.__kind__ === "ok") {
      expect(tx.ok.transactionNumber).not.toBe("");
      expect(tx.ok.amount).toBe(250000);
    }
    await expect(actor.getSavingsBalance(0n, typeId.ok)).resolves.toBe(250000);
  });

  it("creates and disburses a loan, then records a flexible installment", async () => {
    const loan = await actor.createLoan(0n, 1_000_000, 12, { anuitas: null }, 12n, 1n, 5);
    expect(loan.__kind__).toBe("ok");
    if (loan.__kind__ !== "ok") return;

    await expect(actor.disburseLoan(loan.ok.id)).resolves.toEqual({
      __kind__: "ok",
      ok: null,
    });
    const installment = await actor.recordInstallment(loan.ok.id, 100_000);
    expect(installment.__kind__).toBe("ok");
    await expect(actor.listInstallments(loan.ok.id)).resolves.toHaveLength(1);
  });

  it("posts a cash entry and reflects it in the trial balance", async () => {
    const journalId = await actor.postCashEntry(
      "Setoran modal",
      [
        { accountCode: "100", debit: 500000, credit: 0 },
        { accountCode: "300", debit: 0, credit: 500000 },
      ],
      true,
    );
    expect(journalId.__kind__).toBe("ok");
    const journals = await actor.listJournals();
    expect(journals.length).toBeGreaterThan(0);
    await expect(actor.getTrialBalance()).resolves.toBeInstanceOf(Array);
  });

  it("stores the uploaded logo and returns it", async () => {
    await expect(actor.uploadLogo("https://contoh.id/logo.png")).resolves.toEqual({
      __kind__: "ok",
      ok: null,
    });
    await expect(actor.getLogo()).resolves.toBe("https://contoh.id/logo.png");
  });

  it("rejects clearing transaction data without the HAPUS confirmation", async () => {
    const result = await actor.clearTransactionData("HAPUS");
    expect(result.__kind__).toBe("ok");
  });

  it("closes a month under the admin session", async () => {
    await expect(actor.closeMonth("2026-01")).resolves.toEqual({
      __kind__: "ok",
      ok: null,
    });
  });
});
