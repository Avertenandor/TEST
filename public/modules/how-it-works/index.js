export default {
  async mount(root) {
    const res = await fetch('/public/modules/how-it-works/template.html');
    root.innerHTML = await res.text();
    return () => { root.innerHTML = ''; };
  }
};


