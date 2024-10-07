const { Console } = require("console-mpds");

const consoleMPDS = new Console();

initMastermind().play();

function initMastermind() {
    initEnumSetUp().setUp();

    const that = {
        game: initGame(),
        gameView: initGameView(),
        continueDialog: initYesNoDialog("Do you want to continue?"),
    };

    return {
        play() {
            let resume;
            do {
                that.gameView.play(that.game);
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

function initGameView() {
    const that = {
        secretCombinationView: initSecretCombinationView(),
        proposedCombinationView: initProposedCombinationView(),
        resultView: initResultView(),

        show(game) {
            assert(game ?? false);

            const attempts = game.getAttempts();
            consoleMPDS.writeln(`\n${attempts} attempt(s):`);
            this.secretCombinationView.show(game.getSecret());
            for (let i = 0; i < attempts; i++) {
                this.proposedCombinationView.show(game.getProposed(i));
                consoleMPDS.write(' --> ');
                this.resultView.show(game.getResult(i));
            }
        }
    };

    return {
        play(game) {
            assert(game ?? false);

            consoleMPDS.writeln(`----- MASTERMIND -----`);
            that.show(game);
            do {
                game.addProposed(that.proposedCombinationView.ask());
                that.show(game);
            } while (!game.isWinner() && !game.isMaxAttempts());
            consoleMPDS.writeln(`You've ${game.isWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);
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

    const that = {
        validationErrorView: initValidationErrorView(initProposedCombination("").validColorsToString()),
    }

    return {
        ask() {
            let proposed;
            let error;
            do {
                const colors = consoleMPDS.readString(`Propose a combination:`);
                proposed = initProposedCombination(colors);
                error = !proposed.isValid();
                if (error) {
                    that.validationErrorView.show(proposed.getValidationError());
                }
            } while (error);
            return proposed;
        },

        show(proposed) {
            assert(proposed ?? false);

            consoleMPDS.write(proposed.toString());
        }
    }
}

function initValidationErrorView(validColorsMsg) {
    const that = {
        MESSAGES: [
            `Wrong proposed combination length`,
            `Wrong colors, they must be: ${validColorsMsg}`,
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
            assert(proposed.isValid());
            assert(this.getAttempts() < that.MAX_ATTEMPTS);

            that.proposeds[this.getAttempts()] = proposed;
        },

        getAttempts() {
            return that.proposeds.length;
        },

        getProposed(index) {
            assert(typeof index === "number");
            assert(0 <= index && index < this.getAttempts());

            return that.proposeds[index];
        },

        getResult(index) {
            assert(typeof index === "number");
            assert(0 <= index && index < this.getAttempts());

            return that.secret.getResult(this.getProposed(index));
        },

        isWinner() {
            assert(this.getAttempts() > 0);

            return this.getResult(this.getAttempts() - 1).isWinner();
        },

        isMaxAttempts() {
            return this.getAttempts() === that.MAX_ATTEMPTS;
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

        reset() {
            this.combination = initCombination("");
            do {
                let color;
                do {
                    color = this.combination.getRandomValidColor();
                } while (this.combination.containsColor(color));
                this.combination.addColor(color);
            } while (!this.combination.isValid())
        }
    };
    that.reset();

    return {
        getResult(proposed) {
            assert(proposed ?? false);
            assert(proposed.isValid());

            let blacks = 0;
            let whites = 0;
            for (let i = 0; i < this.getLength(); i++) {
                const colorProposed = proposed.getColor(i);
                if (colorProposed === that.combination.getColor(i)) {
                    blacks++;
                } else if (that.combination.containsColor(colorProposed)) {
                    whites++;
                }
            }
            return initResult(this.getLength(), blacks, whites);
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
            return this.getLength() === this.VALID_LENGTH;
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
                } else {                    
                    test.addColor(color);
                }
            }
            return true;
        },

        getLength() {
            return this.colors.length;
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

        isValid() {
            return this.getValidationError().isNull();
        },

        getValidationError() {
            let validationError = ValidationError.NULL;
            if (!that.hasValidLength()) {
                validationError = ValidationError.INVALID_LENGTH;
            } else if (!that.hasValidColors()) {
                validationError = ValidationError.INVALID_COLORS;
            } else if (!that.hasUniqueColors()) {
                validationError = ValidationError.REPEATED_COLORS;
            }
            return validationError;
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

        addColor(color) {
            assert(typeof color === "string");
            assert(color.length === 1);

            that.colors += color;
        },

        getColor(index) {
            assert(typeof index === "number");
            assert(0 <= index && index < that.getLength());

            return that.colors[index];
        },

        getLength() {
            return that.getLength();
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
    assert(typeof colors === "string");

    const that = {
        combination: initCombination(colors)
    };

    return {
        validColorsToString() {
            return that.combination.validColorsToString();
        },

        isValid() {
            return that.combination.isValid();
        },

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
            return this.getBlacks() === that.combinationLength;
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

        isNegative() {
            return that.answer === that.NO;
        }
    };

    return {
        ask() {
            let error = false;
            do {
                that.answer = consoleMPDS.readString(`${that.question} (${that.YES}/${that.NO}):`);
                error = !this.isAffirmative() && !that.isNegative();
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
        const assertionError = "I'm CONSTANT !!!";
        assertionError = "assert stop execution";
    }
}