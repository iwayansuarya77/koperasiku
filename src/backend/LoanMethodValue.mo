import OQL "mo:caffeineai-oql";

module {
  public func _toRow(self : { #anuitas; #menurun }) : OQL.Value {
    ignore self;
    #text(
      switch (self) {
        case (#anuitas) { "anuitas" };
        case (#menurun) { "menurun" };
      }
    );
  };
};
