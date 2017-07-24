/*!
 * enable-travis <https://github.com/jonschlinkert/enable-travis>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
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

function enable(options, cb) {
  options = options || {};
  var travis = new Travis({
    version: '2.0.0',
    // user-agent needs to start with "Travis"
    // https://github.com/travis-ci/travis-ci/issues/5649
    headers: {'user-agent': 'Travis: jonschlinkert/enable-travis'}
  });

  travis.auth.github.post({
    github_token: options.GITHUB_OAUTH_TOKEN
  }, function(err, res) {
    if (err) return cb(err);

    travis.authenticate({
      access_token: res.access_token
    }, function(err) {

      if (err) return cb(err);
      var segs = options.repo.split('/');

      travis.repos(segs[0], segs[1]).get(function(err, res) {
        if (err) return cb(err);

        travis.hooks(res.repo && res.repo.id).put({
          hook: {active: true}

        }, function(err, content) {
          if (err) return cb(err);
          cb(null, content);
        });
      });
    });
  });
}
