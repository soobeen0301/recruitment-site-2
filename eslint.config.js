import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  { rules: { 'no-unused-vars': 'warn' } },
  //기본 error , off 도 가능
];
