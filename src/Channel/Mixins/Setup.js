'use strict'

/*
 * adonis-primus
 *
 * (c) norton <norton0395@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * MIXIN: This is a mixin and has access to the channel
 *        class instance.
 */

const co = require('co')
const Middleware = require('../../Middleware')
const Plugin = require('../../Plugin')
const debug = require('debug')('adonis:primus')
const Setup = exports = module.exports = {}

/**
 * Initiating Chanel
 * add plugin and authorize.
 */
Setup._initiate = function () {
  // add context
  this.primus.use((req, res, next) => {
    req.context = new this.Context(this.primus, req)
    next(req)
  })

  this.primus.plugin('rooms', {
    server: function (primus) {
      var Spark = primus.Spark
      Spark.prototype.context = Spark.request.context
    }
  })

  // add plugin
  const pluginlist = Plugin.resolve(this._plugin, true)
  Plugin.compose(pluginlist, this.primus)

  // set authrize
  // this.primus.authorize((req, done) => {
  //   done(req)
  // })
}

/**
 * Calling custom middleware by looping over them and
 * throwing an error if any middleware throws error.
 */
Setup._callCustomMiddleware = function () {
  this.primus.use((req, res, next) => {
    const middlewareList = Middleware.resolve(this._middleware, true)
    if (!middlewareList.length) {
      next()
      return
    }

    const context = req.context
    debug('context', 'have context')
    const composedFn = Middleware.compose(middlewareList, context)
    co(async function () {
      await composedFn()
    })
    .then(() => next())
    .catch((error) => {
      debug('error', error)
      next(error)
    })
  })
}
