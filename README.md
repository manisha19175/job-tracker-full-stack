# Python Math Utilities

A small collection of Python scripts demonstrating basic math operations.

## Overview

This repository contains simple utility scripts for addition and factorial calculation. It is designed for learning Python functions, function documentation, and command-line input handling.

## Features

- `add.py` defines a reusable `add(a, b)` function
- `fact.py` implements a recursive factorial calculator with input validation
- `tempCodeRunnerFile.py` implements an iterative factorial calculator with input prompts

## Prerequisites

- Python 3.7 or newer

Verify Python is installed:

```bash
python --version
```

## Installation

No dependencies are required. Clone or copy the repository into a local folder and run the scripts with Python.

```bash
git clone <repository-url>
cd Copilot
```

## Usage

### `add.py`

`add.py` defines a reusable function but does not include a built-in CLI prompt. Use it by importing the function into another script.

Example:

```python
from add import add

result = add(2, 3)
print(result)  # 5
```

Test directly from the command line:

```bash
python -c "from add import add; print(add(2, 3))"
```

### `fact.py`

`fact.py` reads a number from standard input and prints its factorial using recursion.

Run:

```bash
python fact.py
```

Enter a number when prompted, for example:

```
5
120
```

### `tempCodeRunnerFile.py`

`tempCodeRunnerFile.py` also reads input from the user and computes the factorial using an iterative algorithm.

Run:

```bash
python tempCodeRunnerFile.py
```

Example interaction:

```
Enter a number: 4
Factorial of 4 is 24
```

## File Summary

- `add.py`
  - Provides the `add(a, b)` function
  - Returns the sum of two values
  - Includes a docstring describing usage

- `fact.py`
  - Provides a recursive `factorial(n: int) -> int` function
  - Handles negative values with a `ValueError`
  - Includes CLI input handling for runtime execution

- `tempCodeRunnerFile.py`
  - Provides an iterative `factorial(n)` function
  - Handles negative values with a `ValueError`
  - Includes prompt-driven CLI input handling

## Extending the Project

This repository can be expanded with:

- unit tests using `unittest` or `pytest`
- a command-line interface using `argparse`
- additional math utilities, such as combinations, permutations, or prime checks
- better packaging and module structure for reusable imports

## License

Add a license if you plan to publish or share this project. Common choices include MIT, Apache 2.0, or BSD 3-Clause.
