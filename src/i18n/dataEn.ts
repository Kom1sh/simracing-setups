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
  // Машина (гараж iRacing)
  tyres: { title: 'Tyres', description: 'As in the Tires & Aero section of the iRacing garage. Cold pressures, as the car leaves the pits.' },
  'gt4:tyres': { title: 'Tyres', description: 'Cold pressures, as the car leaves the pits.' },
  'cup:tyres': { title: 'Tyres', description: 'Cold pressures, as the car leaves the pits.' },
  'nascar:tyres': { title: 'Tyres', description: 'Cold pressures. Goodyear sets its own minimum for every track, so start from the iRacing baseline setup for it.' },
  dials: { title: 'In-car dials', description: 'The same settings you can change while driving.' },
  'gt4:dials': { title: 'In-car dials', description: 'On the McLaren 570S and Porsche 718, ABS and traction control share one setting; on the BMW, ABS is called DSC.' },
  'cup:dials': { title: 'In-car dials', description: 'The Ferrari 296 Challenge has two traction control settings, TC1 and TC2.' },
  chassis: { title: 'Chassis', description: 'Front and rear: anti-roll bars, toe, brake pads.' },
  'gt4:chassis': { title: 'Chassis' },
  'cup:chassis': { title: 'Chassis', description: 'Cup cars have no spring, damper or differential settings in the garage.' },
  corners: { title: 'Suspension', description: 'Each corner of the car: ride height, springs, camber.' },
  'gt4:corners': { title: 'Suspension', description: 'Not every GT4 has adjustable springs: the Porsche 718 does not.' },
  'nascar:corners': { title: 'Corners', description: 'Ride height and corner weights change with the shock collar offset, in pairs, so the cross weight stays put.' },
  dampers: { title: 'Dampers', description: 'Low speed is how the car reacts to steering, throttle and brakes; high speed is kerbs and bumps. The Ferrari 296 GT3 goes from 0 to 11 clicks.' },
  'nascar:dampers': { title: 'Dampers', description: 'Set the slopes for the track first, then fine-tune low- and high-speed bump and rebound.' },
  rear: { title: 'Aero and differential' },
  'gt4:rear': { title: 'Aero and fuel' },
  'cup:rear': { title: 'Aero and fuel' },
  'nascar:rear': { title: 'Differential and fuel' },
  balance: { title: 'Weight and brakes' },
  arb: { title: 'Anti-roll bars', description: 'Diameter is Stiff (2.00″) or Soft (1.375″), the arm goes from P1 (soft) to P5 (stiff).' },
  // Трасса и погода
  character: { title: 'Track character', description: 'An estimate for the whole lap. Adjust it if you drive the track differently.' },
  session: { title: 'Session', description: 'Session type and length. Fuel is calculated from the race length.' },
  weather: { title: 'Weather', description: 'As in the iRacing weather settings. Rain only falls on road courses and only for cars with wet tyres.' },
  surface: { title: 'Surface' },
}

