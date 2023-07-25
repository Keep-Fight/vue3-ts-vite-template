# Vue 3 + TypeScript + Vite 框架模板

## 一、技术栈

- 请求：axios
- 路由：pinia
- 开发语言：TypeScript
- 构建工具：Vite
- 包管理命令：yarn



## 二、目录文件配置

### 1. 目录结构

```apl
项目文件根目录
	- build:
		- plugins: 插件目录
	- public: 公共资源
	- src: 资源目录
		- assets: 静态名
		- components: 非路由组件组件
		- hooks:  hook函数文件列表
		- router: 路由文件
		- store: 
			- modules: 
		- styles: 样式文件
		- untils: 工具
		- views: 路由组件
	- types: 公共类型声明
		- auto-imports.d.ts: 自动导入配置
		- components.d.ts: 组件导入
		- vite-env.d.ts: 自定义组件导入
	- 
```

### 2. vite.config.ts基本配置

```ts
import { UserConfig, ConfigEnv } from 'vite';
import { createVitePlugins } from './build/vite/plugins';
import { resolve } from 'path';
import proxy from './build/vite/proxy';
import { VITE_PORT } from './build/constant';

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir);
}

// https://vitejs.dev/config/
export default ({ command }: ConfigEnv): UserConfig => {
  const isBuild = command === 'build';
  let base: string;
  if (command === 'build') {
    base = '/fast-vue3/';
  } else {
    base = '/';
  }
  return {
    base,
    resolve: {
      alias: [
        {
          find: 'vue-i18n',
          replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
        },
        // /@/xxxx => src/xxxx
        {
          find: /\/@\//,
          replacement: pathResolve('src') + '/',
        },
        // /#/xxxx => types/xxxx
        {
          find: /\/#\//,
          replacement: pathResolve('types') + '/',
        },
      ],
    },
    // plugins
    plugins: createVitePlugins(isBuild),

    // css
    css: {},

    // server
    server: {
      hmr: { overlay: false }, // 禁用或配置 HMR 连接 设置 server.hmr.overlay 为 false 可以禁用服务器错误遮罩层
      // 服务配置
      port: VITE_PORT, // 类型： number 指定服务器端口;
      open: false, // 类型： boolean | string在服务器启动时自动在浏览器中打开应用程序；
      cors: false, // 类型： boolean | CorsOptions 为开发服务器配置 CORS。默认启用并允许任何源
      host: '0.0.0.0', // IP配置，支持从IP启动
      proxy,
    },
  };
};

```



## 三、封装plugins数组

### 1. 封装插件流程

> 下面是导入插件的流程

- 创建目录，与src目录同级

