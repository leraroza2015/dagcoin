(function () {
  'use strict';

  angular.module('copayApp.services').factory('animationService', (isCordova) => {
    const root = {};

    let cachedTransitionState;
    let cachedBackPanel;

    // DISABLE ANIMATION ON DESKTOP
    root.modalAnimated = {
      slideUp: isCordova ? 'full animated slideInUp' : 'full',
      slideRight: isCordova ? 'full animated slideInRight' : 'full',
      slideOutDown: isCordova ? 'slideOutDown' : 'hideModal',
      slideOutRight: isCordova ? 'slideOutRight' : 'hideModal',
    };

    const pageWeight = {
      walletHome: 0,
      copayers: -1,
      cordova: -1,
      payment: -1,

      preferences: 11,
      preferencesGlobal: 11,
      preferencesColor: 12,
      backup: 12,
      preferencesAdvanced: 12,
      about: 12,
      delete: 13,
      preferencesDeviceName: 12,
      preferencesLanguage: 12,
      preferencesUnit: 12,
      preferencesFee: 12,
      preferencesAltCurrency: 12,
      preferencesAlias: 12,
      preferencesEmail: 12,
      export: 13,
      paperWallet: 13,
      logs: 13,
      information: 13,
      translators: 13,
      disclaimer: 13,
      add: 11,
      create: 12,
      import: 12,
      importLegacy: 13,
    };

    function cleanUpLater(e, e2) {
      let cleanedUp = false;
      let timeoutID;
      const cleanUp = function () {
        if (cleanedUp) return;
        cleanedUp = true;
        // sometimes it is null
        if (e2.parentNode) {
          e2.parentNode.removeChild(e2);
        }
        e2.innerHTML = '';
        e.className = '';
        cachedBackPanel = null;
        cachedTransitionState = '';
        if (timeoutID) {
          timeoutID = null;
          window.clearTimeout(timeoutID);
        }
      };
      e.addEventListener('animationend', cleanUp, true);
      e2.addEventListener('animationend', cleanUp, true);
      e.addEventListener('webkitAnimationEnd', cleanUp, true);
      e2.addEventListener('webkitAnimationEnd', cleanUp, true);
      timeoutID = setTimeout(cleanUp, 500);
    }

    root.transitionAnimated = function (fromState, toState) {
      // Animation in progress?
      const x = document.getElementById('mainSectionDup');
      if (x && !cachedTransitionState) {
        console.log('Anim in progress');
        return true;
      }

      const fromName = fromState.name;
      const toName = toState.name;
      if (!fromName || !toName) {
        return true;
      }

      const fromWeight = pageWeight[fromName];
      const toWeight = pageWeight[toName];


      let entering = null;
      let leaving = null;

      // Horizontal Slide Animation?
      if (isCordova && fromWeight && toWeight) {
        if (fromWeight > toWeight) {
          leaving = 'CslideOutRight';
        } else {
          entering = 'CslideInRight';
        }

        // Vertical Slide Animation?
      } else if (isCordova && fromName && fromWeight >= 0 && toWeight >= 0) {
        if (toWeight) {
          entering = 'CslideInUp';
        } else {
          leaving = 'CslideOutDown';
        }

        // no Animation  ?
      } else {
        return true;
      }

      const e = document.getElementById('mainSection');


      const desiredTransitionState = `${fromName || '-'}:${toName || '-'}`;

      if (desiredTransitionState === cachedTransitionState) {
        e.className = entering || '';
        cachedBackPanel.className = leaving || '';
        cleanUpLater(e, cachedBackPanel);
        // console.log('USing animation', cachedTransitionState);
        return true;
      }
      let sc;
      // Keep prefDiv scroll
      const contentDiv = e.getElementsByClassName('content');
      if (contentDiv && contentDiv[0]) {
        sc = contentDiv[0].scrollTop;
      }

      cachedBackPanel = e.cloneNode(true);
      cachedBackPanel.id = 'mainSectionDup';
      const c = document.getElementById('sectionContainer');
      c.appendChild(cachedBackPanel);

      if (sc) {
        cachedBackPanel.getElementsByClassName('content')[0].scrollTop = sc;
      }

      cachedTransitionState = desiredTransitionState;
      return false;
    };

    return root;
  });
}());
