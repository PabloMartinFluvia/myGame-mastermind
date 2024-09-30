# Problems solved in this commit:

1. Method hasUniqueColors in CombinationValidator don't access any property (sign of low cohesion).
- Solution: add property colors (value provided when instantiation) and avoid pass it as argument.

2. Propoerty colors in SecretCombination, ProposedCombination and CombinationValidator:
    - This 3 clases have the property colors, wich represent the colors of one combination.
    - Although changing the data structure in one of them would only involve making changes to that class, it would be more cohesive if there was only one class that had that property.

- Solution: CombinationValidator renamed to Combination + reasigment of responsibilities to do: all management that requires access to any combination of colors.

