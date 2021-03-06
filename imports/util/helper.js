import React from 'react/react';
import ReactDOMServer from 'react-dom/server';
import { Meteor } from 'meteor/meteor';
import Link from '../ui/layouts/link';

import Divider from 'material-ui/Divider';
const nl2brReact = require('react-nl2br');

// Console
export const log = msg => process.env.NODE_ENV === "development" ? console.log(msg) : null;
export const logIf = (x, msg) => x && process.env.NODE_ENV === "development" ? console.log(msg) : null;
export const warn = msg => process.env.NODE_ENV === "development" ? console.warn(msg) : null;
export const warnIf = (x, msg) => x && process.env.NODE_ENV === "development" ? console.warn(msg) : null;
export const error = msg => { if (process.env.NODE_ENV === "development") throw new Error(msg); };
export const errorIf = (x, msg) => { if (x && process.env.NODE_ENV === "development") throw new Error(msg); };

// Strings
export const sanitizeForXSS = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
export const sanitizeStringSlug = (s) => s.replace(/[^a-zA-Z0-9 -_]/g, "");
export const sanitizeHexColour = (s) => s.replace(/[^a-fA-F0-9#]/g, "");
export const sanitizeURL = (s) => sanitizeForXSS(s);
export const nl2br = s => nl2brReact(s);
export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// URLs
export const makeURL = (s) => {
  if (!s || !s.length)
    return null;
  else if (s.substr(0, 7) === "http://" || s.substr(0, 8) === "https://" || s.substr(0, 2) === "//")
    return s;
  else
    return "http://" + s;
};

export const makeLink = (s, label) => {
  const url = makeURL(s);

  if (!url)
    return null;
  else
    return (<Link to={url}>{label}</Link>);
};

// Arrays
export const arrayContains = (arr, item) => arr && arr.length && arr.indexOf(item) >= 0;
export const arrayContainsObjectMatch = (arr, objKey, objVal) => arr && arr.length && arr.some(x => x[objKey] === objVal);

// Objects

/**
 * Checks if a deeply nested property exists.
 * Takes in an array of properties, where each subsequent element is a property of the previous element.
 *
 * For example,
 *     propExistsDeep(object, ['property', 'really', 'deep', 'inside'])
 * returns true if
 *     object.property.really.deep.inside exists.
 */
export const propExistsDeep = function(parent, arrayOfChildProps) {
  if (!parent)
    return false;

  if (!arrayOfChildProps)
    return true;

  let object = parent;
  return arrayOfChildProps.every(function(prop) {
    if (!object.hasOwnProperty(prop))
      return false;
    object = object[prop];
    return true;
  });
};

/**
 * Maps object properties using a given function.
 * @param  {Object}   obj   Target object
 * @param  {Function} fn    Mapping function that takes in an object property value, and returns a new value to be assigned.
 *                          Method signature:
 *                            function(value, key: string) => newValue
 * @return {Object}         Newly constructed object with mapped properties. Original object is not modified.
 */
export const map_obj = function(obj, fn) {
  return Object.keys(obj).reduce(function(accum, curr) {
    accum[curr] = fn(obj[curr], curr);
    return accum;
  }, {});
};

export const objToPairArray = function(obj, keyK, keyV) {
  const arr = [];
  Object.keys(obj).forEach(key => {
    const pair = {};
    pair[keyK] = key;
    pair[keyV] = obj[key];
    arr.push(pair);
  });
  return arr;
};

// Dates
export const is_ongoing = (start, end) => moment(start).isBefore(moment()) && moment(end).isAfter(moment());
export const is_havent_start = (start, end) => moment(start).isAfter(moment());
export const is_over = (start, end) => moment(end).isBefore(moment());

// ListItems
export const insertDividers = (listItems) => {
  const returnItems = [];
  listItems.forEach((x,i,a) => {
    returnItems.push(x);
    if (i < a.length - 1)
      returnItems.push(<Divider key={ "divider_" + i } insert={true} />);
  });

  return returnItems;
}

// React
/*export const react2html = (reactElement) => ReactDOMServer.renderToStaticMarkup((
  <MuiThemeProvider muiTheme={ MuiTheme }>
    {reactElement}
  </MuiThemeProvider>
));*/
export const react2html = (reactElement) => ReactDOMServer.renderToString(reactElement);
export const jquery2html = (jQueryObject) => jQueryObject[0].outerHTML;

// Generate shortId
export const shortId = require('shortid');

// Colors
export const shadeColor = (color, factor) => {
  let R = parseInt(color.substring(1,3), 16);
  let G = parseInt(color.substring(3,5), 16);
  let B = parseInt(color.substring(5,7), 16);

  R = parseInt(R * (1 + factor));
  G = parseInt(G * (1 + factor));
  B = parseInt(B * (1 + factor));

  R = (R < 255) ? R : 255;
  G = (G < 255) ? G : 255;
  B = (B < 255) ? B : 255;

  let RR = (R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16);
  let GG = (G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16);
  let BB = (B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16);

  return "#" + RR + GG + BB;
};

// Pluralizer
export const pluralizer = (number, singular, plural) => number === 1 ? singular : plural;
