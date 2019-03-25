// Include the library
var nem = require("nem-sdk").default;

// Create an NIS endpoint object
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);

// Create a common object holding key 
var common = nem.model.objects.create("common")("", "PRIVATE_KEY");

// Get a MosaicDefinitionCreationTransaction object
var tx = nem.model.objects.get("mosaicDefinitionTransaction");

// Define the mosaic
tx.mosaicName = "mymosaic1";
tx.namespaceParent = {
	"fqn": "ateneo"
};
tx.mosaicDescription = "My mosaic";

// Set properties (see https://nemproject.github.io/#mosaicProperties)
tx.properties.initialSupply = 5000000;
tx.properties.divisibility = 0;
tx.properties.transferable = true;
tx.properties.supplyMutable = true;

return console.log(tx);

// Prepare the transaction object
var transactionEntity = nem.model.transactions.prepare("mosaicDefinitionTransaction")(common, tx, nem.model.network.data.testnet.id);

// Serialize transfer transaction and announce
nem.com.requests.chain.time(endpoint).then(function (timeStamp) {
    const ts = Math.floor(timeStamp.receiveTimeStamp / 1000);
    transactionEntity.timeStamp = ts;
    const due = 60;
    transactionEntity.deadline = ts + due * 60;
   
    console.log(transactionEntity);
   
    nem.model.transactions.send(common, transactionEntity, endpoint).then(function(res){
        console.log(res);
    }, function(err){
        console.log(err);
    });
   
}, function (err) {
    console.error(err);
});