export default { async mount(root){ const r=await fetch('/modules/mev-detailed/template.html'); root.innerHTML=await r.text(); return ()=>{root.innerHTML='';}; } };
