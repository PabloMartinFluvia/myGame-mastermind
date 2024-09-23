const { Console } = require("console-mpds");

const consoleMPDS = new Console();

initMastermind().play();

function initMastermind() {
    const that = {        
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
                game = initGame();
                game.play();
                that.continueDialog.ask();
            } while (that.continueDialog.isAffirmative());
        }
    }
}

function initGame() {
    const that = {
        VALID_COLORS: ['r', 'g', 'y', 'b', 'm', 'c'],
        COMBINATION_LENGTH: 4,
        MAX_ATTEMPTS: 10,
        secret: initSecretCombination(),
        proposeds: [],

        isEndGame: function () {
            return this.isLastProposedWinner() || this.proposeds.length === this.MAX_ATTEMPTS;
        },

        isLastProposedWinner: function () {
            const lastProposed = this.proposeds[this.proposeds.length - 1];
            return this.secret.getResult(lastProposed).isWinner(lastProposed.getLength());
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
            that.secret.setRandom(that.VALID_COLORS, that.COMBINATION_LENGTH);
            that.show();
            do {
                const proposed = initProposedCombination();
                proposed.ask(that.VALID_COLORS, that.COMBINATION_LENGTH);
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
        setRandom: function (VALID_COLORS, COMBINATION_LENGTH) {
            for (let i = 0; i < COMBINATION_LENGTH; i++){
                let newColor;
                do {
                    newColor = VALID_COLORS[parseInt(Math.random() * VALID_COLORS.length)];                    
                } while (that.hasColor(newColor));
                that.colors += newColor;
            }
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

        isValid: function (VALID_COLORS, COMBINATION_LENGTH) {
            return this.hasValidLength(COMBINATION_LENGTH)
                && this.hasValidColors(VALID_COLORS)
                && this.hasUniqueColors();
        },

        hasValidLength: function (COMBINATION_LENGTH) {
            return this.colors.length === COMBINATION_LENGTH;
        },

        hasValidColors: function (VALID_COLORS) {
            for (let color of this.colors) {
                let found = false;
                for (let i = 0; !found && i < VALID_COLORS.length; i++) {
                    found = color === VALID_COLORS[i];
                }
                if (!found) {
                    return false;
                }
            }
            return true;
        },

        hasUniqueColors: function () {
            for (let i = 0; i < this.colors.length - 1; i++) {
                for (let j = i + 1; j < this.colors.length; j++) {
                    if (this.colors[i] === this.colors[j]) {
                        return false;
                    }
                }
            }
            return true;
        },

        getErrorMsg: function (VALID_COLORS, COMBINATION_LENGTH) {            
            if (!this.hasValidLength(COMBINATION_LENGTH)) {
                return `Wrong proposed combination length`;
            } else if (!this.hasValidColors(VALID_COLORS)) {
                let errorMsg = `Wrong colors, they must be: `;
                for (let validColor of VALID_COLORS) {
                    errorMsg += validColor;
                }
                return errorMsg;
            } else if (!this.hasUniqueColors()) {
                return `Wrong proposed combination, colors can't be repeated`;
            }
            return undefined;
        },
    };

    return {
        ask: function (VALID_COLORS, COMBINATION_LENGTH) {
            let error;
            do {
                that.colors = consoleMPDS.readString(`Propose a combination:`);
                error = !that.isValid(VALID_COLORS, COMBINATION_LENGTH);
                if (error) {
                    consoleMPDS.writeln(that.getErrorMsg(VALID_COLORS, COMBINATION_LENGTH));
                }
            } while (error);
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