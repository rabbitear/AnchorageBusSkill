// Skill for Anchorage Bus
var Alexa = require('alexa-sdk');
var rp = require('request-promise');

const skillName = "Anchorage Bus";

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    //this if is for alexa-skill-test for local testing.
    if ('undefined' === typeof process.env.DEBUG) {
      alexa.appId = process.env.ALEXA_APP_ID;
    }
    //alexa.APP_ID = process.env.ALEXA_APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    "WhenNextBusIntent": function() {
        var whereto = this.event.request.intent.slots.ToWhere.value;
        var speechOutput = "ok";
        var nextBusTime = "PARTY TIME!";
        var busStopNumber = '0';

        switch (whereto) {
            case 'downtown':
                busStopNumber = '1632';
                break;
            case 'inbound':
                busStopNumber = '1632';
                break;
            case 'diamond center':
                busStopNumber = '1615';
                break;
            case 'outbound':
                busStopNumber = '1615';
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
                //var rePattern = /<div[^<>]*\ class=\'departure\'[^<>]*>(\d\d:\d\d\s\w+)<\/div>/g;
                var rePattern = /<div[^<>]*\ class=\'departure\'[^<>]*>(\d\d:\d\d\s\w+|Done)<\/div>/g;
                var matches = getMatches(response, rePattern, 1);
                nextBusTime = matches[0]; // cp 1st bus departure time.
                console.log('AFTER response, nextBusTime: ' + nextBusTime);
                if(nextBusTime === "Done") {
                    speechOutput = "There are no more buses scheduled on "+
                    "route 7 tonight, please try again tomorrow morning "+
                    " and have a nice night."}
                else {
                    speechOutput = "The Next number 7 bus going to "+
                    whereto+ " will arrive at the stop at "+
                    nextBusTime +  ".";
                }
                console.log("VAR response holds: " + response);
                // if nextBusTime = undefined, the buses are done.
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
        speechText += "Please say your destination for bus number 7, either downtown or diamond center."
        var repromptText = "For instructions on what you can say, please sayhelp me."
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


