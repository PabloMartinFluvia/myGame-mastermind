# Problem solved in this commit

## Problem
- SecretCombinationView has the responsibility to show the secret combination colors, but hidden. To do that only needs to know how many colors has the secret combination. But this value doesn't depends on the secretCombination's state, it's an "app constant" -> there's no need to establish a *use* collaboration to SecretCombination.

## Solution
- Remove the collaboration and store the value as a property in SecretCombinationView.

## Ideas to consider in the future
- Enum approach is ok?
- Simplify how GamwView requests proposeds and results to Game?
- Better logic to init/reset secret combination?
- create random combinations in Combination?
- ProposedCombination is needed?
- validate proposed combinations in ProposedCombination?

# TODOs in code review
1. Simplicity:
    - Anybody will understand the code? Can be less complex?
2. Legibility:
    - Identifiers indicate their intent? Can be more expressive?
    - Code is consistent with the choosed patterns?
    - There's a coherent pattern for the order of the members in any class? Are related near?
    - There's dead code?
    - There's reapeated code?
    - It's the minimum essential code needed to implement the required functionalities? There's code not needed or complex without need?
4. Domain Model:
    - Indentifiers respect client's vocabulary?    
5. Modular Design:
    - The types of relations established are coherent with the characteristics of the collaboration?
    - Any *module* has his existence justified? Always would be a dessign problem if any *module* were removed and its responsibilities reassigned to any existing *module*?
    - For each *module* its responsabilites of know/do are related to the *concept* that it represents? 
    - The assigment of responsabilities between *modules* is balanced?
    - Each process it's in the *module* which has the *essential* data for the process?
    - The interface of any *module* is primitive?
    - High Cohesion:
        - All responsabilities of any *module* are strongly related?
        - It's possible to define the *module*'s global responsibility in **one single *concept***? There's no *module* wich requires more than one *concept* to define it's global responsibility?
        - Any *module* has just one reason for change? **Only would change** if changes the *concept* wich defines it's global responsibility?
        - Any change would affect only one *module*?    
    - Low Coupling:
        - The number of dependencies of any *module* is not big? They're easy to understand and remember?
        - Any *module* is uncoupled to the implementation of its *servers modules*? 
        - In any *module*: the number of dependencies is inversely proportional to the number of potentially unstable dependencies? (the more number of potential unstable dependencies, the less total number of dependencies).
        - There's no relations cycles between *modules*?
        - Any *module* only collaborates with its direct dependencies?
    - Low Granurality:
        - Any *module* is small?
        - Any *module*'s metrics are <= to the (orientative) recomended?
6. Design by Contract:
    - Any *module* is self-protected?
    - Defensive programing is avoided?
    - In any process: the pre-conditions to execute well the process are checked?
    - In any critical / not trivial process, where the object's state is modified: the process has checked the object's invariant?