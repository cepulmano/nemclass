var nem = require('nem-sdk').default;
var endpoint = nem.model.objects.create('endpoint')(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);
const privKey = 'yourprivatekey';
const passWord = 'yourpasssword';
const toAddress = 'TAKZVW3H4HSZDZK3KBY7AKJLSM6KYQOG3IZN5I5K';
const myNamespace = 'gameworkz';
const myMosaicName = 'gwz';
var sendMosaicAmount = 10000000000;

var common = nem.model.objects.create('common')(passWord,privKey);

var transferTransaction =  nem.model.objects.create('transferTransaction')(toAddress, 1, "");

console.log(transferTransaction);

var myMosaic = nem.model.objects.create('mosaicAttachment')(myNamespace, myMosaicName, sendMosaicAmount);
	transferTransaction.mosaics.push(myMosaic);

console.log(myMosaic);

//==========================================================================================================================//
// Get the mosaic definition to calculate the fee correctly
//==========================================================================================================================//
var mosaicDefinitionMetaDataPair = nem.model.objects.get('mosaicDefinitionMetaDataPair');

console.log(mosaicDefinitionMetaDataPair);

nem.com.requests.namespace.mosaicDefinitions(endpoint, myMosaic.mosaicId.namespaceId).then(res=>{

	// Get mosaic definition and store in mosaic definition object
	var neededDefinition = nem.utils.helpers.searchMosaicDefinitionArray(res.data,[myMosaicName]);

	console.log(neededDefinition);

	// Get the name of the mosaic for use in the mosaic definition object
	var fullMosaicName = nem.utils.format.mosaicIdToName(myMosaic.mosaicId);

	console.log(fullMosaicName);

	// Check existence of mosaic
	if (undefined === neededDefinition[fullMosaicName]){
		return  console.log('Mosaic not found!');
	}

	// Add mosaic definition to mosaic definition object
	mosaicDefinitionMetaDataPair[fullMosaicName] = {};
	mosaicDefinitionMetaDataPair[fullMosaicName].mosaicDefinition = neededDefinition[fullMosaicName];

	nem.com.requests.mosaic.supply(endpoint, fullMosaicName).then(supplyRes=>{

		// Set supply amount to mosaicDefinitionMetaDataPair.
		mosaicDefinitionMetaDataPair[fullMosaicName].supply = supplyRes.supply ;

		// Prepare to sign and send the transaction
		var transactionEntity = nem.model.transactions.prepare('mosaicTransferTransaction')(common, transferTransaction, mosaicDefinitionMetaDataPair, nem.model.network.data.testnet.id);

		console.log(transactionEntity);

		nem.com.requests.chain.time(endpoint).then(function (timeStamp){
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
	}, function (err) {
		console.error(err);
	});
}, function (err) {
	console.error(err);
});