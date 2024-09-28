const { Console } = require("console-mpds");

const consoleMPDS = new Console();

initMastermind().play();

function initMastermind() {
    const that = {
        continueDialog: initYesNoDialog("Do you want to continue?"),

        showTitle: function () {
            consoleMPDS.writeln(`----- MASTERMIND -----`);
        },

        assertInvariant: function () {
            assert
        }
    };

    return {
        play: function () {
            that.showTitle();
            do {
                initGame().play();
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
        secret: null,
        proposeds: [],

        isEndGame: function () {
            return this.isWinner() || this.isLoser();
        },

        isWinner: function () {
            const lastProposed = this.proposeds[this.proposeds.length - 1];
            return this.secret.getResult(lastProposed).isWinner();
        },

        isLoser: function () {
            return this.proposeds.length === this.MAX_ATTEMPTS;
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
            consoleMPDS.writeln(`You've ${this.isWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);
        },

        assertInvariant: function () {
            assert(this.secret ?? false);
            assert(typeof this.secret.getResult === "function");
            assert(typeof this.secret.show === "function");
            assert(0 <= that.proposeds.length && that.proposeds.length <= that.MAX_ATTEMPTS);
            for (let proposed of this.proposeds) {
                assert(typeof proposed.show === "function");
            }
        }
    };

    that.secret = initSecretCombination(that.VALID_COLORS, that.COMBINATION_LENGTH);
    that.assertInvariant();

    return {
        play: function () {
            that.assertInvariant();

            that.show();
            do {
                const proposed = initProposedCombination();
                proposed.ask(that.VALID_COLORS, that.COMBINATION_LENGTH);
                that.proposeds[that.proposeds.length] = proposed;
                that.show();
            } while (!that.isEndGame());
            that.showEndMsg();

            that.assertInvariant();
        }
    };
}

function initSecretCombination(VALID_COLORS, COMBINATION_LENGTH) {
    assert(COMBINATION_LENGTH > 0);
    assert(VALID_COLORS.length > COMBINATION_LENGTH);

    const that = {
        colors: "",

        hasColor: function (searched) {
            for (let color of this.colors) {
                if (color === searched) {
                    return true;
                }
            }
            return false;
        },

        assertInvariant: function () {
            // TODO
        }
    };

    for (let i = 0; i < COMBINATION_LENGTH; i++) {
        let newColor;
        do {
            newColor = VALID_COLORS[parseInt(Math.random() * VALID_COLORS.length)];
        } while (that.hasColor(newColor));
        that.colors += newColor;
    }

    that.assertInvariant();

    return {
        getResult: function (proposed) {
            assert(proposed ?? false);
            assert(typeof proposed.getColor === "function");

            let blacks = 0;
            let whites = 0;
            for (let i = 0; i < that.colors.length; i++) {
                if (that.colors[i] === proposed.getColor(i)) {
                    blacks++;
                } else if (that.hasColor(proposed.getColor(i))) {
                    whites++;
                }
            }
            return initResult(blacks, whites, that.colors.length);
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

        assertInvariant: function (VALID_COLORS, COMBINATION_LENGTH) {
            assert(this.colors === "" || this.isValid(VALID_COLORS, COMBINATION_LENGTH));
        }
    };

    that.assertInvariant();

    return {
        ask: function (VALID_COLORS, COMBINATION_LENGTH) {
            assert(COMBINATION_LENGTH > 0);
            assert(VALID_COLORS.length > COMBINATION_LENGTH);

            let error;
            do {
                that.colors = consoleMPDS.readString(`Propose a combination:`);
                error = !that.isValid(VALID_COLORS, COMBINATION_LENGTH);
                if (error) {
                    consoleMPDS.writeln(that.getErrorMsg(VALID_COLORS, COMBINATION_LENGTH));
                }
            } while (error);

            that.assertInvariant(VALID_COLORS, COMBINATION_LENGTH);
        },

        getColor: function (index) {
            assert(0 <= index && index < that.colors.length);

            return that.colors[index];
        },

        show: function () {
            consoleMPDS.write(that.colors);
        }
    };
}

function initResult(blacks, whites, winnerBlacks) {

    const that = {
        blacks: blacks,
        whites: whites,
        winnerBlacks: winnerBlacks,

        assertInvariant: function () {
            assert(blacks >= 0);
            assert(whites >= 0);
            assert(winnerBlacks >= blacks + whites);
        }
    };

    that.assertInvariant();

    return {
        isWinner: function () {
            return that.blacks === that.winnerBlacks;
        },

        show: function () {
            consoleMPDS.writeln(`${that.blacks} blacks and ${that.whites} whites`);
        }
    };
}

function initYesNoDialog(question) {
    const that = {
        YES: "y",
        NO: "n",
        question: question,
        answer: undefined,

        assertInvariant: function () {
            assert(typeof this.question === "string");
            assert(this.answer === undefined || this.answer === this.YES || this.answer === this.NO);
        }
    };

    that.assertInvariant();

    return {
        ask: function () {
            that.assertInvariant();

            let error = false;
            do {
                that.answer = consoleMPDS.readString(`${that.question} (${that.YES}/${that.NO}):`);
                error = !this.isAffirmative() && that.answer !== that.NO;
                if (error) {
                    consoleMPDS.writeln(`Please, answer "${that.YES}" or "${that.NO}"`);
                }
            } while (error);

            that.assertInvariant();
        },

        isAffirmative: function () {
            return that.answer === that.YES;
        }
    };
}

function assert(condition, msg) {
    if (!condition) {
        if (msg !== undefined) {
            console.log(`Assertion Error: ` + msg);
        }
        const assertionError = null;
        assertionError = 2;
    }
}