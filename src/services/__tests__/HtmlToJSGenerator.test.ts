import { TextsBetween } from 'squid-utils';
import { HtmlToJSCodeGenerator } from '../HtmlToJSCodeGenerator';
import * as cheerio from 'cheerio';
import { UXCode } from '../types';

describe('HtmlToJSGenerator', () => {
  const testObj = (uxCode?: UXCode) => new HtmlToJSCodeGenerator(uxCode ?? {
    namespace: '',
    name: '',
    html: '',
    variables: [],
    i18ns: []
  })
    .withVariablePattern(new TextsBetween('[', ']'));

  describe('codifyText', () => {
    const testObj = new HtmlToJSCodeGenerator({
      namespace: '',
      name: '',
      html: '',
      variables: [],
      i18ns: []
    })
      .withVariablePattern(new TextsBetween('[', ']'));

    test('empty text', () => {
      expect(
        // @ts-ignore
        testObj.codifyText('')
      ).toEqual('\'\'');
    });

    test('simple text', () => {
      expect(
        // @ts-ignore
        testObj.codifyText('test 123')
      ).toEqual('\'test 123\'');
    });

    test('quoted text', () => {
      expect(
        // @ts-ignore
        testObj.codifyText('test\' 123')
      ).toEqual('\'test\\\' 123\'');
    });
  });

  describe('getTextCreationCode', () => {
    const testObj = new HtmlToJSCodeGenerator({
      namespace: '',
      name: '',
      html: '',
      variables: [],
      i18ns: []
    })
      .withVariablePattern(new TextsBetween('[', ']'));

    test('variable at start middle end and one i18n', () => {
      const text = '[att1] and [att2] and [i18n:att3]';
      expect(
        // @ts-ignore
        testObj.getTextCreationCode(text)
      ).toEqual('this.getAttribute(\'att1\') + \' and \' + this.getAttribute(\'att2\') + \' and \' + i18n.translate(\'i18n:att3\')');
    });

    test('empty text', () => {
      const text = '';
      expect(
        // @ts-ignore
        testObj.getTextCreationCode(text)
      ).toEqual('');
    });

    test('text with quote', () => {
      const text = 'test\'ing';
      expect(
        // @ts-ignore
        testObj.getTextCreationCode(text)
      ).toEqual('\'test\\\'ing\'');
    });
  });

  describe('traverseHtmlAndGetJSCode', () => {
    test('empty tag', () => {
      const el = cheerio.load('<style></style>', { decodeEntities: false })('head > *')[0];
      const codeLines: string[] = [];
      expect(
        // @ts-ignore
        testObj().traverseHtmlAndGetJSCode(el, codeLines)
      ).toEqual('el0');
      expect(codeLines).toEqual([
        'const el0 = document.createElement(\'style\');'
      ]);
    });

    test('styles', () => {
      const el = cheerio.load('<style>.form-group { margin: 10px; }</style>', { decodeEntities: false })('head > *')[0];
      const codeLines: string[] = [];
      expect(
        // @ts-ignore
        testObj().traverseHtmlAndGetJSCode(el, codeLines)
      ).toEqual('el1');
      expect(codeLines).toEqual([
        'const el0 = document.createTextNode(\'.form-group { margin: 10px; }\');',
        'const el1 = document.createElement(\'style\');',
        'el1.appendChild(el0);'
      ]);
    });

    test('html', () => {
      const el = cheerio.load(`
      <div att1="attv1">hello1<span att2="attv2">hello2</span>hello3</div>
      `, { decodeEntities: false })('body > *')[0];
      const codeLines: string[] = [];
      expect(
        // @ts-ignore
        testObj().traverseHtmlAndGetJSCode(el, codeLines)
      ).toEqual('el4');
      expect(codeLines).toEqual([
        'const el0 = document.createTextNode(\'hello1\');',
        'const el1 = document.createTextNode(\'hello2\');',
        'const el2 = document.createElement(\'span\');',
        'el2.setAttribute(\'att2\', \'attv2\');',
        'el2.appendChild(el1);',
        'const el3 = document.createTextNode(\'hello3\');',
        'const el4 = document.createElement(\'div\');',
        'el4.setAttribute(\'att1\', \'attv1\');',
        'el4.appendChild(el0);',
        'el4.appendChild(el2);',
        'el4.appendChild(el3);'
      ]);
    });

    test('html with variables', () => {
      const el = cheerio.load(`
      <div att1="attv1 [var2]">hello1 [var1]<span att2="attv2">hel[var3]lo2</span>hello3</div>
      `, { decodeEntities: false })('body > *')[0];
      const codeLines: string[] = [];
      expect(
        // @ts-ignore
        testObj().traverseHtmlAndGetJSCode(el, codeLines)
      ).toEqual('el4');
      expect(codeLines).toEqual([
        'const el0 = document.createTextNode(\'hello1 \' + this.getAttribute(\'var1\'));',
        'this.onDataUpdate[\'var1\'].push(() => el0.nodeValue = \'hello1 \' + this.getAttribute(\'var1\'));',
        'const el1 = document.createTextNode(\'hel\' + this.getAttribute(\'var3\') + \'lo2\');',
        'this.onDataUpdate[\'var3\'].push(() => el1.nodeValue = \'hel\' + this.getAttribute(\'var3\') + \'lo2\');',
        'const el2 = document.createElement(\'span\');',
        'el2.setAttribute(\'att2\', \'attv2\');',
        'el2.appendChild(el1);',
        'const el3 = document.createTextNode(\'hello3\');',
        'const el4 = document.createElement(\'div\');',
        'el4.setAttribute(\'att1\', \'attv1 \' + this.getAttribute(\'var2\'));',
        'this.onDataUpdate[\'var2\'].push(() => el4.setAttribute(\'att1\', \'attv1 \' + this.getAttribute(\'var2\')));',
        'el4.appendChild(el0);',
        'el4.appendChild(el2);',
        'el4.appendChild(el3);'
      ]);
    });
  });

  describe('generate', () => {
    test('ux code', () => {
      const codeLines = testObj({
        namespace: 'field',
        name: 'input',
        style: '<style>div { margin: 10px; }</style>',
        html: '<div><input type="radio" name="name">[val1]<input type="radio" name="name">Option2 [i18n:data]</div>',
        variables: ['val1'],
        i18ns: []
      })
        .generate();
      expect(codeLines).toEqual([
        'this.onDataUpdate = {};',
        'this.onDataUpdate[\'val1\'] = [];',
        'const el0 = document.createTextNode(\'<style>div { margin: 10px; }\');',
        'const el1 = document.createElement(\'style\');',
        'el1.appendChild(el0);',
        'const el2 = document.createElement(\'input\');',
        'el2.setAttribute(\'type\', \'radio\');',
        'el2.setAttribute(\'name\', \'name\');',
        'const el3 = document.createTextNode(this.getAttribute(\'val1\'));',
        'this.onDataUpdate[\'val1\'].push(() => el3.nodeValue = this.getAttribute(\'val1\'));',
        'const el4 = document.createElement(\'input\');',
        'el4.setAttribute(\'type\', \'radio\');',
        'el4.setAttribute(\'name\', \'name\');',
        "const el5 = document.createTextNode('Option2 ' + i18n.translate('i18n:data'));",
        'const el6 = document.createElement(\'div\');',
        'el6.appendChild(el2);',
        'el6.appendChild(el3);',
        'el6.appendChild(el4);',
        'el6.appendChild(el5);',
        'return [el1,el6];'
      ]);
    });
  });
});