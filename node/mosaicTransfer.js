// Include the library
var nem = require("nem-sdk").default;

// Create an NIS endpoint object
var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);

// Create a common object holding key 
var common = nem.model.objects.create("common")("", "PRIVATE_KEY");

// Create variable to store our mosaic definitions, needed to calculate fees properly (already contains xem definition)
var mosaicDefinitionMetaDataPair = nem.model.objects.get("mosaicDefinitionMetaDataPair");

// Create an un-prepared mosaic transfer transaction object (use same object as transfer tansaction)
var transferTransaction = nem.model.objects.create("transferTransaction")("TAMGBBNOVYYITGZ4KK2U7SE2VNQNCP4D63HABXP7", 0, "");

// Create a mosaic attachment object
var mosaicAttachment = nem.model.objects.create("mosaicAttachment")("ateneo", "mymosaic1", 5000);

// Push attachment into transaction mosaics
transferTransaction.mosaics.push(mosaicAttachment);

// Prepare the transfer transaction object
var transactionEntity = nem.model.transactions.prepare("mosaicTransferTransaction")(common, transferTransaction, mosaicDefinitionMetaDataPair, nem.model.network.data.testnet.id);

// Adjust timestamp and deadline
nem.com.requests.chain.time(endpoint).then(function (timeStamp) {
	const ts = Math.floor(timeStamp.receiveTimeStamp / 1000);
	transactionEntity.timeStamp = ts;
	const due = 60;
	transactionEntity.deadline = ts + due * 60;

	transactionEntity.fee = 400000;
	
	console.log(transactionEntity);	

	// Serialize transfer transaction and announce
	nem.model.transactions.send(common, transactionEntity, endpoint).then(function(res){
		console.log(res);
	}, function(err){
		console.log(err);
	});
	
}, function (err) {
	console.error(err);
});