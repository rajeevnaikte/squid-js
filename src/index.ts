import { UX } from './services/UX';
import { UI } from './services/UI';
import { ViewModel } from './model/ViewModel';
import { ViewState } from './model/ViewState';
import { Component } from './model/Component';

// @ts-ignore
window.UX = UX;
// @ts-ignore
window.UI = UI;

export {
  UI,
  UX,
  ViewModel,
  ViewState,
  Component
};
