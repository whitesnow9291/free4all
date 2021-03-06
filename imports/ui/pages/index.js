import { Meteor } from 'meteor/meteor';
import React from 'react';
import Store from '../../startup/client/redux-store';

import MuiTheme from '../layouts/mui-theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import IconButton from 'material-ui/IconButton';
import RefreshIndicator from 'material-ui/RefreshIndicator';

import Header from '../components/header/header';
import LeafletMap from '../components/map/leaflet-map';
import ConfirmRGeo from '../components/map/confirm-rgeo';
import MapInfoBox from '../components/map/map-info-box';
import MapNearbyBox from '../components/map/map-nearby-box';
import GoToHomeButton from '../components/form/go-to-home-button';
import InsertBtn from '../components/form/insert-button';
import GoToGeolocationButton from '../components/map/go-to-geolocation-button'
import InsertBtnDialog from '../components/map/insert-button-dialog'

import * as LatLngHelper from '../../util/latlng';
import * as IconsHelper from '../../util/icons';
import { Bert } from 'meteor/themeteorchef:bert';

const isMobile = () => $(window).innerWidth() <= 992;

export class Index extends React.Component {
  constructor(props) {
    super(props);
    const self = this;

    this.state = {
      gaSelected: null,
      infoBoxState: 0,
      nearbyBoxState: 1,
      geolocation: null,
      mapCenter: null,
      mapZoom: null,
      mapMaxZoom: null,
      isModalOpen: false,
      latLngClicked: {lat:"",lng:""},
      locArr: [],
      showRGeoMarker: false,
      showMarkers: true,
      rGeoLoading: false,
      rGeoTrigger: false,
      homeLocation: null,
      homeZoom: null,
      zoomBehaviour: true,    // true: zoom to mouse/finger, 'center': zoom to center of view
    };

    this.subscription = null;
    this.autorunSub = null;
    this.autorunGeo = null;
    this.autorunHome = null;
    this.autorunAuth = null;

    this.openInsertDialog = this.openInsertDialog.bind(this);
    this.resetEventHandlers = null;
  }

  selectGa(gaId) {
    this.setState({
      gaSelected: gaId,
      infoBoxState: 2,  // Bottom bar: show title / Sidebar: show
    });
  }

  setInfoBoxState(x) {
    this.setState({ infoBoxState: x });
    if (!x) this.setState({ gaSelected: null });
  }

  setNearbyBoxState(x) {
    this.setState({ nearbyBoxState: x });
  }

  componentDidMount() {
    const self = this;

    // Autorun subscription
    this.autorunSub = Tracker.autorun(function () {
      const reactiveUser = Meteor.user();

      // Re-subscribe if user changed
      let commIds = [];

      // Pass user communities to publication function
      if (Meteor.user())
        commIds = Meteor.user().communityIds;
      else if (Session.get('homeLocation'))
        commIds = [ Session.get('homeLocation').commId ];

      self.subscription = Meteor.subscribe('giveaways-search', { tab: 'current', commIds });
    });

    // Autorun track device location
    this.autorunGeo = Tracker.autorun(function() {
      const reactiveLatLng = Geolocation.latLng();

      // Set current location
      self.setState({ geolocation: reactiveLatLng });
    })

    // Autorun check user authenticated
    this.autorunAuth = Tracker.autorun(function() {
      const user = Meteor.user();
      if (user && user.profile.homeLocation) {
        const homeLocation = user.profile.homeLocation;
        const homeZoom = user.profile.homeZoom;
        const commId = user.profile.homeCommunityId;
        // homeLocation state is for goToHomeLocation Button
        self.setState({ homeLocation: homeLocation, homeZoom: homeZoom });
        // homeLocation session is for initial map center
        Session.setPersistent('homeLocation', { coordinates: homeLocation, zoom: homeZoom, commId: commId});
      }
    });

    // Autorun home location session variable
    this.autorunHome = Tracker.autorun(function(){
      const homeLoc = Session.get('homeLocation');

      if (homeLoc)
        self.setState({
          homeLocation: homeLoc.coordinates,
          homeZoom: homeLoc.zoom,
          mapCenter: homeLoc.coordinates,
          mapZoom: isMobile() ? homeLoc.zoom - 1 : homeLoc.zoom
        });
    });
  }

  componentWillUnmount() {
    this.subscription && this.subscription.stop();
    this.autorunSub && this.autorunSub.stop();
    this.autorunHome && this.autorunHome.stop();
    this.autorunGeo && this.autorunGeo.stop();
    this.autorunAuth && this.autorunAuth.stop();
  }

  goToGeolocation() {
    this.setState({ mapCenter: this.state.geolocation });
  }

  goToHomeLoc(){
    this.setState({
      mapCenter: this.state.homeLocation,
      mapZoom: isMobile() ? this.state.homeZoom - 1 : this.state.homeZoom
    });
  }

