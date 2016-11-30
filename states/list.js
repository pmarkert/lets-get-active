const moment = require("moment");
const request = require("request-promise");
const log = require("../log")(__filename);
const xmlescape = require("xml-escape");
const states = require("../states");

module.exports = {
	'ItemSummary': function() {
		const race = this.attributes.results[this.attributes.index];
		const output = `${race.name} is on ${race.date.readable} at ${race.location}`;
		log(`ItemSummary - ${output}`);
		this.emit(':ask', xmlescape(output), "You can say repeat that, more information, next, previous, or start over");
	},
	'ItemDetail': function() {
		const race = this.attributes.results[this.attributes.index];
		const output = `${race.name} is on ${race.date.readable} at ${race.location}`;
		this.emit(":ask", xmlescape(`More information about ${race_name} is not available yet.`));
	},
	'AMAZON.RepeatIntent': function() {
		this.emitWithState('ItemSummary');
	},
	'AMAZON.NextIntent': function() {
		if(this.attributes.index < this.attributes.results.length - 1) {
			this.attributes.index++;
			this.emitWithState("ItemSummary");
		}
		else {
			if(this.attributes.index < this.attributes.total_results - 1) {
				this.emit(":ask", "I still need to learn how to get the next page of results.");
			}
			else {
				this.emit(":ask", "There are no more results right now.");
			}
		}
	},
	'AMAZON.PreviousIntent': function() {
		if(this.attributes.index > 0) {
			this.attributes.index--;
			this.emitWithState("ItemSummary");
		}
		else {
			this.emit(":ask", "That is the first race in the list.");
		}
	},
	'AMAZON.HelpIntent': function () {
		this.emit(':ask', "You can ask me to repeat the summary, go to the next item, go to the previous item, or start over");
	},
	'AMAZON.StartOverIntent': function() {
		delete this.attributes.index;
		delete this.attributes.results;
		this.handler.state = states.SEARCH;
		this.emitWithState("DoSearch");
	},
	'AMAZON.CancelIntent': function () {
		this.emitWithState('AMAZON.StopIntent');
	},
	'AMAZON.StopIntent': function () {
		this.emit("AMAZON.StopIntent");
	},
	'SessionEndedRequest': function () {
		this.emit("AMAZON.StopIntent");
	},
	'Unhandled': function() {
		this.emit(':ask', "I'm sorry, I'm not sure what you meant. You can ask me to repeat the summary, go to the next item, go to the previous item, or start over");
	}
};
