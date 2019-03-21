$(document).ready(function () {

	// Load nem-browser library
	var nem = require("nem-sdk").default;

    // Create an NIS endpoint object
	var endpoint = nem.model.objects.create("endpoint")(nem.model.nodes.defaultTestnet, nem.model.nodes.defaultPort);

	// Get an empty un-prepared transfer transaction object
	var tx = nem.model.objects.get("namespaceProvisionTransaction");

	// Get an empty common object to hold pass and key
	var common = nem.model.objects.get("common");

	/**
     * Function to update our fee in the view
     */
	function updateFee() {
		// New namespace
		tx.namespaceName = $("#namespacename").val();

		// Prepare the updated transfer transaction object
		var transactionEntity = nem.model.transactions.prepare("namespaceProvisionTransaction")(common, tx, nem.model.network.data.testnet.id);

		// Update parent name
		transactionEntity.parent = null;
		if($("#parentname").val().length >= 1)
		{
			transactionEntity.parent = $("#parentname").val()
		}
		console.log(transactionEntity);

		// Format fee returned in prepared object
		var rentalFeeString = nem.utils.format.nemValue(transactionEntity.rentalFee)[0] + "." + nem.utils.format.nemValue(transactionEntity.rentalFee)[1];

		console.log(rentalFeeString);

		//Set fee in view
		$("#rentalfee").val(rentalFeeString);

		// Format fee returned in prepared object
		var transactFeeString = nem.utils.format.nemValue(transactionEntity.fee)[0] + "." + nem.utils.format.nemValue(transactionEntity.fee)[1];

		console.log(transactFeeString);

		//Set fee in view
		$("#transactfee").val(transactFeeString);
	}

	/**
     * Build transaction from form data and send
     */
	function rent() {
		// Check form for errors
		if(!$("#privatekey").val()) return alert('Missing parameter !');

		// Set the private key in common object
		common.privateKey = $("#privatekey").val();

		// Check private key for errors
		if (common.privateKey.length !== 64 && common.privateKey.length !== 66) return alert('Invalid private key, length must be 64 or 66 characters !');
    	if (!nem.utils.helpers.isHexadecimal(common.privateKey)) return alert('Private key must be hexadecimal only !');

		// New namespace
		tx.namespaceName = $("#namespacename").val();

		var transactionEntity = nem.model.transactions.prepare("namespaceProvisionTransaction")(common, tx, nem.model.network.data.testnet.id);

	    // Update parent
		transactionEntity.parent = null;
		if($("#parentname").val().length >= 1)
		{
			transactionEntity.parent = $("#parentname").val();
		}
	
		nem.com.requests.chain.time(endpoint).then(function (timeStamp) {
		    const ts = Math.floor(timeStamp.receiveTimeStamp / 1000);
		    transactionEntity.timeStamp = ts;
		    const due = 60;
		    transactionEntity.deadline = ts + due * 60;

		    // Serialize transfer transaction and announce
		    nem.model.transactions.send(common, transactionEntity, endpoint).then(function(res){
				// If code >= 2, it's an error
				if (res.code >= 2) {
					alert(res.message);
				} else {
					alert(res.message);
				}
			}, function(err) {
				alert(err);
			});
		   
		}, function (err) {
			console.error(err);
		});
	}

	// On amount change we update fee in view
	$("#parentname").on('change keyup paste', function() {
	    updateFee();
	});

	// On message change we update fee in view
	$("#namespacename").on('change keyup paste', function() {
	    updateFee();
	});

	// Call send function when click on send button
	$("#rent").click(function() {
	  rent();
	});

});