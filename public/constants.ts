export enum CardLocation {
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

  /**
   * TryAttack Event
   *
   * Data required: { attackerID: number, targetID: number }
   */
  TryAttack,
  /**
   * TryPlayCard Event
   *
   * Data required depends on card type:
   * - Minions: { boardIndex: number, minionID: number, playerID: PlayerID }
   * - Spells: { cardID: number, playerID: PlayerID }
   * - Weapons: { cardID: number, playerID: PlayerID }
   */
  TryPlayCard,
  /**
   * TryEndTurn Event
   *
   * Data required: None
   */
  TryEndTurn,
  /**
   * TryHeroPower Event
   *
   * Data required: None (NOT IMPLEMENTED YET)
   */
  TryHeroPower,
  /**
   * TryCancel Event
   *
   * Data required: None
   */
  TryCancel,
  /**
   * TryLoad Event
   *
   * Data required: None
   */
  TryLoad,
  /**
   * TryTarget Event
   *
   * Data required: { targetID: number }
   */
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
