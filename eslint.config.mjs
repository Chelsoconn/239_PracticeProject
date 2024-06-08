import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import { fixupConfigRules } from "@eslint/compat";

export default [
 
  {
    files: ["*.js"],
    ...pluginJs.configs.recommended,
    rules: {
     
    }
  },
 
  {
    files: ["*.jsx", "*.tsx"],
    ...fixupConfigRules(pluginReactConfig),
    rules: {
     
    }
  },
  
  {
    files: ["*"],
    globals: {
     
      Handlebars: 'readonly',
      ...globals.browser 
    }
  }
];
