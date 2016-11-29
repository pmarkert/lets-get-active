const moment = require("moment");
const request = global.TEST_MODE ? require("../test/rp_mock") : require("request-promise");
const states = require("../states");
const log = require("../log")(__filename);
const xmlescape = require("xml-escape");

function transform_results(result) {
	const results = [];
	for (var i=0; i<result.results.length; i++) {
		var race = result.results[i];
		var race_date = moment(new Date(race.activityRecurrences[0].activityStartDate));
		results.push({ 
			name : race.assetName, 
			location : race.place.placeName, 
			date : { value: race_date.format("YYYY-MM-DD"), readable: race_date.format("dddd MMMM Do") }
		});
	}
	return results;
}

module.exports = {
	'LaunchRequest': function () {
		if(this.attributes.location) {
			return this.emit("DoSearch");
		}
		return this.emit(":ask", "Let’s get active! I'll help you find some local races and activities. Let’s start with a location. In what city would you like me to search?", "You can give me any US city, state, or zipcode.");
	},
	'DoSearch': function () {
		if(!this.attributes.location) {
			return this.emitWithState("LaunchRequest");
		}

		if(!this.attributes.start_date) { // Default search for today
			this.attributes.start_date = global.TEST_MODE ? "2016-11-28" : moment().format("YYYY-MM-DD");
		}

		const location_formatted = encodeURIComponent(this.attributes.location);
		const start_date = moment(this.attributes.start_date, "YYYY-MM-DD"); 
		this.attributes.distance = this.attributes.distance || "20";

		const url = `http://api.amp.active.com/v2/search/?near=${location_formatted}&radius=${this.attributes.distance}&current_page=1&per_page=10&sort=distance&exclude_children=true&topic=Running&start_date=${this.attributes.start_date}..&api_key=${ACTIVE_API_KEY}`
		log(`Making API call to Active.com - ${url}`);
		request.get({ url: url, json: true })
			.then((result) => {
				// TODO - Figure out if we have an invalid location, and if so, clear the location and reprompt
				log("Active.com search completed - " + JSON.stringify(result, null, 2));
				const total_results = result.total_results;
				if(total_results==0) {
					delete this.handler.state;
					return this.emit(":ask", xmlescape(`I'm sorry, I didn't find any results within ${this.attributes.distance} miles of ${this.attributes.location} starting on or after ${start_date.format("dddd MMMM Do")}. When or where else would you like for me to search?`));
				}
				else {
					this.handler.state = states.GOTO_LIST;
					this.attributes.results = transform_results(result);
					this.attributes.total_results = result.total_results;
					return this.emit(":ask", xmlescape(`OK, I found ${total_results} events within ${this.attributes.distance} miles of ${this.attributes.location}. Would you like to hear about them?`));
				}
			})
			.catch(function(err) {
				log(`An error occurred - ${err}`);
			});
	},
	"SetLocation": function() {
		this.attributes.location = this.event.request.intent.slots.location.value;
		log(`Set location to ${this.attributes.location}`);
		this.emitWithState("DoSearch");
	},
	"SetDate": function() {
		try {
			var date_candidate = this.event.request.intent.slots.date.value;
			if(date_candidate.indexOf("T")>=0) {
				date_candidate = date_candidate.substr(0, date_candidate.indexOf("T"));
			}
			this.attributes.start_date = moment(date_candidate).format("YYYY-MM-DD"); 
			if(this.attributes.start_date=="Invalid date") {
				throw new Error("Invalid date");
			}
			log(`Set start_date to ${this.attributes.start_date}`);
			if(this.attributes.location) {
				this.emitWithState("DoSearch");
			}
			else {
				this.emitWithState("LocationNeeded");
			}
		}
		catch(err) {
			delete this.attributes.start_date;
			log("Error trying to set the date to " + this.event.request.intent.slots.date.value);
			this.emit(":ask", "I think you are trying to tell me the date for which you want me to search, but I didn't quite understand the date that you said. When would you like for me to search for events?");
		}
	},
        "ClearDate": function() {
		delete this.attributes.start_date;
		log(`Cleared start_date`);
		this.emitWithState("DoSearch");
	},
        "LocationNeeded": function() {
		log("Prompting the user for a location");
		this.emit(":ask", "Sure, I'll be happy to help you find events but first, I need to know where you want me to search. Please tell me the name of any US city, state, or zipcode.");
	},
	"SetLocationAndClearDate": function() {
		delete this.attributes.start_date;
		log("Cleared the date, about to set the location");
		this.emitWithState("SetLocation");
	},
	'AMAZON.HelpIntent': function () {
		this.emit(':ask', "You can ask me to find information about upcoming running events such as races near any U.S. city, state, or zipcode. I can search in the near future or at a future date. When or where would you like for me to search?");
	},
	'AMAZON.CancelIntent': function () {
		this.emitWithState('AMAZON.StopIntent');
	},
	'AMAZON.StopIntent': function () {
		this.emit(':tell', "No problem. An active lifestyle keeps you happy, and healthy.");
	},
	'AMAZON.CancelIntent': function () {
		this.emitWithState('AMAZON.StopIntent');
	},
	'AMAZON.StopIntent': function () {
		this.emit(':tell', "No problem. Just remember that an active lifestyle keeps you happy and healthy.");
	},
	'Unhandled': function() {
		this.emit(':ask', "I'm sorry, I'm not sure what you meant. When or where would you like for me to search for events?");
	}
};
