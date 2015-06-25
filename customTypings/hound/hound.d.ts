/// <reference path='../../typings/node/node.d.ts' />


declare module "hound" {
	import events = require('events');

	export function watch(root: string): events.EventEmitter;
	export function unwatch(root: string): void;
	export function clear(): void;
}
