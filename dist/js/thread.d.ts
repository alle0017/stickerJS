export default class Thread {
    static "__#3@#listeners": {};
    static "__#3@#waiting": boolean;
    static "__#3@#queue": any[];
    static "__#3@#postQueue": any[];
    static "__#3@#threads": {};
    static "__#3@#execQueueEvents"(): void;
    /**
     * @param {string} message
     * @param { Record<string,Transferable> } transferable
     * @param {string?} id
     */
    static expose(message: string, transferable: Record<string, Transferable>, id: string | null): void;
    static isChildThread(): boolean;
    /**
     * creates a new thread accessible by using the specified id.
     * @param {string} id
     * @param {string | URL} code
     * @returns
     */
    static spawn(id: string, code: string | URL): string;
    /**
     * create a new listener for the given message. If the current thread is main thread, you have to specify the id.
     * @param {string} message
     * @param {(e: any)=>void} callback
     * @param {string?} id
     */
    static listen(message: string, callback: (e: any) => void, id: string | null): void;
    /**
     * wait for message to be received.
     * available only for one message at time
     * @param {string?} id
     * @param {string} message
     */
    static wait(message: string, id: string | null): void;
    /**
     * post new message  that can be listened with the {@link listen} method
     * @param {string} message
     * @param {any} data
     * @param {string?} id
     */
    static post(message: string, data: any, id: string | null): void;
    /**
     * log any message from each thread
     * @param {any} message
     */
    static log(message: any): void;
    /**
     * log any error message from each thread
     * @param {any} message
     */
    static error(message: any): void;
    /**
     * kill the current thread or the child thread with the specified id
     * @param {string?} id
     */
    static kill(id: string | null): void;
    static join(id: any): Promise<any>;
}
//# sourceMappingURL=thread.d.ts.map