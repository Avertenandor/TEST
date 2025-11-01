export default {
  async mount(root) {
    const res = await fetch('/public/modules/testimonials/template.html');
    root.innerHTML = await res.text();
    return () => { root.innerHTML = ''; };
  }
};


