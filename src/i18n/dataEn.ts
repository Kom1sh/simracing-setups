/**
 * Английские подписи к данным кабинета. Исходные данные остаются русскими,
 * здесь — перевод по id: группы, регулировки, варианты, единицы, трассы, страны.
 */

export interface ParamEn {
  label: string
  hint?: string
  options?: Record<string, string>
  presets?: string[]
}

export const groupsEn: Record<string, { title: string; description?: string }> = {
  // Машина
  tyres: { title: 'Tyres', description: 'Pressures and wheel geometry. Cold values, before you leave the pits.' },
  electronics: { title: 'Electronics', description: 'Driver aids and engine map. Cars without ABS or traction control do not show these rows.' },
  fuel: { title: 'Fuel and brakes', description: 'How much fuel to load and which pads to run. The race fuel plan is in the summary.' },
  mechanics: { title: 'Mechanical grip', description: 'Anti-roll bars, springs, bump stops and the differential.' },
  dampers: { title: 'Dampers', description: 'Slow speeds control roll and weight transfer, fast speeds handle kerbs and bumps. Values in clicks.' },
  aero: { title: 'Aero', description: 'Ride height, downforce and brake cooling.' },
  // Трасса и погода
  character: { title: 'Track character', description: 'An estimate for the whole lap. Adjust it if you drive the track differently.' },
  session: { title: 'Session', description: 'Session type and length. Fuel is calculated from the race length.' },
  weather: { title: 'Weather' },
  surface: { title: 'Surface' },
}

