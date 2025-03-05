export const HeroClass = {
  DRUID: 0,
  HUNTER: 1,
  MAGE: 2,
  PALADIN: 3,
  PRIEST: 4,
  ROGUE: 5,
  SHAMAN: 6,
  WARLOCK: 7,
  WARRIOR: 8,
  NEUTRAL: 9,
}
Object.freeze(HeroClass)

export const Rarity = {
  COMMON: 0,
  FREE: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4,
}
Object.freeze(Rarity)

export const Tribe = {
  NONE: 0,
  BEAST: 1,
  TOTEM: 2,
  DEMON: 3,
  MURLOC: 4,
  PIRATE: 5,
  MECH: 6,
  UNDEAD: 7,
  DRAGON: 8,
}
Object.freeze(Tribe)

export const EffectType = {
  Spell: 0,
  ChooseOne: 1,
  Combo: 2,
  Battlecry: 3,
  Deathrattle: 4,
  Aura: 5,
  Generic: 6, // not any of the others; shouldn't trigger any additional effects
}
Object.freeze(EffectType)

export const EventType = {
  PlayMinion: 0,
  SummonMinion: 1,
  KillMinion: 2,
  Attack: 3,
  Spell: 4,
  Battlecry: 5,
  ChooseOne: 6,
  Combo: 7,
  Deathrattle: 8,
  Damage: 9,
  DrawCard: 10,
  DiscardCard: 11,
  Overdraw: 12,
  Fatigue: 13,
  ChangeStats: 14,
  EndTurn: 15,
  HeroPower: 16,
  Cancel: 17,
}
Object.freeze(EventType)

export const PlayerID = {
  Player1: 0,
  Player2: 1,
}
Object.freeze(PlayerID)
