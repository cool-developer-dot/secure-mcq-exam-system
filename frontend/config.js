/**
 * Frontend configuration file.
 * 
 * Edit window.__ENV.API_BASE_URL to point to your deployed backend API.
 * When hosted on the same domain as the backend, leave it undefined and it
 * will automatically use window.location.origin.
 */
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


