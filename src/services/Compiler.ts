import { basename } from 'path';
import { BaseError, readFile, TextsBetween, walkDirTree, writeFile } from 'squid-utils';
import { MultipleScript, MultipleStyles, MultipleTemplate, NamespaceMissing, TemplateMissing } from './errors';
import * as cheerio from 'cheerio';
import { UXCode } from './types';
import { Config, getConfig } from '../configurations/configuration';
import { JSDOM } from 'jsdom';
import { uniq } from 'lodash';
import { HtmlToJSCodeGenerator } from './HtmlToJSCodeGenerator';
import { js as beautify } from 'js-beautify';
import { getCustomElementName } from '../common/utils';

/**
 * Compiler for UX html code.
 */
export class Compiler {
  private readonly variablePattern = new TextsBetween('[', ']');

  /**
   * Compile the .ux file(s).
   * @param uxDir
   */
  compileUX (uxDir: string) {
    walkDirTree(uxDir, {
      fileNameMatcher: /[.]ux$/g,
      recursive: true
    })
      .forEach(uxFilePath => {
        try {
          this.compile(uxFilePath);
        } catch (e) {
          console.error(e);
        }
      });
  }

  /**
   * Compile a single .ux file and create custom element.
   * @param uxFilePath
   */
  private compile (uxFilePath: string): string {
    const uxCode = this.parse(uxFilePath);
    const uxjsCode = new HtmlToJSCodeGenerator(uxCode)
      .withVariablePattern(this.variablePattern)
      .generate();

    const template = readFile(`${__dirname}/component.js.template`);
    const customElementName = getCustomElementName(uxCode);

    const componentCode = this.variablePattern.replace(template, key => {
      const value = uxjsCode[key];
      if (Array.isArray(value)) {
        return value.join('\n');
      }
      else {
        return value;
      }
    });

    // Validate the ux component code.
    new JSDOM(`<body>
        <script>
          const i18n = { translate: () => '' };
          window.ux = {};
        </script>
        <script>${componentCode}</script>
        <${customElementName}></${customElementName}>
      </body>`, { runScripts: 'dangerously' });

    const uxComponentClassFilePath = `${getConfig(Config.ROOT_DIR)}/.build/ux/${customElementName}.uxjs`;
    writeFile(uxComponentClassFilePath, beautify(componentCode, { indent_size: 2 })); // eslint-disable-line @typescript-eslint/camelcase

    return uxComponentClassFilePath;
  }

  /**
   * Parse and extract component ux code parts.
   * @param uxCode
   */
  private parse (uxFilePath: string): UXCode {
    const uxCode = readFile(uxFilePath);
    const errors: BaseError[] = [];

    // extract namespace
    let nameSpaceEndIdx = uxCode.indexOf(';');
    if (!uxCode.substring(0, nameSpaceEndIdx).match(/^namespace: [^<]+$/g)) {
      errors.push(new NamespaceMissing(uxFilePath));
      nameSpaceEndIdx = -1;
    }
    const namespace = uxCode.substring('namespace: '.length, nameSpaceEndIdx).trim().replace(/(\/|\\)+/g, '.');
    if (namespace.length === 0) {
      errors.push(new NamespaceMissing(uxFilePath));
    }

    const $: CheerioStatic = cheerio.load(uxCode.substr(nameSpaceEndIdx + 1), {
      decodeEntities: false
    });

    // extract style
    const styleEl = $('style');
    if (styleEl.length > 1) {
      errors.push(new MultipleStyles(uxFilePath));
    }
    const style = styleEl.html()?.trim();
    styleEl.remove();

    // extract script
    const scriptEl = $('script');
    if (scriptEl.length > 1) {
      errors.push(new MultipleScript(uxFilePath));
    }
    const script = scriptEl.html()?.trim() ?? undefined;
    scriptEl.remove();

    // extract html
    const templateEl = $('template');
    if (templateEl.length > 1) {
      errors.push(new MultipleTemplate(uxFilePath));
    }
    else if (templateEl.length !== 1) {
      errors.push(new TemplateMissing(uxFilePath));
    }
    const html = templateEl.html()?.trim() ?? '';

    if (errors.length > 0) {
      throw errors;
    }

    const allVariables = uniq(this.variablePattern.get(html));
    return {
      namespace,
      name: basename(uxFilePath, '.ux'),
      style,
      html,
      variables: allVariables.filter(variable => !variable.startsWith('i18n:')),
      i18ns: allVariables.filter(variable => variable.startsWith('i18n:')),
      script
    };
  }
}
