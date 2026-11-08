const { chromium } = require('@playwright/test');

module.exports = {
  ci: {
    collect: {
      chromePath: chromium.executablePath(),
      staticDistDir: './dist',
      url: ['http://localhost/'],
      numberOfRuns: 3,
      settings: { chromeFlags: '--no-sandbox' },
    },
    assert: {
      assertions: {
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        // Home imersiva (ADR 0006): a cena carrega na abertura, então soma 50 KB iniciais + 250 KB
        // de cena (plano 3.11). Os 50 KB sem a cena continuam garantidos por scripts/check-budgets.sh.
        'resource-summary:script:size': ['error', { maxNumericValue: 307200 }],
      },
    },
  },
};
