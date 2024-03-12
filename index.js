export * from './js/ui.js';
export * from './js/router.js';
export * as utils from './js/utils.js';
export * as Thread from './js/thread.js';
//import { CustomElementRegistry, HTMLCustomElement } from './js/customRegistry.js';
import * as CustomElementRegistry from './js/registry.js';
import { HTMLCustomElement } from './js/registry.js';
import MDParser from './js/markdown.js'
import { Router } from './js/router.js';
/**

* @typedef { {
      oninstance?: ()=>void,
      onleave?: ()=>void,
      onenter?: [()=>void],
      onupdate?: ( name: string )=>void,
      [key: string]:any
}} HTMLCustomProperties
*/
/**
* @typedef HTMLCustomElementOptions
* @property {boolean} compileMarkdown
* @property {string} template
* @property {string} name
* @property {string[] | undefined} watch
* @property {HTMLCustomProperties} props
 */
/**
* @typedef HTMLExternCustomElementOptions
* @property {boolean} compileMarkdown
* @property {string} link
* @property {string} name
* @property {string[] | undefined} watch
* @property {HTMLCustomProperties} props
 */
/**
* @typedef HTMLStickerElementOptions
* @property {string} name
* @property {string[] | undefined} watch
* @property {HTMLCustomProperties} props
 */
/**
* @typedef {(props: Record<string, any>, node: HTMLElement) => HTMLCustomElement | undefined} HTMLCustomConstructor
*/

const defineComponent = ( template, name, props, watch )=>{
      CustomElementRegistry.define(name, template, props, watch);
      return ( props = {}, node = document.body )=>{
            const el = CustomElementRegistry.create(name);
            node.appendChild(el);
            for( let [k,v] of Object.entries(props) ){
                  if( v instanceof Array )
                        el.setArray(k,v);
                  else
                        el[k] = v;
            }
            return el;
      }
}
/**
 * 
 * @param {string} fileName relative path to the file
 * @returns file contents
 */
export const load = async ( fileName )=> await (await fetch(fileName)).text()
/**
* define new custom component that can be used in the app, either directly in the html or with {@link append}/{@link create} methods.
* @type {{
*    ( descriptor: HTMLCustomElementOptions ) => HTMLCustomConstructor 
*    ( descriptor: HTMLStickerElementOptions ) => HTMLCustomConstructor
*     ( descriptor: HTMLExternCustomElementOptions ) => Promise<HTMLCustomConstructor>
* }}
 */
export const define = async (arg0)=>{
      
      if( !('name' in arg0) ){
            console.error('descriptor must specify a name');
            return;
      }
      if( 'link' in arg0 ){
            arg0.template = await load(arg0.link);
      }
      const { template, name, props, watch, compileMarkdown } = arg0;
      if(template){
            return defineComponent(
                  compileMarkdown? new MDParser( template ).toHTML(): template, 
                  name, 
                  props, 
                  watch
            );
      }
      const el = document.getElementById(name);
      if( !el ){
            console.error('no template founds for ' + name);
            return;
      }
      return defineComponent(el.innerHTML, name, props, watch);
}
/**
* @type { ( descriptor: HTMLExternCustomElementOptions ) => HTMLCustomConstructor } 
*/
export const defineExtern = async (arg0)=>{
      const { link, name, props, watch, compileMarkdown } = arg0;
      const template = await load(link);

      return defineComponent(
            compileMarkdown? new MDParser( template ).toHTML(): template, 
            name, 
            props, 
            watch
      );
}
/**
 * create new component
 * @param {string} name 
 * @returns {HTMLCustomElement}
 */
export const create = (name)=>{
      return CustomElementRegistry.create(name);
}
/**
 * create and append new component
 * @param {string} name 
 * @param {Record<string,string>} props 
 * @param {HTMLElement} node 
 * @returns {HTMLCustomElement | undefined}
 */
export const append = (name, props = {}, node = document.body)=>{
      const el = CustomElementRegistry.create(name);
      if( !el ) return;
      node.appendChild(el);
      for( let [k,v] of Object.entries(props) ){
            if( v instanceof Array )
                  el.setArray(k,v);
            else
                  el.setAttribute(k,v);
      }
      return el;
}