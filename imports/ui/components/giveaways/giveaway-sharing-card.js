import { Meteor } from 'meteor/meteor';
import React from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';

import * as UsersHelper from '../../../util/users';

export const GiveawaySharingCard = ({ ga }) => (
  <Paper className="giveaway giveaway-card">
    <div className="flex-row">
      <div className="col col-xs-12">
        <h3>Share</h3>
        <TextField id="share-url" value={ Meteor.absoluteUrl('giveaway/' + ga._id) } fullWidth={true} onTouchTap={ () => $("#share-url").select() } />
      </div>
    </div>
  </Paper>
);