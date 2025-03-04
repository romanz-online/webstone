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
  SPELL,
  CHOOSE_ONE,
  COMBO,
  BATTLECRY,
  DEATHRATTLE,
  AURA,
  GENERIC, // not any of the others; shouldn't trigger any additional effects
}
