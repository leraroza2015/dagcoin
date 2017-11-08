(function () {
  'use strict';

  const eventBus = require('byteballcore/event_bus.js');

  angular.module('copayApp.services')
  .factory('newVersion', ($modal, $timeout, $rootScope, $q, configService) => {
    const root = {};
    root.shown = false;
    root.timerNextShow = false;
    root.askForVersion = askForVersion;

    eventBus.on('new_version', (ws, data) => {
      root.version = data.version;
      if (!root.shown) {
        const modalInstance = $modal.open({
          templateUrl: 'views/modals/newVersionIsAvailable.html',
          controller: 'newVersionIsAvailable'
        });
        $rootScope.$on('closeModal', () => {
          modalInstance.dismiss('cancel');
        });
        root.shown = true;
        startTimerNextShow();
      }
    });

    function startTimerNextShow() {
      if (root.timerNextShow) $timeout.cancel(root.timerNextShow);
      root.timerNextShow = $timeout(() => {
        root.shown = false;
      }, 1000 * 60 * 60 * 24);
    }

    function askForVersion() {
      const device = require('byteballcore/device');
      const config = configService.getSync();

      updateHubLocation().then(() => { device.setDeviceHub(config.hub); });
    }

    function updateHubLocation() {
      const defaultConfig = configService.getDefaults();
      const config = configService.getSync();
      const deferred = $q.defer();

      config.hub = defaultConfig.hub;

      configService.setWithoutMergingOld(config, (err) => {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
      });

      return deferred.promise;
    }

    return root;
  });
}());
