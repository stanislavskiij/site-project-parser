let btn = document.querySelector(".search");
let inn = document.querySelector("input");
console.log(inn);
console.log(btn);
btn.addEventListener('click', function(event){
    event.preventDefault();
    console.log(inn.value);
    let requestURL = `http://5c506c1fd7cf.ngrok.io/api/${inn.value}`;
    inn.value = "";

    let xhr = new XMLHttpRequest();
    xhr.open('GET', requestURL);
    xhr.send();
    console.log(xhr.responseText);
});