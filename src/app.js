const { Console } = require("console-mpds");

const consoleMPDS = new Console();

initMastermind().play();

/*
    1   2   3   4
       g   g   g
        y   y   y
            c   c
    m           
    
    m   gy   gyc  gyc

    m   g      c    y
     
    
*/

function initMastermind() {
    const that = {
        VALID_COLORS: ['r', 'g', 'y', 'b', 'm', 'c'],
        COMBINATION_LENGTH: 4,
        DUPLICATED_COLORS_ALLOWED: false,
        MAX_ATTEMPTS: 10,
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
                game = initGame(that.VALID_COLORS, that.COMBINATION_LENGTH, that.DUPLICATED_COLORS_ALLOWED, that.MAX_ATTEMPTS);
                game.play();
                that.continueDialog.ask();
            } while (that.continueDialog.isAffirmative());
        }
    }
}

function initCombinationValidator(VALID_COLORS, COMBINATION_LENGTH, DUPLICATED_COLORS_ALLOWED) {
    const that = {
        VALID_COLORS: VALID_COLORS,
        COMBINATION_LENGTH: COMBINATION_LENGTH,
        DUPLICATED_COLORS_ALLOWED: DUPLICATED_COLORS_ALLOWED,
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

function initGame(VALID_COLORS, COMBINATION_LENGTH, DUPLICATED_COLORS_ALLOWED, MAX_ATTEMPTS) {
    const that = {
        MAX_ATTEMPTS: MAX_ATTEMPTS,
        COMBINATION_LENGTH: COMBINATION_LENGTH,
        validator: initCombinationValidator(VALID_COLORS, COMBINATION_LENGTH, DUPLICATED_COLORS_ALLOWED),
        secret: initSecretCombination(),
        proposeds: [],

        isEndGame: function () {
            return this.isLastProposedWinner() || this.proposeds.length === this.MAX_ATTEMPTS;
        },

        isLastProposedWinner: function () {
            const lastProposed = this.proposeds[this.proposeds.length - 1];            
            return this.secret.getResult(lastProposed).isWinner(this.COMBINATION_LENGTH);                                    
        },

        show: function () {
            consoleMPDS.writeln(`\n${this.proposeds.length} attempt(s):`);
            this.secret.show();
            for (let proposed of this.proposeds) {
                proposed.show();
                consoleMPDS.write(' --> ');
                this.secret.getResult(proposed).show();                
            }
        },

        showEndMsg: function () {
            consoleMPDS.writeln(`You've ${this.isLastProposedWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);
        }
    };

    return {
        play: function () {
            that.secret.setRandom(that.validator);
            that.show();
            do {
                const proposed = initProposedCombination();
                proposed.ask(that.validator);
                that.proposeds[that.proposeds.length] = proposed;
                that.show();
            } while (!that.isEndGame());
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