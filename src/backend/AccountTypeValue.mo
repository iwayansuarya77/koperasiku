import OQL "mo:caffeineai-oql";

module {
  public func _toRow(self : { #asset; #liability; #equity; #revenue; #expense }) : OQL.Value {
    ignore self;
    #text(
      switch (self) {
        case (#asset) { "asset" };
        case (#liability) { "liability" };
        case (#equity) { "equity" };
        case (#revenue) { "revenue" };
        case (#expense) { "expense" };
      }
    );
  };
};
