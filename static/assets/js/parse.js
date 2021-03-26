let personalArea = document.querySelector('.personalArea');
let input = document.querySelector('input');
let btn = document.querySelector('.search');
console.log(btn);
input.addEventListener('input', (event)=>{
    event.preventDefault();
    btn.setAttribute('href', `/parse/${input.value}`);
});
