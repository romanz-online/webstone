export enum CLASS {
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

export enum RARITY {
  COMMON,
  FREE,
  RARE,
  EPIC,
  LEGENDARY,
}

export enum TRIBE {
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

export enum EFFECT_TYPE {
  SPELL,
  CHOOSE_ONE,
  COMBO,
  BATTLECRY,
  DEATHRATTLE,
  AURA,
  GENERIC, // not any of the others; shouldn't trigger any additional effects
}
