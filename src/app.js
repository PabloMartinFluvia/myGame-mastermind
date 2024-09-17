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

function initGame(validator = initCombinationValidator()) {
    return {
        validator: validator,
        board: initBoard(),
        player: initPlayer(validator),

        play: function () {
            showWelcome();
            this.board.secret = generateSecretRandomly(this);
            this.board.show();
            do {
                const proposed = this.player.proposeCombination();
                this.board.addAttempt(proposed);
                this.board.show();
            } while (!isEndGame(this));
            showEndGameMsg(this);
        }
    };

    function showWelcome() {
        consoleMPDS.writeln(`----- MASTERMIND -----`);
    }

    function generateSecretRandomly({ validator }) {
        let secret = [];

        for (let i = 0; i < validator.COMBINATION_LENGTH; i++) {
            let color;
            do {
                let indexColor = parseInt(Math.random() * validator.COLORS.length);
                color = validator.COLORS[indexColor];
            } while (initArrayAdapter(secret).hasItem(color));
            secret[i] = color;
        }
        return secret;
    }

    function isEndGame({ board }) {
        return board.isLastAttemptWinner() || board.hasMaxAttempts();
    }

    function showEndGameMsg({ board }) {
        consoleMPDS.writeln(`You've ${board.isLastAttemptWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);
    }
}

function initBoard() {
    return {
        secret: [],
        attempts: [],
        MAX_ATTEMPTS: 10,

        addAttempt: function (proposed) {
            const attempt = initAttempt(proposed, initResult(proposed, this.secret));
            initArrayAdapter(this.attempts).addAtEnd(attempt);
        },

        show: function () {
            showAttemptsCount(this);
            showSecret(this);
            showAttempts(this);
        },

        isLastAttemptWinner: function () {
            const attemptsAdapted = initArrayAdapter(this.attempts);
            if (attemptsAdapted.hasLength()) {
                return attemptsAdapted.getLast().isWinner();
            }
            return false;
        },

        hasMaxAttempts: function () {
            return initArrayAdapter(this.attempts).hasLength(this.MAX_ATTEMPTS);
        }
    };

    function showAttemptsCount({ attempts }) {
        consoleMPDS.writeln(`\n${attempts.length} attempt(s):`)
    }

    function showSecret({ secret }) {
        const HIDDEN_CHAR = '*';
        let msg = '';
        for (let i = 0; i < secret.length; i++) {
            msg += HIDDEN_CHAR;
        }
        consoleMPDS.writeln(msg);
    }

    function showAttempts({ attempts }) {
        for (let i = 0; i < attempts.length; i++) {
            attempts[i].show();
        }
    }
}

function initAttempt(proposed, result) {
    return {
        proposed: proposed,
        result: result,

        show: function () {
            let msg = initArrayAdapter(this.proposed).toString();
            msg += ` --> ${this.result.countBlacks()} blacks and ${this.result.countWhites()} whites`;
            consoleMPDS.writeln(msg);
        },

        isWinner: function () {
            return this.proposed.length === this.result.countBlacks();
        }
    };
}

function initResult(proposed, secret, VALID_VALUES = ["black", "white", "fail"]) {
    return {
        VALID_VALUES: VALID_VALUES,
        success: calculateSuccess(proposed, secret, VALID_VALUES),

        countBlacks: function () {
            return initArrayAdapter(this.success).count(getBlack(this));
        },

        countWhites: function () {
            return initArrayAdapter(this.success).count(getWhite(this));
        }
    }

    function calculateSuccess(proposed, secret, [black, white, fail]) {
        const values = [];
        for (let i = 0; i < proposed.length; i++) {
            if (proposed[i] === secret[i]) {
                values[i] = black;
            } else if (initArrayAdapter(secret).hasItem(proposed[i])) {
                values[i] = white;
            } else {
                values[i] = fail;
            }
        }
        return values;
    }

    function getBlack(result) {
        return result.VALID_VALUES[0];
    }

    function getWhite(result) {
        return result.VALID_VALUES[1];
    }

}

function initCombinationValidator() {
    return {
        COMBINATION_LENGTH: 4,
        COLORS: ['r', 'g', 'y', 'b', 'm', 'c'],
        errorMsg: "",
        OK: "ok",

        validate: function (combination) {
            this.errorMsg = this.OK;
            if (hasInvalidLength(this, combination)) {
                this.errorMsg = `Wrong proposed combination length`;
            } else if (hasInvalidColors(this, combination)) {
                const colorsMsg = initArrayAdapter(this.COLORS).toString();
                this.errorMsg = `Wrong colors, they must be ${colorsMsg}`;
            } else if (hasDuplicatedValues(combination)) {
                this.errorMsg = `Wrong proposed combination, colors can't be duplicated`;
            }
        },

        isValid: function () {
            return this.errorMsg === this.OK;
        },

        showError: function () {
            consoleMPDS.writeln(this.errorMsg);
        }
    };

    function hasInvalidLength({ COMBINATION_LENGTH }, combination) {
        return !initArrayAdapter(combination).hasLength(COMBINATION_LENGTH);
    }

    function hasInvalidColors({ COLORS }, combination) {
        const colorsAdapted = initArrayAdapter(COLORS);
        for (let color of combination) {
            if (!colorsAdapted.hasItem(color)) {
                return true;
            }
        }
        return false;
    }

    function hasDuplicatedValues(combination) {
        let copy = initArrayAdapter();
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
        validator: validator,

        proposeCombination: function () {
            let proposed;
            do {
                let answer = consoleMPDS.readString(`Propose a combination:`);
                proposed = initStringAdapter(answer).toArray();
                this.validator.validate(proposed);
                if (!this.validator.isValid()) {
                    this.validator.showError();
                }
            } while (!this.validator.isValid());
            return proposed;
        }
    };
}

