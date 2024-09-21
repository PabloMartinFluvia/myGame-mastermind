const { Console } = require("console-mpds");

const consoleMPDS = new Console();

playMastermind();

function playMastermind() {
    const continueDialog = initYesNoDialog("Do you want to continue?");
    do {
        initGame().play();
        continueDialog.ask();
    } while (continueDialog.isAffirmative());

    function initGame() {
        const that = {
            secret: initSecretCombination(),
            attempts: [],
            MAX_ATTEMPTS: 10,

            show: function () {
                consoleMPDS.writeln(`\n${this.attempts.length} attempt(s):`);
                this.secret.show();
                for (let attempt of this.attempts) {
                    attempt.show();
                }
            },

            addProposed: function (proposed) {
                const result = this.secret.getResult(proposed);
                this.attempts[this.attempts.length] = initAttempt(proposed, result);
            },

            isEndGame: function () {
                return this.isLastResultWinner() || this.attempts.length === this.MAX_ATTEMPTS;
            },

            isLastResultWinner: function () {
                return this.attempts[this.attempts.length - 1].isResultWinner();
            },
        }

        return {
            play: function () {
                consoleMPDS.writeln(`----- MASTERMIND -----`);
                that.secret.setRandom();
                that.show();
                do {
                    const proposed = initProposedCombination();
                    proposed.ask();
                    that.addProposed(proposed);
                    that.show();
                } while (!that.isEndGame());
                consoleMPDS.writeln(`You've ${that.isLastResultWinner() ? `won!!! ;-)` : `lost!!! :-(`}`);
            }
        };

        function initSecretCombination() {
            const that = {
                combination: initCombination()
            };

            return {
                setRandom: function () {
                    for (let i = 0; i < that.combination.getCOMBINATION_LENGTH(); i++) {
                        let color;
                        do {
                            const VALID_COLORS = that.combination.getVALID_COLORS();
                            color = VALID_COLORS[parseInt(Math.random() * VALID_COLORS.length)];
                        } while (that.combination.hasColor(color));
                        that.combination.addColor(color);
                    }
                },

                show: function () {
                    const HIDDEN_CHAR = '*';
                    let msg = '';
                    for (let i = 0; i < that.combination.getLength(); i++) {
                        msg += HIDDEN_CHAR;
                    }
                    consoleMPDS.writeln(msg);
                },

                getResult: function (proposed) {
                    let blacks = 0;
                    let whites = 0;
                    for (let i = 0; i < that.combination.getLength(); i++) {
                        if (that.combination.getColor(i) === proposed.getColor(i)) {
                            blacks++;
                        } else if (that.combination.hasColor(proposed.getColor(i))) {
                            whites++;
                        }
                    }
                    return initResult(blacks, whites, that.combination.getLength());
                },
            };
        }

        function initProposedCombination() {
            const that = {
                combination: undefined,

                getErrorMsg: function () {
                    if (!this.combination.hasValidLength()) {
                        return `Wrong proposed combination length`;
                    } else if (!this.combination.hasValidColors()) {
                        let errorMsg = `Wrong colors, they must be: `;
                        for (let validColor of this.combination.getVALID_COLORS()) {
                            errorMsg += validColor;
                        }
                        return errorMsg;
                    } else if (this.combination.hasRepeatedColors()) {
                        return `Wrong proposed combination, colors can't be repeated`;
                    }
                    return undefined;
                }
            };

            return {
                ask: function () {
                    let errorMsg;
                    do {
                        that.combination = initCombination();
                        let answer = consoleMPDS.readString(`Propose a combination:`);
                        for (let i = 0; i < answer.length; i++) {
                            that.combination.addColor(answer[i]);
                        }
                        errorMsg = that.getErrorMsg();
                        if (errorMsg !== undefined) {
                            consoleMPDS.writeln(errorMsg);
                        }
                    } while (errorMsg !== undefined);
                },

                show: function () {
                    let msg = '';
                    for (let i = 0; i < that.combination.getLength(); i++) {
                        msg += that.combination.getColor(i);
                    }
                    consoleMPDS.write(msg);
                },

                getColor: function (index) {
                    return that.combination.getColor(index);
                }
            };
        }

        function initCombination() {
            const that = {
                COMBINATION_LENGTH: 4,
                VALID_COLORS: ['r', 'g', 'y', 'b', 'm', 'c'],
                colors: [],
            };

            return {
                addColor: function (color) {
                    that.colors[that.colors.length] = color;
                },

                hasColor: function (colorTested) {
                    for (let color of that.colors) {
                        if (color === colorTested) {
                            return true;
                        }
                    }
                    return false;
                },

                hasValidLength: function () {
                    return that.colors.length === that.COMBINATION_LENGTH;
                },

                hasValidColors: function () {
                    for (let color of that.colors) {
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

                hasRepeatedColors: function () {
                    for (let i = 0; i < that.colors.length - 1; i++) {
                        for (let j = i + 1; j < that.colors.length; j++) {
                            if (that.colors[i] === that.colors[j]) {
                                return true;
                            }
                        }
                    }
                    return false;
                },

                getColor: function (index) {
                    return that.colors[index];
                },

                getLength: function () {
                    return that.colors.length;
                },

                getCOMBINATION_LENGTH: function () {
                    return that.COMBINATION_LENGTH;
                },

                getVALID_COLORS: function () {
                    return that.VALID_COLORS;
                }
            };
        }

        function initAttempt(proposed, result) {
            const that = {
                proposed: proposed,
                result: result
            };

            return {
                show: function () {
                    that.proposed.show();
                    consoleMPDS.write(' --> ');
                    that.result.show();
                },

                isResultWinner: function () {
                    return that.result.isWinner();
                }
            };
        }

        function initResult(blacks, whites, secretLength) {
            const that = {
                blacks: blacks,
                whites: whites,
                secretLength: secretLength
            }

            return {
                isWinner: function () {
                    return blacks === secretLength;
                },

                show: function () {
                    consoleMPDS.writeln(`${that.blacks} blacks and ${that.whites} whites`);
                }
            };
        }
    }

    function initYesNoDialog(question) {
        const that = {
            question: question,
            VALID_ANSWERS: ["y", "n"],
            answer: undefined,

            isNegative: function () {
                return this.answer === this.getNegative();
            },

            getAffirmative: function () {
                return this.VALID_ANSWERS[0];
            },

            getNegative: function () {
                return this.VALID_ANSWERS[1];
            }
        };

        return {
            ask: function () {
                let error = false;
                do {
                    that.answer = consoleMPDS.readString(`${that.question} (${that.getAffirmative()}/${that.getNegative()}):`);
                    error = !this.isAffirmative() && !that.isNegative();
                    if (error) {
                        consoleMPDS.writeln(`Please, answer "${that.getAffirmative()}" or "${that.getNegative()}"`);
                    }
                } while (error);
            },

            isAffirmative: function () {
                return that.answer === that.getAffirmative();
            }
        };
    }
}



