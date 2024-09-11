const { Console } = require("console-mpds");

const consoleMPDS = new Console();

playMastermind();

function playMastermind() {
    do {
        playGame();
    } while (isResume());

    function playGame() {
        const game = initGame();      
        showTitle(game.TITLE);  
        showBoard(game.board);        
        do {
            const proposed = askProposed(game.rules);
            addAttempt(game.board, proposed);
            showBoard(game.board);            
        } while (!isWinner(game.board) && hasMoreAttempts(game));
        consoleMPDS.writeln(`You've ${isWinner(game.board) ? `won!!! ;-)` : `lost!!! :-(`}`);

        // secret & proposed como Strings
        // black/white counts renombrar como blacks/whites

        function initGame() {            
            const game = {
                TITLE: `MASTERMIND`, 
                rules: {
                    COLORS: ['r', 'g', 'y', 'b', 'm', 'c'], 
                    COMBINATION_LENGTH: 4, 
                    MAX_ATTEMPTS: 10 
                },
                board: {        
                    attempts: []   
                },
            };        
            generateSecretRandomly(game);
            return game;

            function generateSecretRandomly({rules, board}) {    
                board.secret = '';        
                for (let i = 0; i < rules.COMBINATION_LENGTH; i++) {
                    let color;
                    do {
                        let indexColor = parseInt(Math.random() * rules.COLORS.length);
                        color = rules.COLORS[indexColor];
                    } while (isValuePresent(board.secret, color));
                    board.secret += color;
                }
            }
        }

        function showTitle(title) {
            consoleMPDS.writeln(`----- ${title} -----`);
        }
            
        function showBoard({ attempts, secret }) {
            consoleMPDS.writeln(`\n${attempts.length} attempt(s):`)
            showSecret(secret);
            for (let i = 0; i < attempts.length; i++) {
                showAttempt(attempts[i]);
            }

            function showSecret(secret) {
                const HIDDEN_CHAR = '*';
                let msg = '';
                for (let i = 0; i < secret.length; i++) {
                    msg += HIDDEN_CHAR;
                }
                consoleMPDS.writeln(msg);
            }

            function showAttempt(attempt) {
                let msg = attempt.proposed;
                msg += ` --> ${attempt.blacks} blacks and ${attempt.whites} whites`;
                consoleMPDS.writeln(msg);
            }
        }

        function askProposed(rules) {
            let proposed;
            let error;
            do {
                proposed = consoleMPDS.readString(`Propose a combination:`);
                const errorMsg = getErrorMsg(proposed, rules);
                error = errorMsg !== undefined;
                if (error) {
                    consoleMPDS.writeln(errorMsg);
                }
            } while (error);
            return proposed;

            function getErrorMsg(proposed, { COMBINATION_LENGTH, COLORS }) {
                let errorMsg;
                if (hasInvalidLength(proposed, COMBINATION_LENGTH)) {
                    errorMsg = `Wrong proposed combination length`;
                } else if (hasInvalidValues(proposed, COLORS)) {
                    errorMsg = `Wrong colors, they must be ${arrayToString(COLORS)}`;
                } else if (hasDuplicatedValues(proposed)) {
                    errorMsg = `Wrong proposed combination, colors can't be duplicated`;
                }
                return errorMsg;

                function hasInvalidLength(values, expectedLength) {
                    return values.length !== expectedLength;
                }

                function hasInvalidValues(values, validValues) {
                    for (let value of values) {
                        if (!isValuePresent(validValues, value)) {
                            return true;
                        }
                    }
                    return false;
                }

                function arrayToString(array) {
                    let msg = '';
                    for (let value of array) {
                        msg += value;
                    }
                    return msg;
                }

                function hasDuplicatedValues(values) {
                    let copy = [];
                    for (let i = 0; i < values.length; i++) {
                        if (isValuePresent(copy, values[i])) {
                            return true;
                        }
                        copy[i] = values[i];
                    }
                    return false;
                }
            }
        }

        function addAttempt({ secret, attempts }, proposed) {
            let blackCount = 0;
            let whiteCount = 0;
            for (let i = 0; i < proposed.length; i++) {
                if (secret[i] === proposed[i]) {
                    blackCount++;
                } else if (isValuePresent(secret, proposed[i])) {
                    whiteCount++;
                }
            }
            attempts[attempts.length] = {
                proposed: proposed,
                blacks: blackCount,
                whites: whiteCount
            };
        }

        function isWinner({ attempts }) {
            const lastAttempt = attempts[attempts.length - 1];
            return lastAttempt.blacks === lastAttempt.proposed.length;
        }

        function hasMoreAttempts({ board, rules }) {
            return board.attempts.length < rules.MAX_ATTEMPTS;
        }
    }

    function isValuePresent(values, value) {
        for (let i = 0; i < values.length; i++) {
            if (value === values[i]) {
                return true;
            }
        }
        return false;
    }

    function isResume() {
        const VALID_ANSWERS = ['y', 'n'];
        let answer;
        let error;
        do {
            answer = consoleMPDS.readString(`Do you want to continue? (${VALID_ANSWERS[0]}/${VALID_ANSWERS[1]}): `);
            error = !isValuePresent(VALID_ANSWERS, answer);
            if (error) {
                consoleMPDS.writeln(`Wrong response, it must be: '${VALID_ANSWERS[0]}' or '${VALID_ANSWERS[1]}'`)
            }
        } while (error);
        return answer === VALID_ANSWERS[0];
    }
}




