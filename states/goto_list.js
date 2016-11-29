const moment = require("moment");
const request = require("request-promise");
const states = require("../states");
const log = require("../log");

module.exports = {
	'LaunchRequest': function () {
		delete this.attributes.state;
		delete this.attributes.results;
		this.emitWithState('DoSearch'); 
	},
	'AMAZON.YesIntent': function() {
		this.attributes.state = states.LIST;
		this.attributes.index = 0;
		this.emitWithState("ItemSummary");
	},
	'AMAZON.NoIntent': function() {
		delete this.attributes.state;
		this.emitWithState(":ask", "OK, no problem. What other date or location would you like for me to search?");
	},
	'Unhandled': function() {
		const start_date = moment(this.attributes.start_date,"YYYY-MM-DD").format("dddd MMMM Do");
		this.emit(':ask', `Do you want to hear about the ${this.attributes.total_results} events that I found within ${this.attributes.distance} miles of ${this.attributes.location} on or after ${start_date}?`);
	}
};