  handleOpen() {
    // If not logged in, open login dialog instead
    if (!Meteor.user())
      return Store.dispatch({ type: 'OPEN_LOGIN_DIALOG', message: "Login to contribute a giveaway!" });

    this.setState({
      isModalOpen:true,
      nearbyBoxState: 0,
      infoBoxState: 0
    });
  }

  openInsertDialog() {
    this.setState({ isModalOpen: true, showRGeoMarker: false })
    this.showMarkers();
    this.setZoomBehaviour(true);
    this.resetEventHandlers && this.resetEventHandlers();
  }

  setConfirmDialog(features, coords, resetEventHandlers){
    this.resetEventHandlers = this.resetEventHandlers || resetEventHandlers;

    let locArr = features.map((loc)=> {
      loc.text = loc.place_name;
      loc.value = loc.place_name;
      return loc;
    });

    this.setState({
      locArr,
      latLngClicked: coords
    });
  }

  showMarkers() {
    this.setState({ showMarkers: true });
  }

  setZoomBehaviour(value) {
    this.setState({ zoomBehaviour: value });
  }

  resetLoc() {
    this.setState({
      latLngClicked: {lat:"",lng:""},
      locArr: [],
      locName: "",
    });
  }

  render() {
    const clickNearbyGa = ga => event => {
      this.selectGa(ga._id);
      this.setState({ mapCenter: LatLngHelper.lnglat2latlng(ga.coordinates) });
      this.setState({ mapZoom: this.state.mapMaxZoom });
    };

    return (
      <div className="full-container">
        <LeafletMap
          gaId={ this.state.gaSelected }
          infoBoxState={ this.state.infoBoxState }
          markerOnClick={ gaId => this.selectGa(gaId) }
          mapCenter={ this.state.mapCenter }
          setMapCenter={ mapCenter => this.setState({ mapCenter }) }
          mapZoom={ this.state.mapZoom }
          setMapZoom={ mapZoom => this.setState({ mapZoom })}
          setMapMaxZoom={ mapMaxZoom => this.setState({ mapMaxZoom })}
          showMarkers={ this.state.showMarkers }
          rGeoTrigger={ this.state.rGeoTrigger }
          rmvRGeoTrigger={ ()=> this.setState({ rGeoTrigger: false }) }
          addRGeoSpinner={ ()=> this.setState({ rGeoLoading: true }) }
          rmvRGeoSpinner={ ()=> this.setState({ rGeoLoading: false }) }
          setConfirmDialog={ this.setConfirmDialog.bind(this) }
          zoomBehaviour={ this.state.zoomBehaviour }
        />
        <div className="rGeoLoader">
          <RefreshIndicator
            size={40}
            top={10}
            left={ $(window).width() / 2 }
            status={ this.state.rGeoLoading ? "loading" : "hide" }
          />
        </div>
        <div id="map-boxes-container">
          <MapInfoBox
            gaId={ this.state.gaSelected }
            boxState={ this.state.infoBoxState }
            setBoxState={ this.setInfoBoxState.bind(this) }
          />
          <MapNearbyBox
            gaId={ this.state.gaSelected }
            boxState={ this.state.nearbyBoxState }
            setBoxState={ this.setNearbyBoxState.bind(this) }
            nearbyOnClick={ clickNearbyGa }
          />
          { this.state.showRGeoMarker &&
            <ConfirmRGeo
              locArr={ this.state.locArr }
              openInsertDialog={ this.openInsertDialog } />
          }

        </div>

        { this.state.showRGeoMarker && <div className="centerMarker" /> }

        <div id="map-floating-buttons"
             style={{ right: 20 + (this.state.nearbyBoxState > 0 ? $("#map-nearby-box").outerWidth() : 0) }}>
          <GoToGeolocationButton geolocationOnClick={ this.goToGeolocation.bind(this) } />

          <GoToHomeButton
            goToHomeLoc = { this.goToHomeLoc.bind(this) }
            homeLocation = { this.state.homeLocation } />

          <InsertBtn
            handleOpen={ this.handleOpen.bind(this) } />
        </div>

        <InsertBtnDialog
          isModalOpen={ this.state.isModalOpen }
          closeModal={ ()=> this.setState({ isModalOpen: false }) }
          latLng={ this.state.latLngClicked }
          locArr={ this.state.locArr }
          addRGeoTriggerMarker={ ()=> this.setState({ rGeoTrigger: true, showRGeoMarker: true }) }
          hideMarkers={ ()=> this.setState({ showMarkers: false }) }
          resetLoc={ this.resetLoc.bind(this) }
          mapCenter={ this.state.mapCenter }
          zoom={ this.state.mapZoom }
          setZoomBehaviour={ this.setZoomBehaviour.bind(this) } />

      </div>
    );
  }
}

Index.propTypes = {
  name: React.PropTypes.string,
};
