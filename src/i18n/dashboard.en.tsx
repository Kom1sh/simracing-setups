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
  tabTrack: 'Track and weather',
  tabCar: 'Car',
  tabAssistant: 'Assistant',
  trackIntro: (name: string) => (
    <>
      Conditions for <strong>{name}</strong>. Track character is filled in when you pick the track; set the weather and session yourself.
    </>
  ),
  carIntro: (name: string) => (
    <>
      The iRacing garage for the <strong>{name}</strong>. Load the baseline setup in iRacing (iRacing Setups → baseline) and record your changes from it here: 0 is the baseline, “+1” is one click or unit more. Fuel is in litres.
    </>
  ),
  toast: {
    saved: (n: string) => `Setup “${n}” saved`,
    saveFailed: 'The browser refused to save the setup. Download it as a file from the summary.',
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
