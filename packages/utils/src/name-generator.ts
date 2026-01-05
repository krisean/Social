/**
 * Generates a random anonymous username by combining adjectives, nouns, and numbers
 * with random capitalization for a fun, varied appearance.
 *
 * @returns A randomly generated username string
 */
export function generateAnonymousUsername(): string {
  const adjectives = [
    'Unhinged','Cringe','Salty','Sweaty','Based','Epic','Vibey','Cursed',
    'Chaotic','Hot','Clowny','Frothy','Yeety','Mad','NoChill','Raging',
    'Wacky','Glitched','Spicy','Tilted','Frogged','Thicc','Busted','Raw',
    'Sus','Drippy','Toxic','Clapped','Extra','LowKey','HighKey','Snacky',
    'Dank','Lit','Hyped','AFK','MainCharacter','Sniped','Pog','Mega','Feral',
    'Soggy','Clutch','Cracked','Overheated','Bugged','Funky','Frosty',
    'Bizarre','Random','BasedAF','Greedy','Janky','TiltedAF','Zesty','Wild',
    'MadAF','Eboy','Egirl','Cheugy','Simpy','Chonky','Thirsty','Lame','Vibe',
    'Shady','Stressed','Viral','Beta','Alpha','Skrrt','EpicAF','Clipped',
    'Sussy'
  ];

  const nouns = [
    'Goblin','NPC','Boss','Pog','Yeet','Pixel','Clown','Skull',
    'Toast','Snack','Frag','Noob','Clutch','Win',
    'Loss','Taco','Mushroom','Beast','Rogue','Shade','Orbit','Vibe',
    'Snipe','Combo','Banana','Drone','Wizard','Reactor','Flux','Echo','Nova',
    'Sprite','Wraith','Hacker','Glitch','Meme','Drip','Ghost','Knight','Samurai',
    'Pirate','Ranger','Demon','Angel','Robot','Engine','Battery','Halo','Gear',
    'Rocket','Potion','Wumpus','Dragon','Phoenix','Hound','Tiger','Wolf',
    'Bear','Falcon','Shark','Cyborg','Pilot','Driver','Survivor','Mercenary','Mage',
    'Warlock','Hunter','Xeno','Alien','Bot','Virus','Scanner','Blade','Fist','Chaos',
    'Matrix','Beacon','Signal','Shadow','Mind','Rift','Portal','Dungeon','Hero','Legend',
    'Champion','Tracker','Spritez','Pixelz','Wiz','Wizkid','Squire','Sultan','Phantom',
    'Union','Empire','Guild','Tribe','Outcast','Nomad','Prodigy','Brawler','Streak',
    'Trend','Clipper','Streamer','Viral','MemeLord','TikToker','Simper','Chad','Karen',
    'Brat','Flexer','Capper','Simp','Zoomer','Boomer','Yeeter','Lurker','Shrek','ShrekFan',
    'Fan','Fangirl','Fanboy', 'Baka', 'Bro','Siss'
  ];

  const numbers = [
    '69','420','1337','9001','404','777','888','999','101','202',
    '303','505','606','707','808','909','1122','1234','2468','314',
    '2718','1618','3141','8008','9000','747','555','1313','7777',
    '24601','8675309','42069','13371337','007','42','69k','420L','69x','69t'
  ];

  // Pick random adjective, noun, and number
  let adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  let noun = nouns[Math.floor(Math.random() * nouns.length)];
  let num = numbers[Math.floor(Math.random() * numbers.length)];

  // Random capitalization (50% chance per letter)
  function randomCaps(word: string): string {
    return word.split('').map(c => Math.random() < 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');
  }
  adj = randomCaps(adj);
  noun = randomCaps(noun);

  return `${adj}${noun}${num}`;
}