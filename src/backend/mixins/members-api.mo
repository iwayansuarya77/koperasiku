import Map "mo:core/Map";
import Common "../types/common";
import MemberTypes "../types/members";
import MembersLib "../lib/members";

mixin (
  members : Map.Map<Common.MemberId, MemberTypes.Member>,
  memberState : MemberTypes.MemberState,
  memberEmails : Map.Map<Common.MemberId, Text>,
) {
  public shared ({ caller }) func createMember(memberNumber : Text, name : Text, address : Text, phone : Text, email : Text) : async Common.Result<Common.MemberId> {
    ignore caller;
    let id = MembersLib.createMember(members, memberState, memberNumber, name, address, phone, email);
    memberEmails.add(id, email);
    #ok(id);
  };

  public shared ({ caller }) func updateMember(member : MemberTypes.Member) : async Common.Result<()> {
    ignore caller;
    memberEmails.add(member.id, member.email);
    MembersLib.updateMember(members, member);
  };

  public shared ({ caller }) func deleteMember(memberId : Common.MemberId) : async Common.Result<()> {
    ignore caller;
    MembersLib.deleteMember(members, memberId);
  };

  public query ({ caller }) func getMember(memberId : Common.MemberId) : async ?MemberTypes.Member {
    ignore caller;
    MembersLib.getMember(members, memberId);
  };

  public query ({ caller }) func listMembers() : async [MemberTypes.Member] {
    ignore caller;
    MembersLib.listMembers(members);
  };

  public query ({ caller }) func searchMembers(term : Text) : async [MemberTypes.Member] {
    ignore caller;
    MembersLib.searchMembers(members, term);
  };
};
