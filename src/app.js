const { Console } = require("console-mpds");

const consoleMPDS = new Console();

new Mastermind().play();

function Mastermind() {
    initPrototypes();

    this.game = new Game();
    this.gameView = new GameView(this.game);
    this.continueDialog = new YesNoDialog("Do you want to continue?");

    function initPrototypes() {
        initMastermindPrototype();
        initYesNoDialogProtoype();
        initGameViewPrototype();
        initSecretCombinationViewProtoype();
        initProposedCombinationViewPrototype();        
        initResultViewPrototype();
        initGamePrototype();
        initSecretCombinationPrototype();
        initProposedCombinationPrototype();
        initCombinationPrototype();
        initErrorPrototype();
        initResultPrototype();
        initIntervalOpenClosedProtorype();
    };
}
function initMastermindPrototype() {
    Mastermind.prototype.play = function () {
        let resume;
        do {
            this.gameView.play();
            this.continueDialog.ask();
            resume = this.continueDialog.isAffirmative();
            if (resume) {
                this.game.reset();
            }
        } while (resume);
    }
}

function YesNoDialog(question) {
    assert(typeof question === "string");
    assert(question.endsWith('?'));

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

        function isNegative(dialog) {
            return dialog.answer === dialog.NO;;
        }
    };

    YesNoDialog.prototype.isAffirmative = function () {
        return this.answer === this.YES;        
    };
}

