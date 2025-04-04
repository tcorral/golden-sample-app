import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';
import  baseConfig from './playwright.config';
import { join } from 'path';
import { TestOptions, TestEnvironment } from './test.model';


export default defineConfig<TestOptions>({
  ...baseConfig,
  projects: [
    /**
     * Configuration for running tests with mock env
     */
    {
      name: 'localhost-mocked',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          chromiumSandbox: false,
          args: ['--disable-infobars', '--no-sandbox', '--incognito'],
        },
        testEnvironment: TestEnvironment.MOCKS,
        baseURL: 'http://localhost:4200/',
      },
    },
     /**
     * Configuration for running tests with sandbox env running locally and proxying to sandbox
     */
    {
      name: 'localhost-ebp-sndbx',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          chromiumSandbox: false,
          args: ['--disable-infobars', '--no-sandbox', '--incognito'],
        },
        configPath: join(__dirname, 'apps/golden-sample-app-e2e/config/ebp-sndbx.config.json'),
        testEnvironment: TestEnvironment.SANDBOX,
        baseURL: 'http://localhost:4200/',
      },
    },
     /**
     * Configuration for running tests with sandbox env running locally and proxying to sandbox
     */
     {
      name: 'localhost-mb-stg',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          chromiumSandbox: false,
          args: ['--disable-infobars', '--no-sandbox', '--incognito'],
        },
        configPath: join(__dirname, 'apps/golden-sample-app-e2e/config/mb-stg.config.json'),
        baseURL: 'http://localhost:4200/',
      },
    },
  ],
  webServer: [],
})
