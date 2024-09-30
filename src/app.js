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
            assert(this.continueDialog ?? false);
        }
    };

    that.assertInvariant();
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
        MAX_ATTEMPTS: 10,
        secret:  initSecretCombination(),
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

        addProposed: function (proposed) {
            this.assertInvariant();
            assert(this.proposeds.length < this.MAX_ATTEMPTS);

            this.proposeds[this.proposeds.length] = proposed;

            this.assertInvariant();
        },

        showEndMsg: function () {
            consoleMPDS.writeln(`You've ${this.isWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);
        },

        assertInvariant: function () {
            assert(this.secret ?? false);
            assert(0 <= this.proposeds.length && this.proposeds.length <= this.MAX_ATTEMPTS);
            for (let proposed of this.proposeds) {
                assert(proposed ?? false);
            }
        }
    };
    
    that.assertInvariant();
    return {
        play: function () {
            that.show();
            do {
                const proposed = initProposedCombination();
                proposed.ask();
                that.addProposed(proposed);
                that.show();
            } while (!that.isEndGame());
            that.showEndMsg();            
        }
    };
}

function initSecretCombination() {
    const that = {
        colors: "",

        isValid: function () {
            const validator = initCombinationValidator();
            return validator.hasValidLength(this.colors)
                && validator.hasValidColors(this.colors)
                && validator.hasUniqueColors(this.colors);
        },

        hasColor: function (searched) {
            assert(typeof searched === "string");

            for (let color of this.colors) {
                if (color === searched) {
                    return true;
                }
            }
            return false;
        },

        assertInvariant: function () {
            assert(this.isValid());
        }
    };

    const validator = initCombinationValidator();
    while (!validator.hasValidLength(that.colors)) {        
        let color = validator.getRandomValidColor();        
        if (validator.hasUniqueColors(that.colors + color)) {
            that.colors += color;
        }
    }

    that.assertInvariant();
    return {
        getResult: function (proposed) {         
            assert(proposed ?? false);

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

function initCombinationValidator() {
    const that = {
        COMBINATION_LENGTH: 4,
        VALID_COLORS: ['r', 'g', 'y', 'b', 'm', 'c'],        

        assertInvariant: function () {
            // none, his state don't change
        }
    };

    that.assertInvariant();
    return {
        hasValidLength: function (colors) {
            assert(typeof colors === "string");

            return colors.length === that.COMBINATION_LENGTH;
        },

        hasValidColors: function (colors) {    
            assert(typeof colors === "string");

            for (let color of colors) {
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

        hasUniqueColors: function (colors) { 
            assert(typeof colors === "string");

            for (let i = 0; i < colors.length - 1; i++) {
                for (let j = i + 1; j < colors.length; j++) {
                    if (colors[i] === colors[j]) {
                        return false;
                    }
                }
            }
            return true;
        },

        getRandomValidColor: function () {
            return that.VALID_COLORS[parseInt(Math.random() * that.VALID_COLORS.length)];
        },

        validColorsToString: function () {
            let msg = "";
            for (let validColor of that.VALID_COLORS) {
                msg += validColor;
            }
            return msg;
        }
    }
}

function initProposedCombination() {
    const that = {
        colors: "",

        isValid: function () {
            const validator = initCombinationValidator();
            return validator.hasValidLength(this.colors)
                && validator.hasValidColors(this.colors)
                && validator.hasUniqueColors(this.colors);
        },

        getErrorMsg: function () {            
            const validator = initCombinationValidator();
            if (!validator.hasValidLength(this.colors)) {
                return `Wrong proposed combination length`;
            } else if (!validator.hasValidColors(this.colors)) {
                return  `Wrong colors, they must be: ${validator.validColorsToString()}`;
            } else if (!validator.hasUniqueColors(this.colors)) {
                return `Wrong proposed combination, colors can't be repeated`;
            }
            return undefined;
        },

        assertInvariant: function () {
            assert(this.colors === "" || this.isValid());
        }
    };

    that.assertInvariant();

    return {
        ask: function () {            
            that.assertInvariant();

            let error;
            do {
                that.colors = consoleMPDS.readString(`Propose a combination:`);
                error = !that.isValid();
                if (error) {
                    consoleMPDS.writeln(that.getErrorMsg());
                }
            } while (error);

            that.assertInvariant();
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

function initResult(blacks, whites, secretLength) {
    const that = {
        SECRET_LENGTH: secretLength,
        blacks: blacks,
        whites: whites,        

        assertInvariant: function () {
            assert(this.blacks >= 0);
            assert(this.whites >= 0);
            assert(this.SECRET_LENGTH >= this.blacks + this.whites);
        }
    };

    that.assertInvariant();
    return {
        isWinner: function () {
            return that.blacks === that.SECRET_LENGTH;
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
        assertionError = "assert stop execution";
    }
}

