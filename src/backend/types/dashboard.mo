import Common "../types/common";

module {
  public type DashboardStats = {
    memberCount : Nat;
    totalSavings : Float;
    totalLoans : Float;
  };

  public type CashFlowPoint = {
    date : Common.Timestamp;
    balance : Float;
  };

  public type PeriodClose = {
    period : Text;
    closedAt : Common.Timestamp;
    closedBy : Common.UserId;
  };

  public type DashboardState = {
    var logoUrl : Text;
    var lastMonthlyClose : ?PeriodClose;
    var lastYearlyClose : ?PeriodClose;
  };
};
