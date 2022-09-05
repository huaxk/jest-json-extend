import { javascript, typescript } from 'projen';
import { UpgradeDependenciesSchedule } from 'projen/lib/javascript';

const project = new typescript.TypeScriptProject({
  authorName: 'huaxk',
  defaultReleaseBranch: 'main',
  name: 'jest-json-extend',
  packageManager: javascript.NodePackageManager.PNPM,
  projenrcTs: true,
  description: 'Jest expect matchers for JSON strings with jsonpath supported',
  license: 'MIT',
  keywords: [
    'jest',
    'json',
    'expect',
    'matcher',
    'jsonpath',
    'jsonpath-extend',
  ],

  deps: ['jsonpath-plus', 'expect@^27', 'jest-matcher-utils'],
  depsUpgradeOptions: {
    workflowOptions: { schedule: UpgradeDependenciesSchedule.NEVER },
  },

  jestOptions: {
    jestVersion: '^27',
  },
  eslintOptions: { prettier: true, dirs: ['src'] },
  prettier: true,
  prettierOptions: {
    settings: {
      singleQuote: true,
    },
  },

  releaseToNpm: true,
});

project.synth();
