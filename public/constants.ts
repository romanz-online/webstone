export enum Location {
  Deck,
  Hand,
  Board,
  Graveyard,
}

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
  TriggerDeath,
  Death,
  Attack,
  Effect,
  Damage,
  DrawCard,
  DiscardCard,
  Overdraw,
  Fatigue,
  ChangeStats,
  HeroPower,
  RestoreHealth,
  EndTurn,
  StartTurn,
  Cancel,
  Load,
  Target,

  TryAttack,
  TryPlayCard,
  TryEndTurn,
  TryHeroPower,
  TryCancel,
  TryLoad,
  TryTarget,
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
