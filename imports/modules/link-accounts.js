import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { Facebook } from 'meteor/facebook';
import { Google } from 'meteor/google';
import { IVLE } from 'meteor/irvinlim:ivle';
import { OAuth } from 'meteor/oauth';

import { capitalizeFirstLetter } from '../util/helper';
import { updateProfileFacebook, updateProfileGoogle, updateProfileIVLE } from '../api/users/methods';

const linkAccount = (service, servicePackage, request, handler) => {
  servicePackage.requestCredential(request, (token) => {
    const secret = OAuth._retrieveCredentialSecret(token);
    return Meteor.call("user.addOauthCredentials", token, secret, service, function(err, resp) {
      if (err != null) {
        Bert.alert(`Could not link ${capitalizeFirstLetter(service)}.`, 'warning');
        throw new Meteor.Error(err.error, err.reason);
      } else {
        Bert.alert(`Successfully linked ${capitalizeFirstLetter(service)}!`, 'success');
        handler.call({ userId: Meteor.userId() });
      }
    });
  });
};

export const linkFacebook = (options) => {
  linkAccount('facebook', Facebook, {
    requestPermissions: ["email"]
  }, updateProfileFacebook);
};

export const linkGoogle = (options) => {
  linkAccount('google', Google, {
    requestPermissions: ["email"],
    requestOfflineToken: true
  }, updateProfileGoogle);
};

export const linkIVLE = (options) => {
  linkAccount('ivle', IVLE, {}, updateProfileIVLE);
};

const unlinkAccount = (service) => {
  Meteor.call('user.unlinkService', service, (err) => {
    if (err) {
      Bert.alert(`Could not unlink ${capitalizeFirstLetter(service)}.`, 'danger');
    } else {
      Bert.alert(`Successfully unlinked ${capitalizeFirstLetter(service)}.`, 'success');
    }
  });
};

export const unlinkFacebook = (options) => unlinkAccount('facebook');
export const unlinkGoogle = (options) => unlinkAccount('google');
export const unlinkIVLE = (options) => unlinkAccount('ivle');
