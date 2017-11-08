(function () {
  'use strict';

  angular.module('copayApp.controllers').controller('wordsController',
    function ($rootScope, $scope, $timeout, profileService, go, gettext, confirmDialog, notification, $log, isCordova) {
      const msg = gettext('Are you sure you want to delete the backup words?');
      const successMsg = gettext('Backup words deleted');
      const self = this;
      self.show = false;
      const fc = profileService.focusedClient;

      if (isCordova) {
        self.text = `To protect your funds, please use multisig wallets with redundancy, 
          e.g. 1-of-2 wallet with one key on this device and another key on your laptop computer. 
          Just the wallet seed is not enough.`;
      } else {
        const desktopApp = require('byteballcore/desktop_app.js');
        const appDataDir = desktopApp.getAppDataDir();
        self.text = `To restore your wallets, you will need a full backup of Dagcoin data at ${appDataDir}.  
                     Better yet, use multisig wallets with redundancy, 
                     e.g. 1-of-2 wallet with one key on this device and another key on your smartphone.  
                     Just the wallet seed is not enough.`;
      }


      if (fc.isPrivKeyEncrypted()) self.credentialsEncrypted = true;
      else {
        setWords(fc.getMnemonic());
      }
      if (fc.credentials && !fc.credentials.mnemonicEncrypted && !fc.credentials.mnemonic) {
        self.deleted = true;
      }

      self.toggle = function () {
        self.error = '';
        if (!self.credentialsEncrypted) {
          if (!self.show) {
            $rootScope.$emit('Local/BackupDone');
          }
          self.show = !self.show;
        }

        if (self.credentialsEncrypted) {
          self.passwordRequest();
        }

        $timeout(() => {
          $scope.$apply();
        }, 1);
      };

      self.delete = function () {
        confirmDialog.show(msg, (ok) => {
          if (ok) {
            fc.clearMnemonic();
            profileService.clearMnemonic(() => {
              self.deleted = true;
              notification.success(successMsg);
              go.walletHome();
            });
          }
        });
      };

      $scope.$on('$destroy', () => {
        profileService.lockFC();
      });

      function setWords(words) {
        if (words) {
          self.mnemonicWords = words.split(/[\u3000\s]+/);
          self.mnemonicHasPassphrase = fc.mnemonicHasPassphrase();
          self.useIdeograms = words.indexOf('\u3000') >= 0;
        }
      }

      self.passwordRequest = function () {
        try {
          setWords(fc.getMnemonic());
        } catch (e) {
          if (e.message && e.message.match(/encrypted/) && fc.isPrivKeyEncrypted()) {
            self.credentialsEncrypted = true;

            $timeout(() => {
              $scope.$apply();
            }, 1);

            profileService.unlockFC(null, (err) => {
              if (err) {
                self.error = `${gettext('Could not decrypt')}: ${err.message}`;
                $log.warn('Error decrypting credentials:', self.error); // TODO
                return;
              }
              if (!self.show && self.credentialsEncrypted) {
                self.show = !self.show;
              }
              self.credentialsEncrypted = false;
              setWords(fc.getMnemonic());
              $rootScope.$emit('Local/BackupDone');
            });
          }
        }
      };
    });
}());