export const paramsEn: Record<string, ParamEn> = {
  // Шины
  compound: { label: 'Tyres', hint: 'Wets are for a track with water on it. On dry tarmac they overheat quickly.', options: { dry: 'Slicks', wet: 'Wets' } },
  pressure: { label: 'Tyre pressure', hint: 'Higher pressure means a smaller contact patch and faster warm-up. Lower gives more grip, but the tyre runs hotter.' },
  camber: { label: 'Camber', hint: 'Negative camber adds cornering grip, but hurts braking and wears the inner edge of the tyre.' },
  toe: { label: 'Toe', hint: 'Minus points the wheels outward and sharpens turn-in. Plus points them inward and calms the car on the straight.' },
  caster: { label: 'Caster', hint: 'More caster means heavier steering and more camber gain in corners.' },
  // Электроника
  tc: { label: 'Traction control', hint: 'Higher means fewer slides on corner exit, but slower acceleration.' },
  tc2: { label: 'TC power cut', hint: 'How sharply traction control cuts power. Not every car has a separate knob for it.' },
  abs: { label: 'ABS', hint: 'Higher means the wheels lock less often, but braking distances get longer.' },
  ecu: { label: 'Engine map', hint: 'Maps differ in power delivery and fuel use. What each one does depends on the car.' },
  // Топливо и тормоза
  fuel: { label: 'Fuel', hint: 'Ten litres of fuel weigh about 7.5 kg.' },
  pads: { label: 'Brake pads', hint: 'A lower number means stronger braking and faster wear.' },
  brakePower: { label: 'Brake pressure', hint: 'Lower makes the pedal easier to modulate without locking, but braking distances get longer.' },
  brakeBias: { label: 'Brake bias', hint: 'Share of braking force on the front axle. More is more stable, but the fronts lock earlier.' },
  // Механика
  arb: { label: 'Anti-roll bar', hint: 'Stiffer at the front makes the car understeer more. Stiffer at the rear makes it rotate more willingly.' },
  wheelRate: { label: 'Spring rate', hint: 'Stiffer means quicker response and less roll, but a rougher ride over bumps and kerbs.' },
  bumpstopRate: { label: 'Bump stop rate', hint: 'How abruptly the suspension meets the end of its travel. Softer is smoother over kerbs.' },
  bumpstopRange: { label: 'Bump stop gap', hint: 'Less gap means the car lands on the bump stop sooner under load.' },
  diffPreload: { label: 'Diff preload', hint: 'More is more stable on entry and exit, but the car is less willing to turn.' },
  // Амортизаторы
  bumpSlow: { label: 'Bump, slow' },
  bumpFast: { label: 'Bump, fast' },
  reboundSlow: { label: 'Rebound, slow' },
  reboundFast: { label: 'Rebound, fast' },
  // Аэродинамика
  rideHeight: { label: 'Ride height', hint: 'Rear minus front ride height is the rake. More rake gives more front downforce.' },
  splitter: { label: 'Splitter', hint: 'Higher means more downforce on the front axle.' },
  rearWing: { label: 'Rear wing', hint: 'Higher means more downforce and drag: faster in corners, slower on the straights.' },
  brakeDucts: { label: 'Brake ducts', hint: 'More open keeps the brakes cooler at a small cost in drag.' },
  // Характер трассы
  downforce: {
    label: 'Downforce needed',
    hint: 'Fast tracks with long straights want less wing, slow and twisty ones want more.',
    options: { low: 'Low', medium: 'Medium', high: 'High' },
  },
  bumps: { label: 'Bumps', hint: 'A bumpy surface needs more ride height and soft fast damping.', options: { smooth: 'Smooth', medium: 'Some', bumpy: 'Bumpy' } },
  kerbs: { label: 'Kerbs', hint: 'If you ride a lot of high kerbs, the suspension needs travel in reserve.', options: { soft: 'Gentle', medium: 'Medium', harsh: 'Harsh' } },
  // Сессия
  sessionType: { label: 'Session', options: { practice: 'Practice', qualifying: 'Qualifying', race: 'Race' } },
  duration: { label: 'Length', presets: ['20 minutes', '1 hour', '3 hours', '6 hours', '24 hours'] },
  pitStops: { label: 'Mandatory pit stops', hint: 'How many times the rules make you stop.' },
  startTime: { label: 'Start time', hint: 'Time of day on track. The tarmac cools down at night.' },
  timeMultiplier: { label: 'Time acceleration', hint: 'How many times faster than real time the day passes on track.' },
  // Погода
  airTemp: { label: 'Air' },
  trackTemp: { label: 'Track', hint: 'On a sunny day the tarmac is much warmer than the air, on a cloudy one the gap is smaller.' },
  clouds: { label: 'Clouds' },
  rain: { label: 'Rain' },
  randomness: { label: 'Weather changes', hint: 'How much the weather may change during the session.' },
  humidity: { label: 'Humidity' },
  windSpeed: { label: 'Wind', hint: 'The arrow on the track map shows the wind direction.' },
  windFrom: { label: 'Wind from', options: { '0': 'N', '45': 'NE', '90': 'E', '135': 'SE', '180': 'S', '225': 'SW', '270': 'W', '315': 'NW' } },
  // Покрытие
  grip: {
    label: 'Rubber on the line',
    hint: 'The more rubber is laid down, the faster the track. Grip builds up through the race.',
    options: { green: 'Green', fast: 'Fast', optimum: 'Optimum' },
  },
  wetness: { label: 'Water on track', options: { dry: 'Dry', damp: 'Damp', wet: 'Wet', flooded: 'Standing water' } },
}

export const unitsEn: Record<string, string> = {
  л: 'L',
  'Н/м': 'N/m',
  Н: 'N',
  мм: 'mm',
  Нм: 'Nm',
  '% вперёд': '% front',
  мин: 'min',
  'км/ч': 'km/h',
}

export const windNamesEn: Record<string, string> = {
  '0': 'northerly',
  '45': 'north-easterly',
  '90': 'easterly',
  '135': 'south-easterly',
  '180': 'southerly',
  '225': 'south-westerly',
  '270': 'westerly',
  '315': 'north-westerly',
}

