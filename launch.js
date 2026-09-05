const steps=[...document.querySelectorAll('.form-step')];
const stepButtons=[...document.querySelectorAll('[data-step-target]')];
const prev=document.querySelector('#prev');
const next=document.querySelector('#next');
const label=document.querySelector('#step-label');
let current=1;
function showStep(number){current=Math.max(1,Math.min(5,number));steps.forEach(step=>step.classList.toggle('active',+step.dataset.step===current));stepButtons.forEach(button=>{const n=+button.dataset.stepTarget;button.classList.toggle('active',n===current);button.classList.toggle('complete',n<current);});prev.disabled=current===1;next.textContent=current===5?'Review launch':'Continue';label.textContent='Step '+current+' of 5';window.scrollTo({top:document.querySelector('.launch-workspace').offsetTop-80,behavior:'smooth'});}
prev.addEventListener('click',()=>showStep(current-1));
next.addEventListener('click',()=>{if(current<5)showStep(current+1);else alert('Launch configuration ready for review.');});
stepButtons.forEach(button=>button.addEventListener('click',()=>showStep(+button.dataset.stepTarget)));
document.querySelectorAll('textarea[maxlength]').forEach(area=>area.addEventListener('input',()=>{const count=document.querySelector('[data-count='+area.name+']');if(count)count.textContent=area.value.length;}));