function initYesNoDialog(question, VALID_ANSWERS = ["y", "n"]) {
    return {
        question: question,
        answer: ``,
        VALID_ANSWERS: VALID_ANSWERS,

        ask: function () {
            let error = false;
            do {
                this.answer = consoleMPDS.readString(`${this.question} (${getAffirmative(this)}/${getNegative(this)}):`);
                error = !isValid(this);
                if (error) {
                    consoleMPDS.writeln(`Please, answer "${getAffirmative(this)}" or "${getNegative(this)}"`);
                }
            } while (error);
        },

        isAffirmative: function () {
            return this.answer === getAffirmative(this);
        }
    };

    function isValid(dialog) {
        return initArrayAdapter(dialog.VALID_ANSWERS).hasItem(dialog.answer);
    }

    function getAffirmative(dialog) {
        return dialog.VALID_ANSWERS[0];
    }

    function getNegative(dialog) {
        return dialog.VALID_ANSWERS[1];
    }
}

function initStringAdapter(text) {
    return {
        text: text,

        toArray: function () {
            const array = [];
            for (let i = 0; i < this.text.length; i++) {
                array[i] = this.text[i];
            }
            return array;
        }
    };
}

function initArrayAdapter(array = []) {
    return {
        array: array,

        addAtEnd: function (item) {
            this.array[this.array.length] = item;
        },

        getLast: function () {
            return this.array[this.array.length - 1];
        },

        hasLength: function (expected) {
            const length = this.array.length;
            return expected !== undefined ? length === expected : length > 0;
        },

        hasItem: function (target) {
            for (let item of this.array) {
                if (item === target) {
                    return true;
                }
            }
            return false;
        },

        count: function (target) {
            let count = 0;
            for (let item of this.array) {
                if (item === target) {
                    count++;
                }
            }
            return count;
        },

        toString: function () {
            let text = '';
            for (let item of this.array) {
                text += item;
            }
            return text;
        }
    };
}

