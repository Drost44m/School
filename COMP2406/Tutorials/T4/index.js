const heading = document.querySelector('h1');
heading.innerHTML = "Welcome to The Laughing Ladle<br>Enjoy Your Visit!";

const par = document.getElementById('good-deal');
par.innerHTML = "<i>" + par.textContent + "</i>";

const promo = document.getElementsByClassName('promo');
promo[0].style.backgroundColor = '#fff200';
 
const p = promo[0].querySelector('p');
p.style.fontWeight = 'normal';