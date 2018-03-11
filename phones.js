'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var router = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var salesRecord = [ 
    { model: "Note4", quantity: 10, customer: "ram1989", invoiceNumber: "AA000", returned: false}
];

var deals = [
    { model: "Note4", quantity: 10, price: 1000}
];


var phones = [
        { model: "Note", manufacturer: "Samsung", price: 10000, quantity: 10  },
        { model: "S9", manufacturer: "Samsung", price: 60000, quantity: 6 },
        { model: "Note5", manufacturer: "Redmi", price: 12000, quantity: 5 },
        { model: "Note4", manufacturer: "Redmi", price: 9000, quantity: 15  },
        { model: "G5s", manufacturer: "Moto", price: 16000, quantity: 9 },
        { model: "Z2", manufacturer: "Moto", price: 24000, quantity: 2 },
        { model: "H1", manufacturer: "Honor", price: 18000, quantity: 5 },
        { model: "H2", manufacturer: "Honor", price: 22000, quantity: 1 },
        { model: "F6", manufacturer: "OPPO", price: 25000, quantity: 4 },
        { model: "F5", manufacturer: "OPPO", price: 20000, quantity: 12  },
];

app.get('/', function (req, res) {
  console.log("Hello world");
  res.send('Hello world');
})

app.get('/get-items', function (req, res) {

    var key;
    var ph;

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
        for (var i=0; i<ph.length; i+=1) {
            if (ph[i].price > key) {
                ph.splice(i, 1);
                i--;
            }
        }
    }
    
    if (key = req.param('min-price')) {
        for (var i=0; i<ph.length; i+=1) {
            if (ph[i].price < key) {
                ph.splice(i, 1);
                i--;
            }
        }
    }
    
    res.send(ph);
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
    
    var mod, cus, inv, f=0, curr;
    if(cus = req.param('cus-id')) {
        if (mod = req.param('model')) {
            for (var i=0; i<phones.length; i+=1) {
                if (phones[i].model.toLowerCase() == mod.toLowerCase()) {
                    
                    //stock left (quantity) > 0
                    if(phones[i].quantity <= 0) {
                        res.send(mod+" sold out. Currently out of stock!");
                    }

                    //check if the same customer have bought the same model before
                    for(var j=0;j<salesRecord.length;j++) {
                        if(salesRecord[j].customer.toLowerCase() == cus.toLowerCase() && salesRecord[j].model.toLowerCase() == mod.toLowerCase()) {
                            salesRecord[j].quantity++;
                            f=1;
                        }
                    }

                    if (f == 0) {
                        curr = getInvoice();
                        for(var j=0;j<salesRecord.length;j++) {
                            if(salesRecord[j].invoiceNumber == curr) {
                                j=0;
                                curr = getInvoice();
                            }
                        }
                        console.log("returned");
                        salesRecord.push({model:phones[i].model, quantity:1, customer:cus, invoiceNumber:curr, returned: false});
                    }
                    phones[i].quantity-=1;
                    res.send(salesRecord);
                }
            }
        } else res.send("Pass specific model");
    }

})


app.get('/getSalesRecord', function (req, res) {
    res.send(salesRecord);
})


app.get('/return', function (req, res) {
    var key;

    if(key = req.param('invoiceNumber')) {

        for(var i=0;i<salesRecord.length;i++) {
            //if invoice matches
            if (salesRecord[i].invoiceNumber == key && salesRecord[i].returned  == false) {
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



app.get('/start-deal', function (req, res) {
    var mod, qty, price, time;

    mod = req.param('model');
    qty = req.param('quantity');
    price = req.param('price');
    time = req.param('time');

    if (mod && qty && price && time) {
        for(var i=0;i<phones.length;i++) {
            if(phones[i].model == mod && phones[i].quantity > qty) {
                deals.push({model:mod, quantity:qty, 'price':price});
                setTimeout(function() {
                    for(var j=0;j<deals.length;j++) {
                        if (deals[j].model == mod) deals.splice(i)
                    }
                }, time)
            }
        }
    } else res.send('Pass all the params');
    res.send("done");
})

app.listen(9999, function (err) {
  if (err) {
    throw err
  }
  console.log('Server started on port 9999');
})