'use strict'

/*
 * adonis-primus
 *
 * (c) norton <norton0395@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Fold = require('@adonisjs/fold')
const { Ignitor } = require('@adonisjs/ignitor')

class PrimusProvider extends Fold.ServiceProvider {
  _registerFileSocket () {
    new Ignitor(require('@adonisjs/fold'))
      .preLoad('start/primus.js')
  }

  _registerWsContext () {
    this.app.bind('Adonis/Addons/PrimusContext', () => {
      return require('../src/Context')
    })
    this.app.alias('Adonis/Src/PrimusContext', 'PrimusContext')
  }

  _registerWs () {
    this.app.singleton('Adonis/Addons/Primus', (app) => {
      const Primus = require('../src/Primus')
      const Config = app.use('Adonis/Src/Config')
      const Context = app.use('Adonis/Addons/PrimusContext')
      const Server = app.use('Adonis/Src/Server')
      return new Primus(Config, Context, Server)
    })
  }

  _registerMiddleware () {
    this.app.bind('Adonis/Middleware/AuthInitPrimus', () => {
      const AuthInitPrimus = require('../src/Middleware/AuthInitPrimus')
      return new AuthInitPrimus()
    })
    this.app.bind('Adonis/Middleware/AuthPrimus', () => {
      const AuthPrimus = require('../src/Middleware/AuthPrimus')
      return new AuthPrimus()
    })
  }

  register () {
    this._registerWsContext()
    this._registerWs()
  }

    /**
   * Attach context getter when all providers have
   * been registered
   *
   * @method boot
   *
   * @return {void}
   */
  boot () {
    this._registerMiddleware()
    this._registerFileSocket()
    const Context = this.app.use('Adonis/Addons/PrimusContext')
    const Auth = this.app.use('Adonis/Src/Auth')
    const Config = this.app.use('Adonis/Src/Config')
    const Request = this.app.use('Adonis/Src/Request')
    const SessionManager = this.app.use('Adonis/Src/Session')
    class Response {}

     /**
     * Gets the provider load the env file.
     */
    this.app.use('Adonis/Src/Env')

    Context.getter('request', function () {
      return new Request(this._socket.request, new Response(), Config)
    }, true)

     /**
     * Adding getter to the HTTP context. Please note the session
     * store is not initialized yet and middleware must be
     * executed before the session store can be used
     * for fetching or setting data.
     */
    Context.getter('session', function () {
      return require('@adonisjs/session/src/Session/getRequestInstance')(this.request, new Response(), Config, SessionManager)
    }, true)

    Context.getter('auth', function () {
      return new Auth({ request: this.request, session: this.session }, Config)
    }, true)
  }
}

module.exports = PrimusProvider
