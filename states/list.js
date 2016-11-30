const moment = require("moment");
const request = require("request-promise");
const log = require("../log")(__filename);
const xmlescape = require("xml-escape");
const states = require("../states");

module.exports = {
	'ItemSummary': function() {
		const race = this.attributes.results[this.attributes.index];
		const output = `Event number ${this.attributes.index+1} is, the ${race.name}, on ${race.date.readable}, located at ${race.location}`;
		log(`ItemSummary - ${output}`);
		this.emit(':ask', xmlescape(output), "You can say repeat that, more information, next, previous, goto a specific number,  or start over");
	},
	'ItemDetail': function() {
		const race = this.attributes.results[this.attributes.index];
		const output = `${race.name} is on ${race.date.readable} at ${race.location}`;
		this.emit(":ask", xmlescape(`More information about ${race.name} is not available yet.`));
	},
	'GotoNumber': function() {
		const index = this.event.request.intent.slots.index.value;
		if(index <= this.attributes.total_results && index >= 1) {
			if(index >= this.attributes.results.length) {
				this.emit(":ask", "I'm sorry, I currently only have access to the first 10 results.");
			} 
			else {
				this.attributes.index = index - 1;
				this.emitWithState("ItemSummary");
			}
		}
		else {
			this.emit(":ask", "I'm sorry, that number is either too high or too low.");
		}
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
		this.emit(':ask', "You can say repeat, next, previous, or start over");
	},
	'AMAZON.StartOverIntent': function() {
		this.handler.state = states.LIST;
		this.attributes.index = 0;
		this.emitWithState("ItemSummary");
	},
	'AMAZON.CancelIntent': function () {
		this.emit('AMAZON.StopIntent');
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
