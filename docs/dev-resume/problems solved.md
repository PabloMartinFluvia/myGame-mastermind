# Problems solved in this commit:

1. Method getRandomCombination in Combination:
    - This process shouldn't be accesible for ProposedCombination. The process of create a a valid combination randomly it's a responsibility of SecretCombination.
- Solution: implement the logic in SecretCombination, using as much as possible the others publics methods (primitives).

2. Method getErrorMsg in Combination:
    - This process shouldn't be accesible for SecretCombination. The only class interested to the error message when validation failed is ProposedCombination.
    - Move method to ProposedCombination it's not a valid solution:
        1. It would require make public hasValidLength(), hasValidColors(), hasUniqueColors() in Combination.
        2. This change would require remove isValid() in Combination (it wouldn't be a primitive method).
        3. This change would force repeated code (DRY) in ProposedCombination and SecretCombination. At least in the assertion of the invariant.
        ~~~
        combination.hasValidLength() 
            && combination.hasValidColors() 
                && combination.hasUniqueColors()
        ~~~
- Solution: replace isValid() and getErrorMsg() by getValidationResult(), wich returns an enum. For evaluate if Combination isValid the value must be ValidateResult.OK, and in fuction of the other values, ProposedCombination can choose the error msg.
            

