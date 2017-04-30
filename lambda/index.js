// Skill for Anchorage Bus
// The App Id is set in lambda's env's
// Also set TZ in lambda's env to get correct times.
var Alexa = require('alexa-sdk');
var rp = require('request-promise');
var moment = require('moment');
var momentPreciseRangePlugin = require('moment-precise-range-plugin');

const skillName = "Anchorage Bus";

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    //this if is for alexa-skill-test for local testing.
    if ('undefined' === typeof process.env.DEBUG) {
      alexa.appId = process.env.ALEXA_APP_ID;
      alexa.APP_ID = process.env.ALEXA_APP_ID;
    }
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    "WhenNextBusIntent": function() {
        var whereto = this.event.request.intent.slots.ToWhere.value;
        var speechOutput = "ok";
        var nextBusTime = "PARTY TIME!";
        var busStopNumber = '0';
        var busRouteNumber = '7';
        var busDirection = "Home";

        switch (whereto) {
            case 'downtown':
                busStopNumber = '1632';
                busDirection = 'inbound';
                break;
            case 'inbound':
                busStopNumber = '1632';
                busDirection = 'inbound';
                break;
            case 'diamond center':
                busStopNumber = '1615';
                busDirection = 'outbound';
                break;
            case 'outbound':
                busStopNumber = '1615';
                busDirection = 'outbound';
                break;
        }

        var options = {
            method: 'GET',
            uri: 'http://bustracker.muni.org/InfoPoint/departures.aspx?stopid=' + busStopNumber
        }

        let that = this;
        rp(options)
            .then(function(response) {
                console.log('GOT: ' + response.length + ' bytes.');

                // This is the pattern for, how many minutes until
                // next bus.
                var rePattern = /<div[^<>]*\ class=\'departure\'[^<>]*>(\d\d:\d\d\s\w+|Done)<\/div>/g;
                var matches = getMatches(response, rePattern, 1);
                nextBusTime = matches[0]; // cp 1st bus departure time.
                nextBusMoment = moment(nextBusTime, "HH:mm a");
                nextBusTimeStatement = moment().preciseDiff(nextBusMoment);
                console.log('VAR nextBusTime: '+nextBusTime);
                console.log('VAR nextBusTimeStatement: '+
                        nextBusTimeStatement)

                if(nextBusTime === "Done") {
                    speechOutput = "There are no more buses scheduled on "+
                    "route "+busRouteNumber+" tonight, please try "+
                    " again tomorrow morning "+
                    " and have a nice night."}
                else {
                    speechOutput = "The next bus, route number "+
                    busRouteNumber+", going to "+whereto+ " will be at "+
                    "the bus stop in... "+nextBusTimeStatement+".";
                }

                console.log("VAR response holds: " + response);
                that.emit(':tell', speechOutput);
            })
            .catch(function(err) {
                console.log('API call failed.');
                speechOutput = "call to get the bus times had failed, "+
                " please try again later.";
                that.emit(':tell', speechOutput);
            });
    },

    "AMAZON.StopIntent": function () {
        var speechOutput = "Goodbye";
        this.emit(':tell', speechOutput);
    },

    "AMAZON.CancelIntent": function () {
        var speechOutput = "Goodbye";
        this.emit(':tell', speechOutput);
    },

    "LaunchRequest": function() {
        var speechText = "";
        speechText += "Welcome to " + skillName + ". ";
        speechText += "Please say your destination for bus 7.";

        var repromptText = "";
        repromptText += "You can say a destination like ";
        repromptText += "either downtown or diamond center...";
        repromptText += "For instructions more on what you can say, ";
        repromptText += "say: help me.";

        this.emit(':ask', speechText, repromptText);
    }
};



// get groups out of a regex.
function getMatches(string, regex, index) {
  index || (index = 1);
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}


