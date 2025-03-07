export enum HeroClass {
  Druid,
  Hunter,
  Mage,
  Paladin,
  Priest,
  Rogue,
  Shaman,
  Warlock,
  Warrior,
  Neutral,
}

export enum Rarity {
  Common,
  Free,
  Rare,
  Epic,
  Legendary,
}

export enum Tribe {
  None,
  Beast,
  Totem,
  Demon,
  Murloc,
  Pirate,
  Mech,
  Undead,
  Dragon,
}

export enum EffectType {
  Spell,
  ChooseOne,
  Combo,
  Battlecry,
  Deathrattle,
  Aura,
  Silence,
  Generic,
}

export enum EventType {
  PlayCard,
  SummonMinion,
  Kill,
  Death,
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
  RestoreHealth,

  Cancel,
  Target,
  TryAttack,
  TrySpell,
  TryPlayCard,
  Load,
}

export enum CardType {
  Minion,
  Spell,
  Weapon,
}

export enum PlayerID {
  Player1,
  Player2,
}

export enum Keyword {
  Taunt,
  Stealth,
  Poison,
  Windfury,
  Charge,
  DivineShield,
  Elusive,
}
