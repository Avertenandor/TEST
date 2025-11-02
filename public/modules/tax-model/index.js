export default { async mount(root){ const r=await fetch('/modules/tax-model/template.html'); root.innerHTML=await r.text(); return ()=>{root.innerHTML='';}; } };
