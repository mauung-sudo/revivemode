import type { MockGame } from './games'

// Long-form game info for the details page. Mock until the backend
// provides it (docs/BACKEND.md → games table).
export interface GameInfo {
  publisher: string
  series?: string
  plot: string
  gameplay: string
  screenshots: string[]
}

const INFO: Record<string, GameInfo> = {
  'super-mario-bros': {
    publisher: 'Nintendo',
    series: 'Super Mario',
    plot: 'Following the events of Mario Bros., the game is set in the fantasy land of the Mushroom Kingdom after Mario had arrived through a clay pipe from New York City.',
    gameplay:
      "In Super Mario Bros., the player controls Mario, the protagonist of the series. Mario's brother, Luigi, is controlled by the second player in the game's multiplayer mode and assumes the same plot role and functionality as Mario. The objective is to race through the Mushroom Kingdom, survive the main antagonist Bowser's forces, and save Princess Toadstool. It is a side-scrolling platform game where the player moves to the right to reach the flagpole at the end of each level.",
    screenshots: ['/assets/game/ss-1.png', '/assets/game/ss-2.png', '/assets/game/ss-3.png', '/assets/game/ss-4.png'],
  },
  'super-mario-world': {
    publisher: 'Nintendo',
    series: 'Super Mario',
    plot: 'Mario and Luigi are on holiday in Dinosaur Land when Bowser kidnaps Princess Toadstool again. With the help of Yoshi and his fellow dinosaurs, the brothers set out across seven worlds to rescue her.',
    gameplay:
      'A side-scrolling platformer played from an overworld map. Ride Yoshi to eat enemies, fly with the cape feather, and hunt for secret exits that unlock hidden routes like the Star Road. Many levels have more than one way out, so exploring pays off.',
    screenshots: [],
  },
  'sonic-2': {
    publisher: 'Sega',
    series: 'Sonic the Hedgehog',
    plot: 'Dr. Robotnik is building a giant space station, the Death Egg, and needs the Chaos Emeralds to power it. Sonic teams up with his new sidekick Tails to stop him.',
    gameplay:
      'High-speed platforming through loops, springs and ramps. The spin dash lets Sonic launch from a standstill, a second player can take control of Tails, and the half-pipe special stages hold the Chaos Emeralds. There is also a split-screen race mode.',
    screenshots: [],
  },
  'pac-man': {
    publisher: 'Namco',
    series: 'Pac-Man',
    plot: 'Pac-Man is trapped in a maze with four ghosts, Blinky, Pinky, Inky and Clyde, each with its own way of hunting him down.',
    gameplay:
      'Eat every dot to clear the maze while dodging the ghosts. Power pellets turn the ghosts blue for a few seconds so Pac-Man can eat them for big points, and bonus fruit appears in the middle. Two players can take turns.',
    screenshots: [],
  },
  'street-fighter-2': {
    publisher: 'Capcom',
    series: 'Street Fighter',
    plot: 'Fighters from around the world enter a tournament run by the criminal organisation Shadaloo, each with their own reason to face its leader, M. Bison.',
    gameplay:
      'One-on-one fighting with six attack buttons. Each character has special moves performed with joystick motions, and matches are best of three rounds. Fight the computer through the tournament or go head to head with a friend.',
    screenshots: [],
  },
  'sf2-world-warrior': {
    publisher: 'Capcom',
    series: 'Street Fighter',
    plot: 'Eight world warriors, including Ryu, Ken, Chun-Li and Guile, fight their way through a tournament towards the four Shadaloo bosses waiting at the top.',
    gameplay:
      'The home version of the game that started the fighting game boom: light, medium and heavy punches and kicks, special moves like the Hadoken, and close-range throws. Learning each fighter’s strengths is the key to beating the bosses.',
    screenshots: [],
  },
  'mega-man-x': {
    publisher: 'Capcom',
    series: 'Mega Man X',
    plot: 'In the future, robots called Reploids live alongside humans until their leader, Sigma, turns many of them into rebels called Mavericks. X, a new kind of robot, sets out to stop him.',
    gameplay:
      'Pick the order of eight Maverick bosses and take each one’s weapon when you win. X can dash and climb walls, and hidden capsules upgrade his armor. Heart tanks and sub-tanks hidden in stages make him tougher for the final fortress.',
    screenshots: [],
  },
  'castlevania-sotn': {
    publisher: 'Konami',
    series: 'Castlevania',
    plot: 'Dracula’s castle has risen again and the vampire hunter Richter Belmont has vanished. Alucard, Dracula’s son, wakes from his sleep to find out why.',
    gameplay:
      'Explore one huge, connected castle at your own pace. Alucard levels up, collects weapons, armor and spells, and gains powers such as turning into a bat that open up new areas. Hidden rooms and secrets reward going back to places you have already seen.',
    screenshots: [],
  },
  'metal-slug': {
    publisher: 'SNK',
    series: 'Metal Slug',
    plot: 'A rebel army led by General Morden has taken over. Marco and Tarma of the Peregrine Falcon squad are sent in to stop him.',
    gameplay:
      'A run-and-gun shooter famous for its detailed hand-drawn animation. Free prisoners of war for weapon drops, jump into the Metal Slug tank, and blast through soldiers and giant bosses. Two players can play together.',
    screenshots: [],
  },
  'crash-bandicoot': {
    publisher: 'Sony Computer Entertainment',
    series: 'Crash Bandicoot',
    plot: 'Mad scientist Dr. Neo Cortex turns a bandicoot named Crash into his would-be soldier, but Crash escapes. He travels across three islands to stop Cortex and rescue his girlfriend.',
    gameplay:
      'A 3D platformer where most levels run into the screen. Spin and jump through enemies, smash crates for fruit and extra lives, and collect masks that protect you from one hit. Breaking every crate in a level earns a gem.',
    screenshots: [],
  },
  tetris: {
    publisher: 'Nintendo',
    series: 'Tetris',
    plot: 'There is no story: just falling blocks and how long you can keep up.',
    gameplay:
      'Rotate and move the falling pieces, called tetrominoes, to fill complete lines, which then disappear. The pieces fall faster as you level up. Play endlessly for a high score, or try to clear a set number of lines in the other mode.',
    screenshots: [],
  },
  'sf-alpha': {
    publisher: 'Capcom',
    series: 'Street Fighter',
    plot: 'Set between the first two Street Fighter games, it shows younger versions of fighters like Ryu, Ken and Chun-Li before the events of Street Fighter II.',
    gameplay:
      'A fast 2D fighter with a three-level Super Combo gauge, counter-attacks straight out of a block (Alpha Counters) and blocking in the air. It has a brighter, anime-inspired art style than earlier games.',
    screenshots: [],
  },
  sonic: {
    publisher: 'Sega',
    series: 'Sonic the Hedgehog',
    plot: 'Dr. Robotnik is trapping the animals of South Island inside robots and searching for the Chaos Emeralds. Sonic races to free them.',
    gameplay:
      'Run, roll and jump through six zones of three acts each. Rings protect you from a hit, and reaching the end of an act with 50 or more opens a rotating maze special stage where a Chaos Emerald waits.',
    screenshots: [],
  },
  'space-invaders': {
    publisher: 'Atari',
    series: 'Space Invaders',
    plot: 'Rows of aliens march down from the sky, and only your laser cannon stands in their way.',
    gameplay:
      'Slide left and right under the shields and shoot the invaders before they reach the ground. They speed up as their numbers shrink, and a mystery ship crosses the top for bonus points. The cartridge has many game variations, including two-player modes.',
    screenshots: [],
  },
  'mortal-kombat': {
    publisher: 'Acclaim',
    series: 'Mortal Kombat',
    plot: 'The sorcerer Shang Tsung hosts a deadly tournament on his island. If Earth’s fighters lose one more time, their world falls to Outworld.',
    gameplay:
      'A 2D fighter with digitized actors, a dedicated block button and finishing moves called Fatalities. Climb through the other fighters, then face the four-armed champion Goro and Shang Tsung himself.',
    screenshots: [],
  },
  'mortal-kombat-2': {
    publisher: 'Acclaim',
    series: 'Mortal Kombat',
    plot: 'Shang Tsung lures Earth’s fighters into Outworld for a new tournament ruled by the emperor Shao Kahn.',
    gameplay:
      'A bigger roster, faster fights and more ways to finish an opponent than the first game, including several Fatalities per fighter plus sillier finishers. Learn each character’s special moves and combos to reach Shao Kahn.',
    screenshots: [],
  },
  'chrono-trigger': {
    publisher: 'Square',
    series: 'Chrono',
    plot: 'An accident with a teleporter at a village fair sends Crono and his friends through time. They learn that a creature called Lavos will destroy the world in the future, and set out to change history.',
    gameplay:
      'A role-playing game with battles that happen right on the map. Party members combine their skills into double and triple attacks, choices across different eras change what happens later, and there are many endings to find.',
    screenshots: [],
  },
  metroid: {
    publisher: 'Nintendo',
    series: 'Metroid',
    plot: 'Space Pirates have stolen life forms called Metroids and plan to use them as weapons. Bounty hunter Samus Aran lands on planet Zebes to stop them and their leader, Mother Brain.',
    gameplay:
      'Explore a maze of connected caverns, find power-ups such as the Morph Ball and missiles, and use them to reach areas that were blocked before. Progress is kept with passwords.',
    screenshots: [],
  },
  zelda: {
    publisher: 'Nintendo',
    series: 'The Legend of Zelda',
    plot: 'Ganon has captured Princess Zelda and taken the Triforce of Power. Link must find the eight scattered pieces of the Triforce of Wisdom to face him.',
    gameplay:
      'Explore an open overworld from above, find hidden caves and shops, and fight through dungeons for new items like the boomerang and bow that solve puzzles and beat bosses. Finishing the game unlocks a harder second quest.',
    screenshots: [],
  },
  'mega-man-2': {
    publisher: 'Capcom',
    series: 'Mega Man',
    plot: 'Dr. Wily builds eight new Robot Masters to take over the world, and Mega Man sets out to stop him again.',
    gameplay:
      'Choose any of the eight stages in any order and win each boss’s weapon. Every boss is weak to another boss’s weapon, so the order you pick matters. Energy tanks refill your health, and passwords save your progress.',
    screenshots: [],
  },
  contra: {
    publisher: 'Konami',
    series: 'Contra',
    plot: 'Commandos Bill and Lance are sent to a jungle island to stop the alien force known as Red Falcon.',
    gameplay:
      'A tough run-and-gun shooter where one hit costs a life. Shoot flying capsules for weapons like the Spread Gun, fight through side-scrolling and into-the-screen base stages, and play side by side with a friend.',
    screenshots: [],
  },
  castlevania: {
    publisher: 'Konami',
    series: 'Castlevania',
    plot: 'Count Dracula has returned, and vampire hunter Simon Belmont enters his castle to defeat him.',
    gameplay:
      'Fight through six stages with a whip that can be powered up. Hearts found in candles fuel sub-weapons like the axe, dagger and holy water. Each stage ends with a classic monster as the boss.',
    screenshots: [],
  },
  'kirbys-adventure': {
    publisher: 'Nintendo',
    series: 'Kirby',
    plot: 'King Dedede has broken the Star Rod that powers Dream Land’s Fountain of Dreams, and nobody can dream anymore. Kirby sets off to find the pieces.',
    gameplay:
      'Kirby floats, inhales enemies and copies their powers, from fire breath to swords and wheels. Levels are bright and forgiving, with hidden switches, mini-games and secrets to find.',
    screenshots: [],
  },
  'punch-out': {
    publisher: 'Nintendo',
    series: 'Punch-Out!!',
    plot: 'Little Mac, a small boxer from the Bronx, is trained by Doc Louis and works his way up through the circuits towards the title fight.',
    gameplay:
      'Each opponent has a pattern and tells that show what they will throw next. Dodge, block and counter at the right moment, earn star punches for big hits, and watch your stamina. Passwords let you continue later.',
    screenshots: [],
  },
  'tekken-3': {
    publisher: 'Namco',
    series: 'Tekken',
    plot: 'Twenty years after the last tournament, a being called Ogre is attacking the world’s best fighters. Heihachi Mishima holds a new King of Iron Fist tournament to lure it out, and young Jin Kazama enters.',
    gameplay:
      'A 3D fighter where each of four buttons controls one limb. Sidestep around the arena, chain moves into combos and learn a large cast. Extra modes include a beat-’em-up called Tekken Force.',
    screenshots: [],
  },
  'kof-98': {
    publisher: 'SNK',
    series: 'The King of Fighters',
    plot: 'A “dream match” with no story: fighters from the earlier games come together for one big tournament.',
    gameplay:
      'Pick a team of three and fight three-on-three. Choose between two fighting styles that change how running, dodging and the power gauge work. The large roster makes it a favourite of the series.',
    screenshots: [],
  },
  'marvel-vs-capcom': {
    publisher: 'Capcom',
    series: 'Marvel vs. Capcom',
    plot: 'The powerful Onslaught threatens both worlds, and heroes from Marvel comics and Capcom games team up to stop him.',
    gameplay:
      'A fast two-on-two tag fighter. Swap fighters mid-match, call in a random helper character for a quick assist, and unleash team hyper combos together.',
    screenshots: [],
  },
  soulcalibur: {
    publisher: 'Namco',
    series: 'Soulcalibur',
    plot: 'Warriors from around the world hunt for Soul Edge, a cursed sword said to grant its owner great power.',
    gameplay:
      'A 3D weapon-based fighter. Move freely in eight directions, use each fighter’s weapon reach and time guard impacts to turn an opponent’s attack against them.',
    screenshots: [],
  },
  'samurai-shodown': {
    publisher: 'SNK',
    series: 'Samurai Shodown',
    plot: 'In feudal Japan, swordsmen and warriors gather to stop a dark force rising in the late 18th century.',
    gameplay:
      'A weapon-based 2D fighter where a few big hits decide a round. A rage gauge fills as you take damage, swords can be knocked out of a fighter’s hands, and you can roll and duck under attacks.',
    screenshots: [],
  },
  darkstalkers: {
    publisher: 'Capcom',
    series: 'Darkstalkers',
    plot: 'Monsters of legend, including a vampire, a werewolf and a succubus, fight while an alien named Pyron plans to claim the Earth.',
    gameplay:
      'A fast 2D fighter with chain combos, powered-up special moves and the ability to cancel a block into an attack. Each fighter has very animated, expressive moves.',
    screenshots: [],
  },
  ucity: {
    publisher: 'Antonio Niño Díaz (homebrew)',
    plot: 'An open-source city builder made for the Game Boy Color in 2017. You are the mayor of a small town and decide where homes, shops, factories and roads go as it grows into a city.',
    gameplay:
      'Zone land, build power plants and services, set the budget and keep citizens happy while dealing with traffic, pollution and the occasional disaster. Cities are saved in the cartridge memory, so you can come back to them later.',
    screenshots: ['/assets/covers/ucity.webp'],
  },
  'test-pattern': {
    publisher: 'Revive Mode',
    plot: 'A tiny homebrew ROM made for this project. It fills the screen with a single color so we can check the emulator pipeline end to end.',
    gameplay: 'There is nothing to play: if you see a blue screen, the emulator, the ROM loader and the cross-origin isolation headers are all working.',
    screenshots: [],
  },
}

