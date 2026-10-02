const categories = [ 'Specials', 'Mains', 'For Kids', 'Gluten-Free' ];


let totalLength = categories.reduce((sum, cat) => sum + cat.length, 0);
console.log(totalLength);

let result1 = categories.reduce((str, cat) => str + ', ' + cat);
console.log(result1);
 
let result2 = categories.reduce((count, cat) =>
    cat.toLowerCase().endsWith('s') ? count + 1 : count, 0);
console.log(result2);