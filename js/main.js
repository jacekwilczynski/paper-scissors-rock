function randomIntegerFromRange(min, max) {
	var diff = max - min + 1;
	return Math.floor(Math.random() * diff + min);
}

function pickRandomElementFromArray(array) {
	var n = array.length;
	var i = randomIntegerFromRange(0, n - 1);
	return array[i];
}

// A data structure that extends the standard array as if the array wasn't a
// line with a beginning and an end but a circle where you can go round
function ArrayCircle(data) {
	// If user supplied an array, store it; otherwise, create an empty array
	this.data = data || [];

	this.step = function (step, element) {
		// Find element's index in data
		var startIndex = this.data.indexOf(element);
		// If element's not present in data, return null
		if (startIndex == -1) return null;
		// Store the length of the array
		var length = this.data.length;
		// Calculate the target index.
		// Make sure that step isn't greater than length, as it makes no sense to go round the circle few times
		// e.g. if startIndex is 1, length is 3, and step is 7, we'd go:
		// current step: 1234567
		// target index: 2012012
		// Therefore it makes a lot more sense to just go one step instead of seven, since it brings you to the same target index
		var targetIndex = startIndex + (step % length);
		// If step was negative and (absolutely) greater than startIndex, targetIndex might end up below zero.
		// In that case we have to count not from 0 but from the end of the array.
		// e.g. in an array of 3 elements: -1->2, -2->1, -3->0
		if (targetIndex < 0) targetIndex = length - targetIndex;
		// Return the element with the corresponding index
		return this.data[targetIndex];
	}

	// Create shorthand versions of the step method by predefining the step argument
	this.next = this.step.bind(this, +1);
	this.prev = this.step.bind(this, -1);
}

// A general class encompassing the entire in-game mechanics
function PaperScissorsRock() {

	// A abstract class for a player
	function Player(name = 'Player', game) {
		this.name = name;
		// this.score = 0;
		// A reference back to the game object to which the player belongs
		this.game = game;
		// This is undefined because a computer and a human will provide input differently
		this.choose = undefined;
	}

	// Computer player class
	function ComputerPlayer() {
		// Inherit from the Player class
		Player.call(this, arguments);
		// Choose one of the available options randomly
		this.choose = pickRandomElementFromArray.bind(null, this.game.availableChoices);
	}

	// Human player class
	function HumanPlayer() {
		// Inherit from the Player class
		Player.call(this, arguments);
		// Choose one of the available options according to user input
		this.choose = function () {this.game.userInterface.query(this)};
		}
	}

	// Round class
	function Round(game) {
		// Retain a reference back to the game in which this round happens
		this.game = game;
		// Create an array of players combined with their choices in this round (obtain the choices, too)
		this.result = this.game.players.map(function(player) {
			return {
				'player': player,
				choice: player.choose,
			};
		};
		// Once all choices have been obtained, calculate the score for this round for all players by comparing their choices with those of others
		this.result.forEach(function(element) {
			element.score = calculateScore;
			// Affect the total scores in the player objects
			// element.player.score += element.score;
		});
		
		// Find this round's number in the game (or return null if somehow absent)
		this.getNumber = function () {return this.game.rounds.indexOf(this) + 1 || null;}

		// A function that takes one object from the result array and compares it against all others, adding a score property to every element
		function calculateScore(current, index, array) {
			var score = 0;
			// Compare to all...
			for (i in all) {
				var comparingAgainst = array[i];
				// ... except for itself, of course!
				if (comparingAgainst == current) continue;
				// If current.choice is directly after comparingAgainst.choice in the game.availableChoices circle-array, it's a win
				if (current.choice == this.game.availableChoices.next(comparingAgainst.choice)) score++;
				// If current.choice is directly before comparingAgainst.choice in the game.availableChoices circle-array, it's a loss
				if (current.choice == this.game.availableChoices.prev(comparingAgainst.choice)) score--;
			}
			return score;
		}
	}

	function Game(userInterface, ...players = []) {
		// The user interface that will control this game
		this.userInterface = userInterface;
		// An array of players who take part in this game
		this.players = players;
		// An array containing the rounds that have taken place
		this.rounds = [];

		this.initialize = function () {
			this.players.forEach(function(player) {
				// Assign all the backward refernces in the player objects the game contains to itself
				obj.game = this;
			});
		}

		this.newRound = function() {
			this.rounds.push(new Round(this));
		};

		this.getScore = this.rounds.reduce(function (accumulator, current) {
			accumulator.score + current.score;
		});

	}

}