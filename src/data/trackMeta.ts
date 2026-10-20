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
  imola: { downforce: 'medium', bumps: 'medium', kerbs: 'harsh' },
  suzuka: { downforce: 'high', bumps: 'smooth', kerbs: 'medium' },
  cota: { downforce: 'medium', bumps: 'bumpy', kerbs: 'medium' },
  'red-bull-ring': { downforce: 'medium', bumps: 'smooth', kerbs: 'harsh' },
  portimao: { downforce: 'medium', bumps: 'medium', kerbs: 'medium' },
  mugello: { downforce: 'medium', bumps: 'smooth', kerbs: 'medium' },
  hockenheim: { downforce: 'medium', bumps: 'smooth', kerbs: 'medium' },
  'watkins-glen': { downforce: 'medium', bumps: 'medium', kerbs: 'harsh' },
  indianapolis: { downforce: 'medium', bumps: 'smooth', kerbs: 'medium' },
  'brands-hatch': { downforce: 'high', bumps: 'bumpy', kerbs: 'medium' },
  misano: { downforce: 'high', bumps: 'smooth', kerbs: 'medium' },
  zolder: { downforce: 'medium', bumps: 'medium', kerbs: 'harsh' },
  'laguna-seca': { downforce: 'high', bumps: 'medium', kerbs: 'medium' },
  bathurst: { downforce: 'medium', bumps: 'bumpy', kerbs: 'harsh' },
  // Овалы NASCAR: суперспидвеи — минимум прижима, короткие треки — максимум; бордюров почти нет
  daytona: { downforce: 'low', bumps: 'medium', kerbs: 'soft' },
  talladega: { downforce: 'low', bumps: 'smooth', kerbs: 'soft' },
  atlanta: { downforce: 'low', bumps: 'smooth', kerbs: 'soft' },
  charlotte: { downforce: 'medium', bumps: 'medium', kerbs: 'soft' },
  'las-vegas': { downforce: 'medium', bumps: 'smooth', kerbs: 'soft' },
  texas: { downforce: 'medium', bumps: 'medium', kerbs: 'soft' },
  kansas: { downforce: 'medium', bumps: 'smooth', kerbs: 'soft' },
  homestead: { downforce: 'medium', bumps: 'medium', kerbs: 'soft' },
  michigan: { downforce: 'low', bumps: 'smooth', kerbs: 'soft' },
  pocono: { downforce: 'medium', bumps: 'bumpy', kerbs: 'soft' },
  darlington: { downforce: 'medium', bumps: 'medium', kerbs: 'soft' },
  dover: { downforce: 'medium', bumps: 'medium', kerbs: 'soft' },
  phoenix: { downforce: 'high', bumps: 'smooth', kerbs: 'medium' },
  richmond: { downforce: 'high', bumps: 'smooth', kerbs: 'soft' },
  bristol: { downforce: 'high', bumps: 'medium', kerbs: 'soft' },
  martinsville: { downforce: 'high', bumps: 'medium', kerbs: 'medium' },
}

/** Как ещё ищут трассу */
export const trackAliases: Record<string, string[]> = {
  spa: ['спа', 'spa', 'франкоршам'],
  nurburgring: ['нюр', 'нюрбург', 'nurburg', 'ринг'],
  cota: ['cota', 'кота', 'остин', 'austin', 'америк'],
  'red-bull-ring': ['шпильберг', 'spielberg', 'австрия', 'рбр'],
  bathurst: ['батерст', 'bathurst', 'панорама'],
  'laguna-seca': ['лагуна', 'laguna', 'monterey'],
  barcelona: ['каталония', 'catalunya', 'монмело'],
  imola: ['энцо и дино феррари', 'сан-марино'],
  'brands-hatch': ['брэндс', 'brands'],
  indianapolis: ['индианаполис', 'indy', 'инди'],
  daytona: ['дайтона', 'daytona 500', 'dis'],
  talladega: ['дега', 'dega'],
  atlanta: ['echopark', 'эхопарк', 'ams', 'хэмптон'],
  charlotte: ['шарлотт', 'конкорд', 'concord', 'cms'],
  'las-vegas': ['вегас', 'vegas', 'lvms'],
  texas: ['форт-уэрт', 'fort worth', 'tms'],
  homestead: ['майами', 'miami', 'хомстед'],
  michigan: ['бруклин', 'brooklyn', 'mis'],
  pocono: ['лонг-понд', 'long pond', 'треугольник'],
  darlington: ['дарлингтон', 'too tough to tame'],
  dover: ['monster mile', 'монстр'],
  phoenix: ['эйвондейл', 'avondale'],
  bristol: ['бристоль', 'last great colosseum'],
  martinsville: ['скрепка', 'paperclip'],
}
