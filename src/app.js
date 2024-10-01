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

    (function configEnum () { 
        ValidationResult(); 
        Object.freeze(ValidationResult);
    }());

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
        secret: initSecretCombination(),
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
        combination: null,

        assertInvariant: function () {
            assert(this.combination.getValidationResult() === ValidationResult.OK);
        }
    };

    that.combination = initCombination("");
    do {
        let color;
        do {
            color = that.combination.getRandomValidColor();
        } while (that.combination.containsColor(color));
        that.combination.addColor(color);        
    } while (that.combination.getValidationResult() !== ValidationResult.OK)

    that.assertInvariant();

    return {
        getResult: function (proposed) {
            assert(proposed ?? false);
            assert(proposed.getLength() === that.combination.getLength());

            let blacks = 0;
            let whites = 0;
            const length = that.combination.getLength();
            for (let i = 0; i < length; i++) {
                const colorProposed = proposed.getColor(i);
                if (colorProposed === that.combination.getColor(i)) {
                    blacks++;
                } else if (that.combination.containsColor(colorProposed)) {
                    whites++;
                }
            }
            return initResult(length, blacks, whites);
        },

        show: function () {
            const HIDDEN_CHAR = '*';
            let msg = '';
            for (let i = 0; i < that.combination.getLength(); i++) {
                msg += HIDDEN_CHAR;
            }
            consoleMPDS.writeln(msg);
        }
    };
}

function initCombination(colors) {
    assert(colors.length >= 0);
    for (let color of colors) {
        assert(typeof color === "string");
    }

    const that = {
        VALID_LENGTH: 4,
        VALID_COLORS: ['r', 'g', 'y', 'b', 'm', 'c'],
        colors: colors,

        hasValidLength: function () {
            return this.colors.length === this.VALID_LENGTH;
        },

        hasValidColors: function () {
            const valids = initCombination(this.VALID_COLORS);
            for (let color of this.colors) {
                if (!valids.containsColor(color)) {
                    return false;
                }
            }
            return true;
        },

        hasUniqueColors: function () {
            const test = initCombination("");
            for (let color of this.colors) {
                if (test.containsColor(color)) {
                    return false;
                }
                test.addColor(color);
            }
            return true;
        },

        assertInvariant: function () {
            assert(that.colors.length >= 0);
            for (let color of that.colors) {
                assert(typeof color === "string");
            }
        }
    };

    that.assertInvariant();

    return {
        getRandomValidColor: function () {
            return that.VALID_COLORS[parseInt(Math.random() * that.VALID_COLORS.length)];
        },

        validColorsToString: function () {
            let msg = "";
            for (let validColor of that.VALID_COLORS) {
                msg += validColor;
            }
            return msg;
        },

        addColor: function (color) {
            that.assertInvariant();
            assert(typeof color === "string");
            assert(color.length === 1);

            that.colors += color;

            that.assertInvariant();
        },

        containsColor: function (searched) {
            assert(typeof searched === "string");
            assert(searched.length === 1);

            for (let color of that.colors) {
                if (color === searched) {
                    return true;
                }
            }
            return false;
        },

        getColor: function (index) {
            assert(0 <= index && index < this.getLength());
            return that.colors[index];
        },

        getLength: function () {
            return that.colors.length;
        },

        getValidationResult: function () {
            if (!that.hasValidLength()) {                
                return ValidationResult.INVALID_LENGTH;
            } else if (!that.hasValidColors()) {
                return ValidationResult.INVALID_COLORS;
            } else if (!that.hasUniqueColors()) {
                return ValidationResult.REPEATED_COLORS;
            }            
            return ValidationResult.OK;
        },

        show: function () {
            consoleMPDS.write(that.colors);
        }
    };
}

function ValidationResult () {
    ValidationResult.OK = {};
    ValidationResult.INVALID_LENGTH = {};
    ValidationResult.INVALID_COLORS = {};
    ValidationResult.REPEATED_COLORS = {};
}

function initProposedCombination() {
    const that = {
        combination: null,

        showError: function (validationResult) {
            let msg;
            switch (validationResult) {
                case ValidationResult.INVALID_LENGTH:
                    msg = `Wrong proposed combination length`;
                    break;
                case ValidationResult.INVALID_COLORS:
                    msg = `Wrong colors, they must be: ${that.combination.validColorsToString()}`;
                    break;
                case ValidationResult.REPEATED_COLORS:
                    msg = `Wrong proposed combination, colors can't be repeated`
            }
            consoleMPDS.writeln(msg);
        },

        assertInvariant: function () {
            assert(this.combination === null ||
                this.combination.getValidationResult() === ValidationResult.OK);
        }
    };

    that.assertInvariant();

    return {
        ask: function () {
            that.assertInvariant();

            let error;
            do {
                const colors = consoleMPDS.readString(`Propose a combination:`);
                that.combination = initCombination(colors);
                const validationResult = that.combination.getValidationResult();
                error = validationResult !== ValidationResult.OK;
                if (error) {
                    that.showError(validationResult);
                }
            } while (error);

            that.assertInvariant();
        },

        getColor: function (index) {
            return that.combination.getColor(index);
        },

        getLength: function () {
            return that.combination.getLength()
        },

        show: function () {
            that.combination.show();
        }
    };
}

function initResult(secretLength, blacks, whites) {
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