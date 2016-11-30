const Alexa = require('alexa-sdk');
const states = require("./states");
const log = require("./log")(__filename);

ACTIVE_API_KEY = process.env.ACTIVE_API_KEY;

exports.handler = (event, context) => {
	log(JSON.stringify(event, null, 2));
	const alexa = Alexa.handler(event, context);
	alexa.appId = process.env.APP_ID; 
	alexa.registerHandlers({ 
		"LaunchRequest": function() {
			log("Attributes - " + JSON.stringify(this.attributes, null, 2));
			this.handler.state = states.SEARCH;
			delete this.attributes.start_date;
			this.emitWithState("LaunchRequest");
		},
		'SessionEndedRequest': function () {
			this.emit("AMAZON.StopIntent");
		},
		"AMAZON.StopIntent": function() {
			this.handler.state = states.SEARCH;
			delete this.attributes.results;
			delete this.attributes.index;
			delete this.attributes.start_date;
			delete this.attributes.total_results;
			log("Persisting attributes - " + JSON.stringify(this.attributes, null, 2));
			if(process.env.DYANMO_TABLE) {
				this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
			}
			this.emit(':tell', "No problem. Remember, an active lifestyle keeps you both happy and healthy!");
		},
		"Unhandled": function() {
			if(this.event.request.intent) {
				this.handler.state = states.SEARCH;
				this.emitWithState(this.event.request.intent.name);
			}
		}
	});
	for(var key in states) {
		alexa.registerHandlers(Alexa.CreateStateHandler(states[key], require("./states/" + states[key].substr(1))));
	}
	alexa.dynamoDBTableName = process.env.DYNAMO_TABLE;
	alexa.execute();
};
