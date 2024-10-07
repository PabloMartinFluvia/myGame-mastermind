const { Console } = require("console-mpds");

const consoleMPDS = new Console();

initMastermind().play();

function initMastermind() {
    initEnumSetUp().setUp();

    const that = {
        game: initGame(),
        gameView: null,
        continueDialog: initYesNoDialog("Do you want to continue?"),
    };
    that.gameView = initGameView(that.game);

    return {
        play() {
            let resume;
            do {
                that.gameView.play();
                that.continueDialog.ask();
                resume = that.continueDialog.isAffirmative();
                if (resume) {
                    that.game.reset();
                }
            } while (resume);
        }
    }
}

function initEnumSetUp() {
    return {
        setUp() {
            ValidationError();
            Object.freeze(ValidationError);
        }
    }
}

function initGameView(game) {
    assert(game ?? false);

    const that = {
        game: game,
        secretCombinationView: initSecretCombinationView(),
        proposedCombinationView: initProposedCombinationView(),
        resultView: initResultView(),

        show() {
            const proposeds = this.game.getProposeds();
            consoleMPDS.writeln(`\n${proposeds.length} attempt(s):`);
            const secret = this.game.getSecret();
            this.secretCombinationView.show(secret);
            for (let proposed of proposeds) {
                this.proposedCombinationView.show(proposed);
                consoleMPDS.write(' --> ');
                const result = secret.getResult(proposed)
                this.resultView.show(result);
            }
        }
    };

    return {
        play() {
            consoleMPDS.writeln(`----- MASTERMIND -----`);
            that.show();
            do {
                const proposed = that.proposedCombinationView.ask();
                that.game.addProposed(proposed);
                that.show();
            } while (!that.game.isWinner() && !that.game.isMaxAttempts());
            consoleMPDS.writeln(`You've ${that.game.isWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);
        }
    };
}

function initSecretCombinationView() {
    return {
        show: function (secret) {
            assert(secret ?? false);

            const HIDDEN_COLOR = '*';
            let msg = '';
            for (let i = 0; i < secret.getLength(); i++) {
                msg += HIDDEN_COLOR;
            }
            consoleMPDS.writeln(msg);
        }
    }
}

function initProposedCombinationView() {
    return {
        ask() {
            let proposed;
            let validationError;
            do {
                const colors = consoleMPDS.readString(`Propose a combination:`);
                proposed = initProposedCombination(colors);
                validationError = proposed.getValidationError();
                if (!validationError.isNull()) {
                    initValidationErrorView().show(validationError);
                }
            } while (!validationError.isNull());
            return proposed;
        },

        show(proposed) {
            assert(proposed ?? false);

            consoleMPDS.write(proposed.toString());
        }
    }
}

function initValidationErrorView() {
    const that = {
        MESSAGES: [
            `Wrong proposed combination length`,
            `Wrong colors, they must be: ${initCombination("").validColorsToString()}`,
            `Wrong proposed combination, colors can't be repeated`
        ]
    }

    return {
        show(validationError) {
            assert(!validationError.isNull());
            assert(0 <= validationError.ordinal() && validationError.ordinal() < that.MESSAGES.length);

            consoleMPDS.writeln(that.MESSAGES[validationError.ordinal()]);
        }
    };
}

function initResultView() {
    return {
        show(result) {
            assert(result ?? false);

            consoleMPDS.writeln(`${result.getBlacks()} blacks and ${result.getWhites()} whites`);
        }
    }
}

function initGame() {
    const that = {
        MAX_ATTEMPTS: 10,
        proposeds: [],
        secret: initSecretCombination(),
    };

    return {
        addProposed(proposed) {
            assert(proposed ?? false);
            assert(that.proposeds.length < that.MAX_ATTEMPTS);

            that.proposeds[that.proposeds.length] = proposed;
        },

        isWinner() {
            const lastProposed = that.proposeds[that.proposeds.length - 1];
            return that.secret.getResult(lastProposed).isWinner();
        },

        isMaxAttempts() {
            return that.proposeds.length === that.MAX_ATTEMPTS;
        },

        getProposeds() {
            return that.proposeds;
        },

        getSecret() {
            return that.secret;
        },

        reset() {
            that.proposeds = [];
            that.secret.reset();
        }
    };
}

function initSecretCombination() {
    const that = {
        combination: null,

        init() {
            this.combination = initCombination("");
            do {
                let color;
                do {
                    color = this.combination.getRandomValidColor();
                } while (this.combination.containsColor(color));
                this.combination.addColor(color);
            } while (!this.combination.getValidationError().isNull())
        }
    };
    that.init();

    return {
        getResult(proposed) {
            assert(proposed ?? false);
            assert(proposed.getValidationError().isNull());

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

        getLength() {
            return that.combination.getLength();
        },

        reset() {
            that.init();
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

        hasValidLength() {
            return this.colors.length === this.VALID_LENGTH;
        },

        hasValidColors() {
            const valids = initCombination(this.VALID_COLORS);
            for (let color of this.colors) {
                if (!valids.containsColor(color)) {
                    return false;
                }
            }
            return true;
        },

        hasUniqueColors() {
            const test = initCombination("");
            for (let color of this.colors) {
                if (test.containsColor(color)) {
                    return false;
                }
                test.addColor(color);
            }
            return true;
        },

        assertInvariant() {
            assert(that.colors.length >= 0);
            for (let color of that.colors) {
                assert(typeof color === "string");
            }
        }
    };

    return {
        validColorsToString() {
            let msg = "";
            for (let validColor of that.VALID_COLORS) {
                msg += validColor;
            }
            return msg;
        },

        getRandomValidColor() {
            return that.VALID_COLORS[parseInt(Math.random() * that.VALID_COLORS.length)];
        },

        addColor(color) {
            that.assertInvariant();
            assert(typeof color === "string");
            assert(color.length === 1);

            that.colors += color;

            that.assertInvariant();
        },

        containsColor(searched) {
            assert(typeof searched === "string");
            assert(searched.length === 1);

            for (let color of that.colors) {
                if (color === searched) {
                    return true;
                }
            }
            return false;
        },

        getColor(index) {
            assert(typeof index === "number");
            assert(0 <= index && index < this.getLength());

            return that.colors[index];
        },

        getLength() {
            return that.colors.length;
        },

        getValidationError() {
            if (!that.hasValidLength()) {
                return ValidationError.INVALID_LENGTH;
            } else if (!that.hasValidColors()) {
                return ValidationError.INVALID_COLORS;
            } else if (!that.hasUniqueColors()) {
                return ValidationError.REPEATED_COLORS;
            }
            return ValidationError.NULL;
        },

        toString() {
            return that.colors;
        }
    };
}

function ValidationError() {
    ValidationError.INVALID_LENGTH = initError(0);
    ValidationError.INVALID_COLORS = initError(1);
    ValidationError.REPEATED_COLORS = initError(2);
    ValidationError.NULL = initError(3);

    function initError(ordinal) {
        const that = {
            ordinal: ordinal
        }

        return {
            isNull() {
                return this === ValidationError.NULL;
            },

            ordinal() {
                return that.ordinal;
            }
        }
    }
}

function initProposedCombination(colors) {
    const that = {
        combination: initCombination(colors)
    };

    return {
        getValidationError() {
            return that.combination.getValidationError();
        },

        getColor(index) {
            assert(typeof index === "number");
            assert(0 <= index && index < that.combination.getLength());

            return that.combination.getColor(index);
        },

        toString() {
            return that.combination.toString();
        }
    };
}

function initResult(combinationLength, blacks, whites) {
    assert(blacks >= 0);
    assert(whites >= 0);
    assert(combinationLength >= blacks + whites);

    const that = {
        combinationLength: combinationLength,
        blacks: blacks,
        whites: whites,
    };

    return {
        isWinner() {
            return that.blacks === that.combinationLength;
        },

        getBlacks() {
            return that.blacks;
        },

        getWhites() {
            return that.whites;
        }
    };
}

function initYesNoDialog(question) {
    assert(typeof question === "string");

    const that = {
        YES: "y",
        NO: "n",
        question: question,
        answer: undefined,
    };

    return {
        ask() {
            let error = false;
            do {
                that.answer = consoleMPDS.readString(`${that.question} (${that.YES}/${that.NO}):`);
                error = !this.isAffirmative() && that.answer !== that.NO;
                if (error) {
                    consoleMPDS.writeln(`Please, answer "${that.YES}" or "${that.NO}"`);
                }
            } while (error);
        },

        isAffirmative() {
            return that.answer === that.YES;
        }
    };
}

function assert(condition, msg) {
    if (!condition) {
        if (msg !== undefined) {
            console.log(`Assertion Error: ${msg}`);
        }
        const assertionError = null;
        assertionError = "assert stop execution";
    }
}