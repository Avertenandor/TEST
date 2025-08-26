export const REGISTRY = {
  header: { base: '/modules/header', lazy: false },
  hero: { base: '/modules/hero', lazy: false },
  features: { base: '/modules/features', lazy: false },
  textblock: { base: '/modules/textblock', lazy: false },
  terminal: { base: '/modules/terminal', lazy: true },
  auth: { base: '/modules/auth', lazy: true },
  faq: { base: '/modules/faq', lazy: false },
  footer: { base: '/modules/footer', lazy: false },

  'cabinet/shell': { base: '/modules/cabinet/shell', lazy: false },
  'cabinet/auth': { base: '/modules/cabinet/auth', lazy: true },
  'cabinet/profile': { base: '/modules/cabinet/profile', lazy: true },
  'cabinet/balances': { base: '/modules/cabinet/balances', lazy: true },
  'cabinet/deposits': { base: '/modules/cabinet/deposits', lazy: true },
  'cabinet/rewards': { base: '/modules/cabinet/rewards', lazy: true },
  'cabinet/referrals': { base: '/modules/cabinet/referrals', lazy: true },
  'cabinet/transactions': { base: '/modules/cabinet/transactions', lazy: true },
  'cabinet/settings': { base: '/modules/cabinet/settings', lazy: true },
};

export function pathsOf(name) {
  const base = REGISTRY[name].base;
  return {
    js: `${base}/index.js`,
    css: `${base}/style.css`,
    html: `${base}/template.html`,
    lazy: !!REGISTRY[name].lazy
  };
}