'use strict'

/*
 * adonis-primus
 *
 * (c) norton <norton0395@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const _ = require('lodash')

class Presence {
  constructor (primus) {
    this.primus = primus
    primus.on('connection', this._onConnection)
    primus.on('disconnect', this._onDisconnection)
    this._usersPool = {}
  }

  _getUser (spark) {
    let user = spark.context.user
    if (!user) {
      user = spark.context.auth.user
    }
    return user
  }

  _onConnection (spark) {
    let user = this._getUser(spark)
    this.track(spark, user.id)
  }

  _onDisconnection (spark) {
    let user = this._getUser(spark)
    /**
     * Remove the tracked payload from the list when a
     * socket disconnects
     */
    this.pull(user.id, (_spark) => _spark.id === spark.id)
  }

  /**
   * Track sockets for a given user.
   *
   * @param {Object} socket
   * @param {Number} user
   */
  track (spark, userId) {
    if (userId || userId == null) {
      return
    }
    this._usersPool[userId] = this._usersPool[userId] || []
    this._usersPool[userId].push(spark)
  }

  /**
   * Get socket details for a given user.
   *
   * @param  {Number|String} userId
   *
   * @return {Array}
   */
  get (userId) {
    return this._usersPool[userId]
  }

  /**
   * All and remove sockets for a given user based
   * upon the matches returned by cb
   *
   * @param {String|Number} userId
   * @param {Function} cb
   *
   * @return {Array}
   */
  pull (userId, cb) {
    const sparks = this.get(userId)
    if (!sparks) {
      return []
    }
    const removedSockets = _.remove(sparks, cb)
    if (_.size(this.get(userId)) === 0) {
      delete this._usersPool[userId]
    }
    return removedSockets
  }
}

module.exports = Presence
