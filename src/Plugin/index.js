'use strict'

/*
 * adonis-primus
 *
 * (c) norton <norton0395@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

let store = {
  global: [{
    name: 'emitter',
    handler: 'primus-emitter'
  }],
  named: []
}

const Plugin = exports = module.exports = {}

const push = function (plugin, storeName) {
  const storeType = store[storeName]
  if (typeof plugin === 'object') {
    storeType.concat(plugin)
  } else {
    storeType.push(plugin)
  }
  store[storeName] = storeType
}

/**
 * Returns the plugin store instance
 *
 * @return {Object}
 */
Plugin.getStore = function () {
  return store
}

/**
 * Register global plugin.
 *
 * @param  {Array} pluginList
 */
Plugin.global = function (globalList) {
  push(globalList, 'global')
}

/**
 * Return global plugin list
 *
 * @return {Array}
 */
Plugin.getGlobal = function () {
  return store.global
}

/**
 * Add named plugin
 *
 * @param  {Object} pluginSet
 */
Plugin.named = function (name, handler) {
  push({ name, handler }, 'named')
}

/**
 * Return named plugin.
 *
 * @return {Object}
 */
Plugin.getNamed = function () {
  return store.named
}

/**
 * Clear the plugin store by re-initiating the
 * store.
 */
Plugin.clear = function () {
  store = {
    global: [],
    named: []
  }
}

/**
 * Resolves named plugin and concats them with global plugin.
 * This is the final chain to be composed and executed.
 *
 * @param  {Array} namedList
 *
 * @return {Array}
 */
Plugin.resolve = function (namedList) {
  const namedplugin = Plugin.getNamed()
  const globalplugin = Plugin.getGlobal()
  return globalplugin.concat(namedplugin)
}

/**
 * Compose plugin to be executed. Here we have all the custom
 * logic to call the plugin fn.
 *
 * @param  {Array} list
 * @param  {Object} primus
 *
 * @return {function}
 */
Plugin.compose = function (list, primus) {
  list.map(function ({name, handler}) {
    if (typeof handler === 'object') {
      return primus.plugin(name, handler)
    }
    return primus.plugin(name, require(handler))
  })
}
