export default { async mount(root){ const r=await fetch('/modules/deposits-overview/template.html'); root.innerHTML=await r.text(); return ()=>{root.innerHTML='';}; } };

