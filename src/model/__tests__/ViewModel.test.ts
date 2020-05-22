import { GenesisViewModel, ViewModel } from '../ViewModel';
import { html as prettyHtml } from 'js-beautify';
import { readFile } from 'squid-node-utils';

describe('ViewModel', () => {
  test('GenesisViewModel', async () => {
    const genesis = new GenesisViewModel(document.body);
    genesis.add({
      ux: 'form-field-valid'
    });

    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/valid.ux`) ?? ''));

    // @ts-ignore
    const uxViewModel = genesis.items[0];
    expect(uxViewModel).toBeDefined();
    // @ts-ignore
    expect(uxViewModel._id).toEqual('ux-0');
    // @ts-ignore
    expect(uxViewModel.state).toEqual({});
  });

  test('with state data', () => {
    const genesis = new GenesisViewModel(document.body);
    genesis.add({
      ux: 'form-field-valid',
      exampleInputEmail1: 'my-email',
      exampleInputEmail2: 1234
    });

    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/with-state.ux`) ?? ''));

    // @ts-ignore
    const uxViewModel = genesis.items[0];
    // @ts-ignore
    expect(uxViewModel.state).toEqual({
      exampleInputEmail1: 'my-email',
      exampleInputEmail2: 1234
    });
  });

  test('state update', () => {
    const genesis = new GenesisViewModel(document.body);
    genesis.add({
      ux: 'form-field-valid',
      exampleInputEmail1: 'my-email',
      exampleInputEmail2: 1234
    });

    // @ts-ignore
    const uxViewModel = genesis.items[0];
    // @ts-ignore
    uxViewModel.state.exampleInputEmail2 = 12345;
    // @ts-ignore
    expect(uxViewModel.state.exampleInputEmail2).toEqual(12345);
    expect(document.body.getElementsByTagName('input')[0].getAttribute('id'))
      .toEqual('12345');
  });

  test('with two items', async () => {
    const genesis = new GenesisViewModel(document.body);
    genesis.add({
      ux: 'form-form',
      items: [{
        ux: 'form-text-input'
      }, {
        ux: 'form-text-input'
      }]
    });

    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/add-two-item.ux`)));
  });

  test('add and remove item', () => {
    const genesis = new GenesisViewModel(document.body);
    const form = new ViewModel({
      ux: 'form-form'
    });
    genesis.add(form);

    // Add an item.
    form.addItem({
      ux: 'form.text-input'
    });
    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/add-one-item.ux`)));

    // Add another item.
    form.addItem({
      ux: 'form.text-input'
    });
    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/add-two-item.ux`)));

    // Remove an item.
    const removed = form.removeItem(0);
    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/after-detach.ux`)));
    expect(removed?.attachedTo).toEqual(undefined);

    // Add the removed item back at same position.
    if (removed) form.addItem(removed, 0);
    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/add-two-item.ux`)));
    expect(removed?.attachedTo).toEqual(form);

    // Move an item to different place.
    if (removed) genesis.add(removed);
    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/re-attached.ux`)));
    expect(removed?.attachedTo).toEqual(undefined);
  });

  test('detach and attachTo', () => {
    const genesis = new GenesisViewModel(document.body);
    genesis.add({
      ux: 'form-form',
      items: [{
        ux: 'form-text-input'
      }, {
        ux: 'form-text-input'
      }]
    });

    // @ts-ignore
    const detachedViewModel = genesis.items[0].items[0].detach();
    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/after-detach.ux`)));

    // Re-attach in different place.
    genesis.add(detachedViewModel);
    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/re-attached.ux`)));

    // Re-attach to original position.
    // @ts-ignore
    detachedViewModel.attachTo(genesis.items[0], 0);
    expect(prettyHtml(document.body.innerHTML))
      .toEqual(prettyHtml(readFile(`${__dirname}/expected/add-two-item.ux`)));
  });

  test('listeners', () => {
    const eventLogs: string[] = [];

    const genesis = new GenesisViewModel(document.body);
    const form = genesis.add({
      ux: 'form-form',
      items: [{
        ux: 'form-text-input'
      }, {
        ux: 'form-submit-button',
        listeners: {
          click: (vm: ViewModel, event: Event) => {
            eventLogs.push(`${vm.id} ${event.type}`);
          }
        }
      }]
    });

    document.body.getElementsByTagName('button')[0].click();

    // Update listener.
    form.items[1].listeners.click = (vm: ViewModel, event: Event) => {
      eventLogs.push(`${event.type} ${vm.id}`);
    }
    document.body.getElementsByTagName('button')[0].click();

    // Add new listener.
    form.items[0].listeners.click = (vm: ViewModel, event: Event) => {
      eventLogs.push(`${event.type} ${vm.id}`);
    }
    document.body.getElementsByTagName('input')[0].click();

    expect(eventLogs).toEqual(['ux-2 click', 'click ux-2', 'click ux-1']);
  });
});
