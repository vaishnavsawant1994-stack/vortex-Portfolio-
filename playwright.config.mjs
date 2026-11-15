import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'*.spec.mjs',
  timeout:30000,expect:{timeout:7000},fullyParallel:true,
  retries:process.env.CI?1:0,workers:process.env.CI?2:undefined,
  reporter:[['list'],['html',{outputFolder:'playwright-report',open:'never'}]],
  use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure',reducedMotion:'reduce'},
  projects:[
    {name:'chromium-desktop',use:{...devices['Desktop Chrome']}},
    {name:'firefox-desktop',use:{...devices['Desktop Firefox']}},
    {name:'webkit-desktop',use:{...devices['Desktop Safari']}},
    {name:'chromium-mobile',use:{...devices['Pixel 7']}},
    {name:'webkit-mobile',use:{...devices['iPhone 13']}}
  ],
  webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1',url:'http://127.0.0.1:4173/',reuseExistingServer:!process.env.CI,timeout:30000}
});