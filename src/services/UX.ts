import { UXJSCode } from '../model/types';
import { addDefinedComponent, verifyCanDefine } from '../data/storage';
import { kebabCase } from 'lodash';
import { ComponentType } from '../model/ComponentType';
import { Component } from '..';
import { ViewModel } from '..';
import { ReservedComponentKey } from '../exceptions/errors';

/**
 * Class with static method to load/pre-process uxjs code.
 * Internally used by uxui cli tool.
 */
export class UX
{
  /**
   * Add uxjs code object.
   * @param uxjsList
   */
  static add (...uxjsList: UXJSCode[]): void
  {
    uxjsList.forEach(UX.load);
  }

  /**
   * Load the customElement.
   * @param uxjs
   */
  private static load (uxjs: UXJSCode)
  {
    uxjs.name = kebabCase(uxjs.name);
    verifyCanDefine(uxjs.name);
    addDefinedComponent(uxjs.name, ComponentType.HTML, uxjs);
  }

  static define (compName: string, compDef: typeof Component.constructor): void
  {
    const viewModelKeys = Object.getOwnPropertyNames(ViewModel.prototype);
    const validKeys = ['constructor', 'onStateUpdate'];
    const invalidKeys = Object.getOwnPropertyNames(compDef.prototype)
      .filter(compKey => !validKeys.includes(compKey))
      .filter(compKey => viewModelKeys.includes(compKey));

    if (invalidKeys.length)
    {
      throw new ReservedComponentKey(compName, invalidKeys);
    }

    compName = kebabCase(compName);
    verifyCanDefine(compName);
    addDefinedComponent(compName, ComponentType.COMPOSITE, compDef);
  }
}
