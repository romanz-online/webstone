import { HeroClass, Rarity, Tribe, EffectType } from '../constants'

const MINION_DATA = [
  // minion objects will have more data than this
  // these are just the baseline stats for each minion, before manipulation

  // DRUID
  {
    class: HeroClass.Druid,
    name: 'Keeper of the Grove',
    fileName: 'keeper_of_the_grove',
    mana: 4,
    attack: 2,
    health: 4,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Druid,
    name: 'Druid of the Claw',
    fileName: 'druid_of_the_claw',
    mana: 5,
    attack: 4,
    health: 4,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Druid,
    name: 'Ancient of Lore',
    fileName: 'ancient_of_lore',
    mana: 7,
    attack: 5,
    health: 5,
    rarity: Rarity.Epic,
  },
  {
    class: HeroClass.Druid,
    name: 'Ancient of War',
    fileName: 'ancient_of_war',
    mana: 7,
    attack: 5,
    health: 5,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Druid,
    name: 'Ironbark Protector',
    fileName: 'ironbark_protector',
    mana: 8,
    attack: 8,
    health: 8,
    rarity: Rarity.Free,
    taunt: true,
  },
  {
    class: HeroClass.Druid,
    name: 'Cenarius',
    fileName: 'cenarius',
    mana: 9,
    attack: 5,
    health: 8,
    rarity: Rarity.Legendary,
  },
  // HUNTER
  {
    class: HeroClass.Hunter,
    name: 'Timber Wolf',
    fileName: 'timber_wolf',
    mana: 1,
    attack: 1,
    health: 1,
    rarity: Rarity.Free,
    tribe: Tribe.Beast,
  },
  {
    class: HeroClass.Hunter,
    name: 'Scavenging Hyena',
    fileName: 'scavenging_hyena',
    mana: 2,
    attack: 2,
    health: 2,
    rarity: Rarity.Common,
    tribe: Tribe.Beast,
  },
  {
    class: HeroClass.Hunter,
    name: 'Starving Buzzard',
    description: 'Whenever you summon a Beast, draw a card.',
    fileName: 'starving_buzzard',
    mana: 2,
    attack: 2,
    health: 1,
    rarity: Rarity.Free,
    tribe: Tribe.Beast,
  },
  {
    class: HeroClass.Hunter,
    name: 'Houndmaster',
    fileName: 'houndmaster',
    mana: 4,
    attack: 4,
    health: 3,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Hunter,
    name: 'Tundra Rhino',
    fileName: 'tundra_rhino',
    mana: 5,
    attack: 2,
    health: 5,
    rarity: Rarity.Free,
    tribe: Tribe.Beast,
  },
  {
    class: HeroClass.Hunter,
    name: 'Savannah Highmane',
    fileName: 'savannah_highmane',
    mana: 6,
    attack: 6,
    health: 5,
    rarity: Rarity.Rare,
    tribe: Tribe.Beast,
  },
  {
    class: HeroClass.Hunter,
    name: 'King Krush',
    fileName: 'king_krush',
    mana: 9,
    attack: 8,
    health: 8,
    rarity: Rarity.Legendary,
    tribe: Tribe.Beast,
  },
  // MAGE
  {
    class: HeroClass.Mage,
    name: 'Mana Wyrm',
    fileName: 'mana_wyrm',
    mana: 1,
    attack: 1,
    health: 3,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Mage,
    name: "Sorcerer's Apprentice",
    fileName: 'sorcerers_apprentice',
    mana: 2,
    attack: 3,
    health: 2,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Mage,
    name: 'Kirin Tor Mage',
    fileName: 'kirin_tor_mage',
    mana: 3,
    attack: 4,
    health: 3,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Mage,
    name: 'Ethereal Arcanist',
    fileName: 'ethereal_arcanist',
    mana: 4,
    attack: 3,
    health: 3,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Mage,
    name: 'Water Elemental',
    fileName: 'water_elemental',
    mana: 4,
    attack: 3,
    health: 6,
    rarity: Rarity.Free,
  },
  {
    class: HeroClass.Mage,
    name: 'Archmage Antonidas',
    fileName: 'archmage_antonidas',
    mana: 7,
    attack: 5,
    health: 7,
    rarity: Rarity.Legendary,
  },
  // PALADIN
  {
    class: HeroClass.Paladin,
    name: 'Argent Protector',
    fileName: 'argent_protector',
    mana: 2,
    attack: 2,
    health: 2,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Paladin,
    name: 'Aldor Peacekeeper',
    fileName: 'aldor_peacekeeper',
    mana: 3,
    attack: 3,
    health: 3,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Paladin,
    name: 'Guardian of Kings',
    fileName: 'guardian_of_kings',
    mana: 7,
    attack: 5,
    health: 6,
    rarity: Rarity.Free,
  },
  {
    class: HeroClass.Paladin,
    name: 'Tirion Fordring',
    fileName: 'tirion_fordring',
    mana: 8,
    attack: 6,
    health: 6,
    rarity: Rarity.Legendary,
    taunt: true,
  },
  // PRIEST
  {
    class: HeroClass.Priest,
    name: 'Northshire Cleric',
    fileName: 'northshire_cleric',
    mana: 1,
    attack: 1,
    health: 3,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Priest,
    name: 'Lightwell',
    fileName: 'lightwell',
    mana: 2,
    attack: 0,
    health: 5,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Priest,
    name: 'Auchenai Soulpriest',
    fileName: 'auchenai_soulpriest',
    mana: 4,
    attack: 3,
    health: 5,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Priest,
    name: 'Lightspawn',
    fileName: 'lightspawn',
    mana: 4,
    attack: 0,
    health: 5,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Priest,
    name: 'Cabal Shadow Priest',
    fileName: 'cabal_shadow_priest',
    mana: 6,
    attack: 4,
    health: 5,
    rarity: Rarity.Epic,
  },
  {
    class: HeroClass.Priest,
    name: 'Temple Enforcer',
    fileName: 'temple_enforcer',
    mana: 6,
    attack: 6,
    health: 6,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Priest,
    name: 'Prophet Velen',
    fileName: 'prophet_velen',
    mana: 7,
    attack: 7,
    health: 7,
    rarity: Rarity.Legendary,
  },
  // ROGUE
  {
    class: HeroClass.Rogue,
    name: 'Defias Ring Leader',
    fileName: 'defias_ring_leader',
    mana: 2,
    attack: 2,
    health: 2,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Rogue,
    name: 'Patient Assassin',
    fileName: 'patient_assassin',
    mana: 2,
    attack: 1,
    health: 1,
    rarity: Rarity.Rare,
    stealth: true,
    poison: true,
  },
  {
    class: HeroClass.Rogue,
    name: 'Edwin VanCleef',
    fileName: 'edwin_vancleef',
    mana: 3,
    attack: 2,
    health: 2,
    rarity: Rarity.Legendary,
  },
  {
    class: HeroClass.Rogue,
    name: 'SI:7 Agent',
    fileName: 'si7_agent',
    mana: 3,
    attack: 3,
    health: 3,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Rogue,
    name: 'Master of Disguise',
    fileName: 'master_of_disguise',
    mana: 4,
    attack: 4,
    health: 4,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Rogue,
    name: 'Kidnapper',
    fileName: 'kidnapper',
    mana: 6,
    attack: 5,
    health: 3,
    rarity: Rarity.Rare,
    tribe: Tribe.Undead,
  },
  // SHAMAN
  {
    class: HeroClass.Shaman,
    name: 'Dust Devil',
    fileName: 'dust_devil',
    mana: 1,
    attack: 3,
    health: 1,
    rarity: Rarity.Common,
    overload: 2,
    windfury: true,
  },
  {
    class: HeroClass.Shaman,
    name: 'Flametongue Totem',
    fileName: 'flametongue_totem',
    mana: 2,
    attack: 0,
    health: 3,
    rarity: Rarity.Free,
    tribe: Tribe.Totem,
  },
  {
    class: HeroClass.Shaman,
    name: 'Mana Tide Totem',
    fileName: 'mana_tide_totem',
    mana: 3,
    attack: 0,
    health: 3,
    rarity: Rarity.Rare,
    tribe: Tribe.Totem,
  },
  {
    class: HeroClass.Shaman,
    name: 'Unbound Elemental',
    fileName: 'unbound_elemental',
    mana: 3,
    attack: 2,
    health: 4,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Shaman,
    name: 'Windspeaker',
    fileName: 'windspeaker',
    mana: 4,
    attack: 3,
    health: 3,
    rarity: Rarity.Free,
  },
  {
    class: HeroClass.Shaman,
    name: 'Earth Elemental',
    fileName: 'earth_elemental',
    mana: 5,
    attack: 7,
    health: 8,
    rarity: Rarity.Epic,
    overload: 3,
    taunt: true,
  },
  {
    class: HeroClass.Shaman,
    name: 'Fire Elemental',
    fileName: 'fire_elemental',
    mana: 6,
    attack: 6,
    health: 5,
    rarity: Rarity.Free,
  },
  {
    class: HeroClass.Shaman,
    name: "Al'Akir the Windlord",
    fileName: 'alakir_the_windlord',
    mana: 8,
    attack: 3,
    health: 5,
    rarity: Rarity.Legendary,
    charge: true,
    taunt: true,
    divineShield: true,
    windfury: true,
  },
  // WARLOCK
  {
    class: HeroClass.Warlock,
    name: 'Blood Imp',
    fileName: 'blood_imp',
    mana: 1,
    attack: 0,
    health: 1,
    rarity: Rarity.Common,
    tribe: Tribe.Demon,
    stealth: true,
  },
  {
    class: HeroClass.Warlock,
    name: 'Flame Imp',
    fileName: 'flame_imp',
    mana: 1,
    attack: 3,
    health: 2,
    rarity: Rarity.Common,
    tribe: Tribe.Demon,
  },
  {
    class: HeroClass.Warlock,
    name: 'Voidwalker',
    fileName: 'voidwalker',
    mana: 1,
    attack: 1,
    health: 3,
    rarity: Rarity.Free,
    tribe: Tribe.Demon,
    taunt: true,
  },
  {
    class: HeroClass.Warlock,
    name: 'Felstalker',
    fileName: 'felstalker',
    mana: 2,
    attack: 4,
    health: 3,
    rarity: Rarity.Free,
    tribe: Tribe.Demon,
  },
  {
    class: HeroClass.Warlock,
    name: 'Felguard',
    fileName: 'felguard',
    mana: 3,
    attack: 3,
    health: 5,
    rarity: Rarity.Rare,
    tribe: Tribe.Demon,
    taunt: true,
  },
  {
    class: HeroClass.Warlock,
    name: 'Void Terror',
    fileName: 'void_terror',
    mana: 3,
    attack: 3,
    health: 3,
    rarity: Rarity.Rare,
    tribe: Tribe.Demon,
  },
  {
    class: HeroClass.Warlock,
    name: 'Pit Lord',
    fileName: 'pit_lord',
    mana: 4,
    attack: 5,
    health: 6,
    rarity: Rarity.Rare,
    tribe: Tribe.Demon,
  },
  {
    class: HeroClass.Warlock,
    name: 'Summoning Portal',
    fileName: 'summoning_portal',
    mana: 4,
    attack: 0,
    health: 4,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Warlock,
    name: 'Doomguard',
    fileName: 'doomguard',
    mana: 5,
    attack: 5,
    health: 7,
    rarity: Rarity.Rare,
    tribe: Tribe.Demon,
    charge: true,
  },
  {
    class: HeroClass.Warlock,
    name: 'Dread Infernal',
    fileName: 'dread_infernal',
    rarity: Rarity.Free,
    tribe: Tribe.Demon,
    mana: 6,
    attack: 6,
    health: 6,
  },
  {
    class: HeroClass.Warlock,
    name: 'Lord Jaraxxus',
    fileName: 'lord_jaraxxus',
    mana: 9,
    attack: 3,
    health: 15,
    rarity: Rarity.Legendary,
    tribe: Tribe.Demon,
  },
  // WARRIOR
  {
    class: HeroClass.Warrior,
    name: 'Armorsmith',
    fileName: 'armorsmith',
    mana: 2,
    attack: 1,
    health: 4,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Warrior,
    name: 'Cruel Taskmaster',
    fileName: 'cruel_taskmaster',
    mana: 2,
    attack: 2,
    health: 2,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Warrior,
    name: 'Frothing Berserker',
    fileName: 'frothing_berserker',
    mana: 3,
    attack: 2,
    health: 4,
    rarity: Rarity.Rare,
  },
  {
    class: HeroClass.Warrior,
    name: 'Warsong Commander',
    fileName: 'warsong_commander',
    mana: 3,
    attack: 2,
    health: 3,
    rarity: Rarity.Free,
  },
  {
    class: HeroClass.Warrior,
    name: 'Arathi Weaponsmith',
    fileName: 'arathi_weaponsmith',
    mana: 4,
    attack: 3,
    health: 3,
    rarity: Rarity.Common,
  },
  {
    class: HeroClass.Warrior,
    name: "Kor'kron Elite",
    fileName: 'korkron_elite',
    mana: 4,
    attack: 4,
    health: 3,
    rarity: Rarity.Free,
    charge: true,
  },
  {
    class: HeroClass.Warrior,
    name: 'Grommash Hellscream',
    fileName: 'grommash_hellscream',
    mana: 8,
    attack: 4,
    health: 9,
    rarity: Rarity.Legendary,
    charge: true,
  },
  {
    class: HeroClass.Neutral,
    name: 'Faerie Dragon',
    fileName: 'faerie_dragon',
    mana: 2,
    attack: 3,
    health: 2,
    rarity: Rarity.Common,
    elusive: true,
  },
]

export default MINION_DATA
