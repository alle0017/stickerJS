/**@abstract */
export class HTMLCustomElement extends HTMLElement {
    static template: any;
    /**@protected */
    protected static getAttributes(template: any): any[];
    /**@protected */
    protected static getForAttributes(template: any): any[];
    /**@protected */
    protected static getBindingAttributes(template: any): any;
    static "__#4@#tagToString"(tag: any): string;
    static "__#4@#getPropName": (str: any) => any;
    static "__#4@#isAttributeValue"(node: any, prop: any): any;
    static "__#4@#getPropsRefs"(prop: any, node: any, isText: any): {};
    /**
    *
    * @param {Text} node
    * @param {*} props
    */
    static "__#4@#addTextNodeHook"(node: Text): {};
    static "__#4@#addHTMLHook"(node: any, props: any): {};
    /**
     * @param {HTMLElement} node
     * @returns {string[]}
     */
    static "__#4@#checkForEvents"(node: HTMLElement): string[];
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
    static "__#4@#traverse"(node: HTMLElement): {
        events: {
            node: HTMLElement;
            events: Array<string>;
        }[];
        refs: Record<string, Array<{
            node: HTMLElement;
            isText: boolean;
            isAttribute: undefined | string;
        }>>;
    };
    shadow: ShadowRoot;
    refs: {};
    /**@protected */
    protected initializeTwoWayBinding(): void;
    /**@protected */
    protected initialize(template: any): HTMLElement;
    /**@protected */
    protected setEvents(events: any): void;
    /**@protected */
    protected setProp(name: any, value: any): void;
    /**@protected */
    protected getRefs(): void;
    setArray(name: any, value: any): void;
    getElementsByClassName(className: any): any;
    getElementById(id: any): HTMLElement;
    querySelector(selector: any): any;
    querySelectorAll(selector: any): NodeListOf<any>;
    /**
     * dispatch new event
     * @param {string} eventName
     * @param {Object} args it can be accessed with event.details or, in {@link listen}, with the built-in **$e** const
     */
    emit(eventName: string, args: any): void;
    /**
    * listen for specific events
    * @param {string} eventName
    * @param {Function} handler
    * @returns {Function} a reference to the function used as handler. Must be used with {@link stopListen} or removeEventListener to stop listening for the specified event
    */
    listen(eventName: string, handler: Function): Function;
    /**
     * stop listening for specific event
     * @param {string} eventName
     * @param {Function} handler
     */
    stopListen(eventName: string, handler: Function): void;
    /**
     *
     * @param {string} selector
     * @returns {HTMLElement}
     */
    get(selector: string): HTMLElement;
    /**
     *
     * @returns {HTMLElement[]}
     */
    getAll(selector: any): HTMLElement[];
    #private;
}
export function define(name: any, template: any, props: any, watch?: any[]): void;
export function create(name: any): any;
//# sourceMappingURL=registry.d.ts.map