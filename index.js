'use strict';

const Funnel = require('broccoli-funnel');
const Rollup = require('broccoli-rollup');
const BroccoliDebug = require('broccoli-debug');

module.exports = {
  name: require('./package').name,

  init() {
    this._super.init && this._super.init.apply(this, arguments);
    this.debugTree = BroccoliDebug.buildDebugCallback('async-data-demo');
    this.options = this.options || {};
  },

  buildBabelOptions() {
    let babelOptions = this.options.babel || {};
    let plugins = babelOptions.plugins || [];
    let postPlugins = babelOptions.postTransformPlugins || [];

    return {
      loose: true,
      plugins,
      postTransformPlugins: postPlugins,
      exclude: ['transform-block-scoping', 'transform-typeof-symbol'],
    };
  },

  _setupBabelOptions() {
    if (this._hasSetupBabelOptions) {
      return;
    }

    this.options.babel = this.buildBabelOptions();

    this._hasSetupBabelOptions = true;
  },

  included(app) {
    this._super.included.apply(this, arguments);

    this._setupBabelOptions();
  },

  treeForPublic() {
    let tree = './addon';

    tree = this.debugTree(tree, 'addon-worker-thread:input');
    this._setupBabelOptions();

    let babel = this.addons.find(addon => addon.name === 'ember-cli-babel');
    let workerTree = babel.transpileTree(this.debugTree(tree, 'addon-worker-thread:input'), {
      babel: this.options.babel,
      'ember-cli-babel': {
        compileModules: false,
        extensions: ['js', 'ts'],
      },
    });

    workerTree = this.debugTree(workerTree, 'addon-worker-thread:output');
    workerTree = new Rollup(workerTree, {
      rollup: {
        input: 'data-worker/index.js',
        output: [
          {
            file: 'workers/data-worker.js',
            format: 'iife',
            amd: { id: 'ember-data/-private' },
            exports: 'named',
          },
        ],
        external: [],
        // cache: true|false Defaults to true
      },
    });

    workerTree = this.debugTree(workerTree, 'addon-worker-thread:rollup-output');
    workerTree = new Funnel(workerTree, { destDir: '' });

    return this.debugTree(workerTree, 'addon-worker-thread:final');
  },

  treeForAddon(tree) {
    tree = this.debugTree(tree, 'addon-main-thread:input');

    let babel = this.addons.find(addon => addon.name === 'ember-cli-babel');

    let addonTree = new Funnel(tree, {
      exclude: ['data-worker'],

      destDir: 'async-data-demo',
    });

    // use the default options
    addonTree = babel.transpileTree(this.debugTree(addonTree, 'addon-main-thread:input'));
    addonTree = this.debugTree(addonTree, 'addon-main-thread:output');

    addonTree = new Funnel(addonTree, { destDir: '' });

    return this.debugTree(addonTree, 'addon-main-thread:final');
  },
};
