const { Console } = require("console-mpds");

const consoleMPDS = new Console();

initMastermind().play();

function initMastermind() {
    const that = {
        MAX_ATTEMPTS: 10,
        validator: initCombinationValidator(),
        game: null,
        continueDialog: initYesNoDialog("Do you want to continue?"),

        showTitle: function () {
            consoleMPDS.writeln(`----- MASTERMIND -----`);
        }
    };

    return {
        play: function () {
            that.showTitle();
            do {                
                game = initGame(that.MAX_ATTEMPTS, that.validator);
                game.play();
                that.continueDialog.ask();
            } while (that.continueDialog.isAffirmative());
        }
    }
}

function initCombinationValidator() {
    const that = {
        COMBINATION_LENGTH: 4,
        VALID_COLORS: ['r', 'g', 'y', 'b', 'm', 'c'],
        DUPLICATED_COLORS_ALLOWED: false,
        colors: "",

        hasDuplicatedColors: function () {
            for (let i = 0; i < this.colors.length - 1; i++) {
                for (let j = i + 1; j < this.colors.length; j++) {
                    if (this.colors[i] === this.colors[j]) {
                        return true;
                    }
                }
            }
            return false;
        },
    };

    return {
        setColors: function (colors) {
            that.colors = colors;
        },

        isLengthValid: function () {
            return that.colors.length === that.COMBINATION_LENGTH;
        },

        hasValidColors: function () {
            for (let color of that.colors) {
                let found = false;
                for (let i = 0; !found && i < that.VALID_COLORS.length; i++) {
                    found = color === that.VALID_COLORS[i];
                }
                if (!found) {
                    return false;
                }
            }
            return true;
        },

        isDuplicatedColorsRuleValid: function () {
            if (that.DUPLICATED_COLORS_ALLOWED) {
                return true;
            } else {
                return !that.hasDuplicatedColors();
            }
        },

        getVALID_COLORS: function () {
            return that.VALID_COLORS;
        }
    };
}

function initYesNoDialog(question) {
    const that = {
        question: question,
        answer: undefined,
        VALID_ANSWERS: ["y", "n"],        

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
                error = !this.isAffirmative() && that.answer !== that.getNegative();
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

function initGame(MAX_ATTEMPTS, validator) {
    const that = {
        MAX_ATTEMPTS: MAX_ATTEMPTS,
        validator: validator,
        secret: initSecretCombination(),
        attempts: [],

        isEnd: function () {
            return this.isLastAttemptWinner() || this.attempts.length === this.MAX_ATTEMPTS;
        },

        isLastAttemptWinner: function () {
            return this.attempts[this.attempts.length - 1].isWinner();
        },

        show: function () {
            consoleMPDS.writeln(`\n${this.attempts.length} attempt(s):`);
            this.secret.show();
            for (let attempt of this.attempts) {
                attempt.show();
            }
        },

        showEndMsg: function () {
            consoleMPDS.writeln(`You've ${this.isLastAttemptWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);
        }
    };

    return {
        play: function () {
            that.secret.setRandom(that.validator);            
            that.show();
            do {
                const proposed = initProposedCombination();
                proposed.ask(that.validator);
                that.attempts[that.attempts.length] = initAttempt(proposed, that.secret);
                that.show();
            } while (!that.isEnd());
            that.showEndMsg();
        }
    };
}

function initSecretCombination() {
    const that = {
        colors: "",

        addDifferentRandomColor: function (VALID_COLORS) {
            let color;
            do {                
                color = VALID_COLORS[parseInt(Math.random() * VALID_COLORS.length)];
            } while (that.hasColor(color));
            that.colors += color;
        },

        hasColor: function (searched) {
            for (let color of this.colors) {
                if (color === searched) {
                    return true;
                }
            }
            return false;
        }
    };

    return {
        setRandom: function (validator) {
            do {
                that.addDifferentRandomColor(validator.getVALID_COLORS());                
                validator.setColors(that.colors);
            } while (!validator.isLengthValid());
        },

        getResult: function (proposed) {
            let blacks = 0;
            let whites = 0;
            for (let i = 0; i < that.colors.length; i++) {
                if (that.colors[i] === proposed.getColor(i)) {
                    blacks++;
                } else if (that.hasColor(proposed.getColor(i))) {
                    whites++;
                }
            }
            return initResult(blacks, whites);
        },

        show: function () {
            const HIDDEN_CHAR = '*';
            let msg = '';
            for (let i = 0; i < that.colors.length; i++) {
                msg += HIDDEN_CHAR;
            }
            consoleMPDS.writeln(msg);
        }
    };
}

function initProposedCombination() {
    const that = {
        colors: "",

        getErrorMsg: function (validator) {
            validator.setColors(this.colors); // 
            if (!validator.isLengthValid()) {
                return `Wrong proposed combination length`;
            } else if (!validator.hasValidColors()) {
                let errorMsg = `Wrong colors, they must be: `;
                for (let validColor of validator.getVALID_COLORS()) {
                    errorMsg += validColor;
                }
                return errorMsg;
            } else if (!validator.isDuplicatedColorsRuleValid()) {
                return `Wrong proposed combination, colors can't be repeated`;
            }
            return undefined;
        }
    };

    return {
        ask: function (validator) {
            let errorMsg;
            do {
                that.colors = consoleMPDS.readString(`Propose a combination:`);
                errorMsg = that.getErrorMsg(validator);
                if (errorMsg !== undefined) {
                    consoleMPDS.writeln(errorMsg);
                }
            } while (errorMsg !== undefined);
        },

        getColor: function (index) {
            return that.colors[index];
        },

        getLength: function () {
            return that.colors.length;
        },

        show: function () {
            consoleMPDS.write(that.colors);
        }
    };
}

function initAttempt(proposed, secret) {
    const that = {
        proposed: proposed,
        result: secret.getResult(proposed)
    };

    return {
        isWinner: function () {
            return that.result.isWinner(proposed.getLength());
        },

        show: function () {
            that.proposed.show();
            consoleMPDS.write(' --> ');
            that.result.show();
        }
    };
}

function initResult(blacks, whites) {
    const that = {
        blacks: blacks,
        whites: whites
    };

    return {
        isWinner: function (expectedBlacks) {
            return that.blacks === expectedBlacks;
        },

        show: function () {
            consoleMPDS.writeln(`${that.blacks} blacks and ${that.whites} whites`);
        }
    };
}