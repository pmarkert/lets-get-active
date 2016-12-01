# lets-get-active
An active lifestyle keeps you both healthy and happy... or so they say ;) This is an Alexa Skill to search for upcoming races and Active.com events.

An active lifestyle keeps you both healthy and happy... or so they say ;)
Now you can use Alexa on an Amazon echo device to find out information about upcoming races and Active.com events. Try it out! 

* You: "Alexa, launch Let's get active!"
* Alexa: "Let’s get active! I'll help you find some local races and activities. Let’s start with a location. In what city would you like me to search?"
* You: "Atlanta, GA"
* Alexa: "OK, I found 22 upcoming races near Atlanta, would you like to hear about them"

## Here are some of the interesting user notes/features of the skill:
* Uses the Active.com API to query for running events near a US location
* Looks for events on or after a specified date
* The skill remembers some of your preferences (like the last search location) to make it quicker to search next time.
* Intelligent ranking algorithm to set the recommended order of events based upon popularity, date and proximity.
* Provides summary information about the top-3 events and allows users ti navigate through additional events
* Users can ask for more details, which includes sending a card to the user's phone about the event with a shortened link to read more information and event register for the event.
* Shows users the logo from the event if available

## Here are some of the interesting developer notes/features of the skill:
* Extensive unit-testing framework to mock requests and validate responses against the skill
* Provides unit-test coverage capability that makes it possible to test every intent against every state
* The skill makes use of multiples states to give context sensitivity to the conversation
* The skill persists select information for future use so that users can get updates more easily
* Makes use of a patched version of the node.js alexa-skills-sdk, for which I've submitted a pull-request
