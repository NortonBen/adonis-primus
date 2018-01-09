'use strict'

/*
 * adonis-primus
 *
 * (c) norton <norton0395@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Primus = require('primus')
const mixin = require('es6-class-mixin')
const _ = require('lodash')
const Mixins = require('./Mixins')
const Presence = require('../Presence')
const util = require('../../lib/util')

class Channel {
  constructor (server, Context, name, closure, option) {
    this.server = server
    this.primus = new Primus(server, Object.assign({}, option, { pathname: name }))
    this.presence = new Presence(this.io)
    /**
     * A reference to the closure, it will be executed after
     * all middleware method.
     *
     * @type {Function|Class}
     */
    this._closure = closure

    /**
     * A boolean to know whether closure is a class or not. When
     * closure is a class we call class methods for LifeCycle
     * events.
     *
     * @type {Boolean}
     */
    this._closureIsAClass = util.isClass(closure)

    /**
     * Adonis Context class to be initiated upon new socket
     *
     * @type {Class}
     */
    this.Context = Context

    /**
     * Custom middleware to be executed for each socket
     * connection.
     *
     * @type {Array}
     */
    this._middleware = []

      /**
     * Custom plugin to be executed for each socket
     * connection.
     *
     * @type {Array}
     */
    this._plugin = []

    /**
     * The method to be invoked whenever someone leaves
     * the channel.
     *
     * @type {Function}
     */
    this._disconnectedFn = this._closureIsAClass && this._closure.prototype.disconnected
    ? util.wrapIfGenerator(this._closure.prototype.disconnected)
    : function () {}

    this._connecttionFn = this._closureIsAClass && this._closure.prototype.connection
    ? util.wrapIfGenerator(this._closure.prototype.connection)
    : function () {}

    /**
     * Lifecycle methods to be called as soon as
     * a channel is instantiated. Never change
     * the execution order of below methods
     */
    this._initiate()
    this._callCustomMiddleware()

    /**
     * Hook into new connection and invoke the
     * channel closure.
     */
    this.primus.on('connection', (spark) => this._connecttionFn(spark))
    this.primus.on('connection', (spark) => this._onConnection(spark))
    this.primus.on('disconnect', (spark) => this._disconnectedFn(spark))
  }

  get primus () {
    return this.primus
  }

  /**
   * Add a middleware to the middleware stack
   *
   * @param {...Spread} middleware
   */
  middleware (middleware) {
    const args = _.isArray(middleware) ? middleware : _.toArray(arguments)
    this._middleware = this._middleware.concat(args)
    return this
  }

  /**
   * Add a plugin to the plugin stack
   *
   * @param {...Spread} plugin
   */
  plugin (plugin) {
    const args = _.isArray(plugin) ? plugin : _.toArray(arguments)
    this._plugin = this._plugin.concat(args)
    return this
  }
}

class ExtendedChannel extends mixin(
  Channel,
  Mixins.Setup,
  Mixins.LifeCycle
) {}

module.exports = ExtendedChannel
