# Problems:

1. Method showResult(proposed) in SecretCombination:
    - is not cohesive: calculates the result AND asks result to show itself. 
    - makes difficult to homogenize the interfaces

Solution: replace it with getResult(proposed) and Game assumes responsability to invoke .show() of Result. 

2. Method isWinner(proposed) in SecretCombination:
    - is not primitive: calls this.getResult(proposed) and is independent of the state of <i>this</i> (argument for parameter  in Result's isWinner(winnerCount) is a constant), so it could be implemented in client instead.

Solution: remove method and implement it on Game. (obs: it doesn't increase Game's coupling, it already colaborates with Result.) 

3. Method main() in Mastermind:
    - don't describe the purpose of the app (play maststermind)

Solution: rename to play(). It describes the purpose and also uses the same name used in game's method (to reduce naming scope).

4. Method showSecret() in SecretCombination:
    - it's not consistent with the pattern chosed during the developement: when a state of any object needs to be showed to user, some client invokes his method .show().

Solution: rename showSecret() to show()

5. Method isWinner(winnerCount) in Result:
    - require a parameter proves class Result is not assuming well his responsibility: it's responsible to inform the properties of one result (how many blacks and whites and if the secret has been found). 

Solution: add a new property in Result (winnerBlacks), provide the value when the object is created, and remove the param in the method. This change increases Result's cohesion.

6. None method it's defended against logical errors.

Solution: add assertions to assert preconditions (when the method has parameters) and invariants (when the method changes the state <i>this</i>)


Note: the invariant of SecretCombination is assert colors property is valid. If validate logic is written in this assert would have the consequence of DRY (it's also written in ProposedCombination). The solution would be create a new class, wich assumes the responsibility to validate both combinations.
    