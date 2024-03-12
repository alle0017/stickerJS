export type browser = string;
/**
 * @enum {string}
 */
export const browser: Readonly<{
    FIREFOX: "Firefox";
    CHROME: "Chrome";
    IE: "Trident";
    MS_IE: "MSIE";
    OPERA: "Opera";
    SAFARI: "Safari";
    IPHONE_SAFARI: "iPhone";
    IPAD_SAFARI: "iPad";
    WEBKIT: "AppleWebKit";
    GECKO: "Gecko";
    MS_EDGE: "Edge";
    CHROMIUM_EDGE: "Edg/";
    NINTENDO: " NintendoBrowser";
}>;
export type os = string;
/**
 * @enum {string}
 */
export const os: Readonly<{
    NINTENDO: "Nintendo";
    PLAYSTATION: "PlayStation";
    XBOX: "XBox";
    ANDROID: "Android";
    IPHONE: "iPhone";
    IPAD: "iPad";
    WINDOWS_PHONE: "Windows Phone";
    MAC: "Mac";
    WINDOWS: "Win";
    UNIX: "X11";
    CHROMECAST: "CrKey";
    ROKU: "Roku";
    LINUX: "Linux";
    UNKNOWN: "unknown";
}>;
export function detectOs(): os;
export function detectBrowser(): browser;
export function isMobile(): boolean;
export function detectBrowserVersion(): number;
export function getUserAgentInfo(): {
    browser: string;
    browserVersion: number;
    os: string;
};
//# sourceMappingURL=utils.d.ts.map