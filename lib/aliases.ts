const ADJECTIVES = [
  'Swift', 'Bright', 'Calm', 'Bold', 'Keen', 'Wise', 'Cool', 'Warm',
  'Free', 'Kind', 'Brave', 'Sharp', 'Quick', 'Quiet', 'Vivid', 'Eager',
  'Gentle', 'Witty', 'Sunny', 'Mellow', 'Lively', 'Clever', 'Daring', 'Serene',
]

const NOUNS = [
  'Traveler', 'Explorer', 'Wanderer', 'Seeker', 'Dreamer', 'Thinker',
  'Creator', 'Builder', 'Runner', 'Learner', 'Reader', 'Writer',
  'Maker', 'Player', 'Mover', 'Finder', 'Keeper', 'Walker',
  'Trekker', 'Rover', 'Ranger', 'Pioneer', 'Voyager', 'Nomad',
]

export function generateAlias(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const number = Math.floor(Math.random() * 9000) + 1000
  return `${adjective} ${noun} #${number}`
}
