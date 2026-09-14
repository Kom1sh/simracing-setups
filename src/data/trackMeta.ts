/**
 * Характер трасс для сетапа — оценка, а не измерение: нужный прижим, неровности, бордюры.
 * Подставляется при выборе трассы, в кабинете её можно поправить.
 */
export interface TrackMeta {
  downforce: 'low' | 'medium' | 'high'
  bumps: 'smooth' | 'medium' | 'bumpy'
  kerbs: 'soft' | 'medium' | 'harsh'
  /** Пояснение, если схема отличается от конфигурации, где сейчас гоняют GT3 */
  layoutNote?: string
}

export const trackMeta: Record<string, TrackMeta> = {
  monza: { downforce: 'low', bumps: 'medium', kerbs: 'harsh' },
  spa: { downforce: 'medium', bumps: 'medium', kerbs: 'medium' },
  silverstone: { downforce: 'high', bumps: 'medium', kerbs: 'medium' },
  nurburgring: { downforce: 'high', bumps: 'smooth', kerbs: 'medium' },
  hungaroring: { downforce: 'high', bumps: 'smooth', kerbs: 'medium' },
  zandvoort: { downforce: 'high', bumps: 'medium', kerbs: 'medium' },
  barcelona: { downforce: 'high', bumps: 'smooth', kerbs: 'medium' },
  'paul-ricard': { downforce: 'medium', bumps: 'smooth', kerbs: 'soft' },
  imola: { downforce: 'medium', bumps: 'medium', kerbs: 'harsh' },
  suzuka: { downforce: 'high', bumps: 'smooth', kerbs: 'medium' },
  cota: { downforce: 'medium', bumps: 'bumpy', kerbs: 'medium' },
  'red-bull-ring': { downforce: 'medium', bumps: 'smooth', kerbs: 'harsh' },
  portimao: { downforce: 'medium', bumps: 'medium', kerbs: 'medium' },
  sepang: { downforce: 'high', bumps: 'medium', kerbs: 'medium' },
  'yas-marina': { downforce: 'medium', bumps: 'smooth', kerbs: 'medium' },
  mugello: { downforce: 'medium', bumps: 'smooth', kerbs: 'medium' },
  hockenheim: { downforce: 'medium', bumps: 'smooth', kerbs: 'medium' },
  bahrain: { downforce: 'medium', bumps: 'smooth', kerbs: 'medium' },
  kyalami: { downforce: 'medium', bumps: 'smooth', kerbs: 'medium' },
  'watkins-glen': { downforce: 'medium', bumps: 'medium', kerbs: 'harsh' },
  indianapolis: { downforce: 'medium', bumps: 'smooth', kerbs: 'medium' },
  lusail: { downforce: 'medium', bumps: 'smooth', kerbs: 'medium' },
  'brands-hatch': { downforce: 'high', bumps: 'bumpy', kerbs: 'medium' },
  misano: { downforce: 'high', bumps: 'smooth', kerbs: 'medium' },
  zolder: { downforce: 'medium', bumps: 'medium', kerbs: 'harsh' },
  'laguna-seca': { downforce: 'high', bumps: 'medium', kerbs: 'medium' },
  bathurst: { downforce: 'medium', bumps: 'bumpy', kerbs: 'harsh' },
  valencia: { downforce: 'high', bumps: 'smooth', kerbs: 'medium' },
}

/** Как ещё ищут трассу */
export const trackAliases: Record<string, string[]> = {
  spa: ['спа', 'spa', 'франкоршам'],
  nurburgring: ['нюр', 'нюрбург', 'nurburg', 'ринг'],
  cota: ['cota', 'кота', 'остин', 'austin', 'америк'],
  'red-bull-ring': ['шпильберг', 'spielberg', 'австрия', 'рбр'],
  bathurst: ['батерст', 'bathurst', 'панорама'],
  'laguna-seca': ['лагуна', 'laguna', 'monterey'],
  'yas-marina': ['абу-даби', 'abu dhabi', 'яс'],
  bahrain: ['сахир', 'sakhir'],
  lusail: ['лусаиль', 'лосаил', 'losail'],
  barcelona: ['каталония', 'catalunya', 'монмело'],
  'paul-ricard': ['ле-кастелле', 'castellet', 'рикар'],
  imola: ['энцо и дино феррари', 'сан-марино'],
  valencia: ['рикардо тормо', 'ricardo tormo', 'честе'],
  'brands-hatch': ['брэндс', 'brands'],
  indianapolis: ['индианаполис', 'indy', 'инди'],
}
