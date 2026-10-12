import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import FloatValue "mo:caffeineai-oql/FloatValue";
import AccountTypeValue "AccountTypeValue";
import LoanMethodValue "LoanMethodValue";

import Common "types/common";
import AuthTypes "types/auth";
import MemberTypes "types/members";
import CoaTypes "types/coa";
import SavingsTypes "types/savings";
import LoanTypes "types/loans";
import AccountingTypes "types/accounting";
import DashboardTypes "types/dashboard";

import AuthMixin "mixins/auth-api";
import MembersMixin "mixins/members-api";
import CoaMixin "mixins/coa-api";
import SavingsMixin "mixins/savings-api";
import LoansMixin "mixins/loans-api";
import AccountingMixin "mixins/accounting-api";
import DashboardMixin "mixins/dashboard-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let users : Map.Map<Common.UserId, AuthTypes.UserAccount>;
  let authState : AuthTypes.AuthState;

  let members : Map.Map<Common.MemberId, MemberTypes.Member>;
  let memberState : MemberTypes.MemberState;
  let memberEmails : Map.Map<Common.MemberId, Text>;

  let accounts : Map.Map<Common.AccountCode, CoaTypes.Account>;
  let coaState : CoaTypes.CoaState;

  let savingsTypes : Map.Map<Common.SavingsId, SavingsTypes.SavingsType>;
  let savingsTransactions : Map.Map<Common.SavingsId, SavingsTypes.SavingsTransaction>;
  let savingsBalances : Map.Map<(Common.MemberId, Common.SavingsId), SavingsTypes.SavingsBalance>;
  let savingsState : SavingsTypes.SavingsState;

  let loans : Map.Map<Common.LoanId, LoanTypes.Loan>;
  let installments : Map.Map<Common.LoanId, LoanTypes.Installment>;
  let loanState : LoanTypes.LoanState;

  let journals : Map.Map<Common.JournalId, AccountingTypes.JournalEntry>;
  let accountingState : AccountingTypes.AccountingState;

  let dashboardState : DashboardTypes.DashboardState;

  include MixinAuthorization(accessControlState, null);
  include AuthMixin(users, authState);
  include MembersMixin(members, memberState, memberEmails);
  include CoaMixin(accounts, coaState);
  include SavingsMixin(savingsTypes, savingsTransactions, savingsBalances, savingsState, journals, accountingState);
  include LoansMixin(loans, installments, loanState, journals, accountingState, memberEmails);
  include AccountingMixin(journals, accounts, accountingState);
  include DashboardMixin(dashboardState, authState, users, members, savingsBalances, loans, journals, accounts, savingsTransactions, installments);
  include ApiDocMixin();

  include Expose({
    entities = [
      members.toEntity("member", "Member", "id")
        .sample({ id = 0; memberNumber = ""; name = ""; address = ""; phone = ""; email = ""; joinedAt = 0; isActive = true })
        .controllerOnly()
        .build(),
      accounts.toEntity("account", "Account", "code")
        .sample({ code = ""; name = ""; accountType = #asset; isActive = true })
        .controllerOnly()
        .build(),
      savingsTypes.toEntity("savingsType", "SavingsType", "id")
        .sample({ id = 0; name = ""; interestRate = 0.0; cashAccountCode = ""; isActive = true })
        .controllerOnly()
        .build(),
      savingsTransactions.toEntity("savingsTransaction", "SavingsTransaction", "id")
        .sample({ id = 0; transactionNumber = ""; memberId = 0; savingsTypeId = 0; cashAccountCode = ""; amount = 0.0; isDeposit = true; createdAt = 0 })
        .controllerOnly()
        .build(),
      loans.toEntity("loan", "Loan", "id")
        .sample({ id = 0; loanNumber = ""; memberId = 0; principal = 0.0; interestRate = 0.0; method = #anuitas; termMonths = 0; penaltyMonths = 0; penaltyRate = 0.0; disbursedAt = 0; remainingPrincipal = 0.0; isClosed = false })
        .controllerOnly()
        .build(),
      installments.toEntity("installment", "Installment", "id")
        .sample({ id = 0; loanId = 0; transactionNumber = ""; amount = 0.0; paidAt = 0 })
        .controllerOnly()
        .build(),
      journals.toEntityManual("journal", "JournalEntry", "id")
        .sample({ id = 0; transactionNumber = ""; kind = #manualJournal; description = ""; lines = []; createdAt = 0 })
        .payload("id", func j = j.id)
        .payload("transactionNumber", func j = j.transactionNumber)
        .payload("kind", func j = switch (j.kind) {
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
        })
        .payload("description", func j = j.description)
        .payload("lineCount", func j = j.lines.size())
        .payload("createdAt", func j = j.createdAt)
        .controllerOnly()
        .build(),
    ];
  });
};
