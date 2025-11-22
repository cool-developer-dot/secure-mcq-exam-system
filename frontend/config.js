/**
 * Frontend configuration file.
 *
 * Set API_BASE_URL to your deployed backend. If you're serving the frontend
 * and backend from the same domain, you can delete this assignment and the
 * fallback logic below will auto-detect the origin.
 */
window.__ENV = window.__ENV || {};
window.__ENV.API_BASE_URL = 'https://secure-mcq-exam-system.onrender.com';

(function () {
  var DEFAULT_LOCAL_API = 'http://localhost:3000';

  window.__ENV = window.__ENV || {};

  if (!window.__ENV.API_BASE_URL) {
    var isFileProtocol = window.location.protocol === 'file:';
    var hasOrigin =
      window.location.origin &&
      window.location.origin !== 'null' &&
      !isFileProtocol;

    window.__ENV.API_BASE_URL = hasOrigin
      ? window.location.origin
      : DEFAULT_LOCAL_API;
  }
})();


