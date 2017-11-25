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
		// If step was positive but greater than length - 1, apply the remainder operation to it to put it in range
		if (targetIndex >= length) targetIndex %= length;
		// Return the element with the corresponding index
		return this.data[targetIndex];
	}

	// Create shorthand versions of the step method by predefining the step argument
	this.next = this.step.bind(this, +1);
	this.prev = this.step.bind(this, -1);
}

function paperScissorsRock() {

	function Participant(type = 'Computer', name = type) {
		this.type = type;
		this.name = name;
		this.score = 0;
		if (this.type != 'Computer') {
			document.querySelectorAll('.human-name').forEach(function(node) {node.innerHTML = this.name;}, this);
		}
	}

	const options = new ArrayCircle(['paper', 'scissors', 'rock']);
	var player;
	var computer;
	var round;
	var roundTable = document.querySelector('#table');
	var roundTBody;
	var roundRow;
	var roundCells;
	var roundPlaceholder;

	function resetRounds() {
		round = 0;
		if (roundTBody) roundTable.removeChild(roundTBody);
		roundTBody = document.createElement('tbody');
		roundTable.appendChild(roundTBody);
		roundRow = undefined;
		roundCells = undefined;
		roundPlaceholder = undefined;
	}

	function nextRound() {
		if (roundRow) roundRow.className = '';
		var oldRoundRow = roundRow;
		round += 1;
		roundRow = document.createElement('tr');
		roundTBody.insertBefore(roundRow, oldRoundRow);
		roundCells = [];
		for (let i = 0; i < 3; i++) {
			roundCells.push(document.createElement('td'));
			roundRow.appendChild(roundCells[i]);
		}
		roundRow.className = "current";
		roundPlaceholder = document.createElement('div');
		roundPlaceholder.className = "choice-button";
		roundCells[0].appendChild(roundPlaceholder);
		roundCells[1].innerHTML = round;
	}

	function updateScore(side, change) {
		var scoreOutput = document.querySelectorAll('.' + side + '-score');
		var participant = (side == 'human' ? player : computer);
		participant.score += change;
		scoreOutput.forEach(function (node) {
			node.innerHTML = participant.score;
		});
		if (participant.score >= 10) return {
			winner: participant,
			loser: (participant == player ? computer : player),
		};
	}

	function act(choice) {

		function animateChoice(actor, choice) {
			var selection = document.querySelectorAll('.' + actor + '-choice.' + choice)[0];
			if (selection.classList.contains('shrink-and-fade-in')) {
				selection.classList.remove('shrink-and-fade-in');
				setTimeout(function () {selection.classList.add('shrink-and-fade-in');}, 10);
			} else {
				selection.classList.add('shrink-and-fade-in');
			}
			setTimeout(function() {
				selection.classList.remove('shrink-and-fade-in');
			}, 3000);
			var img = selection.getElementsByTagName('img')[0].cloneNode(false);
			var div = document.createElement('div');
			div.className = 'choice-button ' + choice;
			div.appendChild(img);
			if (actor == 'human') {
				roundCells[0].replaceChild(div, roundPlaceholder);
			}
			else {
				roundCells[2].appendChild(div);
			}
		}

		function getComputerChoice() {
			return pickRandomElementFromArray(options.data);
		}

		function calculateScore() {
			if (choice == options.next(computerChoice)) {
				return {
					won: 'human',
					lost: 'computer',
				};
			}
			if (computerChoice == options.next(choice)) {
				return {
					won: 'computer',
					lost: 'human',
				};
			}
			return 'draw';
		}

		function conclude(endScore) {
			var panel = document.querySelector('#conclusion');
			var heading = document.querySelector('#conclusion-heading');
			var text = document.querySelector('#conclusion-text');
			if (endScore.winner == player) {
				heading.innerHTML = "Congratulations!";
				panel.classList.add('panel-success');
			} else {
				heading.innerHTML = "Sorry...";
				panel.classList.add('panel-danger');
			}
			text.innerHTML = endScore.winner.name + " has won over " + endScore.loser.name
				+ " with a score of " + endScore.winner.score + " to " + endScore.loser.score + ".";
			panel.classList.remove('hidden');
			document.querySelectorAll('.side-panel').forEach(function (node) {node.classList.add('hidden');});
			document.querySelector('#play-again').addEventListener('click', function() {
				panel.classList.add('hidden');
				document.querySelectorAll('.side-panel').forEach(function (node) {node.classList.remove('hidden');});
				document.querySelector('#game').classList.add('hidden', 'opacity-0');
				document.querySelector('#start').click();
				updateScore('human', 0);
				updateScore('computer', 0);
				setTimeout(function () {
					document.querySelector('#game').classList.remove('hidden');
				}, 100);
				setTimeout(function () {
					document.querySelectorAll('.human-choice').forEach(function (node) {
						node.classList.remove('shrink-and-fade-in');
					}, 5);
					document.querySelector('.human').classList.remove('win', 'lose');
						document.querySelector('.computer').classList.remove('win', 'lose');
				})
			});
		}

		animateChoice('human', choice);
		var computerChoice = getComputerChoice();
		animateChoice('computer', computerChoice);

		var score = calculateScore();
		var endScore;
		if (score != 'draw') {
			endScore = updateScore(score.won, +1);
			document.querySelectorAll('.' + score.won)[0].classList.add('win');
			document.querySelectorAll('.' + score.lost)[0].classList.add('lose');
			roundCells[score.won == 'human' ? 0 : 2].classList.add('success');
			// roundCells[score.won == 'human' ? 2 : 0].classList.add('danger');
			setTimeout(function () {
				document.querySelectorAll('.' + score.won)[0].classList.remove('win');
				document.querySelectorAll('.' + score.lost)[0].classList.remove('lose');
			}, 2000);
		} else {
			// roundCells[0].classList.add('info');
			// roundCells[2].classList.add('info');
		}

		if (endScore)
			conclude(endScore);
		else
			nextRound();
	}

	document.querySelector('#game-setup').addEventListener('transitionend', function () {
		document.querySelector('#name-input').focus();
	});

	document.querySelector('#start').addEventListener('click', function () {
		player = new Participant('Player', document.querySelector('#name-input').value);
		computer = new Participant();
		resetRounds();
		nextRound();
	});

	var choiceButtons = document.querySelectorAll('.human-choice');
	choiceButtons[0].addEventListener('click', function() {act('paper');});
	choiceButtons[1].addEventListener('click', function() {act('scissors');});
	choiceButtons[2].addEventListener('click', function() {act('rock');});

}

paperScissorsRock();