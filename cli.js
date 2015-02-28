#!/usr/bin/env node

process.title = 'enable-travis';

var chalk = require('chalk');
var symbol = require('log-symbols');
var inquirer = require('inquirer');

var repo = require('git-repo-name');
var user = require('git-user-name');
var name = require('git-username');
var pkg = require('load-pkg');

var username = name() || user();
var repository = repo() || pkg && pkg.name;
var enable = require('./');


run(function (env) {
  enable(env.repo, env, function (err, res) {
    if (err) throw(err);
    if (res && res.result) {
      symbol.success + ' ' + console.log(chalk.green(env.repo, 'has been enabled!'));
    }
  });
});

function run(cb) {
  console.log(chalk.cyan('Please provide your github username and password:'));
  console.log(chalk.gray('(answers are never stored):'));
  console.log();

  var prompts = [];

  prompts.push({
    type: "input",
    name: 'username',
    message: chalk.bold('username'),
    default: username
  });

  prompts.push({
    type: "password",
    name: 'password',
    message: chalk.bold('password'),
    default: null
  });

  prompts.push({
    type: "input",
    name: 'repo',
    message: chalk.bold('owner/repo'),
    default: username + '/' + repository
  });

  inquirer.prompt(prompts, function (answer) {
    if(answer) {
      if (answer.repo && answer.repo.indexOf('/') === -1) {
        console.log(chalk.red('github repo must be in the form of `owner/repo'));
        process.exit(1);
      }
      cb(answer);
    } else {
      console.log(chalk.green('\n  Got it. All is good.'));
      process.exit(0);
    }
  });
}
