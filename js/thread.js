
export default class Thread {
      
      static #listeners = {};
      static #waiting = false;
      static #queue = [];
      static #postQueue = [];
      static #threads = {};

      static #execQueueEvents(){
            this.#queue.forEach( e =>{
                  if( 'data' in e.data ){
                        Thread.#listeners[e.data.type](e.data.data);
                  }else{
                        Thread.#listeners[e.data.type]();
                  }
            })
            this.#queue = [];
            this.#postQueue.forEach( e =>{
                  Thread.post(e.message, e.data, e.id)
            })
            this.#postQueue = [];
      }
      /**
       * @param {string} message 
       * @param { Record<string,Transferable> } transferable
       * @param {string?} id 
       */
      static expose( message, transferable, id ){
            const header = {};
            const exposed = [];
            for( const [k,v] of Object.entries( transferable ) ){
                  header[ k ] = {
                        value: v,
                        isFunction: false, 
                  }
                  exposed.push( v ); 
            }
            if( Thread.isChildThread() ){
                  self.postMessage({
                        type: message,
                        data: header,
                  }, '*', exposed );
            }else if( id && Thread.#threads[id] ){
                  Thread.#threads[id].postMessage({
                        type: message,
                        data: header,
                  }, exposed );
            }else{
                  Thread.error('you have to specify the thread if you are using Thread.post from window');
            }
      }
      static isChildThread() {
            return typeof window == 'undefined';
      }
      /**
       * creates a new thread accessible by using the specified id.
       * @param {string} id 
       * @param {string | URL} code 
       * @returns 
       */
      static spawn(id, code) {
            if( this.#threads[id] ){
                  Thread.error(`thread ${id} already exists`);
                  return;
            }
            const thread = new Worker(code, {
                  type: 'module'
            });
            /**listen for errors */
            thread.onerror = (e)=>{
                  Thread.error(`error occurred while running thread ${id}`);
                  console.error(e)
            }
            thread.onmessageerror = (e)=>{
                  Thread.error(`error occurred while running thread ${id} (message cannot be serialized)`);
                  console.error(e)
            }

            /**listen for logs */
            thread.addEventListener('message', e =>{
                  if( !('type' in e.data) || !('message' in e.data) || e.data.type !== 'log' )
                        return;
                  Thread.log(e.data.message);
            });
            thread.addEventListener('message', e =>{
                  if( !('type' in e.data) || !('message' in e.data) || e.data.type !== 'error' )
                        return;
                  Thread.error(e.data.message);
            });

            /**listen for exposed */
            thread.addEventListener('message', e =>{
                  if( !('type' in e.data) || !('message' in e.data) || e.data.type !== 'error' )
                        return;
                  Thread.error(e.data.message);
            });
            this.#threads[id] = thread;
            return id;
      }
      /**
       * create a new listener for the given message. If the current thread is main thread, you have to specify the id.
       * @param {string} message 
       * @param {(e: any)=>void} callback 
       * @param {string?} id 
       */
      static listen( message, callback, id ){
            if( typeof message !== 'string' || typeof callback !== 'function' ){
                  Thread.error(`handler rejected ${message}`);
                  return;
            }
            this.#listeners[message] = callback;
            if( Thread.isChildThread() ){
                  self.addEventListener('message', e =>{
                        if( !('type' in e.data) || e.data.type !== message )
                              return;
      
                        if( Thread.#waiting ){
                              Thread.#queue.push( e );
                        }else if( 'data' in e.data ){
                              Thread.#listeners[message](e.data.data);
                        }else{
                              Thread.#listeners[message]();
                        }
                  })
            }else if( id && this.#threads[id] ){
                  this.#threads[id].addEventListener('message', e =>{
                        if( !('type' in e.data) || e.data.type !== message )
                              return;
      
                        if( Thread.#waiting ){
                              Thread.#queue.push( e );
                        }else if( 'data' in e.data ){
                              Thread.#listeners[message](e.data.data);
                        }else{
                              Thread.#listeners[message]();
                        }
                  })
            }else{
                  Thread.error('you have to specify the thread if you are using Thread.listen from window');
            }
      }
      /**
       * wait for message to be received.
       * available only for one message at time
       * @param {string?} id 
       * @param {string} message
       */
      static wait(message, id){
            this.#waiting = true;
            if( Thread.isChildThread() ){
                  self.addEventListener('message', e =>{
                        if( 'type' in e.data && e.data.type === message ){
                              Thread.#waiting = false;
                              Thread.#execQueueEvents();
                        }
                  })
            }else if( id && Thread.#threads[id] ){
                  Thread.#threads[id].addEventListener('message', e =>{
                        if( 'type' in e.data && e.data.type === message ){
                              Thread.#waiting = false;
                              Thread.#execQueueEvents();
                        }
                  });
            }else{
                  Thread.error('you have to specify the thread if you are using Thread.wait from window');
            }
      }
      /**
       * post new message  that can be listened with the {@link listen} method
       * @param {string} message 
       * @param {any} data 
       * @param {string?} id 
       */
      static post( message, data, id ){
            if( Thread.#waiting ){
                  Thread.#postQueue.push({
                        message,
                        data,
                        id,
                  })
                  return;
            }
            if( Thread.isChildThread() ){
                  self.postMessage({
                        type: message,
                        data
                  });
            }else if( id && Thread.#threads[id] ){
                  Thread.#threads[id].postMessage({
                        type: message,
                        data
                  })
            }else{
                  Thread.error('you have to specify the thread if you are using Thread.post from window');
            }
      }
      /**
       * log any message from each thread
       * @param {any} message 
       */
      static log( message ){
            if( Thread.isChildThread() ){
                  self.postMessage({
                        type: 'log',
                        message: message,
                  });
            }else{
                  console.log(message);
            }
      }
      /**
       * log any error message from each thread
       * @param {any} message 
       */
      static error( message ){
            if( Thread.isChildThread() ){
                  self.postMessage({
                        type: 'error',
                        message: message,
                  });
            }else{
                  console.error(message);
            }
      }
      /**
       * kill the current thread or the child thread with the specified id 
       * @param {string?} id
       */
      static kill(id){
            if( typeof id == 'string' ){
                  if( Thread.#threads[id] ){
                        Thread.#threads[id].terminate();
                        delete Thread.#threads[id];
                  }else{
                        Thread.error(`thread ${id} doesn't exists`);
                  }
            }else if( Thread.isChildThread() ){
                  Thread.post('killed', null)
                  self.close();
            }else{
                  console.error('cannot kill the main thread');
            }
      }
      static async join(id) {
            if( typeof id !== 'string' || !Thread.#threads[id] ){
                  Thread.error(`thread ${id} doesn't exists`);
                  return;
            }
            return new Promise((resolve, reject) =>{
                        Thread.listen('killed', ()=>{
                              resolve();
                        }, id);
                  }
            );
      }
}
