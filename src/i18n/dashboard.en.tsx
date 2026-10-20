import type { ru } from './dashboard.ru'

export const en: typeof ru = {
  skip: 'Skip to settings',
  wordmark: ['Setups', 'for sim racing'],
  mySetups: 'My setups',
  save: 'Save',
  bandLabel: 'Track and car',
  lapLength: 'Lap length',
  km: 'km',
  turns: 'Turns',
  direction: 'Direction',
  layout: 'Layout',
  altitude: 'Altitude',
  m: 'm',
  carCategory: 'iRacing car class',
  engine: 'Engine',
  enginePos: 'Engine position',
  debut: 'Class debut',
  electronics: 'Electronics',
  elec: {
    none: 'No ABS or traction control',
    both: 'ABS and traction control',
    tcOnly: 'Traction control, no ABS',
    noAbs: 'No ABS',
    absOnly: 'ABS, no traction control',
    noTc: 'No traction control',
  },
  settingsTabs: 'Settings',
  tabTrack: 'Conditions',
  tabCar: 'My setup',
  tabAssistant: 'Assistant',
  trackIntro: (name: string) => (
    <>
      Weather and session at <strong>{name}</strong>. The assistant takes temperature, clouds and rain into account; the summary on the right calculates fuel.
    </>
  ),
  carIntro: (name: string) => (
    <>
      Every adjustment in the <strong>{name}</strong> garage. 0 is the baseline, “+1” is one click or unit more. Fuel is in litres.
    </>
  ),
  setupIntro: (name: string) => (
    <>
      Your <strong>{name}</strong> setup is a list of changes from the iRacing baseline (iRacing Setups → baseline). Apply the assistant’s advice, then after 3–5 laps mark whether it helped.
    </>
  ),
  changesTitle: 'Changes from the baseline',
  changesEmpty: 'Everything is still as in the baseline. Apply the assistant’s advice or change a value in the garage below.',
  resetShort: 'Undo',
  resetOne: (name: string) => `Return ${name} to the baseline`,
  historyTitle: 'Assistant advice',
  historyIntro: (car: string, track: string) => `${car} at ${track}: what the assistant suggested and whether it helped.`,
  historyLoading: 'Loading advice…',
  historyFailed: 'Could not load advice. Reload the page.',
  historyEmpty: 'No advice for this car and track yet.',
  askAssistant: 'Ask the assistant',
  rated: 'Your rating:',
  garageTitle: 'Full garage',
  garageHint: (n: number) => `${n} adjustments — open`,
  garageHide: 'Collapse',
  toast: {
    saved: (n: string) => `Setup “${n}” saved`,
    saveFailed: 'The server did not save the setup. Check your connection or download it as a file from the summary.',
    listFailed: 'Could not load your setups from the server. Reload the page.',
    opened: (n: string) => `Opened “${n}”`,
    removed: (n: string) => `Deleted “${n}”`,
    downloaded: 'Setup file downloaded',
    notJson: 'Cannot read the file: it is not JSON.',
    notOurs: 'This is not a setup from this dashboard: the file has no simracing-setups/v1 mark.',
    partly: (track: boolean, car: boolean) =>
      `Setup loaded, but the ${[track ? 'track' : '', car ? 'car' : ''].filter(Boolean).join(' and ')} from the file is not available here, so the current one stays.`,
    loaded: (n: string) => `Loaded “${n}”`,
    category: (label: string, track: string | null) => `${label} has its own garage, changes start from the baseline${track ? `. Track: ${track}` : ''}.`,
  },
  trackGone: 'track removed',
  carGone: 'car removed',
  user: {
    menu: 'Account',
    signOut: 'Log out',
    toSite: 'Home page',
    language: 'Language',
  },
  nTracks: (n: number) => `${n} ${n === 1 ? 'track' : 'tracks'}`,
  nChanged: (n: number) => `${n} changed`,
}
