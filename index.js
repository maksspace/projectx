const fs = require('fs');
const exec = require('child_process').exec;
const axios = require('axios');

const DEFAULT_MODULES_URL = 'https://raw.githubusercontent.com/maksspace/projectx/master/modules.json';

function getExistingModules (url) {
  return axios.get(url, {
  	 headers: {
        'Content-Type': 'application/json'
    }
  })
  	.then(res => {
  	  return (res.status === 200)
  	  	? res.data
  	  	: Promise.reject(res);
 	}).catch(error => {
 		return Promise.reject(error);
 	});
}

class ProjectXBase {

  _logStr (str) {
    const date = new Date();
    const currentDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const currentTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    console.log(`> [${currentDate} ${currentTime}] ${str}`);
    return this;
  }

  _initDirectory (path) {
		if (!fs.existsSync(path)) {
			this._logStr(`Create path - ${path}`);
			fs.mkdirSync(path);
		}
	}

}

class Console {
	cmd (command) {
		return new Promise((resolve, reject) => {
			exec(command, (error, stdout, stderr) => {
				if (!error) {
					resolve(stdout);
				} else {
					reject(error);
				}
			})
		});
	}
}

class Git extends ProjectXBase {
	constructor () {
		super();
		this.console = new Console;
	}

	clone (repo, path) {
		this._logStr(`Start clonnig - ${repo}`);
		return this.console.cmd(`git clone ${repo} ${path}`)
			.then(() => {
				this._logStr(`Repo ${repo} successfuly clonned`);
			})
			.catch((error) => {
				this._logStr(`Faild clonnig ${repo} - ${error}`);
			});
		;
	}
}

// type-name-lang

class Module extends ProjectXBase {
  constructor (name) {
    super();
    this._name = name;
  }

  build () {
    this._logStr(`Building module - ${this._name}`);
  }
}

class Project extends ProjectXBase {

  constructor (name) {
    super();
    this._type = '';
    this._lang = '';
    this._name = name;
    this._base = '';
    this._modules = [];
    this._facadeOf = undefined;
  }

  base (name) {
    this._base = name;
    return this;
  }

  type (name) {
  	this._type = name;
  	return this;
  }

  lang (name) {
  	this._lang = name;
  	return this;
  }

  module (name) {
    const module = new Module(name)
    this._modules.push(module);
    return this;
  }

  build (modulesList) {
    this._logStr(`Building project - ${this._name}`);
    this._modules.forEach(m => m.build(modulesList));
  }

  getRepos () {

  }
}

class Claster extends ProjectXBase {

  constructor (name, projects = []) {
    super();
    this._name = name;
    this._projects = projects;
    this._mode = '';
    this._fns = {};
    this._eventHandlers = [];
  }

  define (name, fn) {
    this._fns[name] = fn;
    return this;
  }

  on (eventName, fn) {
    this._eventHandlers.push((...args) => {
      if (typeof fn === 'string') {
        this._fns[fn](...args);
      } else if (typeof fn === 'function') {
        fn(...args);
      }
    });
    return this;
  }

  mode (name) {
    this._mode = name;
    return this;
  }

  run () {
    this._logStr(`Claster ${this._name} is running...`);
    this._projects.forEach(p => {
      console.log(JSON.stringify(p, null, 2));
      p.build();
    });
  }

}

class ProjectX extends ProjectXBase {
	constructor (modulesUrl) {
		super();
		this._modulesUrl = modulesUrl || DEFAULT_MODULES_URL;
		this._clasters = [];
		this._modulesList = [];
		this._git = new Git;
	}

	run () {
		this._logStr('Init ProjectX root directory...');
		this._initRootDirectory();
		this._logStr('Loading existing modules...');
		getExistingModules(this._modulesUrl)
	  		.then(modules => {
	  			this._modulesList = modules;
	  			this._getModules();
	  		})
	  		.catch(status => {
	  			this._logStr(`Error during load existing modules - error code ${status}`);
	  		});
	}

	registerClaster (claster) {
		this._clasters.push(claster);
		return this;
	}

	_initRootDirectory () {
		const rootDirectoryPath = './.projectx';
		const buildedModulesPath = `${rootDirectoryPath}/modules`;
		this._initDirectory(rootDirectoryPath);
		this._initDirectory(buildedModulesPath);
	}

	_getModules () {
	  this._clasters.forEach(c => {
	    c._projects.forEach(p => {
	     	const projectRepos = p.getRepos();
	 	});
	  });
	}
}

const px = new ProjectX();
const restApi = new Project('rest-api');
const webApp = new Project('web-app');

restApi
  .type('api')
  .lang('js')
  .base('koa')
  .module('auth')
;

webApp
  .type('web')
  .lang('js')
  .base('vue')
  .module('auth')
;

const claster = new Claster('my-claster', [
  restApi,
  webApp
]);

px
	.registerClaster(claster)
	.run()
;
