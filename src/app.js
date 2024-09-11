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
        generateSecretRandomly(game);
        showBoard(game.board);
        let secretFound;
        do {
            const proposed = askProposed(game.rules);
            addAttempt(game.board, proposed);
            showBoard(game.board);
            secretFound = isWinner(game.board);
        } while (!secretFound && hasMoreAttempts(game));
        consoleMPDS.writeln(`You've ${secretFound ? `won!!! ;-)` : `lost!!! :-(`}`);

        function initGame() {
            return {
                TITLE: `MASTERMIND`, 
                rules: {
                    COLORS: ['r', 'g', 'y', 'b', 'm', 'c'], 
                    COMBINATION_LENGTH: 4, 
                    MAX_ATTEMPTS: 10 // hasMoreAttempts  
                },
                board: {                       
                    secret: [], 
                    attempts: []   
                },
            };
        }

        function showTitle(title) {
            consoleMPDS.writeln(`----- ${title} -----`);
        }

        function generateSecretRandomly({rules, board}) {            
            for (let i = 0; i < rules.COMBINATION_LENGTH; i++) {
                let color;
                do {
                    let indexColor = parseInt(Math.random() * rules.COLORS.length);
                    color = rules.COLORS[indexColor];
                } while (isValuePresent(board.secret, color));
                board.secret[i] = color;
            }
        }

        function showBoard({ attempts, secret }) {
            consoleMPDS.writeln(`\n${attempts.length} attempt(s):`)
            showSecret(secret);
            for (let i = 0; i < attempts.length; i++) {
                showAttempt(attempts[i]);
            }

            function showSecret(secret) {
                let msg = '';
                for (let i = 0; i < secret.length; i++) {
                    msg += '*';
                }
                consoleMPDS.writeln(msg);
            }

            function showAttempt(attempt) {
                let msg = attempt.proposed;
                msg += ` --> ${attempt.blackCount} blacks and ${attempt.whiteCount} whites`;
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
                    errorMsg = `Wrong colors, they must be ${parseArrayToString(COLORS)}`;
                } else if (hasDuplicatedValues(proposed)) {
                    errorMsg = `Wrong proposed combination, colors can't be duplicated`;
                }
                return errorMsg;

                function hasInvalidLength(array, expectedLength) {
                    return array.length !== expectedLength;
                }

                function hasInvalidValues(array, validValues) {
                    for (let value of array) {
                        if (!isValuePresent(validValues, value)) {
                            return true;
                        }
                    }
                    return false;
                }

                function parseArrayToString(array) {
                    let msg = '';
                    for (let value of array) {
                        msg += value;
                    }
                    return msg;
                }

                function hasDuplicatedValues(array) {
                    let copy = [];
                    for (let i = 0; i < array.length; i++) {
                        if (isValuePresent(copy, array[i])) {
                            return true;
                        }
                        copy[i] = array[i];
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
                blackCount: blackCount,
                whiteCount: whiteCount
            };
        }

        function isWinner({ attempts }) {
            const lastAttempt = attempts[attempts.length - 1];
            return lastAttempt.blackCount === lastAttempt.proposed.length;
        }

        function hasMoreAttempts({ board, rules }) {
            return board.attempts.length < rules.MAX_ATTEMPTS;
        }
    }

    function isValuePresent(array, value) {
        for (let i = 0; i < array.length; i++) {
            if (value === array[i]) {
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




