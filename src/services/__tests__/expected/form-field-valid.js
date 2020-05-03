if (window.ux['form-field-valid']) {
  throw 'UX form-field-valid already exists.';
}
window.ux['form-field-valid'] = {
  loaded: false,
  style() {
    const el0 = document.createTextNode('.form-group {     margin: 10px;   }');
    const el1 = document.createElement('style');
    el1.appendChild(el0);
    return [el1];
  },
  html() {
    this.onDataUpdate = {};
    this.onDataUpdate['exampleInputEmail1'] = [];
    const el3 = document.createTextNode(i18n.translate('i18n:Email address'));
    const el4 = document.createElement('label');
    el4.setAttribute('for', this.getAttribute('exampleInputEmail1'));
    this.onDataUpdate['exampleInputEmail1'].push(() => el4.setAttribute('for', this.getAttribute('exampleInputEmail1')));
    el4.appendChild(el3);
    const el5 = document.createTextNode('test');
    const el6 = document.createElement('input');
    el6.setAttribute('type', 'email');
    el6.setAttribute('class', 'form-control');
    el6.setAttribute('id', this.getAttribute('exampleInputEmail1'));
    this.onDataUpdate['exampleInputEmail1'].push(() => el6.setAttribute('id', this.getAttribute('exampleInputEmail1')));
    el6.setAttribute('aria-describedby', 'emailHelp');
    el6.setAttribute('placeholder', i18n.translate('i18n:Enter email'));
    const el7 = document.createTextNode('test2');
    const el8 = document.createElement('br');
    const el10 = document.createTextNode(i18n.translate('i18n:We\'ll never share your email with anyone else.'));
    const el11 = document.createElement('small');
    el11.setAttribute('id', 'emailHelp');
    el11.setAttribute('class', 'form-text text-muted');
    el11.appendChild(el10);
    const el13 = document.createElement('div');
    el13.setAttribute('class', 'form-group');
    el13.appendChild(el4);
    el13.appendChild(el5);
    el13.appendChild(el6);
    el13.appendChild(el7);
    el13.appendChild(el8);
    el13.appendChild(el11);
    return [el13];
  },
  script() {
    this.onresize = () => {
      console.log('hello');
    };
  }
};