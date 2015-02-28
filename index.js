/*!
 * enable-travis <https://github.com/jonschlinkert/enable-travis>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var Travis = require('travis-ci');

/**
 * Expose `enable`
 */

module.exports = enable;

/**
 * Enable a travis project
 */

function enable(repo, env, cb) {
  var travis = new Travis({version: '2.0.0'});
  env = env || {};

  travis.authenticate({
    username: env.username,
    password: env.password
  }, function (err, res) {
    if (err) return cb(err);
    var segs = repo.split('/');

    travis.repos(segs[0], segs[1]).get(function (err, result) {
      if (err) return cb(err);

      travis.hooks(result.repo && result.repo.id).put({
        hook: {active: true}

      }, function (err, content) {
        if (err) return cb(err);
        cb(null, content);
      });
    });
  });
}
