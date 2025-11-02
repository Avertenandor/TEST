export const REGISTRY = {
  // Универсальные пути: /modules/* (Vite сервит /public как корень)
  header:   { base: '/modules/header',   lazy: false },
  hero:     { base: '/modules/hero',     lazy: false },
  features: { base: '/modules/features', lazy: false },
  coin:     { base: '/modules/coin',     lazy: false },
  'how-it-works': { base: '/modules/how-it-works', lazy: false },
  partners: { base: '/modules/partners', lazy: false },
  testimonials: { base: '/modules/testimonials', lazy: false },
  roadmap: { base: '/modules/roadmap', lazy: false },
  security: { base: '/modules/security', lazy: false },
  'platform-access': { base: '/modules/platform-access', lazy: false },
  'deposits-overview': { base: '/modules/deposits-overview', lazy: false },
  referral: { base: '/modules/referral', lazy: false },
  loyalty: { base: '/modules/loyalty', lazy: false },
  multipliers: { base: '/modules/multipliers', lazy: false },
  'device-mining': { base: '/modules/device-mining', lazy: false },
  'volatility-trading': { base: '/modules/volatility-trading', lazy: false },
  'tech-info': { base: '/modules/tech-info', lazy: false },
  'mev-detailed': { base: '/modules/mev-detailed', lazy: false },
  'tax-model': { base: '/modules/tax-model', lazy: false },
  'pwa-install': { base: '/modules/pwa-install', lazy: false },
  team: { base: '/modules/team', lazy: false },
  'final-cta': { base: '/modules/final-cta', lazy: false },
  textblock:{ base: '/modules/textblock', lazy: false },
  // На лендинге не монтируем терминал
  terminal: { base: '/modules/terminal', lazy: true, disabledOnLanding: true },
  auth:     { base: '/modules/auth',     lazy: true },
  faq:      { base: '/modules/faq',      lazy: false },
  footer:   { base: '/modules/footer',   lazy: false },

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