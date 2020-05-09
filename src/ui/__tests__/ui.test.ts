describe('build layout', () => {
  test('layout', () => {
    // @ts-ignore
    window.ui.render({});
    console.log(document.body.innerHTML);
  });
});