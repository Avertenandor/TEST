export const REGISTRY = {
  // В продакшене файлы лежат в /public/modules/*, поэтому базовые пути указываем с этим префиксом
  header:   { base: '/public/modules/header',   lazy: false },
  hero:     { base: '/public/modules/hero',     lazy: false },
  features: { base: '/public/modules/features', lazy: false },
  coin:     { base: '/public/modules/coin',     lazy: false },
  'how-it-works': { base: '/public/modules/how-it-works', lazy: false },
  partners: { base: '/public/modules/partners', lazy: false },
  testimonials: { base: '/public/modules/testimonials', lazy: false },
  roadmap: { base: '/public/modules/roadmap', lazy: false },
  security: { base: '/public/modules/security', lazy: false },
  'platform-access': { base: '/public/modules/platform-access', lazy: false },
  'deposits-overview': { base: '/public/modules/deposits-overview', lazy: false },
  referral: { base: '/public/modules/referral', lazy: false },
  loyalty: { base: '/public/modules/loyalty', lazy: false },
  multipliers: { base: '/public/modules/multipliers', lazy: false },
  'device-mining': { base: '/public/modules/device-mining', lazy: false },
  'volatility-trading': { base: '/public/modules/volatility-trading', lazy: false },
  team: { base: '/public/modules/team', lazy: false },
  'final-cta': { base: '/public/modules/final-cta', lazy: false },
  textblock:{ base: '/public/modules/textblock',lazy: false },
  // На лендинге не монтируем терминал
  terminal: { base: '/public/modules/terminal', lazy: true, disabledOnLanding: true },
  auth:     { base: '/public/modules/auth',     lazy: true },
  faq:      { base: '/public/modules/faq',      lazy: false },
  footer:   { base: '/public/modules/footer',   lazy: false },

  'cabinet/shell':         { base: '/public/modules/cabinet/shell',         lazy: false },
  'cabinet/auth':          { base: '/public/modules/cabinet/auth',          lazy: true },
  'cabinet/profile':       { base: '/public/modules/cabinet/profile',       lazy: true },
  'cabinet/balances':      { base: '/public/modules/cabinet/balances',      lazy: true },
  'cabinet/deposits':      { base: '/public/modules/cabinet/deposits',      lazy: true },
  'cabinet/rewards':       { base: '/public/modules/cabinet/rewards',       lazy: true },
  'cabinet/referrals':     { base: '/public/modules/cabinet/referrals',     lazy: true },
  'cabinet/transactions':  { base: '/public/modules/cabinet/transactions',  lazy: true },
  'cabinet/settings':      { base: '/public/modules/cabinet/settings',      lazy: true },
};

export function pathsOf(name) {
  const base = REGISTRY[name].base;
  return {
    js: `${base}/index.js`,
    css: `${base}/style.css`,
    html: `${base}/template.html`,
    lazy: !!REGISTRY[name].lazy,
    disabledOnLanding: !!REGISTRY[name].disabledOnLanding
  };
}