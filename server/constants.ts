export enum HeroClass {
  DRUID,
  HUNTER,
  MAGE,
  PALADIN,
  PRIEST,
  ROGUE,
  SHAMAN,
  WARLOCK,
  WARRIOR,
  NEUTRAL,
}

export enum Rarity {
  COMMON,
  FREE,
  RARE,
  EPIC,
  LEGENDARY,
}

export enum Tribe {
  NONE,
  BEAST,
  TOTEM,
  DEMON,
  MURLOC,
  PIRATE,
  MECH,
  UNDEAD,
  DRAGON,
}

export enum EffectType {
  Spell,
  ChooseOne,
  Combo,
  Battlecry,
  Deathrattle,
  Aura,
  Generic, // not any of the others; shouldn't trigger any additional effects
}

export enum EventType {
  PlayMinion,
  SummonMinion,
  KillMinion,
  Attack,
  Spell,
  Battlecry,
  ChooseOne,
  Combo,
  Deathrattle,
  Damage,
  DrawCard,
  DiscardCard,
  Overdraw,
  Fatigue,
  ChangeStats,
  EndTurn,
  HeroPower,
}
