/**
* @typedef ConditionDescriptor
* @property {Function} condition
* @property {HTMLElement} element
 */
/**@abstract */
export class HTMLCustomElement extends HTMLElement {
      static template;

      shadow = this.attachShadow({
            mode: 'open'
      });
      #hooks = {};
      #forTemplates = {};

      refs = {};
      conditions;

      /**@protected */
      static getAttributes( template ){
            const array = template.match( /{{[^{}]+}}/g );
            const res = [];

            if( !array ){
                  return res;
            }
            for( let el of array ){
                  res.push(
                        this.#getPropName(el)
                  )
            }
            return res;
      }
      /**@protected */
      static getForAttributes( template ){
             /**@type {string[]} */
             const forArray = template.match( /for\s*=\s*".*?\bof\b.*?"/g );
             const res = [];

             if( !forArray )
                   return res;
             for( const el of forArray ){
                   res.push( el.replace(/for\s*=\s*".*?\bof\b/, '').replace('"', '').trim() );
             }
             return res;
      }
      /**@protected */
      static getBindingAttributes( template ){
            const getBindingProperties = ( str )=>{
                  const map = {};
                  const declarations = str.split(',').map( assignment => assignment.trim().split('=') );
                  for( const d of declarations ){
                        if( d[0][0] !== '@' ){
                              continue;
                        }
                        map[d[0].replace('@', '').trim()] = d[1].trim();
                  }
                  return map;
            }
            const bindings = template.match( /bind\s*=\s*"\s*@data\s*=\s.*"/g )
            if( !bindings )
                  return [];
            return bindings.map( 
                  bind => {
                  return getBindingProperties( 
                        bind.replace(/bind\s*=\s*/, '').replace(/\s*"\s*/g, '')
                        )['data'] }
                  );
      }
      static #tagToString(tag){
            let attributes = '';
            for( let attr of tag.attributes ){
                  attributes += `${attr.name}="${attr.value}" `;
            }
            return `<${tag.tagName} ${attributes}>`
      }
      static #getPropName = str => str.replace(/[\s\b]*/gi, '').replace('{{','').replace('}}','')
      static #isAttributeValue(node, prop){
            if( node.nodeType == Node.TEXT_NODE )
                  return undefined;
            for( const a of node.attributes ){
                  if( this.#getPropName(a.value) == prop ){
                        return a.name;
                  }
            }
            return undefined;
      }
      static #getPropsRefs(prop, node, isText){
            const refs = {};
            const nodeDescriptor = {
                  node,
                  isText,
                  isAttribute: this.#isAttributeValue(node, prop)
            }
            if( refs[prop] ){
                  refs[prop].push(nodeDescriptor);
            }else{
                  refs[prop] = [nodeDescriptor]
            }
            return refs;
      }
      /**
      * 
      * @param {Text} node 
      * @param {*} props 
      */
      static #addTextNodeHook(node){
            const children = [];
            let refs = {};
            let prop;
            let text = node.wholeText;

