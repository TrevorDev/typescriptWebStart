/// <reference path='../../../typings/jquery/jquery.d.ts' />
/// <reference path="../../../typings/rivets/rivets.d.ts" />
import $ = require("jquery")
import rivets = require("rivets")

rivets.configure({
		  // Attribute prefix in templates
		  prefix: 'rv',
		  // Preload templates with initial data on bind
		  preloadData: true,
		  // Root sightglass interface for keypaths
		  rootInterface: '.',
		  // Template delimiters for text bindings
		  templateDelimiters: ['[[', ']]'],
		  // Augment the event handler of the on-* binder
		  handler: function(target, event, binding) {
		    this.call(target, event, binding.view.models)
		  }
		})
var t = {test: ["hello", "onthee", "two"]}
rivets.bind($('#app'), t)