// Constants cannot be changed after they are set
const TAX_RATE = 0.13;

/* These are values that we would typically get from a text 
   field or some other kind of input field on our webpage. 
   Variables are typically declared with let. */
let price= Number("49.99");
console.log(`price is: ${price}`); // 49.99

let payment = 60.00;
let applyDiscount = true; 

// The ?: does the same as: if (applyDiscount) newPrice = price*0.9; else newPrice = price;
let newPrice = applyDiscount ? price * 0.9 : price;

console.log(`newPrice is: ${newPrice}`); 

let tax = newPrice * TAX_RATE; 
let total = newPrice + tax;
let change = payment - total;

// Here is the output
const output = `
Product Price: $${price.toFixed(2)}
${applyDiscount ? `Discounted Price: $${newPrice.toFixed(2)}` : ''}
Tax: $${tax.toFixed(2)}
-------------------------
Subtotal: $${total.toFixed(2)}
Amount Tendered: $${payment.toFixed(2)}
=========================
Change Due: $${change.toFixed(2)}
`;
console.log(output);

