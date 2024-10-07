# Problems solved in this commit:

1. Views dessign it's not consistent.
* Solution: homogeneize all ->
    - relation type between views: looking for a hierarchy -> composition
    - relation type between view and his respective model: looking for a design that works with any instance of his respective model -> use

2. GameView is colaborating with models which aren't his respective model, wich increases complexity unnecessary.
* Solution: request the process to his respective model (delegating the request).

3. GameView has high coupling:
    - With collaboration:
        - console
        - proposedCombinationView
        - game
        - secretCombinationView
        - resultView
    - Without collaboration:        
        - proposed
        - secret
        - result
* But considering some factors, it's not a significant problem:
    - 3 are not collaboratos, so only can affect if they're removed, and there's a low probability, due they're *core* models.
    - there's low coupling to unestable *modules*: maybe the views and console could affect if there's a change related to the technology to use for presentation. But this change also would affect this class, so will imply replace all views.

4. ProposedCombination and SecretCombination colaborates with ValidationError without need, increasing complexity.
* Solution: request the evaluation of the validation process to Combination -> reduce the number of dependencies.



