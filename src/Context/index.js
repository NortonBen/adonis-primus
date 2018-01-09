'use strict'

/*
 * adonis-primus
 *
 * (c) norton <norton0395@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Macroable = require('macroable')

/**
 * An instance of this class is passed to all route handlers
 * and middleware. Also different part of applications
 * can bind getters to this class.
 *
 * @binding Adonis/Adons/PrimusContext
 * @alias PrimusContext
 * @group Ws
 *
 * @class PrimusContext
 * @constructor
 *
 */

class PrimusContext extends Macroable {
  constructor (primus, req) {
    super()

    /**
     * Node.js primus of primus object when connect
     *
     * @attribute _socket
     *
     * @type {Object}
     */
    this._primus = primus

     /**
     * Node.js req object of request HTTP
     *
     * @attribute socket
     *
     * @type {Object}
     */
    this._req = req

    this.constructor._readyFns
      .filter((fn) => typeof (fn) === 'function')
      .forEach((fn) => fn(this))
  }

  /**
   * Hydrate the context constructor
   *
   * @method hydrate
   *
   * @return {void}
   */
  static hydrate () {
    super.hydrate()
    this._readyFns = []
  }

  /**
   * Define onReady callbacks to be executed
   * once the request context is instantiated
   *
   * @method onReady
   *
   * @param  {Function} fn
   *
   * @chainable
   */
  static onReady (fn) {
    this._readyFns.push(fn)
    return this
  }
}

/**
 * Defining _macros and _getters property
 * for Macroable class
 *
 * @type {Object}
 */
PrimusContext._macros = {}
PrimusContext._getters = {}
PrimusContext._readyFns = []

module.exports = PrimusContext
