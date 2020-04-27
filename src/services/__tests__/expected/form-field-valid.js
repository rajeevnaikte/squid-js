try {
  customElements.define('form-field-valid', class extends HTMLElement {
    items;

    constructor () {
      super();
      this.attachShadow({ mode: 'open' });
      this.addStyle();
      this.addHtml();
      this.addScript();
      this.getAttributeNames()
    }

    addStyle () {
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML += '<style>' + '.form-group {    margin: 10px;  }' + '</style>';
      }
    }

    addHtml () {
      if (this.shadowRoot) {
        this.shadowRoot.innerHTML += '<label for="'+(this.getAttribute('exampleInputEmail1') || '')+'">'+(this.getAttribute('i18n:Email address') || '')+'</label>  <input type="email" class="form-control" id="'+(this.getAttribute('exampleInputEmail1') || '')+'" aria-describedby="emailHelp" placeholder="'+(this.getAttribute('i18n:Enter email') || '')+'">  <small id="emailHelp" class="form-text text-muted">'+(this.getAttribute('i18n:We\'ll never share your email with anyone else.') || '')+'</small>';
      }
    }

    addScript () {
      this.onresize = () => {
    console.log('hello');
  };
    }
  });
} catch (e) {
  if (e.message.includes('not a valid custom element name')) {
    throw 'UX component name form-field-valid is not valid.';
  }
  else if (e.message.includes('has already been used')) {
    throw 'UX component form-field-valid already exists.';
  }
  throw e;
}
