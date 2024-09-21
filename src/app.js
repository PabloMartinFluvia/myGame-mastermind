const { Console } = require("console-mpds");

const consoleMPDS = new Console();

playMastermind();

function playMastermind() {
    const continueDialog = initYesNoDialog("Do you want to continue?");
    do {
        const newGame = initGame();
        newGame.play();
        continueDialog.ask();
    } while (continueDialog.isAffirmative());
}

function initGame() {
    const COMBINATION_LENGTH = 4;
    const COLORS = ['r', 'g', 'y', 'b', 'm', 'c'];
    const MAX_ATTEMPTS = 10;
    const validator = initCombinationValidator(COMBINATION_LENGTH, COLORS);
    const board = initBoard(generateSecretRandomly(), MAX_ATTEMPTS);
    const player = initPlayer(validator);
    return {
        play: function () {
            showWelcome();
            board.show();
            do {
                const proposed = player.proposeCombination();
                board.addAttempt(proposed);
                board.show();
            } while (!isEndGame());
            showEndGameMsg();
        }
    };

    function showWelcome() {
        consoleMPDS.writeln(`----- MASTERMIND -----`);
    }

    function generateSecretRandomly() {
        let secret = [];

        for (let i = 0; i < COMBINATION_LENGTH; i++) {
            let color;
            do {
                let indexColor = parseInt(Math.random() * COLORS.length);
                color = COLORS[indexColor];
            } while (initArrayAdapter(secret).hasItem(color));
            secret[i] = color;
        }
        return secret;
    }

    function isEndGame() {
        return board.isLastAttemptWinner() || board.hasMaxAttempts();
    }

    function showEndGameMsg() {
        consoleMPDS.writeln(`You've ${board.isLastAttemptWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);
    }
}

function initBoard(secret, MAX_ATTEMPTS) {
    const attempts = [];    
    return {
        addAttempt: function (proposed) {
            const attempt = initAttempt(proposed, initResult(proposed, secret));
            initArrayAdapter(attempts).addAtEnd(attempt);
        },

        show: function () {
            showAttemptsCount();
            showSecret();
            showAttempts();
        },

        isLastAttemptWinner: function () {
            const attemptsAdapted = initArrayAdapter(attempts);
            if (attemptsAdapted.hasLength()) {
                return attemptsAdapted.getLast().isWinner();
            }
            return false;
        },

        hasMaxAttempts: function () {
            return initArrayAdapter(attempts).hasLength(MAX_ATTEMPTS);
        }
    };

    function showAttemptsCount() {
        consoleMPDS.writeln(`\n${attempts.length} attempt(s):`)
    }

    function showSecret() {
        const HIDDEN_CHAR = '*';
        let msg = '';
        for (let i = 0; i < secret.length; i++) {
            msg += HIDDEN_CHAR;
        }
        consoleMPDS.writeln(msg);
    }

    function showAttempts() {
        for (let i = 0; i < attempts.length; i++) {
            attempts[i].show();
        }
    }
}

function initAttempt(proposed, result) {
    return {
        show: function () {
            let msg = initArrayAdapter(proposed).toString();
            msg += ` --> ${result.countBlacks()} blacks and ${result.countWhites()} whites`;
            consoleMPDS.writeln(msg);
        },

        isWinner: function () {
            return proposed.length === result.countBlacks();
        }
    };
}

function initResult(proposed, secret) {
    const VALID_VALUES = ["black", "white", "fail"];
    const success = calculateSuccess(proposed, secret, VALID_VALUES);
    return {
        countBlacks: function () {
            return initArrayAdapter(success).count(getBlack());
        },

        countWhites: function () {
            return initArrayAdapter(success).count(getWhite());
        }
    }

    function calculateSuccess(proposed, secret, [black, white, fail]) {
        const success = [];
        for (let i = 0; i < proposed.length; i++) {
            if (proposed[i] === secret[i]) {
                success[i] = black;
            } else if (initArrayAdapter(secret).hasItem(proposed[i])) {
                success[i] = white;
            } else {
                success[i] = fail;
            }
        }
        return success;
    }

    function getBlack() {
        return VALID_VALUES[0];
    }

    function getWhite() {
        return VALID_VALUES[1];
    }

}

function initCombinationValidator(COMBINATION_LENGTH, COLORS) {
    const OK = "ok";
    let errorMsg = "";
    return {
        validate: function (combination) {
            errorMsg = OK;
            if (hasInvalidLength(combination)) {
                errorMsg = `Wrong proposed combination length`;
            } else if (hasInvalidColors(combination)) {
                const colorsMsg = initArrayAdapter(COLORS).toString();
                errorMsg = `Wrong colors, they must be ${colorsMsg}`;
            } else if (hasDuplicatedValues(combination)) {
                errorMsg = `Wrong proposed combination, colors can't be duplicated`;
            }
        },

        isValid: function () {
            return errorMsg === OK;
        },

        showError: function () {
            consoleMPDS.writeln(errorMsg);
        }
    };

    function hasInvalidLength(combination) {
        return !initArrayAdapter(combination).hasLength(COMBINATION_LENGTH);
    }

    function hasInvalidColors(combination) {
        const colorsAdapted = initArrayAdapter(COLORS);
        for (let color of combination) {
            if (!colorsAdapted.hasItem(color)) {
                return true;
            }
        }
        return false;
    }

    function hasDuplicatedValues(combination) {
        let copy = initArrayAdapter([]);
        for (let i = 0; i < combination.length; i++) {
            if (copy.hasItem(combination[i])) {
                return true;
            }
            copy.addAtEnd(combination[i]);
        }
        return false;
    }
}

function initPlayer(validator) {
    return {
        proposeCombination: function () {
            let proposed;
            do {
                let answer = consoleMPDS.readString(`Propose a combination:`);
                proposed = initStringAdapter(answer).toArray();
                validator.validate(proposed);
                if (!validator.isValid()) {
                    validator.showError();
                }
            } while (!validator.isValid());
            return proposed;
        }
    };
}

function initYesNoDialog(question) {
    const VALID_ANSWERS = ["y", "n"];
    let answer;
    return {
        ask: function () {
            let error = false;
            do {
                answer = consoleMPDS.readString(`${question} (${getAffirmative()}/${getNegative()}):`);
                error = !isValid();
                if (error) {
                    consoleMPDS.writeln(`Please, answer "${getAffirmative()}" or "${getNegative()}"`);
                }
            } while (error);
        },

        isAffirmative: function () {
            return answer === getAffirmative();
        }
    };

    function isValid() {
        return initArrayAdapter(VALID_ANSWERS).hasItem(answer);
    }

    function getAffirmative() {
        return VALID_ANSWERS[0];
    }

    function getNegative() {
        return VALID_ANSWERS[1];
    }
}

function initStringAdapter(text) {
    return {
        toArray: function () {
            const array = [];
            for (let i = 0; i < text.length; i++) {
                array[i] = text[i];
            }
            return array;
        }
    };
}

function initArrayAdapter(array) {
    return {
        addAtEnd: function (item) {
            array[array.length] = item;
        },

        getLast: function () {
            return array[array.length - 1];
        },

        hasLength: function (expected) {
            const length = array.length;
            return expected !== undefined ? length === expected : length > 0;
        },

        hasItem: function (target) {
            for (let item of array) {
                if (item === target) {
                    return true;
                }
            }
            return false;
        },

        count: function (target) {
            let count = 0;
            for (let item of array) {
                if (item === target) {
                    count++;
                }
            }
            return count;
        },

        toString: function () {
            let text = '';
            for (let item of array) {
                text += item;
            }
            return text;
        }
    };
}

