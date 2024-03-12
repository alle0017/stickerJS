import { append, define, utils, } from "../index.js";

export class ui {
      static #defined = {
            ask: false,
            titleBar: false,
      };
      static get ask(){
            if( !this.#defined.ask )
                  this.#defineAsk();
            return ( text, placeholder = 'insert here', value = placeholder )=>{

                  const el = append( 's-ask', {
                        placeholder, 
                        text,
                  });
            
                  el.style.width = '100px';
                  el.style.height = '100px';
                  el.getElementById('dialog-input').value = value;
                  return new Promise((resolve, reject) =>{
                        el.getElementById('title-bar').onclick = ()=>{
                              el.remove();
                              resolve( "" );
                        }
                        el.getElementById( 'dialog-button').onclick = ()=>{
                              const text = el.getElementById( 'dialog-input').value;
                              el.remove();
                              resolve( text );
                        }
                        el.onkeydown = (e)=>{
                              if(e.key == 'Enter'){
                                    const text = el.getElementById( 'dialog-input').value;
                                    el.remove();
                                    resolve( text );
                              }
                        }
                  });
            }
      }
      static set ask(value){}

      static get titleBar(){
            if(!this.#defined.titleBar)
                  this.#defineTitleBar();
            return (onclose, node = document.body, title = 'window')=>{
                  if( !(node instanceof HTMLElement) || typeof onclose != 'function' ){
                        console.error('node must be an HTML element anf onclose must be a function (error in titleBar)');
                        return;
                  }
                  const el = append( 's-title-bar', {
                        title,
                        callback,
                  }, node);
            }
      }
      static set titleBar(value){}

      static #defineAsk(){
            this.#defined.ask = true;
            if( !this.#defined.titleBar )
                  this.#defineTitleBar();
            define({
                  name: 's-ask',
      
                  template: /*html*/`
                  <style>
                        * {
                              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
                        }
                        :host {
                              --button-color: #007aff;
                              --background: #fff;
                              --text: #000;
                              --border: #d3d3d3;
                        }
                        @media (prefers-color-scheme: dark) {
                              :host {
                                    --button-color: #007aff;
                                    --background: #222;
                                    --text: #c8c8c8;
                                    --border: #474747;
                              }
                        }
                        #dialog-button {
                              color: #000;
                              border: 1px solid var(--button-color);
                              position: absolute;
                              right: 50px;
                              bottom: 30px;
                              padding: 1% 10%;
                              background-color: var(--button-color) !important;
                        }
                        #dialog-window {
                              z-index: 1000;
                              padding: 10%;
                              position: absolute;
                              left: calc(50% - 200px);
                              top: 20%;
                              border-radius: 4px;
                              background-color: var(--background) !important;
                              border: 1px solid var(--border) !important;
                              min-width: 200px;
                              max-width: 210px;
                              min-height: 100px;
                              max-height: 110px;
                              font-size: 16px;
                        }
                        input{
                              background-color: var(--background) !important;
                              border: 1px solid var(--border) !important;
                              margin-top: 10%;
                              margin-bottom: 10%;
                              min-width: 80%;
                              padding: 5px;
                              color: var(--text) !important;
                        }
                        input, #dialog-button {
                              font-size: 14px;
                              border-radius: 4px !important;
                        }
                        .row{
                              display: flex; 
                        }
                        .col{
                              flex: 1;
                        }
                        .overlay {
                              position: fixed;
                              top: 0;
                              left: 0;
                              height: 100%;
                              width: 100%;
                              z-index: 500;
                              background-color: rgba(0,0,0,0.5);
                        }
                  </style>
                  <div class="overlay"></div>
                  <div id="dialog-window">
                        <s-title-bar id="title-bar" title="prompt"></s-title-bar>
                        <text class="row">
                              <b>{{text}}</b>
                        </text>
                        <input type="text" placeholder="{{placeholder}}" value="" id="dialog-input" class="row">
                        <button id="dialog-button" class="row">
                              Ok
                        </button>
                  </div>      
            `})

      }
      static #defineTitleBar(){
            this.#defined.titleBar = true;
            define({
                  name: 's-title-bar',
                  template: /*html*/`
                  <style>
                        :host {
                              --background: #fff;
                              --red: rgb(255,59,48);
                              --green: rgb(53,199,89);
                              --yellow: rgb(255,204,0);
                        }
                        @media (prefers-color-scheme: dark) {
                              :host {
                                    --background: rgb(44,44,46);
                                    --red: rgb(255,69,58);
                                    --green: rgb(48,209,88);
                                    --yellow: rgb(255,214,10);
                                    --text: #c8c8c8;
                              }
                        }
                        #bar{
                              z-index: 1050;
                              width: 100%;
                              height: 30px;
                              position: absolute;
                              top: 0;
                              left: 0;
                              background-color: var(--background);
                              display: flex;
                              cursor: default;
                        }
                        #cross{
                              position: absolute;
                              left: 5px;
                              top: 6px;
                        }
                        .mac {
                              background-color: var(--red);
                              margin: 7px 0px 0px 7px;
                              width: 15px;
                              height: 15px;
                              border-radius: 50%;
                              cursor: default;
                        }
                        .others {
                              position: absolute;
                              right: 5px;
                              width: 35px;
                              height: 30px;
                        }
                        .others > #cross {
                              fill: var(--text);
                        }
                  </style>
                  <div id="bar">
                        <div id="close" class="round-button">
                        <svg xmlns="http://www.w3.org/2000/svg" id="cross" width="18" height="18" fill="" class="bi bi-x" viewBox="0 0 16 16">
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                        </svg>
                        </div>
                        <div style="margin-left: 30%;">
                              {{title}}
                        </div>
                  </div>      
            `,
            props: {
                  callback: undefined,
                  onenter(){
                        const self = this;
                        const button = this.get('#close');
                        button.onclick = () => {
                              self.callback && self.callback();
                        }
                        if( utils.detectOs() == utils.os.MAC ){
                              this.get('#cross').fill = 'rgb(58,58,60)';
                              button.classList.add('mac');
                        }else{
                              button.classList.add('others');
                        }
                  }
            }
            })
      }
      /**
       * 
       * @param {HTMLElement} element 
       */
      static draggable(element){
            let positionType = element.style.position;
            element.onmousedown = (e)=>{
                  e = e || {
                        clientX: 0,
                        clientY: 0,
                  };
                  let { clientX: prevX, clientY: prevY } = e;
                  element.style.position = 'absolute';
                  element.onmousemove = (e)=>{
                        e = e || {
                              clientX: 0,
                              clientY: 0,
                        };
                        e.preventDefault();
                        let y = prevY - e.clientY;
                        let x = prevX - e.clientX;
                        prevX = e.clientX;
                        prevY = e.clientY;
                        element.style.left = (element.offsetLeft - x) + "px";
                        element.style.top = (element.offsetTop - y) + "px";
                  }
                  element.onmouseup = ()=>{
                        element.onmousedown = null;
                        element.onmouseup = null;
                        element.style.position = positionType;
                  }
            }
      }
}