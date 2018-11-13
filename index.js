const fs = require('fs');
const exec = require('child_process').exec;
const argv = require('yargs').argv;
const axios = require('axios');
const _ = require('lodash');

const CLI_PARAMS = [
  'a',
  'r',
  'n',
  'l',
  'b'
];

const CLI_PARAMS_NAMES = {
  ADD_MODULE: 'a',
  REMOVE_MODULE: 'r',
  SET_APP_NAME: 'n',
  SET_APP_LANG: 'l',
  SET_APP_BASE: 'b',
};

const CONFIG_NAME = 'projectx.config.json';
const CONFIG_PATH = './';
const CONFIG_LOCATION = `${CONFIG_PATH}${CONFIG_NAME}`;
const CONFIG_TEMPLATE = {
  name: '',
  lang: '',
  base: '',
  dependencies: {}
};

function getOptions (args) {
  return _.keys(args).reduce((options, name) => {
    return CLI_PARAMS.includes(name)
      ? [ ...options, { cmd: name, value: args[name] }]
      : options;
  }, []);
}

class ProjectX {

  constructor(options) {
    this._init(options);
    if (!this._configExist()) {
      this._initConfig();
    }
    this._readConfig();
  }

  run () {
    for (let o of this._options) {
      this._applyOption(o.cmd, o.value);
    }
    console.log('Saving config ...');
    this._saveConfig();
    console.log('Done.');
  }

  _init (options) {
    this._config = {};
    this._options = options || [];
  }

  _configExist () {
    return fs.existsSync(CONFIG_LOCATION);
  }

  _initConfig () {
    this._config = _.cloneDeep(CONFIG_TEMPLATE);
  }

  _saveConfig () {
    const configInString = JSON.stringify(this._config, null, 2);
    fs.writeFileSync(CONFIG_LOCATION, configInString);
  }

  _readConfig () {
    this._config = require(CONFIG_LOCATION);
  }

  _applyOption (cmd, optionValue) {
    switch (cmd) {
      case CLI_PARAMS_NAMES.SET_APP_NAME: {
        this._config.name = optionValue;
        break;
      }
      case CLI_PARAMS_NAMES.SET_APP_LANG: {
        this._config.lang = optionValue;
        break;
      }
      case CLI_PARAMS_NAMES.SET_APP_BASE: {
        this._config.base = optionValue;
        break;
      }
      case CLI_PARAMS_NAMES.ADD_MODULE: {
        console.log(`Adding ${cmd} module ...`);
        this._config.dependencies[optionValue] = {
          repo: 'https://github.com/maksspace/projectx'
        };
        break;
      }
      case CLI_PARAMS_NAMES.REMOVE_MODULE: {
        this._config.dependencies[optionValue] = undefined;
        break;
      }
    }
    return this;
  }

  async _installModule (moduleName) {

  }
}

const options = getOptions(argv);
new ProjectX(options).run();