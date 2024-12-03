const { Console } = require("console-mpds");

const consoleMPDS = new Console();

new Mastermind().play();

function Mastermind() {
    initPrototypes();
    initEnums();

    this.game = new Game();
    this.gameView = new GameView();
    this.continueDialog = new YesNoDialog("Do you want to continue?");

    function initEnums() { // to init simulated enums
        ValidationError();
        Object.freeze(ValidationError);
    };

    function initPrototypes() {
        initMastermindPrototype();
        initYesNoDialogProtoype();
        initGameViewPrototype();
        initSecretCombinationViewProtoype();
        initProposedCombinationViewPrototype();
        initValidationErrorViewPrototype();
        initResultViewPrototype();
        initGamePrototype();
        initSecretCombinationPrototype();
        initProposedCombinationPrototype();
        initCombinationPrototype();
        initResultPrototype();
    };
}
function initMastermindPrototype() {
    Mastermind.prototype.play = function() {
        let resume;
        do {
            this.gameView.play(this.game);
            this.continueDialog.ask();
            resume = this.continueDialog.isAffirmative();
            if (resume) {
                this.game.reset();
            }
        } while (resume);
    }
}

function ValidationError() { // enum aproach
    ValidationError.INVALID_LENGTH = new ValidationErrorObject(0);
    ValidationError.INVALID_COLORS = new ValidationErrorObject(1);
    ValidationError.REPEATED_COLORS = new ValidationErrorObject(2);
    ValidationError.NULL = new ValidationErrorObject(3);

    initValidationErrorObjectPrototype();

    function ValidationErrorObject(ordinal) {
        this.ordinal = ordinal;
    }

    function initValidationErrorObjectPrototype() {
        ValidationErrorObject.prototype.isNull = function () {
            return this === ValidationError.NULL;
        };

        ValidationErrorObject.prototype.getOrdinal = function () {
            return this.ordinal;
        };
    }
}

function YesNoDialog(question) {
    assert(typeof question === "string");

    this.YES = "y";
    this.NO = "n";
    this.question = question;
    this.answer = undefined;
}
function initYesNoDialogProtoype() {
    YesNoDialog.prototype.ask = function () {
        let error = false;
        do {
            this.answer = consoleMPDS.readString(`${this.question} (${this.YES}/${this.NO}):`);
            error = !this.isAffirmative() && !isNegative(this);
            if (error) {
                consoleMPDS.writeln(`Please, answer "${this.YES}" or "${this.NO}"`);
            }
        } while (error);

        function isNegative(object) {
            return hasAnswer(object, object.NO);
        }
    };

    YesNoDialog.prototype.isAffirmative = function () {
        return hasAnswer(this, this.YES);
    };

    function hasAnswer(object, expected) {
        assert(object ?? false);
        return object.answer === expected;
    }
}

