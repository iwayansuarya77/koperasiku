import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Common "../types/common";
import MemberTypes "../types/members";

module {
  public func createMember(
    members : Map.Map<Common.MemberId, MemberTypes.Member>,
    state : MemberTypes.MemberState,
    memberNumber : Text,
    name : Text,
    address : Text,
    phone : Text,
    email : Text,
  ) : Common.MemberId {
    let id = state.nextMemberId;
    state.nextMemberId := id + 1;
    members.add(id, {
      id;
      memberNumber;
      name;
      address;
      phone;
      email;
      joinedAt = Time.now().toNat();
      isActive = true;
    });
    id;
  };

  public func updateMember(
    members : Map.Map<Common.MemberId, MemberTypes.Member>,
    member : MemberTypes.Member,
  ) : Common.Result<()> {
    switch (members.get(member.id)) {
      case null { #err("Anggota tidak ditemukan") };
      case (?_) {
        members.add(member.id, member);
        #ok(());
      };
    };
  };

  public func deleteMember(
    members : Map.Map<Common.MemberId, MemberTypes.Member>,
    memberId : Common.MemberId,
  ) : Common.Result<()> {
    switch (members.get(memberId)) {
      case null { #err("Anggota tidak ditemukan") };
      case (?_) {
        members.remove(memberId);
        #ok(());
      };
    };
  };

  public func getMember(
    members : Map.Map<Common.MemberId, MemberTypes.Member>,
    memberId : Common.MemberId,
  ) : ?MemberTypes.Member {
    members.get(memberId);
  };

  public func listMembers(
    members : Map.Map<Common.MemberId, MemberTypes.Member>,
  ) : [MemberTypes.Member] {
    let result = List.empty<MemberTypes.Member>();
    for (m in members.values()) {
      result.add(m);
    };
    result.toArray();
  };

  public func searchMembers(
    members : Map.Map<Common.MemberId, MemberTypes.Member>,
    term : Text,
  ) : [MemberTypes.Member] {
    let t = term.toLower();
    let result = List.empty<MemberTypes.Member>();
    for (m in members.values()) {
      if (m.name.toLower().contains(#text t) or m.memberNumber.toLower().contains(#text t)) {
        result.add(m);
      };
    };
    result.toArray();
  };
};
