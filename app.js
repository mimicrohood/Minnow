const links=[...document.querySelectorAll('nav a[href^="#"]')];
const sections=links.map(link=>document.querySelector(link.getAttribute('href'))).filter(Boolean);
const observer=new IntersectionObserver(entries=>{const current=entries.filter(entry=>entry.isIntersecting)[0];if(!current)return;links.forEach(link=>link.classList.toggle('on',link.hash===`#${current.target.id}`));},{rootMargin:'-30% 0px -60%'});
sections.forEach(section=>observer.observe(section));
document.querySelectorAll('.faqs details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)document.querySelectorAll('.faqs details').forEach(other=>{if(other!==item)other.open=false;});}));
