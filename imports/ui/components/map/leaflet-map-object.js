import React from 'react';
import { Meteor } from 'meteor/meteor';
import * as Helper from '../../../modules/helper';

import FontIcon from 'material-ui/FontIcon';

import { Categories } from '../../../api/categories/categories';
import { StatusTypes } from '../../../api/status-types/status-types';
import { StatusUpdates } from '../../../api/status-updates/status-updates';

export default class LeafletMapObject {
  constructor(elemID) {
    Helper.errorIf(!Meteor.settings.public.MapBox, "Error: Mapbox settings not defined.");

    let initialCoords = Meteor.settings.public.MapBox.initialCoords,
        initialZoom = Meteor.settings.public.MapBox.initialZoom,
        mapID = Meteor.settings.public.MapBox.mapID,
        accessToken = Meteor.settings.public.MapBox.accessToken;

    Helper.errorIf(!accessToken, "Error: Mapbox access token not defined.");

    if (!initialCoords) initialCoords = [0, 0];
    if (!initialZoom) initialZoom = 1;
    if (!mapID) mapID = "mapbox.streets";

    this.map = L.map(elemID, { zoomControl:false }).setView(Meteor.settings.public.MapBox.initialCoords, Meteor.settings.public.MapBox.initialZoom);
    this.markers = {};

    L.Icon.Default.imagePath = 'packages/bevanhunt_leaflet/images';
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      id: Meteor.settings.public.MapBox.mapID,
      accessToken: Meteor.settings.public.MapBox.accessToken
    }).addTo(this.map);
  }

  addMarker(id, ga, clickHandler) {
    if (!id)
      return Helper.error("addMarker: No id specified.");

    const status = StatusUpdates.findOne({ userId: ga.userId, giveawayId: ga._id }, { sort: { date: "desc" } });
    Helper.errorIf(!status, "Error: No status update for Giveaway #" + id);
    const statusType = StatusTypes.findOne(status.statusTypeId);
    Helper.errorIf(!statusType, "Error: No status type for Status Update #" + status._id);
    const category = Categories.findOne(ga.categoryId);
    Helper.errorIf(!category, "Error: No category defined for Giveaway #" + id);

    const icon = L.divIcon({
      iconSize: [62, 62],
      iconAnchor: [31, 62],
      html: '<div class="map-marker" style="background-color: ' + Helper.sanitizeHexColour(statusType.hexColour) + '"><i class="' + category.iconClass + '"></i></div>',
    });

    Helper.warnIf(this.markers[id], "Notice: Duplicate marker IDs present.");

    this.markers[id] = L.marker(ga.coordinates, {icon: icon});
    this.markers[id].addTo(this.map).on('click', clickHandler);
  }

  removeMarker(id, ga, clickHandler) {
    Helper.errorIf(!this.markers[id], "Error: No such marker for Giveaway #" + id);

    this.markers[id].off('click', clickHandler);
    this.map.removeLayer(this.markers[id]);
    this.markers[id] = null;
  }

  updateMarker(id, ga, clickHandler) {
    if (id in this.markers) this.removeMarker(id, ga, clickHandler);
    this.addMarker(id, ga, clickHandler);
  }
}
