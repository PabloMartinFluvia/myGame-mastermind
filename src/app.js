const { Console } = require("console-mpds");

const consoleMPDS = new Console();

playMastermind();

function playMastermind() {
    do {
        playGame();
    } while (isResume());

    function playGame() {        
        showTitle();
        const COLORS = ['r', 'g', 'y', 'b', 'm', 'c'];  
        const COMBINATION_LENGTH = 4;                     
        const secret = getSecretRandomly(COLORS);    
        showBoard(secret);                                                       
        const MAX_ATTEMPTS = 10; 
        let secretFound;
        let proposeds = [];
        let results = [];              
        do {        
            const proposed = askProposed(COLORS, COMBINATION_LENGTH);   
            proposeds[proposeds.length] = proposed;   
            const RESULT_COLORS = ['black', 'white'];       
            const result = getResult(secret, proposed, RESULT_COLORS);                                        
            results[results.length] = result;           
            showBoard(secret, proposeds, results, RESULT_COLORS);  
            secretFound = isWinner(result, RESULT_COLORS[0]);                  
        } while (!secretFound && proposeds.length < MAX_ATTEMPTS);        
        consoleMPDS.writeln(`You've ${secretFound ? `won!!! ;-)` : `lost!!! :-(`}`);

        function showTitle() {
            const TITLE = `MASTERMIND`;
            consoleMPDS.writeln(`----- ${TITLE} -----`);
        }

        function getSecretRandomly(validColors) {             
            let secret = [];
            for (let i = 0; i < COMBINATION_LENGTH; i++) {
                let color;
                do {
                    let indexColor = parseInt(Math.random() * validColors.length);                     
                    color = validColors[indexColor];
                } while (isValuePresent(secret, color)); 
                secret[i] = color;
            } 
            return secret;                                                                 
        }

        function showBoard(secret, proposeds = [], results = [], resultColors = []) {            
            consoleMPDS.writeln(`\n${proposeds.length} attempt(s):`)
            showSecret(secret);
            for (let i = 0; i < proposeds.length; i++) {
                showAttempt(proposeds[i], results[i], resultColors);
            }

            function showSecret(secret) {
                let msg = '';
                for (let i = 0; i < secret.length; i++) {
                    msg += '*';
                }
                consoleMPDS.writeln(msg);
            }

            function showAttempt(proposed, result, [blackResult, whiteResult]) {         
                let msg = parseArrayToString(proposed);
                const blackCount = countIn(result, blackResult);
                const whiteCount = countIn(result, whiteResult);
                msg += ` --> ${blackCount} blacks and ${whiteCount} whites`;
                consoleMPDS.writeln(msg);    
                
                function countIn(array, value) {
                    let count = 0;
                    for (let item of array) {
                        if (item === value) {
                            count++;
                        }
                    }
                    return count;
                }
            }
        } 

        function parseArrayToString(array) {
            let msg = '';
            for (let value of array) {
                msg += value;
            }
            return msg;
        }

        function askProposed(validColors) {
            let proposed;
            let error;
            do {                
                proposed = consoleMPDS.readString(`Propose a combination:`);   
                error = false;             
                const errorMsg = getErrorMsg(proposed, validColors);                
                if (errorMsg !== null) {
                    consoleMPDS.writeln(errorMsg);
                    error = true;
                }
            } while (error);
            return proposed;

            function getErrorMsg(proposed, validColors) {  
                let errorMsg = null;                            
                if (hasInvalidLength(proposed, COMBINATION_LENGTH)) {
                    errorMsg = `Wrong proposed combination length`;                          
                } else if (hasInvalidColors(validColors, proposed)) {
                    errorMsg = `Wrong colors, they must be ${parseArrayToString(validColors)}`;                                     
                } else if (hasDuplicatedValues(proposed)) { 
                    errorMsg = `Wrong proposed combination, colors can't be duplicated`;                                  
                }
                return errorMsg;

                function hasInvalidLength(array, expectedLength) {
                    return array.length !== expectedLength;
                }
    
                function hasInvalidColors(validColors, proposed) {
                    for (let i = 0; i < proposed.length; i++) {
                        if (!isValuePresent(validColors, proposed[i])) {
                            return true;
                        }
                    }
                    return false;
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

        function getResult(secret, proposed, [blackResult, whiteResult]) {
            let result = [];
            for (let i = 0; i < proposed.length; i++) {
                if (secret[i] === proposed[i]) {
                    result[i] = blackResult;
                } else if (isValuePresent(secret, proposed[i])) {
                    result[i] = whiteResult;
                } else {
                    result[i] = 'no result';
                }
            }
            return result;
        }

        function isWinner(result, blackResult) {                           
            for (let resultItem of result) {                             
                if (resultItem !== blackResult){
                    return false;
                }
            }
            return true;   
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