function GameView() {
    this.secretCombinationView = new SecretCombinationView();
    this.proposedCombinationView = new ProposedCombinationView();
    this.resultView = new ResultView();
}
function initGameViewPrototype() {
    GameView.prototype.play = function(game) {
        assert(game ?? false);

        consoleMPDS.writeln(`----- MASTERMIND -----`);
        show(game, this);
        do {
            game.addProposed(this.proposedCombinationView.ask());
            show(game, this);
        } while (!game.isWinner() && !game.isMaxAttempts());
        consoleMPDS.writeln(`You've ${game.isWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);

        function show(game, gameView) {
            assert(game ?? false);

            const attempts = game.getAttempts();
            consoleMPDS.writeln(`\n${attempts} attempt(s):`);
            gameView.secretCombinationView.show(game.getSecret());
            for (let i = 0; i < attempts; i++) {
                gameView.proposedCombinationView.show(game.getProposed(i));
                consoleMPDS.write(' --> ');
                gameView.resultView.show(game.getResult(i));
            }
        }
    }
}

function SecretCombinationView() {
    // without attributes due a dessign
}
function initSecretCombinationViewProtoype() {

    SecretCombinationView.prototype.show = function (secret) {
        assert(secret ?? false);

        const HIDDEN_COLOR = '*';
        let msg = '';
        for (let i = 0; i < secret.getLength(); i++) {
            msg += HIDDEN_COLOR;
        }
        consoleMPDS.writeln(msg);
    }
}

function ProposedCombinationView() {
    this.validationErrorView = new ValidationErrorView(new ProposedCombination("").validColorsToString());
}
function initProposedCombinationViewPrototype() {
    ProposedCombinationView.prototype.ask = function () {
        let proposed;
        let error;
        do {
            const colors = consoleMPDS.readString(`Propose a combination:`);
            proposed = new ProposedCombination(colors);
            error = !proposed.isValid();
            if (error) {
                this.validationErrorView.show(proposed.getValidationError());
            }
        } while (error);
        return proposed;
    };

    ProposedCombinationView.prototype.show = function (proposed) {
        assert(proposed ?? false);

        consoleMPDS.write(proposed.toString());
    };
}

function ValidationErrorView(validColorsMsg) {
    this.MESSAGES = [
        `Wrong proposed combination length`,
        `Wrong colors, they must be: ${validColorsMsg}`,
        `Wrong proposed combination, colors can't be repeated`
    ]
}
function initValidationErrorViewPrototype() {
    ValidationErrorView.prototype.show = function (validationError) {
        assert(!validationError.isNull());
        assert(0 <= validationError.getOrdinal() && validationError.getOrdinal() < this.MESSAGES.length);

        consoleMPDS.writeln(this.MESSAGES[validationError.getOrdinal()]);
    }
}

function ResultView() {
    // without attributes due a dessign
}
function initResultViewPrototype() {
    ResultView.prototype.show = function (result) {
        assert(result ?? false);

        consoleMPDS.writeln(`${result.getBlacks()} blacks and ${result.getWhites()} whites`);
    }
}

function Game() {
    this.MAX_ATTEMPTS = 10;
    this.proposeds = [];
    this.secret = new SecretCombination();
}
function initGamePrototype() {
    Game.prototype.addProposed = function (proposed) {
        assert(proposed ?? false);
        assert(proposed.isValid());
        assert(this.getAttempts() < this.MAX_ATTEMPTS);

        this.proposeds[this.getAttempts()] = proposed;
    };

    Game.prototype.getAttempts = function () {
        return this.proposeds.length;
    };

    Game.prototype.getProposed = function (index) {
        assert(typeof index === "number");
        assert(0 <= index && index < this.getAttempts());

        return this.proposeds[index];
    };

    Game.prototype.getResult = function (index) {
        assert(typeof index === "number");
        assert(0 <= index && index < this.getAttempts());

        return this.secret.getResult(this.getProposed(index));
    };

    Game.prototype.isWinner = function () {
        assert(this.getAttempts() > 0);

        return this.getResult(this.getAttempts() - 1).isWinner();
    };

    Game.prototype.isMaxAttempts = function () {
        return this.getAttempts() === this.MAX_ATTEMPTS;
    };

    Game.prototype.getSecret = function () {
        return this.secret;
    };

    Game.prototype.reset = function () {
        this.proposeds = [];
        this.secret.reset();
    };
}

function SecretCombination() {
    this.combination = null;
    this.reset();
}
function initSecretCombinationPrototype() {
    SecretCombination.prototype.reset = function () {
        this.combination = new Combination("");
        do {
            let color;
            do {
                color = this.combination.getRandomValidColor();
            } while (this.combination.containsColor(color));
            this.combination.addColor(color);
        } while (!this.combination.isValid());
    };

    SecretCombination.prototype.getResult = function (proposed) {
        assert(proposed ?? false);
        assert(proposed.isValid());

        let blacks = 0;
        let whites = 0;
        for (let i = 0; i < this.getLength(); i++) {
            const colorProposed = proposed.getColor(i);
            if (colorProposed === this.combination.getColor(i)) {
                blacks++;
            } else if (this.combination.containsColor(colorProposed)) {
                whites++;
            }
        }
        return new Result(this.getLength(), blacks, whites);
    };

    SecretCombination.prototype.getLength = function () {
        return this.combination.getLength();
    };
}

function ProposedCombination(colors) {
    assert(typeof colors === "string");

    this.combination = new Combination(colors);
}
function initProposedCombinationPrototype() {
    ProposedCombination.prototype.validColorsToString = function () {
        return this.combination.validColorsToString();
    },

        ProposedCombination.prototype.isValid = function () {
            return this.combination.isValid();
        },

        ProposedCombination.prototype.getValidationError = function () {
            return this.combination.getValidationError();
        },

        ProposedCombination.prototype.getColor = function (index) {
            assert(typeof index === "number");
            assert(0 <= index && index < this.combination.getLength());

            return this.combination.getColor(index);
        },

        ProposedCombination.prototype.toString = function () {
            return this.combination.toString();
        }
}

function Combination(colors) {
    assert(colors.length >= 0);
    for (let color of colors) {
        assert(typeof color === "string");
    }

    this.VALID_LENGTH = 4;
    this.VALID_COLORS = ['r', 'g', 'y', 'b', 'm', 'c'];
    this.colors = colors;
}
function initCombinationPrototype() {
    Combination.prototype.validColorsToString = function () {
        let msg = "";
        for (let validColor of this.VALID_COLORS) {
            msg += validColor;
        }
        return msg;
    };

    Combination.prototype.getRandomValidColor = function () {
        return this.VALID_COLORS[parseInt(Math.random() * this.VALID_COLORS.length)];
    };

    Combination.prototype.isValid = function () {
        return this.getValidationError().isNull();
    };

    Combination.prototype.getValidationError = function () {
        let validationError = ValidationError.NULL;
        if (!hasValidLength(this)) {
            validationError = ValidationError.INVALID_LENGTH;
        } else if (!hasValidColors(this)) {
            validationError = ValidationError.INVALID_COLORS;
        } else if (!hasUniqueColors(this)) {
            validationError = ValidationError.REPEATED_COLORS;
        }
        return validationError;

        function hasValidLength(combination) {
            return combination.getLength() === combination.VALID_LENGTH;
        };

        function hasValidColors(combination) {
            const valids = new Combination(combination.VALID_COLORS);
            for (let color of combination.colors) {
                if (!valids.containsColor(color)) {
                    return false;
                }
            }
            return true;
        };

        function hasUniqueColors(combination) {
            const test = new Combination("");
            for (let color of combination.colors) {
                if (test.containsColor(color)) {
                    return false;
                } else {
                    test.addColor(color);
                }
            }
            return true;
        };
    };

    Combination.prototype.containsColor = function (searched) {
        assert(typeof searched === "string");
        assert(searched.length === 1);

        for (let color of this.colors) {
            if (color === searched) {
                return true;
            }
        }
        return false;
    };

    Combination.prototype.addColor = function (color) {
        assert(typeof color === "string");
        assert(color.length === 1);

        this.colors += color;
    };

    Combination.prototype.getColor = function (index) {
        assert(typeof index === "number");
        assert(0 <= index && index < this.getLength());

        return this.colors[index];
    };

    Combination.prototype.getLength = function () {
        return this.colors.length;
    };

    Combination.prototype.toString = function () {
        return this.colors;
    };
}

function Result(combinationLength, blacks, whites) {
    assert(blacks >= 0);
    assert(whites >= 0);
    assert(combinationLength >= blacks + whites);

    this.combinationLength = combinationLength;
    this.blacks = blacks;
    this.whites = whites;
}
function initResultPrototype() {
    Result.prototype.isWinner = function () {
        return this.getBlacks() === this.combinationLength;
    };

    Result.prototype.getBlacks = function () {
        return this.blacks;
    };

    Result.prototype.getWhites = function () {
        return this.whites;
    }
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