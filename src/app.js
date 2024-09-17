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
    const validator = initCombinationValidator();
    const game = {
        validator: validator,
        board: initBoard(),
        player: initPlayer(validator),

        play: function () {
            showWelcome();
            game.board.secret = generateSecretRandomly(game);
            game.board.show();
            do {
                const proposed = game.player.proposeCombination();
                game.board.addAttempt(proposed);
                game.board.show();
            } while (!isEndGame(game));
            showEndGameMsg(game);
        }
    };
    return game;

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
    const board = {
        secret: [],
        attempts: [],
        MAX_ATTEMPTS: 10,

        addAttempt: function (proposed) {
            const attempt = initAttempt(proposed, board.secret);
            initArrayAdapter(board.attempts).addAtEnd(attempt);
        },

        show: function () {
            showAttemptsCount(board);
            showSecret(board);
            showAttempts(board);
        },

        isLastAttemptWinner: function () {
            const attemptsAdapted = initArrayAdapter(board.attempts);
            if (attemptsAdapted.hasLength()) {
                return attemptsAdapted.getLast().isWinner();
            }
            return false;
        },

        hasMaxAttempts: function () {
            return initArrayAdapter(board.attempts).hasLength(board.MAX_ATTEMPTS);
        }
    };
    return board;

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

function initAttempt(proposed, secret) {
    const attempt = {
        proposed: proposed,
        result: initResult(proposed, secret),

        show: function () {
            let msg = initArrayAdapter(attempt.proposed).toString();
            msg += ` --> ${attempt.result.countBlacks()} blacks and ${attempt.result.countWhites()} whites`;
            consoleMPDS.writeln(msg);
        },

        isWinner: function () {
            return attempt.proposed.length === attempt.result.countBlacks();
        }
    };
    return attempt;
}

function initResult(proposed, secret) {
    const VALID_VALUES = ["black", "white", "fail"];
    const result = {
        VALID_VALUES: VALID_VALUES,
        success: calculateSuccess(proposed, secret, VALID_VALUES),

        countBlacks: function () {
            return initArrayAdapter(result.success).count(getBlack(result));
        },

        countWhites: function () {
            return initArrayAdapter(result.success).count(getWhite(result));
        }
    }

    return result;

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
    const validator = {
        COMBINATION_LENGTH: 4,
        COLORS: ['r', 'g', 'y', 'b', 'm', 'c'],
        errorMsg: "",
        OK: "ok",

        validate: function (combination) {
            validator.errorMsg = validator.OK;
            if (hasInvalidLength(validator, combination)) {
                validator.errorMsg = `Wrong proposed combination length`;
            } else if (hasInvalidColors(validator, combination)) {
                const colorsMsg = initArrayAdapter(validator.COLORS).toString();
                validator.errorMsg = `Wrong colors, they must be ${colorsMsg}`;
            } else if (hasDuplicatedValues(combination)) {
                validator.errorMsg = `Wrong proposed combination, colors can't be duplicated`;
            }
        },

        isValid: function () {
            return validator.errorMsg === validator.OK;
        },

        showError: function () {
            consoleMPDS.writeln(validator.errorMsg);
        }
    };
    return validator;

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
    const player = {
        validator: validator,

        proposeCombination: function () {
            let proposed;
            do {
                let answer = consoleMPDS.readString(`Propose a combination:`);
                proposed = initStringAdapter(answer).toArray();
                player.validator.validate(proposed);
                if (!player.validator.isValid()) {
                    player.validator.showError();
                }
            } while (!player.validator.isValid());
            return proposed;
        }
    };
    return player;
}

function initYesNoDialog(question, VALID_ANSWERS = ["y", "n"]) {
    const dialog = {
        question: question,
        answer: ``,
        VALID_ANSWERS: VALID_ANSWERS,

        ask: function () {
            let error = false;
            do {
                dialog.answer = consoleMPDS.readString(`${dialog.question} (${getAffirmative(dialog)}/${getNegative(dialog)}):`);
                error = !isValid(dialog);
                if (error) {
                    consoleMPDS.writeln(`Please, answer "${getAffirmative(dialog)}" or "${getNegative(dialog)}"`);
                }
            } while (error);
        },

        isAffirmative: function () {
            return dialog.answer === getAffirmative(dialog);
        }
    };

    return dialog;

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
    const stringAdapter = {
        text: text,

        toArray: function () {
            const array = [];
            for (let i = 0; i < stringAdapter.text.length; i++) {
                array[i] = stringAdapter.text[i];
            }
            return array;
        }
    };

    return stringAdapter;
}

function initArrayAdapter(array = []) {
    const adapted = {
        array: array,

        addAtEnd: function (item) {
            adapted.array[adapted.array.length] = item;
        },

        getLast: function () {
            return adapted.array[adapted.array.length - 1];
        },

        hasLength: function (expected) {
            const length = adapted.array.length;
            return expected !== undefined ? length === expected : length > 0;
        },

        hasItem: function (target) {
            for (let item of adapted.array) {
                if (item === target) {
                    return true;
                }
            }
            return false;
        },

        count: function (target) {
            let count = 0;
            for (let item of adapted.array) {
                if (item === target) {
                    count++;
                }
            }
            return count;
        },

        toString: function () {
            let text = '';
            for (let item of adapted.array) {
                text += item;
            }
            return text;
        }
    };

    return adapted;
}

