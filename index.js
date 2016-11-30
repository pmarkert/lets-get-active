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
			if(process.env.DYANMO_TABLE) {
				this.emit(':saveState', true); // Be sure to call :saveState to persist your session attributes in DynamoDB
			}
			else {
				this.emit(":tell", "Session ended.");
			}
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
