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
 * MIXIN: This is a mixin and has access to the Channel
 *        class instance
*/

const util = require('../../../lib/util')

const LifeCycle = exports = module.exports = {}

/**
 * This method is invoked whenever a new socket joins a channel
 * and all middleware have been called. Here we initiate the
 * channel closure and pass around the socket and the
 * request to the constructor.
 *
 * @param  {Object} spark
 */
LifeCycle._onConnection = function (spark) {
  const closureInstance = new this._closure(spark, this.presence)

  /**
   * If channel closure is a class, we need to bind all class
   * methods starting with {on} as the event listeners for
   * corresponding events.
   */
  if (this._closureIsAClass) {
    const methods = Object.getOwnPropertyNames(this._closure.prototype)
    methods.forEach((method) => this._bindEventListener(closureInstance, spark, method))
  }
}

/**
 * Here we attach listeners for events defined as
 * function names on the socket class.
 *
 * @param {Object} closureInstance
 * @param {Object} socket
 * @param {String} method
 */
LifeCycle._bindEventListener = function (closureInstance, spark, method) {
  if (method.startsWith('on') && typeof (closureInstance[method]) === 'function') {
    spark.on(util.generateEventName(method), closureInstance[method])
  }
}