export const paramsEn: Record<string, ParamEn> = {
  // Шины
  compound: { label: 'Tyres', hint: 'Slicks are for a dry track, treaded wets are for water. In iRacing it only rains on road courses.', options: { dry: 'Slicks', wet: 'Wets' } },
  pressure: { label: 'Cold pressure', hint: 'Pressure as the car leaves the pits. Higher runs cooler but grips less, lower grips more and runs hotter. The GT3 minimum is 21.5 psi (148 kPa), and baseline setups usually sit on it.' },
  'gt4:pressure': { label: 'Cold pressure', hint: 'Pressure as the car leaves the pits. Higher runs cooler but grips less, lower grips more and runs hotter.' },
  'cup:pressure': { label: 'Cold pressure', hint: 'Pressure as the car leaves the pits. Higher runs cooler but grips less, lower grips more and runs hotter.' },
  'nascar:pressure': { label: 'Cold pressure', hint: 'In left turns the right front carries the most load, so on a balanced car it builds the most pressure over a run. The left side usually runs lower pressures than the right.' },
  // Кнопки в кокпите
  brakeBias: { label: 'Brake bias', hint: 'Share of braking force on the front axle. More locks the fronts sooner but keeps the car stable under braking; less helps it turn in on the brakes.' },
  'nascar:brakeBias': { label: 'Brake bias', hint: 'Share of braking force on the front axle. More is more stable, but the fronts lock earlier.' },
  abs: { label: 'ABS', hint: 'A higher position means more help from ABS. The Ferrari 296 GT3 has twelve: 1 is off, 2–7 are for a dry track, 8–12 for rain.' },
  tc: { label: 'Traction control', hint: 'More means less wheelspin and rear tyre wear, but a slower exit if the system cuts too much power. Position 1 usually turns it off.' },
  throttleShape: { label: 'Throttle shape', hint: 'How the pedal maps to torque: 1 is linear, higher is more S-shaped, 10 is linear again but more aggressive.' },
  brakePads: { label: 'Brake pads', hint: 'Low has the least friction and weaker brakes; Medium and High brake harder but lock up more easily.', options: { low: 'Low', medium: 'Medium', high: 'High' } },
  // Шасси и подвеска
  arbFront: { label: 'Front anti-roll bar', hint: 'Stiffer means less front roll and more understeer; softer helps the car turn.' },
  arbRear: { label: 'Rear anti-roll bar', hint: 'Stiffer makes the car rotate more, up to oversteer; softer calms it down towards understeer.' },
  toe: { label: 'Toe', hint: 'Minus is toe-out: sharper turn-in at the front, a livelier rear. Plus is calmer on the straight and keeps the tyres cooler.' },
  'nascar:toe': { label: 'Toe', hint: 'Front: more toe-out sharpens turn-in, but can overwork the front tyres and cause sudden understeer. Rear: toe-out helps rotation, toe-in adds stability.' },
  rideHeight: { label: 'Ride height', hint: 'Set with the spring perch offsets. Lower at the front means more front downforce; the front-to-rear difference (rake) moves the aero balance. Tech inspection checks the limits, for example 50–92.5 mm at the rear on the Ferrari 296 GT3.' },
  springRate: { label: 'Spring rate', hint: 'Stiffer keeps the ride height and aero steady, softer gives more mechanical grip on a bumpy track. After a spring change, reset the ride height with the perch offsets.' },
  'nascar:springRate': { label: 'Spring rate', hint: 'Stiffer holds the body attitude and aero, softer grips better over bumps. On ovals the left rear runs softer than the right rear, or the car drifts into understeer through a run.' },
  camber: { label: 'Camber', hint: 'More negative camber adds cornering grip, but hurts braking and wears the inside edge. Minus here means more camber.' },
  'nascar:camber': { label: 'Camber', hint: 'On ovals the left wheels run positive camber and the right wheels negative; on road courses all four are negative.' },
  bump: { label: 'Bump', hint: 'More makes the car react sharper to steering and braking, but it soaks up bumps worse.' },
  rebound: { label: 'Rebound', hint: 'More holds the body longer after a load; too much and the wheel leaves the track.' },
  lsComp: { label: 'Bump, low speed', hint: 'More moves weight faster under braking and direction changes; at the front it adds understeer on the brakes.' },
  hsComp: { label: 'Bump, high speed', hint: 'More is stiffer over kerbs and bumps and keeps the aero platform on a smooth track; less absorbs hits better.' },
  lsRebound: { label: 'Rebound, low speed', hint: 'More holds the body longer: the front under acceleration, the rear under braking. Too much and the wheel loses contact.' },
  hsRebound: { label: 'Rebound, high speed', hint: 'How fast the damper extends after a bump or kerb.' },
  'nascar:lsComp': { label: 'Bump, low speed', hint: 'More loads the wheel faster under braking and off the banking, but absorbs small bumps worse.' },
  'nascar:hsComp': { label: 'Bump, high speed', hint: 'Less is better over bumps and kerbs, more on a smooth track.' },
  'nascar:lsRebound': { label: 'Rebound, low speed', hint: 'More holds the body better, but can unload the wheel.' },
  'nascar:hsRebound': { label: 'Rebound, high speed', hint: 'More keeps the body calmer after a bump; too much costs grip.' },
  hsCompSlope: { label: 'High-speed bump slope', hint: 'Higher is more linear, for bumpy tracks; lower is more digressive, for smooth ones.' },
  hsReboundSlope: { label: 'High-speed rebound slope', hint: 'Higher is more linear, for bumpy tracks; lower is for smooth ones.' },
  // Аэродинамика и дифференциал
  wing: { label: 'Rear wing', hint: 'Higher means more downforce and drag: faster in corners, slower on the straights, balance moves towards understeer. On the Ferrari 296 GT3, +1 wing is offset by −1 mm front ride height or +3 mm at the rear.' },
  diffPreload: { label: 'Diff preload', hint: 'More means less lift-off oversteer and a more stable entry, but more off-throttle understeer and sharper oversteer on the power.' },
  'nascar:diffPreload': { label: 'Diff preload', hint: 'More locks the diff harder everywhere: more understeer on the power and under braking, including mid-corner.' },
  frictionFaces: { label: 'Friction faces', hint: 'More faces lock harder: more off-throttle understeer and on-throttle oversteer, less inside wheelspin over kerbs.' },
  fuel: { label: 'Fuel', hint: 'How much to load at the start. A litre of fuel weighs about 0.75 kg. The race plan is in the summary.' },
  // NASCAR
  crossWeight: { label: 'Cross weight', hint: 'Share of weight on the left rear and right front, one of the key oval settings. More gives a stable entry and better drive off, less keeps the car free in the corner. Too much locks the left front.' },
  noseWeight: { label: 'Nose weight', hint: 'Share of weight on the front axle. More is more stable at speed, less helps the car rotate, useful on short tracks.' },
  arbFrontDiameter: { label: 'Front anti-roll bar', hint: 'The stiff bar rolls less and responds sharper, but adds understeer.', options: { stiff: 'Stiff 2.00″', soft: 'Soft 1.375″' } },
  arbFrontArm: { label: 'Front bar arm' },
  arbFrontPreload: { label: 'Front bar preload', hint: 'Static load in the bar: adds or removes its effect in the corners and on the straights.' },
  arbRearDiameter: { label: 'Rear anti-roll bar', hint: 'The stiff bar rolls less, but adds oversteer.', options: { stiff: 'Stiff 2.00″', soft: 'Soft 1.375″' } },
  arbRearArm: { label: 'Rear bar arm' },
  arbRearPreload: { label: 'Rear bar preload', hint: 'Static load in the rear bar.' },
  casterLf: { label: 'Caster, left front', hint: 'Less caster on the left than on the right pulls the car left, which helps on ovals. More caster means heavier steering and more straight-line stability.' },
  casterRf: { label: 'Caster, right front', hint: 'More caster means heavier steering and less dynamic cross weight in the corner.' },
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
  // Погода
  weatherType: {
    label: 'Session weather',
    hint: 'Static never changes. Forecasted adds a chance of rain and changing clouds. Timeline lets you plan the weather minute by minute.',
    options: { static: 'Static', forecast: 'Forecasted', timeline: 'Timeline' },
  },
  airTemp: { label: 'Air' },
  trackTemp: { label: 'Track', hint: 'In iRacing the sun heats the tarmac: on a clear day it is much warmer than the air, under clouds the gap is smaller. This is your estimate for tyre pressures.' },
  sky: { label: 'Clouds', options: { clear: 'Clear', partly: 'Partly cloudy', mostly: 'Mostly cloudy', overcast: 'Overcast' } },
  rain: { label: 'Chance of rain', hint: 'Rain needs forecasted or timeline weather.' },
  humidity: { label: 'Humidity' },
  fog: { label: 'Fog' },
  windSpeed: { label: 'Wind', hint: 'The arrow on the track map shows the wind direction.' },
  windFrom: { label: 'Wind from', options: { '0': 'N', '45': 'NE', '90': 'E', '135': 'SE', '180': 'S', '225': 'SW', '270': 'W', '315': 'NW' } },
  // Покрытие
  rubber: {
    label: 'Rubber on track',
    hint: 'iRacing lays down rubber through the session: the more there is, the more grip on the racing line. Marbles build up off line.',
    options: { low: 'Clean', moderate: 'Rubbered in', high: 'Heavily rubbered' },
  },
  wetness: { label: 'Water on track', hint: 'You can set a wet track with static weather too, but falling rain needs a forecast.', options: { dry: 'Dry', damp: 'Damp', wet: 'Wet' } },
}

