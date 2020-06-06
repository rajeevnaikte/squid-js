import { UXExists, UXUndefined } from '../exceptions/errors';
import { ComponentType } from '../model/ComponentType';
import { Component, ComponentImplType } from '../model/Component';
import { UXJSCode } from '../model/types';

const definedComponents = {
  [ComponentType.HTML]: new Map<string, typeof Component.constructor | UXJSCode>(),
  [ComponentType.COMPOSITE]: new Map<string, typeof Component.constructor | UXJSCode>()
};

export const addDefinedComponent = (
  compName: string,
  compType: ComponentType,
  compDef: typeof Component.constructor | UXJSCode
): void => {
  definedComponents[compType].set(compName, compDef);
};

export const verifyCanDefine = (compName: string): void => {
  if (Object.values(definedComponents).some(map => map.has(compName))) {
    throw new UXExists(compName);
  }
};

export const verifyDefined = (compName: string): void => {
  if (!Object.values(definedComponents).some(map => map.has(compName))) {
    throw new UXUndefined(compName);
  }
};

export const getComponentType = (compName: string): ComponentType | undefined => {
  for (const type in ComponentType) {
    // @ts-ignore
    if (definedComponents[type].has(compName)) {
      return parseInt(type) as unknown as ComponentType;
    }
  }
  return undefined;
};

export const getComponentDef = (compName: string): ComponentImplType | UXJSCode | undefined => {
  for (const type in definedComponents) {
    // @ts-ignore
    const comp = definedComponents[type].get(compName);
    if (comp) {
      return comp;
    }
  }
  return undefined;
};
