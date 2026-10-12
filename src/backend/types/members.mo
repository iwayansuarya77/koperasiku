import Common "../types/common";

module {
  public type Member = {
    id : Common.MemberId;
    memberNumber : Text;
    name : Text;
    address : Text;
    phone : Text;
    email : Text;
    joinedAt : Common.Timestamp;
    isActive : Bool;
  };

  public type MemberState = {
    var nextMemberId : Common.MemberId;
  };
};
