import { basename } from 'path';
import { BaseError, readFile, TextsBetween, walkDirTree, writeFile } from 'squid-utils';
import { HtmlBodyMissing, MultipleHtmlBody, MultipleScript, MultipleStyles, NamespaceMissing } from './errors';
import * as cheerio from 'cheerio';
import { UXComponentCode } from './types';
import { Config, getConfig } from '../configurations/configuration';
import { JSDOM } from 'jsdom';
import { kebabCase } from 'lodash';

export class UXCompiler {
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
  private compile (uxFilePath: string) {
    const uxComponentCode = this.parse(uxFilePath);
    const template = readFile(`${__dirname}/component.js.template`);
    const customElementName = `${kebabCase(uxComponentCode.namespace)}-${uxComponentCode.name}`;

    const componentCode = this.variablePattern.replace(template, key => {
      if (key === 'html') {
        return this.variablePattern.split(uxComponentCode.html)
          .map(htmlPart => {
            if (typeof htmlPart === 'string') {
              return `'${htmlPart.replace(/'/g, '\\\'').replace(/\n/g, '')}'`;
            } else {
              return `(this.getAttribute('${htmlPart.textBetween.replace(/'/g, '\\\'')}') || '')`;
            }
          })
          .join('+');
      }
      else if (key === 'style') {
        return `'${uxComponentCode.style?.replace(/'/g, '\\\'').replace(/\n/g, '')}'` ?? '';
      }
      else if (key === 'namespace') {
        return kebabCase(uxComponentCode.namespace);
      }
      return uxComponentCode[key]?.toString() ?? '';
    });

    // Validate the ux component code.
    new JSDOM(`<body><script>${componentCode}</script><${customElementName}></${customElementName}></body>`, { runScripts: 'dangerously' });

    const uxComponentClassFilePath = `${getConfig(Config.ROOT_DIR)}/.build/ux/${customElementName}.js`;
    writeFile(uxComponentClassFilePath, componentCode);
  }

  /**
   * Parse and extract component ux code parts.
   * @param uxCode
   */
  private parse (uxFilePath: string): UXComponentCode {
    const uxCode = readFile(uxFilePath);
    const errors: BaseError[] = [];

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
    const headStyle = $('head > style');
    const bodyStyle = $('body > style');
    if ((headStyle.length + bodyStyle.length) > 1) {
      errors.push(new MultipleStyles(uxFilePath));
    }

    const body = $('body > :not(script)');
    if (body.length > 1) {
      errors.push(new MultipleHtmlBody(uxFilePath));
    } else if (body.length !== 1) {
      errors.push(new HtmlBodyMissing(uxFilePath));
    }

    const headScript = $('head > script');
    const bodyScript = $('body > script');
    if ((headScript.length + bodyScript.length) > 1) {
      errors.push(new MultipleScript(uxFilePath));
    }

    if (errors.length > 0) {
      throw errors;
    }

    const html = body.html()?.trim() ?? '';

    return {
      namespace,
      name: basename(uxFilePath, '.ux'),
      style: headStyle.html()?.trim() ?? bodyStyle.html()?.trim() ?? undefined,
      html,
      variables: this.variablePattern.get(html),
      script: headScript.html()?.trim() ?? bodyScript.html()?.trim() ?? undefined
    };
  }
}
