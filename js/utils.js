/**
 * @enum {string}
 */
export const browser = Object.freeze({
      FIREFOX: 'Firefox',
      CHROME: 'Chrome',
      IE: "Trident", 
      MS_IE: "MSIE",
      OPERA: "Opera", 
      SAFARI: "Safari",
      IPHONE_SAFARI: "iPhone",
      IPAD_SAFARI: "iPad",
      WEBKIT: 'AppleWebKit',
      GECKO: 'Gecko',
      MS_EDGE: 'Edge',
      CHROMIUM_EDGE: 'Edg/',
      NINTENDO: ' NintendoBrowser',
});
/**
 * @enum {string}
 */
export const os = Object.freeze({
      NINTENDO: 'Nintendo',
      PLAYSTATION: 'PlayStation',
      XBOX: 'XBox',
      ANDROID: 'Android',
      IPHONE: 'iPhone',
      IPAD: 'iPad',
      WINDOWS_PHONE: 'Windows Phone',
      MAC: 'Mac',
      WINDOWS: 'Win',
      UNIX: 'X11',
      CHROMECAST: 'CrKey',
      ROKU: 'Roku',
      LINUX: 'Linux',
      UNKNOWN: 'unknown',
})
/**
 * return the actual os used
 * @returns {os}
 */
export const detectOs = ()=>{
      if( !navigator || !('userAgent' in navigator)){
            return os.UNKNOWN;
      }
      for( const platform of Object.values( os ) ){
            if( navigator.userAgent.indexOf(platform) >= 0 )
                  return platform;
      }
      return os.UNKNOWN;
}
/**
 * return the actual browser used
 * @returns {browser}
 */
export const detectBrowser = ()=>{
      if( !navigator || !('userAgent' in navigator)){
            return browser.UNKNOWN;
      }
      for( const b of Object.values( browser ) ){
            if( navigator.userAgent.indexOf(b) >= 0 )
                  return b;
      }
      return browser.UNKNOWN;
}
const checkIfMobilePlatform = ()=>{
      const checkOs = detectOs();
      return checkOs == os.ANDROID || checkOs == os.IPHONE || checkOs == os.WINDOW_PHONE;
}
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData for more information about compatibility
 * @returns {boolean} if device is mobile
 */
export const isMobile = ()=>{
      if( !navigator )
            return false;
      if( !('userAgentData' in navigator) )
            return checkIfMobilePlatform();
      return navigator.userAgentData.mobile;
}
/**
 * returns the browser version detected via user agent
 * @returns {number} Browser version
 */
export const detectBrowserVersion = ()=>{
      if( !navigator || !('userAgent' in navigator) )
            return 0.0;
      const browser = detectBrowser();

      return parseFloat(
            navigator.userAgent.substring( 
                  navigator.userAgent.indexOf( browser ) + browser.length + 1
            )
      )
}
/**
 * return the user agent data about:
 * - browser
 * - browserVersion
 * - os
 * @returns {{
 *     browser: browser,
 *     browserVersion: number,
 *     os: os
 * }}
 */
export const getUserAgentInfo = (()=>{
      const data = {
            browser: detectBrowser(),
            browserVersion: detectBrowserVersion(),
            os: detectOs(),
      }
      return ()=>{
            return data;
      }
})()
