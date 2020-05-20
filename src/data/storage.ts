import { UXExists } from '../exceptions/errors';
import { UXComponent } from '../model/UXComponent';
import { ComponentType } from '../model/ComponentType';

const definedComponents = {
  [ComponentType.HTML]: new Map<string, UXComponent | undefined>(),
  [ComponentType.COMPOSITE]: new Map<string, UXComponent | undefined>()
}

export const addDefinedComponent = (compName: string, compType: ComponentType, compDef?: UXComponent): void => {
  definedComponents[compType].set(compName, compDef);
};

export const verifyCanDefine = (compName: string): void => {
  if (Object.values(definedComponents).some(map => map.has(compName))) {
    throw new UXExists(compName);
  }
};

export const getComponentType = (compName: string): ComponentType | undefined => {
  for (const type in definedComponents) {
    // @ts-ignore
    if (definedComponents[type].has(compName)) {
      // @ts-ignore
      return type;
    }
  }
  return undefined;
};

export const getUIComponentDef = (compName: string): UXComponent | undefined => {
  for (const type in definedComponents) {
    // @ts-ignore
    const comp = definedComponents[type].get(compName);
    if (comp) {
      return comp;
    }
  }
  return undefined;
};
