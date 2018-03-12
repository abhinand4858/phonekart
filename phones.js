'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var router = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var temp;

var salesRecord = [ 
    { model: "Note4", quantity: 10, customer: "ram1989", invoiceNumber: "AA000", returned: false, sale: false}
];

var deals = [
    { model: "Note4", quantity: 5, price: 1000, sold : 0, status : 'close' }
];


var phones = [
        { model: "Note4", manufacturer: "Samsung", price: 10000, quantity: 10  },
        { model: "S9", manufacturer: "Samsung", price: 60000, quantity: 6 },
        { model: "Note5", manufacturer: "Redmi", price: 12000, quantity: 5 },
        { model: "5A", manufacturer: "Redmi", price: 9000, quantity: 15  },
        { model: "G5s", manufacturer: "Moto", price: 16000, quantity: 9 },
        { model: "Z2", manufacturer: "Moto", price: 24000, quantity: 2 },
        { model: "H1", manufacturer: "Honor", price: 18000, quantity: 5 },
        { model: "H2", manufacturer: "Honor", price: 22000, quantity: 1 },
        { model: "F6", manufacturer: "OPPO", price: 25000, quantity: 4 },
        { model: "F5", manufacturer: "OPPO", price: 20000, quantity: 12  },
];

app.get('/', function (req, res) {
    console.log("Hello world");
    res.send("Welcome to phoneKart!");
})

app.get('/get-items', function (req, res) {

    var key;
    var ph = [];

    if (key = req.param('manufacturer')){
        for (var i=0; i<phones.length; i+=1) {
            if (phones[i].manufacturer.toLowerCase() == key.toLowerCase()) {
                ph.push(phones[i]); 
            }
        }
    }
    
    if (key = req.param('model')) {
        // if ph contains entries added from manufacturer
        if(ph.length>0) {
            for (var i=0; i<ph.length; i+=1) {
                if (ph[i].model.toLowerCase() != key.toLowerCase()) {
                    ph.splice(i, 1);
                    i--;
                }
            } 
        } else {   //if model is the first param
            for (var i=0; i<phones.length; i+=1) {
                if (phones[i].model.toLowerCase() == key.toLowerCase()) {
                    ph.push(phones[i]); 
                }
            }
        }  
    }
    
    if (key = req.param('max-price')) {
        if(ph.length>0) {
            for (var i=0; i<ph.length; i+=1) {
                if (ph[i].price > key) {
                    ph.splice(i, 1);
                    i--;
                }
            } 
        } else {   //if max-price is the first param
            for (var i=0; i<phones.length; i+=1) {
                if (phones[i].price < key) {
                    ph.push(phones[i]); 
                }
            }
        }  
        
    }
    
    if (key = req.param('min-price')) {
        if(ph.length>0) {
            for (var i=0; i<ph.length; i+=1) {
                if (ph[i].price < key) {
                    ph.splice(i, 1);
                    i--;
                }
            }
        } else {   //if min-price is the first param
            for (var i=0; i<phones.length; i+=1) {
                if (phones[i].price > key) {
                    ph.push(phones[i]); 
                }
            }
        }  

    }
    
    if (ph.length >0) 
        res.send(ph);
    else res.send(phones);
})

function getInvoice() {
    var r;
    r = Math.random();
    var char1 = String.fromCharCode(r*25+65);
    r = Math.random();
    var char2 = String.fromCharCode(r*25+65);
    r = Math.random();
    var dig1 = String.fromCharCode(r*9+48);
    r = Math.random();
    var dig2 = String.fromCharCode(r*9+48);
    r = Math.random();
    var dig3 = String.fromCharCode(r*9+48);
    return (char1+char2+dig1+dig2+dig3);
}