![image-20230721204626534](https://raw.githubusercontent.com/Keep-Fight/learn-notes/main/imgs/202307251209153.png)


- 创建插件ts文件

![image-20230721205349146](https://raw.githubusercontent.com/Keep-Fight/learn-notes/main/imgs/202307251209863.png)



- 在plugins的index.ts文件目录下导入cha'dchad插件ts文件，

> **这个地方是导入插件的地方，创建插件ts文件以后需要在这里导入**

```ts
/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import { PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import VitePluginCertificate from 'vite-plugin-mkcert';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
import { ConfigSvgIconsPlugin } from './svgIcons';
import { AutoRegistryComponents } from './component';
import { AutoImportDeps } from './autoImport';
import { ConfigMockPlugin } from './mock';
import { ConfigVisualizerConfig } from './visualizer';
import { ConfigCompressPlugin } from './compress';
import { ConfigPagesPlugin } from './pages';
import { ConfigRestartPlugin } from './restart';
import { ConfigProgressPlugin } from './progress';
import { ConfigImageminPlugin } from './imagemin';
import { ConfigUnocssPlugin } from './unocss';

export function createVitePlugins(isBuild: boolean) {
  const vitePlugins: (PluginOption | PluginOption[])[] = [
    // vue支持
    vue(),
    // JSX支持
    vueJsx(),
    // setup语法糖组件名支持
    vueSetupExtend(),
    // 提供https证书
    VitePluginCertificate({
      source: 'coding',
    }) as PluginOption,
  ];

  // 自动按需引入组件
  vitePlugins.push(AutoRegistryComponents());

  // 自动按需引入依赖
  vitePlugins.push(AutoImportDeps());

  // 自动生成路由
  vitePlugins.push(ConfigPagesPlugin());

  // 开启.gz压缩  rollup-plugin-gzip
  vitePlugins.push(ConfigCompressPlugin());

  // 监听配置文件改动重启
  vitePlugins.push(ConfigRestartPlugin());

  // 构建时显示进度条
  vitePlugins.push(ConfigProgressPlugin());

  // unocss
  vitePlugins.push(ConfigUnocssPlugin());

  // vite-plugin-svg-icons
  vitePlugins.push(ConfigSvgIconsPlugin(isBuild));

  // vite-plugin-mock
  vitePlugins.push(ConfigMockPlugin(isBuild));

  // rollup-plugin-visualizer
  vitePlugins.push(ConfigVisualizerConfig());

  vitePlugins.push(ConfigImageminPlugin());

  return vitePlugins;
}
```



- 在vite.config.ts中导入插件（只操作一次）

```ts
import { UserConfig, ConfigEnv } from 'vite';
import { createVitePlugins } from './build/vite/plugins';
import { resolve } from 'path';
import proxy from './build/vite/proxy';
import { VITE_PORT } from './build/constant';

function pathResolve(dir: string) {
    return resolve(process.cwd(), '.', dir);
}

// https://vitejs.dev/config/
export default ({ command }: ConfigEnv): UserConfig => {
    const isBuild = command === 'build';
    let base: string;
    if (command === 'build') {
        base = '/fast-vue3/';
    } else {
        base = '/';
    }
    return {
        base,
        // plugins
        plugins: createVitePlugins(isBuild),

        // css
        css: {},
    };
};
```



### 2. 常用的插件

#### （1）按需自动导入API

> 在此导入以后会自动导入使用的组件比如**ref**,组件中不用在声明

- 安装插件

```shell
npm i -D unplugin-auto-import

yarn add -D unplugin-auto-import
```

- 创建autoImport.ts

```ts
/**
 * @name AutoImportDeps
 * @description 按需加载，自动引入
 */
import AutoImport from 'unplugin-auto-import/vite';

export const AutoImportDeps = () => {
  return AutoImport({
    dts: 'types/auto-imports.d.ts',
    imports: [
      'vue',
      'pinia',
      'vue-router',
      {
        '@vueuse/core': [],
      },
    ],
  });
};
```

- 导入插件

```ts
/**
 * @name createVitePlugins
 * @description 封装plugins数组统一调用
 */
import { PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import VitePluginCertificate from 'vite-plugin-mkcert';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
import { AutoRegistryComponents } from './component';

export function createVitePlugins(isBuild: boolean) {
  const vitePlugins: (PluginOption | PluginOption[])[] = [
    // vue支持
    vue(),
    // JSX支持
    vueJsx(),
    // setup语法糖组件名支持
    vueSetupExtend(),
    // 提供https证书
    VitePluginCertificate({
      source: 'coding',
    }) as PluginOption,
  ];

  // 自动按需引入组件
  vitePlugins.push(AutoRegistryComponents());

  return vitePlugins;
}
```



- 使用示例

> 以下是自动生成的文件，

```ts
// Generated by 'unplugin-auto-import'
export {};
declare global {
  const reactive: typeof import('vue')['reactive'];
  const ref: typeof import('vue')['ref'];
    .....
}
```

> 组件中使用

```vue
<template>
  {{count}}
</template>
<script setup lang="ts">
// 这里就不用import导入了
const count = ref<number>(0)
</script>
```





#### （2）按需自动导入组件

- 安装插件

```shell
npm install  unplugin-vue-components  -D
yarn add unplugin-vue-components  -D
```

- 创建component.ts

```ts
/**
 * @name  AutoRegistryComponents
 * @description 按需加载，自动引入组件
 */
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver, VueUseComponentsResolver } from 'unplugin-vue-components/resolvers';
export const AutoRegistryComponents = () => {
    return Components({
        dirs: ['src/components'],
        extensions: ['vue'],
        deep: true,
        // 需要创建相应的文件夹
        dts: 'types/components.d.ts',
        directoryAsNamespace: false,
        globalNamespaces: [],
        directives: true,
        importPathTransform: (v) => v,
        allowOverrides: false,
        include: [/\.vue$/, /\.vue\?vue/],
        exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/, /[\\/]\.nuxt[\\/]/],
        resolvers: [ElementPlusResolver(), VueUseComponentsResolver()],
    });
};

```

- 在上面导入插件



#### （3）按需导入svg

- 安装插件

```shell
yarn add -D vite-plugin-svg-icons
```

- 创建src/assets/icons文件夹
- 在src\components\SvgIcon文件夹下创建index.ts，内容如下

```ts
<template>
  <svg aria-hidden="true" class="svg-icon-spin" :class="calsses">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script lang="ts" setup>
  const props = defineProps({
    prefix: {
      type: String,
      default: 'icon',
    },
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: '#333',
    },
    size: {
      type: String,
      default: 'default',
    },
  });
  const symbolId = computed(() => `#${props.prefix}-${props.name}`);
  const calsses = computed(() => {
    return {
      [`sdms-size-${props.size}`]: props.size,
    };
  });
  const fontSize = reactive({ default: '32px', small: '20px', large: '48px' });
</script>
<style lang="less" scoped>
  .svg-icon-spin {
    width: v-bind('fontSize.default');
    height: v-bind('fontSize.default');
    fill: v-bind(color);
    vertical-align: middle;
    color: v-bind(color);

    &.sdms-size-small {
      font-size: v-bind('fontSize.small');
      height: v-bind('fontSize.small');
    }

    &.sdms-size-large {
      font-size: v-bind('fontSize.large');
      height: v-bind('fontSize.large');
    }
  }
</style>
```

- 在main.ts配置信息

```ts
import { createApp } from 'vue';
import App from './App.vue';
// 支持SVG
import 'virtual:svg-icons-register';

createApp(App).mount('#app');
```



- svg的使用

```vue
<template>
<img :src="logo" width="240" />
</template>

<script setup lang="ts">
    import logo from '/@/assets/icons/svg/logo.svg';
</script>
```



#### （4）其他插件

> 安装都是
>
> ```shell
> yarn add -D vite-plugin-compression
> x yarn add -D 插件名
> 
> ```

- **compress.ts**

```ts
/**
 * @name ConfigCompressPlugin
 * @description 开启.gz压缩
 */
import viteCompression from 'vite-plugin-compression';
import { COMPRESSION } from '../../constant';

export const ConfigCompressPlugin = () => {
    if (COMPRESSION) {
        return viteCompression({
            verbose: true, // 默认即可
            disable: false, //开启压缩(不禁用)，默认即可
            deleteOriginFile: false, //删除源文件
            threshold: 10240, //压缩前最小文件大小
            algorithm: 'gzip', //压缩算法
            ext: '.gz', //文件类型
        });
    }
    return [];
};
```

- **imagemin.ts**

```ts
import viteImagemin from 'vite-plugin-imagemin';

export function ConfigImageminPlugin() {
    const plugin = viteImagemin({
        gifsicle: {
            optimizationLevel: 7,
            interlaced: false,
        },
        mozjpeg: {
            quality: 20,
        },
        optipng: {
            optimizationLevel: 7,
        },
        pngquant: {
            quality: [0.8, 0.9],
            speed: 4,
        },
        svgo: {
            plugins: [
                {
                    name: 'removeViewBox',
                },
                {
                    name: 'removeEmptyAttrs',
                    active: false,
                },
            ],
        },
    });
    return plugin;
}
```

- **mock.ts**

```ts
/**
 * @name ConfigMockPlugin
 * @description 引入mockjs，本地模拟接口
 */
import { viteMockServe } from 'vite-plugin-mock';
export const ConfigMockPlugin = (isBuild: boolean) => {
    return viteMockServe({
        ignore: /^\_/,
        mockPath: 'mock',
        localEnabled: !isBuild,
        prodEnabled: false, //实际开发请关闭，会影响打包体积
        // https://github.com/anncwb/vite-plugin-mock/issues/9
        injectCode: `
       import { setupProdMockServer } from '../mock/_createProdMockServer';
       setupProdMockServer();
       `,
    });
};
```

- pages.ts

```ts
/**
 * @name ConfigPagesPlugin
 * @description 动态生成路由
 */
import Pages from 'vite-plugin-pages';
export const ConfigPagesPlugin = () => {
  return Pages({
    pagesDir: [{ dir: 'src/views', baseRoute: '' }],
    extensions: ['vue', 'md'],
    exclude: ['**/components/*.vue'],
    nuxtStyle: true,
  });
};
```

- **progress.ts**

```ts
/**
 * @name ConfigProgressPlugin
 * @description 构建显示进度条
 */

import progress from 'vite-plugin-progress';
export const ConfigProgressPlugin = () => {
    return progress();
};
```

- **restart.ts**

```ts
/**
 * @name ConfigRestartPlugin
 * @description 监听配置文件修改自动重启Vite
 */
import ViteRestart from 'vite-plugin-restart';
export const ConfigRestartPlugin = () => {
    return ViteRestart({
        restart: ['*.config.[jt]s', '**/config/*.[jt]s'],
    });
};
```

- visualizer.ts

```ts
/**
 * @name ConfigUnocssPlugin
 * @description 监听配置文件修改自动重启Vite
 */

// Unocss
import Unocss from 'unocss/vite';

export const ConfigUnocssPlugin = () => {
  return Unocss();
};
```



### 3. 手动导入模块

- vite-env.d.ts文件

> 经常会有导入其他模块

```ts
/// <reference types="vite/client" />

// 导入自定义组件
declare module '*.vue' {
    import { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module 'virtual:*' {
    const result: any;
    export default result;
}

// 样式库模块
declare module 'element-plus';
```





## 四、配置代码检查 (eslint)

### 1. eslint安装

- 安装插件

```shell
npm i eslint -D
yarn add eslint -D
pnpm add eslint -D

# 安装eslint
npm install eslint --save-dev

# window如果无法运行上述命令，可尝试
"node_modules/.bin/eslint" --init 
```

- 初始化eslint配置文件

> 配置文件不是一步生成的，这里是要在终端进行进一步的选择，比如你使用的框架，使用的语言，代码模块化的风格等等

```shell
# 初始化配置，eslint同时可作为命令行工具使用
./node_modules/.bin/eslint --init

# window如果无法运行上述命令，可尝试
"node_modules/.bin/eslint" --init 

# 初始化配置
npx eslint --init
```

- **vite集成eslint**

> 安装一个插件ts
>
> ```shell
> yarn add vite-plugin-eslint -D
> ```

```json
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'

export default defineConfig({
    plugins: [
        eslint({
            include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
            exclude: ['node_modules'],
            cache:false
        })
    ]
})
```



### 2. eslint配置

#### （1）配置.eslintrc.cjs

- 在配置文件中添加规则

> eslint的规则往往是公司项目领导来决定,**下面是一个简单的模板**

```json
rules: {
    // eslint（https://eslint.bootcss.com/docs/rules/）
    'no-var': 'error', // 要求使用 let 或 const 而不是 var
    'no-multiple-empty-lines': ['warn', { max: 1 }], // 不允许多个空行
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-unexpected-multiline': 'error', // 禁止空余的多行
    'no-useless-escape': 'off', // 禁止不必要的转义字符

    // typeScript (https://typescript-eslint.io/rules)
    '@typescript-eslint/no-unused-vars': 'error', // 禁止定义未使用的变量
    '@typescript-eslint/prefer-ts-expect-error': 'error', // 禁止使用 @ts-ignore
    '@typescript-eslint/no-explicit-any': 'off', // 禁止使用 any 类型
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-namespace': 'off', // 禁止使用自定义 TypeScript 模块和命名空间。
    '@typescript-eslint/semi': 'off',

    // eslint-plugin-vue (https://eslint.vuejs.org/rules/)
    'vue/multi-word-component-names': 'off', // 要求组件名称始终为 “-” 链接的单词
    'vue/script-setup-uses-vars': 'error', // 防止<script setup>使用的变量<template>被标记为未使用
    'vue/no-mutating-props': 'off', // 不允许组件 prop的改变
    'vue/attribute-hyphenation': 'off' // 对模板中的自定义组件强制执行属性命名样式
}

```

> **.eslintrc.cjs完整配置**

```js
// .eslintrc.cjs完整配置

// @ts-check
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020,
    sourceType: "module",
    jsxPragma: "React",
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-essential",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "vue/script-setup-uses-vars": "error",
    "@typescript-eslint/ban-ts-ignore": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-empty-function": "off",
    "vue/custom-event-name-casing": "off",
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "space-before-function-paren": "off",

    "vue/attributes-order": "off",
    "vue/v-on-event-hyphenation": "off",
    "vue/multi-word-component-names": "off",
    "vue/one-component-per-file": "off",
    "vue/html-closing-bracket-newline": "off",
    "vue/max-attributes-per-line": "off",
    "vue/multiline-html-element-content-newline": "off",
    "vue/singleline-html-element-content-newline": "off",
    "vue/attribute-hyphenation": "off",
    "vue/require-default-prop": "off",
    "vue/html-self-closing": [
      "error",
      {
        html: {
          void: "always",
          normal: "never",
          component: "always",
        },
        svg: "always",
        math: "always",
      },
    ],
  },
});
```



- package.json scripts中添加脚本

```json
"scripts":{
    "lint":"eslint src",
    "fix":"eslint src --fix"
}
```

#### （2）创建.eslintignore

```txt
// .eslintignore

*.sh
node_modules
*.md
*.woff
*.ttf
.vscode
.idea
dist
/public
/docs
.husky
.local
/bin
Dockerfile
```



### 3. eslint命令使用

- **命令使用**

```shell
# 用于检查代码是否符合eslint配置的语法规则
yarn lint
# 用于修复代码eslint检查出的语法错误
yarn fix
```



## 五、代码格式化 （prettier）

### 1. 安装

> 为了防止Prettier和ESLint格式化功能冲突，还需要安装 eslint-config-prettier 来关闭ESLint中的代码格式化功能

```shell
npm install --save-dev --save-exact prettier
npm install --save-dev eslint-plugin-prettier
npm install --save-dev eslint-config-prettier

yarn add -D prettier
yarn add -D eslint-plugin-prettier
yarn add -D eslint-config-prettier
yarn add -D eslint-define-config
```



### 2. 创建.prettierignore

```txt
// .prettierignore
/dist/*
.local
.output.js
/node_modules/**

**/*.svg
**/*.sh

/public/*
```



### 3. 创建prettier.config.js

```js
// prettier.config.js
module.exports = {
    // 一行最多多少个字符
    printWidth: 150,
    // 指定每个缩进级别的空格数
    tabWidth: 2,
    // 使用制表符而不是空格缩进行
    useTabs: true,
    // 在语句末尾是否需要分号
    semi: true,
    // 是否使用单引号
    singleQuote: true,
    // 更改引用对象属性的时间 可选值"<as-needed|consistent|preserve>"
    quoteProps: 'as-needed',
    // 在JSX中使用单引号而不是双引号
    jsxSingleQuote: false,
    // 多行时尽可能打印尾随逗号。（例如，单行数组永远不会出现逗号结尾。） 可选值"<none|es5|all>"，默认none
    trailingComma: 'es5',
    // 在对象文字中的括号之间打印空格
    bracketSpacing: true,
    // jsx 标签的反尖括号需要换行
    jsxBracketSameLine: false,
    // 在单独的箭头函数参数周围包括括号 always：(x) => x \ avoid：x => x
    arrowParens: 'always',
    // 这两个选项可用于格式化以给定字符偏移量（分别包括和不包括）开始和结束的代码
    rangeStart: 0,
    rangeEnd: Infinity,
    // 指定要使用的解析器，不需要写文件开头的 @prettier
    requirePragma: false,
    // 不需要自动在文件开头插入 @prettier
    insertPragma: false,
    // 使用默认的折行标准 always\never\preserve
    proseWrap: 'preserve',
    // 指定HTML文件的全局空格敏感度 css\strict\ignore
    htmlWhitespaceSensitivity: 'css',
    // Vue文件脚本和样式标签缩进
    vueIndentScriptAndStyle: false,
    //在 windows 操作系统中换行符通常是回车 (CR) 加换行分隔符 (LF)，也就是回车换行(CRLF)，
    //然而在 Linux 和 Unix 中只使用简单的换行分隔符 (LF)。
    //对应的控制字符为 "\n" (LF) 和 "\r\n"(CRLF)。auto意为保持现有的行尾
    // 换行符使用 lf 结尾是 可选值"<auto|lf|crlf|cr>"
    endOfLine: 'auto',
};
```



### 4. 安装插件

![image-20230722224733867](https://raw.githubusercontent.com/Keep-Fight/learn-notes/main/imgs/202307251212936.png)

![image-20230722224745544](https://gitee.com/LHD86/notes/raw/master/imgs/202307251226450.png)

> 选择默认格式化

![image-20230723142856995](https://raw.githubusercontent.com/Keep-Fight/learn-notes/main/imgs/202307251212785.png)

![image-20230723142156189](https://raw.githubusercontent.com/Keep-Fight/learn-notes/main/imgs/202307251212140.png)





## 六、环境配置 （env）

创建三个文件

- .env.development

```properties
# 开发环境

VITE_APP_TITLE = fast-vue3
# 接口请求地址，会设置到 axios 的 baseURL 参数上
VITE_APP_API_BASEURL = /api
# 调试工具，可设置 eruda 或 vconsole，如果不需要开启则留空
VITE_APP_DEBUG_TOOL = vconsole

# 是否开启代理
VITE_OPEN_PROXY = true
```



- .env.production

```properties
# 生产环境
NODE_ENV = production

# 页面标题
VITE_APP_TITLE = fast-vue3
# 接口请求地址，会设置到 axios 的 baseURL 参数上
VITE_APP_API_BASEURL = /
# 调试工具，可设置 eruda 或 vconsole，如果不需要开启则留空
VITE_APP_DEBUG_TOOL = vconsole

# 是否在打包时生成 sourcemap
VITE_BUILD_SOURCEMAP = false
# 是否在打包时删除 console 代码
VITE_BUILD_DROP_CONSOLE = false
# 是否在打包时开启压缩，支持 gzip 和 brotli
VITE_BUILD_COMPRESS = gzip,brotli
```



- .env.test

```properties
# 测试环境
NODE_ENV = production

# 页面标题
VITE_APP_TITLE = fast-vue3
# 接口请求地址，会设置到 axios 的 baseURL 参数上
VITE_APP_API_BASEURL = /
# 调试工具，可设置 eruda 或 vconsole，如果不需要开启则留空
VITE_APP_DEBUG_TOOL = vconsole

# 是否在打包时生成 sourcemap
VITE_BUILD_SOURCEMAP = true
# 是否在打包时删除 console 代码
VITE_BUILD_DROP_CONSOLE = true
# 是否在打包时开启压缩，支持 gzip 和 brotli
VITE_BUILD_COMPRESS =
```



## 七、代理配置 （proxy）

- 在vite.config.ts文件下配置

> 可以自行进行封装

```shell
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 自动按需导入
import AutoImport from 'unplugin-auto-import/vite'

import Components from 'unplugin-vue-components/vite'



export default defineConfig({
  plugins: [
    vue(),
  ],
  // 解决dev环境跨域
  server: {
    cors: true, // 默认启用并允许任何源
    open: true, // 在服务器启动时自动在浏览器中打开应用程序
    proxy: {
      '/api': {
        target: "http://localhost:8081",
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        changeOrigin: true, //是否有跨域
        ws: true,  // 允许websocket代理
      }
    }
  },

  // 打包配置
  build: {
    target: 'modules',
    outDir: 'dist', //指定输出路径
    assetsDir: 'assets', // 指定生成静态资源的存放路径
    minify: 'terser' // 混淆器，terser构建后文件体积更小
  },
})

```



## 八、提交规范 （husky）





## 九、样式处理 （scss）



### 1. 安装sass

``` shell
yarn add node-sass
yarn add sass-loader  
yarn add style-loader
yarn add sass
```



- 配置vite.config.ts

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//element-plus 按需导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vitejs.dev/config/
export default defineConfig({
    css: {
        preprocessorOptions: {
            //导入scss全局样式
            scss: {
                additionalData: `@use "./src/styles/element.scss" as *;`,
                // javascriptEnabled: true
            },
        },
    }
})
```



### 2. 重置样式

在styles文件下创建以下文件

> reset.scss

```scss
html {
    box-sizing: border-box;
}

*,
::before,
::after {
    margin: 0;
    padding: 0;
    box-sizing: inherit;
}

a {
    text-decoration: none;
    color: #333;
}

a:hover,
a:link,
a:visited,
a:active {
    text-decoration: none;
}

ol,
ul {
    list-style: none;
}

input,
textarea {
    outline: none;
    border: none;
    resize: none;
}

body {
    font-size: 14px;
    font-weight: 400;
}
```



## 十、请求封装 （axios）

### 1. 安装axios

```shell
yarn add axios
```

### 2. 封装axios

> 需要根据自己的业务条件进行封装
>
> 
>
> 在utils文件夹下创建一个axios文件夹

- index.ts

```ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { showMessage } from './status';
import { IResponse } from './type';
import { getToken } from '../auth';

// 如果请求话费了超过 `timeout` 的时间，请求将被中断
axios.defaults.timeout = 5000;
// 表示跨域请求时是否需要使用凭证
axios.defaults.withCredentials = false;
// axios.defaults.headers.common['token'] =  AUTH_TOKEN
// 允许跨域
axios.defaults.headers.post['Access-Control-Allow-Origin-Type'] = '*';

const axiosInstance: AxiosInstance = axios.create({
	baseURL: import.meta.env.BASE_URL + '',
	// transformRequest: [
	//   function (data) {
	//     //由于使用的 form-data传数据所以要格式化
	//     delete data.Authorization
	//     data = qs.stringify(data)
	//     return data
	//   },
	// ],
});

// axios实例拦截响应
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => {
		// if (response.headers.authorization) {
		//   localStorage.setItem('app_token', response.headers.authorization)
		// } else if (response.data && response.data.token) {
		//   localStorage.setItem('app_token', response.data.token)
		// }

		if (response.status === 200) {
			return response;
		}
		showMessage(response.status);
		return response;
	},
	// 请求失败
	(error: any) => {
		const { response } = error;
		if (response) {
			// 请求已发出，但是不在2xx的范围
			showMessage(response.status);
			return Promise.reject(response.data);
		}
		showMessage('网络连接异常,请稍后再试!');
	}
);

// axios实例拦截请求
axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = getToken();
		if (token) {
			// config.headers.Authorization = `${TokenPrefix}${token}`
		}
		return config;
	},
	(error: any) => {
		return Promise.reject(error);
	}
);

const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
	const conf = config;
	return new Promise((resolve) => {
		axiosInstance.request<any, AxiosResponse<IResponse>>(conf).then((res: AxiosResponse<IResponse>) => {
			// resolve(res as unknown as Promise<T>);
			const {
				data: { data },
			} = res;
			resolve(data as T);
		});
	});
};

// const request = <T = any>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
//   if (typeof config === 'string') {
//     if (!options) {
//       return axiosInstance.request<T, T>({
//         url: config,
//       });
//       // throw new Error('请配置正确的请求参数');
//     } else {
//       return axiosInstance.request<T, T>({
//         url: config,
//         ...options,
//       });
//     }
//   } else {
//     return axiosInstance.request<T, T>(config);
//   }
// };

export function get<T = any>(config: AxiosRequestConfig): Promise<T> {
	return request({ ...config, method: 'GET' });
}

export function post<T = any>(config: AxiosRequestConfig): Promise<T> {
	return request({ ...config, method: 'POST' });
}

export default request;
export type { AxiosInstance, AxiosResponse };
/**
 * @description: 用户登录案例
 * @params {ILogin} params
 * @return {Promise}
 */
// export const login = (params: ILogin): Promise<IResponse> => {
//     return axiosInstance.post('user/login', params).then(res => res.data);
// };

```



- **status.ts**

```ts
export const showMessage = (status: number | string): string => {
  let message = '';
  switch (status) {
    case 400:
      message = '请求错误(400)';
      break;
    case 401:
      message = '未授权，请重新登录(401)';
      break;
    case 403:
      message = '拒绝访问(403)';
      break;
    case 404:
      message = '请求出错(404)';
      break;
    case 408:
      message = '请求超时(408)';
      break;
    case 500:
      message = '服务器错误(500)';
      break;
    case 501:
      message = '服务未实现(501)';
      break;
    case 502:
      message = '网络错误(502)';
      break;
    case 503:
      message = '服务不可用(503)';
      break;
    case 504:
      message = '网络超时(504)';
      break;
    case 505:
      message = 'HTTP版本不受支持(505)';
      break;
    default:
      message = `连接出错(${status})!`;
  }
  return `${message}，请检查网络或联系管理员！`;
};

```



- **type.ts**

```ts
export interface RequestOptions {
  // Whether to process the request result
  isTransformResponse?: boolean;
}

// 返回res.data的interface
export interface IResponse<T = any> {
  code: number | string;
  result: T;
  message: string;
  status: string | number;
}

/**用户登录 */
export interface ILogin {
  /** 账户名称 */
  username: string;
  /** 账户密码 */
  password: string;
}
```



### 3. 封装utils

- **auth.ts**

```ts
const TokenKey = 'fast-token';
const TokenPrefix = 'Bearer ';

const isLogin = () => {
  return !!localStorage.getItem(TokenKey);
};
const getToken = () => {
  return localStorage.getItem(TokenKey);
};
const setToken = (token: string) => {
  localStorage.setItem(TokenKey, token);
};
const clearToken = () => {
  localStorage.removeItem(TokenKey);
};
export { TokenPrefix, isLogin, getToken, setToken, clearToken };
```

- **result.ts**

```ts
import { Recoverable } from 'repl';

// 返回统一格式的接口数据类型定义
export function successResult<T = Recoverable>(result: T, { message = 'Request success' } = {}) {
    return {
        code: 200,
        result,
        message,
        status: 'ok',
    };
}
export function errorResult(message = 'Request failed', { code = -1, result = null } = {}) {
    return {
        code,
        result,
        message,
        status: 'fail',
    };
}

//返回分页数据
export function pageSuccessResult<T = any>(page: number, pageSize: number, list: T[], { message = 'ok' } = {}) {
    const pageData = pagination(page, pageSize, list);
    return {
        ...successResult({
            items: pageData,
            total: list.length,
        }),
        message,
    };
}

// 封装分页数据
export function pagination<T = any>(pageNo: number, pageSize: number, array: T[]): T[] {
    const offset = (pageNo - 1) * Number(pageSize);
    const res =
          offset + Number(pageSize) >= array.length ? array.slice(offset, array.length) : array.slice(offset, offset + Number(pageSize));
    return res;
}

// 返回参数类型定义
export interface requestParams {
    method: string;
    body: any;
    headers?: { authorization?: string };
    query: any;
}

/**
 * @name  getRequestToken
 * @description 通过request数据中获取token，具体情况根据接口规范修改
 */
export function getRequestToken({ headers }: requestParams): string | undefined {
    return headers?.authorization;
}
```



