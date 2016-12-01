const log = require("../log")(__filename);
const xmlescape = require("xml-escape");
const states = require("../states");

module.exports = {
	'ListItems': function() {
		var output = "Here are the 3 most popular events. Number ";
		for(var i=0;i<3;i++) {
			var race = this.attributes.results[i];
			output += `${i+1} is the ${race.name}, on ${race.date.readable}, in ${race.location}. `;
		}
		output + "You can ask me for more information about a specific event by number."
		this.attributes.index = 2; // Set the user up for #4 to be next
		this.emit(":ask", xmlescape(output), "You can ask me to repeat that, or give me a specific number, or I can start over with a new search.");
	},
	'AMAZON.RepeatIntent': function() {
		this.emitWithState('ListItems');
	},
	'AMAZON.HelpIntent': function () {
		this.emit(':ask', "You can navigate the list by telling me to goto a specific number. You can also ask me to repeat the list, or start over.");
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
		if(this.event.request.intent && ["LaunchRequest", "ClearDate", "SetDate", "SetLocation", "SetLocationAndClearDate"].indexOf(this.event.request.intent.name)>=0) {
			delete this.attributes.results;
			this.handler.state = states.SEARCH;
			log(`Clearing search results and passing back to SEARCH.${this.event.request.intent.name}`);
			return this.emitWithState(this.event.request.intent.name);
		}
		else if(this.event.request.intent && ["GotoNumber", "AMAZON.NextIntent", "AMAZON.PreviousIntent", "ItemSummary", "ItemDetail" ].indexOf(this.event.request.intent.name)>=0) {
			this.handler.state = states.LIST;
			return this.emitWithState(this.event.request.intent.name);
		}
		else {
			this.emit(':ask', "I'm sorry, I'm not sure what you meant. You can ask me to repeat the summary, go to the next item, go to the previous item, or start over");
		}
	}
};
