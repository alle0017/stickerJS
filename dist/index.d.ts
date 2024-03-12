export * from "./js/ui.js";
export * from "./js/router.js";
export * as utils from "./js/utils.js";
export * as Thread from "./js/thread.js";
/**
* define new custom component that can be used in the app, either directly in the html or with {@link append}/{@link create} methods.
* @type {{
*    ( descriptor: HTMLCustomElementOptions ) => HTMLCustomConstructor
*    ( descriptor: HTMLStickerElementOptions ) => HTMLCustomConstructor
* }}
 */
export const define: {
    (descriptor: HTMLCustomElementOptions): HTMLCustomConstructor;
    (descriptor: HTMLStickerElementOptions): HTMLCustomConstructor;
};
export function create(name: string): HTMLCustomElement;
export function append(name: string, props?: Record<string, string>, node?: HTMLElement): HTMLCustomElement | undefined;
export type HTMLCustomProperties = {
    [key: string]: any;
    oninstance?: () => void;
    onleave?: () => void;
    onenter?: [() => void];
    onupdate?: (name: string) => void;
};
export type HTMLCustomElementOptions = {
    template: string;
    name: string;
    watch: string[] | undefined;
    props: HTMLCustomProperties;
};
export type HTMLStickerElementOptions = {
    name: string;
    watch: string[] | undefined;
    props: HTMLCustomProperties;
};
export type HTMLCustomConstructor = (props: Record<string, any>, node: HTMLElement) => HTMLCustomElement | undefined;
import { HTMLCustomElement } from './js/registry.js';
//# sourceMappingURL=index.d.ts.map