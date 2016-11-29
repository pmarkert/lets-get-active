const Alexa = require('alexa-sdk');
const states = require("./states");
const log = require("./log");

ACTIVE_API_KEY = process.env.ACTIVE_API_KEY;

var states_none = require("./states/none");
var states_goto_list = require("./states/goto_list");
var states_list = require("./states/list");

exports.handler = (event, context) => {
	log(JSON.stringify(event, null, 2));
	const alexa = Alexa.handler(event, context);
	alexa.appId = "amzn1.ask.skill.9200600c-ea41-4400-adbe-beb6efef00b1";
	alexa.registerHandlers(Alexa.CreateStateHandler(states.NONE, states_none));
	alexa.dynamoDBTableName = process.env.DYNAMO_TABLE;
	alexa.execute();
};