export function gameInfo(g: MockGame): GameInfo {
  return (
    INFO[g.id] ?? {
      publisher: '—',
      plot: `${g.title} is a ${g.year} ${g.genre.toLowerCase()} game for the ${g.platform}.`,
      gameplay: 'Full description coming soon.',
      screenshots: [],
    }
  )
}

export interface Comment {
  id: string
  user: string
  text: string
  ago: string
  replies: number
  likes: number
}

export const SAMPLE_COMMENTS = (title: string): Comment[] => [
  { id: 'c1', user: 'GamePro2000', text: `Just finished playing ${title}! Such a classic game.`, ago: '3min', replies: 2, likes: 50 },
  { id: 'c2', user: 'RetroGamer88', text: `${title} never gets old!`, ago: '3 mon', replies: 10, likes: 83 },
  { id: 'c3', user: 'PlayerOneX', text: `Just beat the final boss in ${title}!`, ago: '2 hrs', replies: 10, likes: 109 },
  { id: 'c4', user: 'EpicGamer23', text: `${title} is the best :>`, ago: '19 min', replies: 10, likes: 78 },
  { id: 'c5', user: 'PixelWarrior', text: `Just discovered a secret in ${title}`, ago: '4 days', replies: 10, likes: 71 },
  { id: 'c6', user: 'CasualGamerGirl', text: `Played ${title} for the first time. Can't believe what I've been missing!`, ago: '1 day', replies: 10, likes: 89 },
]
