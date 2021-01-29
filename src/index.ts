import { UX } from './services/UX';
import { UI } from './services/UI';
import { ViewModel } from './model/ViewModel';
import { ViewState } from './model/ViewState';
import { Component } from './model/Component';

if (typeof window !== 'undefined')
{
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.UX = UX;
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	window.UI = UI;
}

export {
	UI,
	UX,
	ViewModel,
	ViewState,
	Component
};
