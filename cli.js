#!/usr/bin/env node

process.title = 'enable-travis';

var argv = require('minimist')(process.argv.slice(2));
var chalk = require('chalk');
var symbol = require('log-symbols');
var inquirer = require('inquirer');
var DataStore = require('data-store');
var store = new DataStore('enable-travis');

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
// var password = store.get('password');
var token = store.get('GITHUB_OAUTH_TOKEN');
var repository = repo() || pkg && pkg.name;
var enable = require('./');


run(function (env) {
  enable(env, function (err, res) {
    if (err) {
      console.log(err);
      console.log(chalk.yellow('Oops! Travis doesn\'t seem know about this project yet.'));
      console.log(chalk.yellow('Use "https://github.com/jonschlinkert/sync-travis" to '));
      console.log(chalk.yellow('update Travis CI with your latest GitHub projects.'));
      process.exit(0);
    }
    if (res && res.result) {
      console.log(symbol.success + ' ' + chalk.green(env.repo), 'has been enabled!');
    }
  });
});

function run(cb) {
  console.log('Please provide the repo to enable, your github username and auth token:');
  // console.log(chalk.gray('(answers are never stored):'));
  console.log();

  var prompts = [];

  prompts.push({
    type: 'input',
    name: 'repo',
    message: chalk.bold('owner/repo'),
    default: username + '/' + repository
  });

  prompts.push({
    type: 'input',
    name: 'username',
    message: chalk.bold('username'),
    default: username
  });

  // prompts.push({
  //   type: 'password',
  //   name: 'password',
  //   message: chalk.bold('password'),
  //   default: password
  // });

  prompts.push({
    type: 'password',
    name: 'GITHUB_OAUTH_TOKEN',
    message: chalk.bold('GitHub auth token'),
    default: token
  });

  inquirer.prompt(prompts, function (answers) {
    for (var key in answers) {
      if (key !== repo) {
        store.set(key, answers[key]);
      }
    }

    if(answers) {
      if (answers.repo && answers.repo.indexOf('/') === -1) {
        console.log(chalk.red('github repo must be in the form of `owner/repo'));
        process.exit(1);
      }
      cb(answers);
    } else {
      console.log(chalk.green('\n  Got it. All is good.'));
      process.exit(0);
    }
  });
}
