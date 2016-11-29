const moment = require("moment");
const request = require("request-promise");
const states = require("../states");
const log = require("../log")(__filename);
const xmlescape = require("xml-escape");

module.exports = {
	'AMAZON.YesIntent': function() {
		this.handler.state = states.LIST;
		this.attributes.index = 0;
		this.emitWithState("ItemSummary");
	},
	'AMAZON.NoIntent': function() {
		this.handler.state = states.SEARCH;
		delete this.attributes.results;
		this.emit(":ask", "OK, no problem. What date or location would you like for me to search?");
	},
	'AMAZON.StartOverIntent': function() {
		this.emitWithState("AMAZON.NoIntent");
	},
	'AMAZON.RepeatIntent': function() {
		this.handler.state = states.SEARCH;
		this.emitWithState("DoSearch");
	},
	'AMAZON.HelpIntent': function() {
		this.emit(':ask', xmlescape(`To hear about the events I've found, you can say Yes otherwise, You can also give me a different location or date to search.`));
	},
	'Unhandled': function() {
		if(["LaunchRequest", "ClearDate", "SetDate", "SetLocation", "SetLocationAndClearDate", "AMAZON.StopIntent", "AMAZON.CancelIntent"].indexOf(this.event.request.intent.name)>=0) {
			delete this.attributes.results;
			this.handler.state = states.SEARCH;
			log(`Clearing search results and passing back to SEARCH.${this.event.request.intent.name}`);
			return this.emitWithState(this.event.request.intent.name);
		}
		const start_date = moment(this.attributes.start_date,"YYYY-MM-DD").format("dddd MMMM Do");
		this.emit(':ask', xmlescape(`I'm not sure what you meant. I've done a search for events within ${this.attributes.distance} miles of ${this.attributes.location} on or after ${start_date} and found ${this.attributes.total_results}. To hear about them, you can say Yes otherwise, You can also tell me a different location date to search.`));
	}
};