export const trackNamesEn: Record<string, string> = {
  monza: 'Monza',
  spa: 'Spa-Francorchamps',
  silverstone: 'Silverstone',
  nurburgring: 'Nürburgring',
  hungaroring: 'Hungaroring',
  zandvoort: 'Zandvoort',
  barcelona: 'Barcelona-Catalunya',
  'paul-ricard': 'Paul Ricard',
  imola: 'Imola',
  suzuka: 'Suzuka',
  cota: 'Circuit of the Americas',
  'red-bull-ring': 'Red Bull Ring',
  portimao: 'Portimão',
  sepang: 'Sepang',
  'yas-marina': 'Yas Marina',
  mugello: 'Mugello',
  hockenheim: 'Hockenheim',
  bahrain: 'Bahrain',
  kyalami: 'Kyalami',
  'watkins-glen': 'Watkins Glen',
  indianapolis: 'Indianapolis',
  lusail: 'Lusail',
  'brands-hatch': 'Brands Hatch',
  misano: 'Misano',
  zolder: 'Zolder',
  'laguna-seca': 'Laguna Seca',
  bathurst: 'Mount Panorama',
  valencia: 'Valencia',
}

export const countriesEn: Record<string, string> = {
  Италия: 'Italy',
  Бельгия: 'Belgium',
  Великобритания: 'United Kingdom',
  Германия: 'Germany',
  Венгрия: 'Hungary',
  Нидерланды: 'Netherlands',
  Испания: 'Spain',
  Франция: 'France',
  Япония: 'Japan',
  США: 'USA',
  Австрия: 'Austria',
  Португалия: 'Portugal',
  Малайзия: 'Malaysia',
  ОАЭ: 'UAE',
  Бахрейн: 'Bahrain',
  ЮАР: 'South Africa',
  Катар: 'Qatar',
  Австралия: 'Australia',
}

export const layoutsEn: Record<string, string> = {
  'Гран-при': 'Grand Prix',
  'Гран-при (Arena, с 2011)': 'Grand Prix (Arena, since 2011)',
  'GP-Strecke (Гран-при)': 'GP-Strecke (Grand Prix)',
  'Гран-при (с 2020)': 'Grand Prix (since 2020)',
  'Гран-при без шиканы': 'Grand Prix without the chicane',
  'Гран-при 1C-V2 (с шиканой на прямой Mistral)': 'Grand Prix 1C-V2 (with the Mistral chicane)',
  'Гран-при (с 2021)': 'Grand Prix (since 2021)',
  'Гран-при (с 2002)': 'Grand Prix (since 2002)',
  'Гран-при (с 2015)': 'Grand Prix (since 2015)',
  'Гран-при с Inner Loop': 'Grand Prix with the Inner Loop',
  'Дорожная трасса (с 2014)': 'Road course (since 2014)',
  'Гран-при (с 2023)': 'Grand Prix (since 2023)',
  'Гран-при (с 2008)': 'Grand Prix (since 2008)',
  'Гран-при (с 1996)': 'Grand Prix (since 1996)',
  'Полная трасса (с 1987)': 'Full circuit (since 1987)',
}

export const categoriesEn: Record<string, { label: string; note?: string }> = {
  gt3: { label: 'GT3' },
  gt4: { label: 'GT4', note: 'GT4 cars use the GT3 adjustment template for now.' },
  gt2: { label: 'GT2', note: 'GT2 cars use the GT3 adjustment template for now.' },
  cup: { label: 'Cup', note: 'Cup cars use the GT3 adjustment template for now.' },
}

export const enginePositionEn: Record<string, string> = {
  front: 'front',
  'front-mid': 'front, behind the front axle',
  mid: 'behind the cockpit',
  rear: 'rear, behind the rear axle',
}

export const aspirationEn: Record<string, string> = {
  na: 'naturally aspirated',
  turbo: 'turbo',
  'twin-turbo': 'twin-turbo',
}

export const engineLayoutEn: Record<string, string> = {
  'flat-6': 'flat-6',
  I4: 'inline-4',
  I5: 'inline-5',
  I6: 'inline-6',
}
