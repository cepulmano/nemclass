// Include the library
var nem = require("nem-sdk").default;

// Create an NIS endpoint object
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);

// Create a common object holding key
var common = nem.model.objects.create("common")("", "PRIVATE_KEY");

// Create an un-prepared transfer transaction object
var transferTransaction = nem.model.objects.create("transferTransaction")("RECEPIENT_WALLET", 200, "");

// Prepare the transfer transaction object
var transactionEntity = nem.model.transactions.prepare("transferTransaction")(common, transferTransaction, nem.model.network.data.testnet.id);

// Serialize transfer transaction and announce
nem.com.requests.chain.time(endpoint).then(function (timeStamp) {
    const ts = Math.floor(timeStamp.receiveTimeStamp / 1000);
    transactionEntity.timeStamp = ts;
    const due = 60;
    transactionEntity.deadline = ts + due * 60;
      
    nem.model.transactions.send(common, transactionEntity, endpoint).then(function(res){
        console.log(res);
    }, function(err){
        console.log(err);
    });
   
}, function (err) {
    console.error(err);
});