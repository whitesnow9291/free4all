import { Meteor } from 'meteor/meteor';
import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { browserHistory } from 'react-router';

import Divider from 'material-ui/Divider';
import MenuItem from 'material-ui/MenuItem';
import { ActionHome, ActionExitToApp, ActionLock } from 'material-ui/svg-icons';

import Login from '../auth/login';
import { getHandleLogout } from '../../../modules/logout';

export class DrawerMenuItems extends React.Component {
  constructor(props) {
    super(props);
  }

  constructMenuItems() {
    this.menuItems = [
      { title: "Home", href: "/", icon: (<ActionHome />) },
      { divider: true },
    ];

    if (this.props.hasUser) {
      this.menuItems.push({ title: "Log Out", onClick: getHandleLogout(), icon: (<ActionExitToApp />) });
    } else {
      this.menuItems.push({ title: "Log In", onClick: this.props.openLogin.bind(this), icon: (<ActionLock />) });
    }
  }

  render() {
    this.constructMenuItems();

    return (
      <div id="drawer-menu-items">
        { this.menuItems.map((item, index) => {
          if (item.divider) {
            return (
              <Divider
                key={ 'menudivider'+index }
              />);
          } else {
            const onClick = () => {
              if (item.onClick)
                item.onClick();
              this.props.closeDrawer();
            };

            const menuItem = (
              <MenuItem
                key={ 'menuitem'+index }
                onTouchTap={ onClick }
                primaryText={ item.title }
                leftIcon={ item.icon }
              />);

            if (!item.href)
              return menuItem;
            else
              return (
                <LinkContainer key={ 'menulink'+index } to={ item.href }>{ menuItem }</LinkContainer>
              );
          }
        }) }
      </div>
    );
  }
}

DrawerMenuItems.propTypes = {
  closeDrawer: React.PropTypes.func,
  hasUser: React.PropTypes.object,
}
