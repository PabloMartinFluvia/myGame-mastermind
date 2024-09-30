# Develop Resume

## Index
* [Intro](#intro)
* [Tasks - Branches](#tasks---branches)
    * [Task 0](#task-0-js_v00)
    * [Task 1](#task-1-js_v01)
    * [Task 2](#task-2-js_v020-js_v021-js_v022-js_v023)
    * [Task 3](#task3-js_v03)
    * [Task 4](#task4-js_v04)

## Intro
This project has been used for practice:

1. Developement starts when a minimum knowledge of the language has been reached.
2. Requisites and "expected level of code quality" evolves.
3. When something new is requested to be applied, that task is implemented in a new branch.
    - Obs: old branch remains, to make it easier future comparisions.

## Tasks - Branches
Task's description contains what's <i>new</i> vs previous task.

### Task 0: js_v0.0
- Task:
    - Implement vasic version only with functions.
- Basic version.
- Process Oriented Programing.
- Imperative programing.

### Task 1: js_v0.1
- Task:
    - Upgrade previous task using objects <b>without methods</b> (aka structs, registers, etc...).
- Design Principles to practice:
    - KISS.
    - Self explanatory: naming, comments, format.
    - Consistent code: standards, coherence, alerts.
    - Minimum code: dead code, YAGNI, DRY.

### Task 2: js_v0.2.1, js_v0.2.2, js_v0.2.3, js_v0.2.4
- Task:
    - Upgrade previous task usig objects with methods.
    - 4 differents versions to practice some alternatives to init objects with functions
        - simple
        - this
        - clousures
        - that / factory pattern
- Object Based Programing combined with free functions to init objects.
- <b>Note: improvements after reviews are done in js_v0.2.4</b>

### Task3: js_v0.3
- New Design Principles to practice:
    - Avoid antipattern Functional Descomposition
    - Information Expert Pattern / General Principle of Assignment of Responsibilities  
    - Classification strategies and collaboration relationships adapting the domain model.

### Task4: js_v0.4
- New Design Principles to practice:
    - Modular Design: High Cohesion, Low Coupling, Low Granurality
    - Interface Design: 
        - Principles of Least Commitment and Least Surprise.
        - Sufficient, Complete and Primitive Interface Principle
        - Related Smell Codes
    - Design by Contract.
    - Implementation Design:
        - Cohesion:
            - Functions Should Do One Thing
            - Single Responsibility Principle
            - Related Smell Codes
        - Coupling:
            - Demeter Laws (aka Do not talk to strangers, Chain of Message)
            - Related Smell Codes
        - Granurality:
            - Related Smell Codes

- [Analysis](./analysis.md)

