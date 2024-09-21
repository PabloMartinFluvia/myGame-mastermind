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
    const secret = generateSecretRandomly(COMBINATION_LENGTH, COLORS);
    
    const that = {
        board: initBoard(secret, MAX_ATTEMPTS),
        player: initPlayer(COMBINATION_LENGTH, COLORS),

        showWelcome: function () {
            consoleMPDS.writeln(`----- MASTERMIND -----`);
        },        

        isEndGame: function () {
            return this.board.isLastAttemptWinner() || this.board.hasMaxAttempts();
        },

        showEndGameMsg: function () {
            consoleMPDS.writeln(`You've ${this.board.isLastAttemptWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);
        }
    };

    return {
        play: function () {
            that.showWelcome();
            that.board.show();
            do {
                const proposed = that.player.proposeCombination();
                that.board.addAttempt(proposed);
                that.board.show();
            } while (!that.isEndGame());
            that.showEndGameMsg();
        }
    };

    function generateSecretRandomly(COMBINATION_LENGTH, COLORS) {
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
}

function initBoard(secret, MAX_ATTEMPTS) {
    const that = {
        secret: secret,
        MAX_ATTEMPTS: MAX_ATTEMPTS,
        attempts: [],

        showAttemptsCount: function () {
            consoleMPDS.writeln(`\n${this.attempts.length} attempt(s):`)
        },

        showSecret: function () {
            const HIDDEN_CHAR = '*';
            let msg = '';
            for (let i = 0; i < this.secret.length; i++) {
                msg += HIDDEN_CHAR;
            }
            consoleMPDS.writeln(msg);
        },

        showAttempts: function () {
            for (let i = 0; i < this.attempts.length; i++) {
                this.attempts[i].show();
            }
        }
    }

    return {
        addAttempt: function (proposed) {
            const attempt = initAttempt(proposed, initResult(proposed, that.secret));
            initArrayAdapter(that.attempts).addAtEnd(attempt);
        },

        show: function () {
            that.showAttemptsCount();
            that.showSecret();
            that.showAttempts();
        },

        isLastAttemptWinner: function () {
            const attemptsAdapted = initArrayAdapter(that.attempts);
            if (attemptsAdapted.hasLength()) {
                return attemptsAdapted.getLast().isWinner();
            }
            return false;
        },

        hasMaxAttempts: function () {
            return initArrayAdapter(that.attempts).hasLength(that.MAX_ATTEMPTS);
        }
    };
}

function initAttempt(proposed, result) {
    const that = {
        proposed: proposed,
        result: result
    };

    return {
        show: function () {
            let msg = initArrayAdapter(that.proposed).toString();
            msg += ` --> ${that.result.countBlacks()} blacks and ${that.result.countWhites()} whites`;
            consoleMPDS.writeln(msg);
        },

        isWinner: function () {
            return that.proposed.length === that.result.countBlacks();
        }
    };
}

function initResult(proposed, secret) {
    const VALID_VALUES = ["black", "white", "fail"];
    const success = calculateSuccess(proposed, secret, VALID_VALUES);

    const that = {
        VALID_VALUES: VALID_VALUES,
        success: success,

        getBlack: function () {
            return VALID_VALUES[0];
        },

        getWhite: function () {
            return VALID_VALUES[1];
        }
    };

    return {
        countBlacks: function () {
            return initArrayAdapter(that.success).count(that.getBlack());
        },

        countWhites: function () {
            return initArrayAdapter(that.success).count(that.getWhite());
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
}

function initCombinationValidator(COMBINATION_LENGTH, COLORS) {
    const that = {
        COMBINATION_LENGTH: COMBINATION_LENGTH,
        COLORS: COLORS,
        OK: 'ok',
        errorMsg: '',

        hasInvalidLength: function (combination) {
            return !initArrayAdapter(combination).hasLength(this.COMBINATION_LENGTH);
        },

        hasInvalidColors: function (combination) {
            const colorsAdapted = initArrayAdapter(this.COLORS);
            for (let color of combination) {
                if (!colorsAdapted.hasItem(color)) {
                    return true;
                }
            }
            return false;
        },

        hasDuplicatedValues: function (combination) {
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
    return {
        validate: function (combination) {
            that.errorMsg = that.OK;
            if (that.hasInvalidLength(combination)) {
                that.errorMsg = `Wrong proposed combination length`;
            } else if (that.hasInvalidColors(combination)) {
                const colorsMsg = initArrayAdapter(that.COLORS).toString();
                that.errorMsg = `Wrong colors, they must be ${colorsMsg}`;
            } else if (that.hasDuplicatedValues(combination)) {
                that.errorMsg = `Wrong proposed combination, colors can't be duplicated`;
            }
        },

        isValid: function () {
            return that.errorMsg === that.OK;
        },

        showError: function () {
            consoleMPDS.writeln(that.errorMsg);
        }
    };


}

function initPlayer(COMBINATION_LENGTH, COLORS) {
    const that = {
        validator: initCombinationValidator(COMBINATION_LENGTH, COLORS),
    };

    return {
        proposeCombination: function () {
            let proposed;
            do {
                let answer = consoleMPDS.readString(`Propose a combination:`);
                proposed = initStringAdapter(answer).toArray();
                that.validator.validate(proposed);
                if (!that.validator.isValid()) {
                    that.validator.showError();
                }
            } while (!that.validator.isValid());
            return proposed;
        }
    };
}

function initYesNoDialog(question) {
    const that = {
        question: question,
        VALID_ANSWERS: ["y", "n"],
        answer: undefined,

        isValid: function () {
            return initArrayAdapter(this.VALID_ANSWERS).hasItem(this.answer);
        },

        getAffirmative: function () {
            return this.VALID_ANSWERS[0];
        },

        getNegative: function () {
            return this.VALID_ANSWERS[1];
        }
    };

    return {
        ask: function () {
            let error = false;
            do {
                that.answer = consoleMPDS.readString(`${that.question} (${that.getAffirmative()}/${that.getNegative()}):`);
                error = !that.isValid();
                if (error) {
                    consoleMPDS.writeln(`Please, answer "${that.getAffirmative()}" or "${that.getNegative()}"`);
                }
            } while (error);
        },

        isAffirmative: function () {
            return that.answer === that.getAffirmative();
        }
    };
}

function initStringAdapter(text) {
    const that = {
        text: text
    };
    return {
        toArray: function () {
            const array = [];
            for (let i = 0; i < that.text.length; i++) {
                array[i] = that.text[i];
            }
            return array;
        }
    };
}

function initArrayAdapter(array) {
    const that = {
        array: array
    };

    return {
        addAtEnd: function (item) {
            that.array[that.array.length] = item;
        },

        getLast: function () {
            return that.array[that.array.length - 1];
        },

        hasLength: function (expected) {
            const length = that.array.length;
            return expected !== undefined ? length === expected : length > 0;
        },

        hasItem: function (target) {
            for (let item of that.array) {
                if (item === target) {
                    return true;
                }
            }
            return false;
        },

        count: function (target) {
            let count = 0;
            for (let item of that.array) {
                if (item === target) {
                    count++;
                }
            }
            return count;
        },

        toString: function () {
            let text = '';
            for (let item of that.array) {
                text += item;
            }
            return text;
        }
    };
}

