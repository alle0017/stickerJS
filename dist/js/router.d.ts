export class Router {
    /**
     * create new instance of a router, used to build single page applications
     * @param {Record<string,string>} map name of the route: name of the component to use
     * @param {HTMLElement} node default document.body
     */
    constructor(map: Record<string, string>, node?: HTMLElement);
    /**
     * set the root of the router
     * @param {HTMLElement} node
     */
    setRoot(node: HTMLElement): void;
    /**
     * go to the specified route if exists
     * @param {string} route
     */
    goto(route: string): void;
    /**
     * used to add new routes to the router
     * @param {Record<string,string>} map
     * @example
     * router.map({
          '/home': 'home-component',
     });
     */
    map(map: Record<string, string>): void;
    /**
     * go to the last visited page before the current one.
     */
    back(): void;
    #private;
}
//# sourceMappingURL=router.d.ts.map