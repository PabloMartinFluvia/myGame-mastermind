# Problems solved in this commit:

1. The invariant in SecretCombination & ProposedCombination:
    - In SecretCombination is assert colors property is valid
    - In ProposedCombination is assert colors property is valid or not inicialized.
    - So both requires the logic wich validates colors property. If coded in both -> DRY

- Solution: create a class CombinationValidator to assume the responsibility of validate a the colors value. It implies to assume the resonibility of know wich are the valid values related to a valid combination's colors.
- Due this reassigment of responsibilities, none other class should know the constants VALID_COLORS and COMBINATION_LENGTH.