export const unitsEn: Record<string, string> = {
  л: 'L',
  'Н/мм': 'N/mm',
  мм: 'mm',
  'Н·м': 'Nm',
  'поз.': 'pos.',
  клик: 'clicks',
  'шт.': 'faces',
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
  imola: 'Imola',
  suzuka: 'Suzuka',
  cota: 'Circuit of the Americas',
  'red-bull-ring': 'Red Bull Ring',
  portimao: 'Portimão',
  mugello: 'Mugello',
  hockenheim: 'Hockenheim',
  'watkins-glen': 'Watkins Glen',
  indianapolis: 'Indianapolis',
  'brands-hatch': 'Brands Hatch',
  misano: 'Misano',
  zolder: 'Zolder',
  'laguna-seca': 'Laguna Seca',
  bathurst: 'Mount Panorama',
  daytona: 'Daytona',
  talladega: 'Talladega',
  atlanta: 'Atlanta',
  charlotte: 'Charlotte',
  'las-vegas': 'Las Vegas',
  texas: 'Texas',
  kansas: 'Kansas',
  homestead: 'Homestead-Miami',
  michigan: 'Michigan',
  pocono: 'Pocono',
  darlington: 'Darlington',
  dover: 'Dover',
  phoenix: 'Phoenix',
  richmond: 'Richmond',
  bristol: 'Bristol',
  martinsville: 'Martinsville',
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
  Овал: 'Oval',
}

export const categoriesEn: Record<string, { label: string; note?: string }> = {
  nascar: { label: 'NASCAR', note: 'Next Gen Cup. The fuel cell holds 20 gallons (76 L).' },
  gt3: { label: 'GT3' },
  gt4: { label: 'GT4' },
  cup: { label: 'Cup', note: 'Porsche 911 Cup (992.2) and Ferrari 296 Challenge.' },
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