function GameView(game) {
    assert(game ?? false);
    this.game = game;
    this.secretCombinationView = new SecretCombinationView();
    this.proposedCombinationView = new ProposedCombinationView(game);
    this.resultView = new ResultView(game);
}
function initGameViewPrototype() {
    GameView.prototype.play = function () {        
        consoleMPDS.writeln(`----- MASTERMIND -----`);
        show(this);
        do {
            this.proposedCombinationView.read();            
            show(this);
        } while (!this.game.isWinner() && !this.game.isMaxAttempts());
        consoleMPDS.writeln(`You've ${this.game.isWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);

        function show(gameView) {
            const attemptsCount = gameView.game.countAttempts();
            consoleMPDS.writeln(`\n${attemptsCount} attempt(s):`);
            gameView.secretCombinationView.show();
            for (let attempt = 1; attempt <= attemptsCount; attempt++) {
                gameView.proposedCombinationView.show(attempt);
                consoleMPDS.write(' --> ');
                gameView.resultView.show(attempt);
            }
        }        
    }
}

function SecretCombinationView() {
    this.HIDDEN_COLOR = '*';
    this.COMBINATION_LENGTH = new Combination().VALID_LENGTH;
}
function initSecretCombinationViewProtoype() {

    SecretCombinationView.prototype.show = function () {
        consoleMPDS.writeln(this.HIDDEN_COLOR.repeat(this.COMBINATION_LENGTH));
    }
}

function ProposedCombinationView(game) {
    assert(game ?? false);
    this.game = game;
}
function initProposedCombinationViewPrototype() {
    ProposedCombinationView.prototype.read = function () {
        let proposed;
        let error;
        do {
            const colors = consoleMPDS.readString(`Propose a combination:`);            
            proposed = new ProposedCombination(Array.from(colors));
            error = !proposed.isValid();
            if (error) {
                consoleMPDS.writeln(proposed.getValidationError().toString());
            }
        } while (error);
        this.game.addProposed(proposed);
    };

    ProposedCombinationView.prototype.show = function (attempt) {        
        const colors = this.game.getProposed(attempt - 1).getColors();
        consoleMPDS.write(colors.join(""));
    };
}

function ResultView(game) {
    assert(game ?? false);
    this.game = game;
}
function initResultViewPrototype() {
    ResultView.prototype.show = function (attempt) {        
        const result = this.game.getResult(attempt - 1);
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
        assert(!this.isMaxAttempts());

        this.proposeds.push(proposed);        
    };

    Game.prototype.countAttempts = function () {
        return this.proposeds.length;
    };

    Game.prototype.isMaxAttempts = function () {
        return this.countAttempts() === this.MAX_ATTEMPTS;
    };

    Game.prototype.isWinner = function () {
        assert(this.countAttempts() > 0);

        return this.getResult(this.countAttempts() - 1).isWinner();
    };

    Game.prototype.getResult = function (index) {
        return this.secret.getResult(this.getProposed(index));
    };

    Game.prototype.getProposed = function (index) {
        assert(new IntervalOpenClosed(this.countAttempts()).includes(index));      

        return this.proposeds[index];
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
        this.combination = new Combination();
        do {
            let color;
            do {
                color = this.combination.getRandomValidColor();
            } while (this.combination.includes(color));
            this.combination.addColor(color);
        } while (!this.combination.isValid());
    };

    SecretCombination.prototype.getResult = function (proposed) {
        assert(proposed ?? false);
        assert(proposed.isValid());

        let blacks = 0;
        let whites = 0;
        const colorsProposeds = proposed.getColors();
        for (let i = 0; i < colorsProposeds.length; i++) {            
            if (colorsProposeds[i] === this.combination.getColor(i)) {
                blacks++;
            } else if (this.combination.includes(colorsProposeds[i])) {
                whites++;
            }
        }
        return new Result(this.combination.VALID_LENGTH, blacks, whites);
    };
}

function Result(winnerCount, blacks, whites) {    
    assert(blacks >= 0);
    assert(whites >= 0);
    assert(winnerCount >= blacks + whites);

    this.winnerCount = winnerCount;
    this.blacks = blacks;
    this.whites = whites;
}
function initResultPrototype() {
    Result.prototype.isWinner = function () {
        return this.getBlacks() === this.winnerCount;
    };

    Result.prototype.getBlacks = function () {
        return this.blacks;
    };

    Result.prototype.getWhites = function () {
        return this.whites;
    }
}

function ProposedCombination(colors) {
    this.combination = new Combination(colors);
}
function initProposedCombinationPrototype() {

    /**
     * Combination has a valid length. Elements are unrepeated. Each element is a valid color.     
     */
    ProposedCombination.prototype.isValid = function () {
        return this.combination.isValid();
    };

    ProposedCombination.prototype.getValidationError = function () {
        return this.combination.getValidationError();
    };
    
    ProposedCombination.prototype.getColors = function () {
        assert(this.isValid());

        const colors = [];
        for (let i = 0; i < this.combination.VALID_LENGTH; i++) {
            colors.push(this.combination.getColor(i));
        }
        return colors;
    };
}

function Combination(colors = []) {
    assert(Array.isArray(colors));
    colors.forEach(color => assertIsChar(color));

    this.VALID_LENGTH = 4;
    this.VALID_COLORS = ['r', 'g', 'y', 'b', 'm', 'c'];
    this.colors = colors;
}
function initCombinationPrototype() {
    Combination.prototype.getValids = function () {
        return this.VALID_COLORS;
    };

    Combination.prototype.getRandomValidColor = function () {
        const randomIndex = Math.floor(Math.random() * this.VALID_COLORS.length);
        return this.VALID_COLORS[randomIndex];
    };

    Combination.prototype.isValid = function () {
        return this.getValidationError().isNull();
    };

    Combination.prototype.getValidationError = function () {
        let error = new Error(this.VALID_COLORS);
        if (!hasValidLength(this)) {
            error.setInvalidLength();
        } else if (!hasValidColors(this)) {
            error.setInvalidColors();
        } else if (!hasUniqueColors(this)) {
            error.setRepeatedColors();
        }
        return error;

        function hasValidLength(combination) {
            return combination.colors.length === combination.VALID_LENGTH;
        };

        function hasValidColors(combination) {            
            for (let color of combination.colors) {
                if (!combination.VALID_COLORS.includes(color)) {
                    return false;
                }
            }
            return true;
        };

        function hasUniqueColors(combination) {
            const copy = [];
            for (let color of combination.colors) {
                if (copy.includes(color)) {
                    return false;
                }
                copy.push(color);
            }
            return true;
        };
    };

    Combination.prototype.includes = function (color) {
        assertIsChar(color);

        return this.colors.includes(color);
    };

    Combination.prototype.addColor = function (color) {
        assertIsChar(color);

        this.colors.push(color);
    };

    Combination.prototype.getColor = function (index) {
        assert(new IntervalOpenClosed(this.colors.length).includes(index));        

        return this.colors[index];
    };
}

function Error(validsColors) {
    this.MESSAGES = [
        `Wrong proposed combination length`,
        `Wrong colors, they must be: ${validsColors.join("")}`,
        `Wrong proposed combination, colors can't be repeated`
    ];
    
    this.index = null;
}
function initErrorPrototype() {
    Error.prototype.setInvalidLength = function () {
        this.index = 0;
    };

    Error.prototype.setInvalidColors = function () {
        this.index = 1;
    };

    Error.prototype.setRepeatedColors = function () {
        this.index = 2;
    };

    Error.prototype.isNull = function () {
        return this.index === null;
    };

    Error.prototype.toString = function () {
        assert(!this.isNull())
        return this.MESSAGES[this.index];
    };
}

/**
 * Max limit is open. Min limit is closed.
 */
function IntervalOpenClosed(max, min = 0) {    
    assertIsNum(max);
    assertIsNum(min);
    assert(max > min);

    this.max = max;
    this.min = min    
}
function initIntervalOpenClosedProtorype() {
    IntervalOpenClosed.prototype.includes = function(value) {
        assertIsNum(value);
        return this.max > value && value >= this.min;
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

function assertIsChar(value) {
    assert(typeof value === "string");
    assert(value.length === 1);
}

function assertIsNum(value) {
    assert(typeof value === "number");
}