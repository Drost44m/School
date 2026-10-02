const categoriesArray = [ 'Appetizers', 'Mains', 'Desserts', 'Drinks' ];
//console.log(categoriesArray);

let categoriesObject = {
    "d3": 'Desserts', 
    "y2": 'Appetizers',
    "a0": 'Gluten-Free',
    "x5": 'Drinks',
    "d3": 'For Kids',
    "f1": 'Drinks',
    "y6": 'Drinks',
    "a0": 'Mains'
}
//console.log(categoriesObject);

console.log(Object.keys(categoriesObject));  
console.log(Object.values(categoriesObject));
console.log(Object.entries(categoriesObject));

console.log(categoriesObject.d3);
console.log(categoriesObject.a0);



let key = Object.keys(categoriesObject).filter(k => categoriesObject[k] === 'Drinks');
console.log(key);

