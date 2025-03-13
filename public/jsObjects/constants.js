export const HeroClass = {
Druid:0,
Hunter:1,
Mage:2,
Paladin:3,
Priest:4,
Rogue:5,
Shaman:6,
Warlock:7,
Warrior:8,
Neutral:9,
}
Object.freeze(HeroClass)

export const Rarity = {
Common:0,
Free:1,
Rare:2,
Epic:3,
Legendary:4,
}
Object.freeze(Rarity)

export const Tribe = {
None:0,
Beast:1,
Totem:2,
Demon:3,
Murloc:4,
Pirate:5,
Mech:6,
Undead:7,
Dragon:8,
}
Object.freeze(Tribe)

export const EffectType = {
Spell:0,
ChooseOne:1,
Combo:2,
Battlecry:3,
Deathrattle:4,
Aura:5,
Silence:6,
Generic:7,
}
Object.freeze(EffectType)

export const EventType = {
PlayCard:0,
SummonMinion:1,
TriggerDeath:2,
Death:3,
Attack:4,
Effect:5,
Damage:6,
DrawCard:7,
DiscardCard:8,
Overdraw:9,
Fatigue:10,
ChangeStats:11,
HeroPower:12,
RestoreHealth:13,
EndTurn:14,
StartTurn:15,
Cancel:16,
Load:17,
Target:18,
TryAttack:19,
TryPlayCard:20,
TryEndTurn:21,
TryHeroPower:22,
TryCancel:23,
TryLoad:24,
TryTarget:25,
}
Object.freeze(EventType)

export const CardType = {
Minion:0,
Spell:1,
Weapon:2,
}
Object.freeze(CardType)

export const PlayerID = {
Player1:0,
Player2:1,
}
Object.freeze(PlayerID)

export const Keyword = {
Taunt:0,
Stealth:1,
Poison:2,
Windfury:3,
Charge:4,
DivineShield:5,
Elusive:6,
}
Object.freeze(Keyword)

