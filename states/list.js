const moment = require("moment");
const request = require("request-promise");
const log = require("../log");

module.exports = {
	'LaunchRequest': function () {
		delete this.attributes.state;
		delete this.attributes.results;
		this.emitWithState('DoSearch'); 
	},
	'ItemSummary': function() {
		const result = this.attributes.result;
		const race = result.results[this.attributes.index];
		const race_name = race.assetName;
		const race_location = race.place.placeName;
		const race_date = moment(new Date(race.activityRecurrences[0].activityStartDate)).format("dddd MMMM Do");
		const output = `${race_name} is on ${race_date} at ${race_location}`;
		log(`ItemSummary - ${output}`);
		this.emit(':ask', output, "You can say repeat that, more information, next, previous, or start over");
	},
	'ItemDetail': function() {
		const result = this.attributes.result;
		const race = result.results[this.attributes.index];
		const race_name = race.assetName;
		const race_location = race.place.placeName;
		const race_date = moment(new Date(race.activityRecurrences[0].activityStartDate)).format("dddd MMMM Do");
		const output = `${race_name} is on ${race_date} at ${race_location}`;
		this.emit(":ask", `More information about ${race_name} is not available yet.`);
	},
	'AMAZON.RepeatIntent': function() {
		this.emit('ItemSummary');
	},
	'AMAZON.NextIntent': function() {
		const result = this.attributes.result;
		if(this.attributes.index < result.results.length - 1) {
			this.attributes.index++;
			this.emit("ItemSummary");
		}
		else {
			if(this.attributes.index < result.total_results - 1) {
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
			this.emit("ItemSummary");
		}
		else {
			this.emit(":ask", "That is the first race in the list.");
		}
	},
	'AMAZON.HelpIntent': function () {
		this.emit(':ask', "You can ask me to repeat the summary, go to the next item, go to the previous item, start over, or start over");
	},
	'AMAZON.StartOverIntent': function() {
		delete this.attributes.state;
		this.emitWithState("DoSearch");
	},
	'AMAZON.CancelIntent': function () {
		this.emit('AMAZON.StopIntent');
	},
	'AMAZON.StopIntent': function () {
		this.emit(':tell', "No problem. Just remember that an active lifestyle keeps you happy and healthy.");
	},
	'Unhandled': function() {
		this.emit(':ask', "I'm sorry, I'm not sure what you meant. You can ask me to repeat the summary, go to the next item, go to the previous item, start over, or start over");
	}
};
