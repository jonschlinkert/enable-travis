#!/usr/bin/env node

process.title = 'enable-travis';

var argv = require('minimist')(process.argv.slice(2));
var log = require('log-utils');
var Enquirer = require('enquirer');
var DataStore = require('data-store');

var store = new DataStore('enable-travis');
var enquirer = new Enquirer();
enquirer.register('password', require('prompt-password'));

if (argv.set) {
  var args = argv.set.split(/[=:,]/);
  console.log(args)
  store.set.apply(store, args);
  process.exit(1);
}

if (argv.get) {
  console.log(store.get(argv.get));
  process.exit(1);
}

var repo = require('git-repo-name');
var user = require('git-user-name');
var name = require('git-username');
var pkg = require('load-pkg');

var username = name() || user() || store.get('username');
var token = store.get('GITHUB_OAUTH_TOKEN');
var repository = repo.sync() || pkg && pkg.name;
var enable = require('./');

run(function (env) {
  enable(env, function (err, res) {
    if (err) {
      console.log(err);
      console.log(log.yellow('Oops! Travis doesn\'t seem know about this project yet.'));
      console.log(log.yellow('Use "https://github.com/jonschlinkert/sync-travis" to '));
      console.log(log.yellow('update Travis CI with your latest GitHub projects.'));
      process.exit(0);
    }
    if (res && res.result) {
      console.log(log.symbol.success + ' ' + log.green(env.repo), 'has been enabled!');
    }
  });
});

function run(cb) {
  console.log('Please provide the repo to enable, your github username and auth token:');
  console.log();

  var prompts = [];

  prompts.push({
    type: 'input',
    name: 'repo',
    message: log.bold('owner/repo'),
    default: username + '/' + repository
  });

  prompts.push({
    type: 'input',
    name: 'username',
    message: log.bold('username'),
    default: username
  });

  prompts.push({
    type: 'password',
    name: 'GITHUB_OAUTH_TOKEN',
    message: log.bold('GitHub auth token'),
    default: token
  });

  enquirer.ask(prompts)
    .then(function(answers) {
      for (var key in answers) {
        if (key !== repo) {
          store.set(key, answers[key]);
        }
      }

      if (answers) {
        if (answers.repo && answers.repo.indexOf('/') === -1) {
          console.log(log.red('github repo must be in the form of `owner/repo'));
          process.exit(1);
        }
        cb(answers);
      } else {
        console.log(log.green('\n  Got it. All is good.'));
        process.exit(0);
      }
    })
    .catch(function(err) {
      console.error(err);
      process.exit(1);
    });
}