app.get('/buy', function (req, res){
    
    var mod, cus, inv, qty, curr, f=0;

    cus = req.param('cus-id');
    mod = req.param('model');
    qty = req.param('quantity');

    
    if (cus && mod && qty) {
        //check if deal is available for specific model
        for (var i=0; i<deals.length; i+=1) {
            if(deals[i].model.toLowerCase() == mod.toLowerCase() && deals[i].quantity-deals[i].sold >= qty && deals[i].status == 'open') {
                curr = getInvoice();
                //duplicate invoices are handled here
                for(var j=0;j<salesRecord.length;j++) {
                    if(salesRecord[j].invoiceNumber == curr) {
                        j=-1;
                        curr = getInvoice();
                    }
                }
                salesRecord.push({model:deals[i].model, quantity:qty, customer:cus, invoiceNumber:curr, returned: false, sale: true });
                phones[i].quantity-=qty;
                deals[i].sold=parseInt(deals[i].sold)+parseInt(qty);
                f=1;
            }
        }

        if(f==0) {
        //handle order not in sale
            for (var i=0; i<phones.length; i+=1) {

                if (phones[i].model.toLowerCase() == mod.toLowerCase()) {
                    
                    //checks stock left (quantity)
                    if(phones[i].quantity <= 0) {
                        res.send(mod+" sold out. Currently out of stock!");
                    } else if(phones[i].quantity >= qty) {

                        curr = getInvoice();

                        //duplicate invoices are handled here
                        for(var j=0;j<salesRecord.length;j++) {
                            if(salesRecord[j].invoiceNumber == curr) {
                                j=-1;
                                curr = getInvoice();
                            }
                        }                   
                        salesRecord.push({model:phones[i].model, quantity:qty, customer:cus, invoiceNumber:curr, returned: false, sale: false});
                        phones[i].quantity-=qty;
                    }
                }
            }
        }

        res.send(salesRecord); 

    } else res.send("Pass model, customer-id, quantity");

})


app.get('/getSalesRecord', function (req, res) {
    res.send(salesRecord);
})


app.get('/return', function (req, res) {
    var key;

    if(key = req.param('invoiceNumber')) {

        for(var i=0;i<salesRecord.length;i++) {
            //if invoice matches
            if (salesRecord[i].invoiceNumber == key && salesRecord[i].returned  == false && salesRecord[i].sale == false) {
                for (var j=0; j<phones.length; j+=1) {
                    //finding invoice model in phones
                    if (phones[j].model.toLowerCase() == salesRecord[i].model.toLowerCase()) {
                        phones[j].quantity+=salesRecord[i].quantity;
                        salesRecord[i].returned = true;
                    }
                }  
            }
        }
        res.send(salesRecord);
        console.log(phones);
    }
})

//function to close the deal on timeout
function disable(i, temp, mod) { 
    for(var j=0;j<deals.length;j++) {
        if (deals[j].model.toLowerCase() == mod.toLowerCase()) deals[j].status = 'close';
    }
    console.log("i="+i)
    phones[i].price = temp;  
}

app.get('/start-deal', function (req, res) {
    var mod, qty, price, time;

    mod = req.param('model');
    qty = req.param('quantity');
    price = req.param('price');
    time = req.param('time');

    if (mod && qty && price && time) {
        for(var i=0;i<phones.length;i++) {
            if(phones[i].model.toLowerCase() == mod.toLowerCase() && phones[i].quantity > qty) {
                deals.push({model:phones[i].model, quantity:qty,'price':price, sold: 0, status: 'open' });

                temp = phones[i].price; 
                phones[i].price = price;
                var pos = i;
                //disabling the status flag after given time
                setTimeout(function() {
                    disable(pos, temp, mod);
                }, time);
                res.send("Deal added");
            }
        }
    } else res.send('Pass model name, quantity, price and time of deal');
    
})

//list out the deals
app.get('/show-deals', function (req, res) {
    res.send(deals);
})

app.listen(9999, function (err) {
  if (err) {
    throw err
  }
  console.log('Server started on port 9999');
})