            while( ( prop = text.match(/{{[^{}]+}}/) ) ){
                  
                  const propName = this.#getPropName( prop[0] );
                  const span = document.createElement( 'span' );
                  span.classList.add( propName );
                  children.push(
                        text.substring(0, prop.index),
                        span
                  );
                  text = text.slice( prop.index + prop[0].length )
                  refs = { 
                        ...refs, 
                        ...this.#getPropsRefs( propName, span, true ) 
                  };
            }
            node.replaceWith( ...children )
            return refs;
      }
      static #addHTMLHook(node, props){
            let refs = {}
            for( const prop of props ){
                  const p = this.#getPropName( prop );
                  refs = { 
                        ...refs, 
                        ...this.#getPropsRefs( p, node, false )
                  };
                  
            }
            return refs;
      }
      /**
       * @param {HTMLElement} node 
       * @returns {string[]}
       */
      static #checkForEvents( node ){
            const ev = [];
            for( const prop of node.getAttributeNames() ){
                  if( prop.indexOf('@') < 0 )
                        continue;
                  ev.push( prop );
            }
            return ev;
      }
      /**
       * traverse one time the element dom and returns the refs to all custom properties and custom events
       * @param {HTMLElement} node 
       * @returns {{ 
       *      events: Array<{node: HTMLElement, events: Array<string>}>,
       *      refs: Record<string, Array<{
       *                      node: HTMLElement,
       *                      isText: boolean,
       *                      isAttribute: undefined | string,
       *      }>>
       *}}
       */
      static #traverse(node){
            let refs = {};
            let events = [];

            for( let el of node.childNodes ){
                  if( el.nodeType === Node.TEXT_NODE ){
                        if( el.textContent.match( /{{[^{}]+}}/g ) )
                              refs = {
                                    ...refs,
                                    ...this.#addTextNodeHook(el)
                              }
                        continue;
                  }

                  const ev = this.#checkForEvents(el);

                  if( ev.length > 0 )
                        events.push({
                              node: el,
                              events: ev,
                        });  

                  const html = this.#tagToString(el).match(/{{[^{}]+}}/g);

                  if( html ){
                        refs = {
                              ...refs,
                              ...this.#addHTMLHook(el, html)
                        }
                  }
                  if( el.hasChildNodes() ){
                        const refsAndEvs = this.#traverse( el );
                        refs = {
                              ...refs,
                              ...refsAndEvs.refs
                        }
                        if( refsAndEvs.events.length > 0 ){
                              events.push(...refsAndEvs.events)
                        }
                  }
            }
            return {
                  refs,
                  events,
            };
      }
      /**@protected */
      initializeConditionalRendering(){
            /**@type HTMLElement[] */
            const list = this.querySelectorAll('[if]');
            const condBinds = {}
            if( !list )
                  return;
            for( const node of list ){
                  const code = node.getAttribute('if');
                  const fn = (new Function(`return ${code}`)).bind(this);
                  let fallbacks = [];

                  if( node.id ){
                        for( const f of this.querySelectorAll(`[else=${node.id}]`) ){
                              fallbacks.push({
                                    node: f,
                                    root: f.parentNode,
                              });
                        }
                  }
                  const attribs = code.match(/this.[a-zA-Z0-9_]+/);

                  if( attribs ){
                        for( let a of attribs ){
                              a = a.replace('this.', '');
                              if( !condBinds[a] ){
                                    condBinds[a] = [{
                                          condition: fn,
                                          node,
                                          root: node.parentNode,
                                          fallbacks,
                                    }]
                              }
                        }
                  }
            }
            return condBinds;
      }
      /**@protected */
      initializeTwoWayBinding(){
            /**@param {string} str */
            const getBindingProperties = ( str )=>{
                  const map = {};
                  const declarations = str.split(',').map( assignment => assignment.trim().split('=') );
                  for( const d of declarations ){
                        if( d[0][0] !== '@' ){
                              continue;
                        }
                        map[d[0].replace('@', '').trim()] = d[1].trim();
                  }
                  return map;
            }
            const bind = ( data, prop, event, tag )=>{
                  Object.assign( this, data, {
                        get(){
                              return this[`_${data}`];
                        },
                        set( value ){
                              if( value === this[`_${data}`] )
                                    return;
                              this[`_${data}`] = value;
                              if( value instanceof Array)
                                    this.setArray( data, value );
                              else
                                    this.setProp( data, value );
                              if( this.conditions[data] ){
                                    for( const o of this.conditions[data] ){
                                          if( o.condition() ){
                                                o.root.append( o.node )
                                                for( const f of o.fallbacks ){
                                                      f.node.remove()
                                                }
                                          }else{
                                                o.node.remove()
                                                for( const f of o.fallbacks ){
                                                      f.root.append( f.node )
                                                }
                                          }
                                    }
                              }
                              tag[prop] = value;
                        }
                  })
                  tag.addEventListener(event, (()=>{
                        this[data] = tag[prop];
                  }).bind(this));
            }
            const nodes = this.querySelectorAll('[bind]');
            if( !nodes )
                  return;
            for( const node of nodes ){
                  const props = getBindingProperties( node.getAttribute('bind') );
                  if( !props['data'] ){
                        console.error(`invalid binding assignment ${node} it must contain @data value`);
                        continue;
                  }
                  bind(
                        props['data'],
                        props['prop'] || 'value',
                        props['event'] || 'change',
                        node
                  )
            }
      }
      /**
       * 
       * @param {HTMLElement} dom 
       */
      #initializeForStatement( dom ){
            const forNodes = dom.querySelectorAll('[for]');

            for( const node of forNodes ){

                  const statement = node.getAttribute('for').split(' ').filter( v => v );
                  const prop = statement[2];
                  if( this.#forTemplates[prop] ){
                        this.#forTemplates[prop].push({
                              node: node,
                              template: node.innerHTML,
                              placeholder: statement[0]
                        });
                  }else{
                        this.#forTemplates[prop] = [{
                              node: node,
                              template: node.innerHTML,
                              placeholder: statement[0]
                        }];
                  }
                  node.innerHTML = '';
            }
      }
      /**@protected */
      initialize( template ){
            const dom = new DOMParser().parseFromString( template, 'text/html').body;

            this.#initializeForStatement(dom);

            const { refs, events } = HTMLCustomElement.#traverse(dom);

            this.#hooks = refs;
            //this.setEvents( events );
            return { dom, events };
      }

      /**@protected */
      setEvents(events) {
            for( const o of events ){

                  o.events.forEach( e =>{ 
                        const handler = (new Function('$e', o.node.getAttribute(e) )).bind(this);
                        if( e.search(/@[a-zA-Z0-9_-]+::once/) >= 0 ){
                              const rHandler = (($e)=>{
                                    handler($e instanceof CustomEvent ? $e.detail: $e);
                                    o.node.removeEventListener( e.replace('@', '').replace('::once', ''), rHandler );
                              }).bind(this);
                              o.node.addEventListener( e.replace('@', '').replace('::once', ''), rHandler );
                        }else{
                              o.node.addEventListener( e.replace('@', ''), ((e)=>{
                                    handler(e instanceof CustomEvent ? e.detail: e);
                              }).bind(this));
                        }
                  }, this)
            }
      }
      
      /**
       * 
       * @param {string} propName 
       * @param {any[]} array 
       */
      #fillNodeWithArrayValues( propName, array ){
            const replaceDirectValue = (template, prop, value) => template.replace( new RegExp(`{{\s*${prop}\s*}}`, 'g'), value);
            const replaceAccessToProperty = (template, prop, value) =>{
                  const regex = new RegExp(`{{\s*${prop}\.[a-zA-Z0-9]+\s*}}`,'g');
                  const occurrence = template.match(regex);
                  if( !occurrence ) return template;
                  for( let o of occurrence ){
                        const propRegex = new RegExp(`{{\s*${prop}\.`);
                        o = o.replace(propRegex, '').replace(/\s*}}/, '');
                        const regex = new RegExp(`{{\s*${prop}\.${o}\s*}}`, 'g');
                        template = template.replace(regex, value[o]);
                  }
                  return template;
            }
            const replaceValue = (template, prop, value) =>{
                  return replaceAccessToProperty(
                        replaceDirectValue(
                                    template, 
                                    prop, 
                                    value
                              ),
                        prop,
                        value
                  );
                  
            }

            const nodes = this.#forTemplates[propName];
            if( !nodes )
                  return;
            if( this.onupdate ){
                  this.onupdate( propName );
            }
            for( const node of nodes ){
                  let html = '';
                  
                  array.forEach( value =>{
                        html += replaceValue(node.template, node.placeholder, value);
                  })
                  node.node.innerHTML = html;
            }
      }
      #replaceAttributeWithValue(name, value) {
            
            if( !this.#hooks[name] ){
                  return;
            }
            if( this.onupdate ){
                  this.onupdate( name );
            }
            for(const node of this.#hooks[name] ){
                  if( node.isText ){
                        node.node.innerHTML = value;
                  }else if( node.isAttribute ){
                        node.node[node.isAttribute] = value;
                  }
            }
      }
      /**@protected */
      setProp(name, value){
            this.#replaceAttributeWithValue(name, value)
      }
      /**@protected */
      getRefs(){
            const list = this.querySelectorAll('[ref]');
            for( const el of list ){
                  this.refs[el.getAttribute('ref')] = el;
            }
      }
      
      
      setArray(name, value){
            if( value instanceof Array )
            this.#fillNodeWithArrayValues(name, value);
      }
      
      getElementsByClassName(className){
            return this.shadow.getElementsByClassName(className);
      }
      getElementById(id){
            return this.shadow.getElementById(id);
      }
      querySelector(selector){
            return this.shadow.querySelector(selector);
      }
      querySelectorAll(selector){
            return this.shadow.querySelectorAll(selector);
      }
      /**
       * dispatch new event
       * @param {string} eventName 
       * @param {Object} args it can be accessed with event.details or, in {@link listen}, with the built-in **$e** const
       */
      emit(eventName, args){
            this.dispatchEvent( new CustomEvent( eventName, {detail: args, bubbles: true} ) );
      }
      /**
      * listen for specific events
      * @param {string} eventName
      * @param {Function} handler
      * @returns {Function} a reference to the function used as handler. Must be used with {@link stopListen} or removeEventListener to stop listening for the specified event
      */
      listen(eventName, handler){
            const ref = ((e)=>{ 
                  const $e = e instanceof CustomEvent ? e.detail: e;
                  handler($e)
            }).bind(this);
            this.addEventListener( eventName, ref );
            return ref;
      }
      /**
       * stop listening for specific event
       * @param {string} eventName 
       * @param {Function} handler 
       */
      stopListen(eventName, handler){
            this.removeEventListener( eventName, handler );
      }
      /**
       * 
       * @param {string} selector 
       * @returns {HTMLElement}
       */
      get(selector){
            return this.shadow.querySelector(selector);
      }
      /**
       * 
       * @returns {HTMLElement[]}
       */
      getAll(selector){
            const nodes = [];
            const list = this.shadow.querySelectorAll(selector);
            if( list )
                  list.forEach( (el) => nodes.push(el) );
            return nodes;
      }
}
export const define = ( name, template, props, watch = [] ) => {

      name = name.toLowerCase();

      if( name.indexOf('-') <= 0 ){
            console.warn('the element ' + name + ' will not be registered for invalid name (you must choose a valid name, with "-" in it, see https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)');
            return;
      }
      if( customElements.get( name ) ){
            console.warn('the element ' + name + ' is already registered');
            return;
      }
      if( !(watch instanceof Array) )
            watch = [];


      class CustomElement extends HTMLCustomElement {
            static #elementProperties = new Set([
                  ...watch, 
                  ...HTMLCustomElement.getAttributes(template), 
                  ...HTMLCustomElement.getForAttributes(template), 
                  ...HTMLCustomElement.getBindingAttributes(template)
            ]);

            static get observedAttributes() {
                  return [...this.#elementProperties.values()];
            }

            
            #checkInitialConditions(){
                  for( const attr of Object.values( this.conditions ) ){
                        for( const o of attr ){
                              if( o.condition() ){
                                    o.root.append( o.node )
                                    for( const f of o.fallbacks ){
                                          f.node.remove()
                                    }
                              }else{
                                    o.node.remove()
                                    for( const f of o.fallbacks ){
                                          f.root.append( f.node )
                                    }
                              }
                        }
                  }
            }
            #onEnterCallback(){
                  if( !this.onenter || typeof this.onenter != 'function' )
                        return;
                  const p = this.onenter();

                  if( p instanceof Promise ){
                        /**@type {HTMLElement[]} */
                        const fallbacks = this.getAll('[fallback]')
                        //check if there are any fallbacks
                        if( fallbacks.length > 0 )
                        p.then(()=>{
                              for( const f of fallbacks ){
                                    f.remove();
                              }
                        }).catch(()=>{
                              for( const f of fallbacks ){
                                    const node = this.getElementById( f.getAttribute('fallback') );
                                    if( node )
                                          node.remove();
                              }
                        })
                  }
            }

            constructor(){
                  super();
                  if(  props && typeof props === 'object' ){
                        Object.defineProperties( 
                              this,
                              Object.getOwnPropertyDescriptors( props ) 
                        )
                  }
                  if( this.oninstance ){
                        this.oninstance();
                  }

                  for( const k of CustomElement.#elementProperties ){
                        this[`_${k}`] = '';
                        Object.defineProperty( this, k, {
                              get(){
                                    return this[`_${k}`];
                              },
                              set( value ){
                                    if( value === this[`_${k}`] )
                                          return;
                                    this[`_${k}`] = value;
                                    if( value instanceof Array)
                                          this.setArray( k, value );
                                    else
                                          this.setProp( k, value );
                                    if( this.conditions[k] ){
                                          for( const o of this.conditions[k] ){
                                                if( o.condition() ){
                                                      o.root.append( o.node )
                                                      for( const f of o.fallbacks ){
                                                            f.node.remove()
                                                      }
                                                }else{
                                                      o.node.remove()
                                                      for( const f of o.fallbacks ){
                                                            f.root.append( f.node )
                                                      }
                                                }
                                          }
                                    }
                              }
                        })
                  }
            }
            connectedCallback(){
                  
                  const {dom, events} = this.initialize( template );
                  this.shadow.append( dom )
                  if( this.hasAttributes() ){
                        for( const a of this.attributes ){
                              this.setProp(a.name, a.value);
                        }
                  }
                  this.getRefs();
                  this.initializeTwoWayBinding()
                  this.conditions = this.initializeConditionalRendering();
                  this.setEvents(events)
                  this.#onEnterCallback()
                  this.#checkInitialConditions();
            }
            attributeChangedCallback(name, oldValue, newValue){
                  if( oldValue === newValue ) return;
                  this.setProp(name, newValue);
            }
            disconnectedCallback() {
                  if( this.onleave && typeof this.onleave == 'function' ){
                        this.onleave();
                  }
            }
      }
      customElements.define(name, CustomElement);
}

export const create = ( name )=>{
      name = name.toLowerCase();

      if( !customElements.get(name) ){
            console.error(`element with name ${name} does not exist`);
            return;
      }
      return document.createElement(name);
}
