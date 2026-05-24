// Theory Database - Static content for first units
// This provides reliable theory content without depending on Gemini API

export interface TheoryContent {
  title: string
  overview: string
  sections: Array<{
    heading: string
    content: string
    codeExample: string
    visualDescription: string
  }>
  keyTakeaways: string[]
}

type TheoryKey = `${string}-${string}-${string}` // subject-unit-subtopic

const theoryDatabase: Record<string, TheoryContent> = {
  // DSA - Arrays - Introduction
  'dsa-arrays-intro': {
    title: 'Introduction to Arrays',
    overview: 'Arrays are one of the most fundamental data structures in computer science. They allow you to store multiple values of the same type in a contiguous block of memory, making them efficient for accessing elements by index. In this section, you\'ll learn what arrays are, how they work, and why they\'re essential for programming.',
    sections: [
      {
        heading: 'What are Arrays?',
        content: `An array is a collection of elements of the same data type, stored in contiguous memory locations. Think of it like a row of lockers, where each locker has a number (index) and can hold one item.

Key Characteristics:
- Fixed Size: Once created, the size of an array is typically fixed (in some languages)
- Indexed Access: Elements are accessed using their position (index), starting from 0
- Contiguous Memory: All elements are stored next to each other in memory
- Same Data Type: All elements must be of the same type (in statically-typed languages)

Why Arrays Matter:
Arrays provide O(1) constant-time access to any element if you know its index. This makes them incredibly fast for lookups and essential for many algorithms.`,
        codeExample: `// Creating an array in different languages

// C++
int numbers[5] = {1, 2, 3, 4, 5};
int first = numbers[0];  // Access first element (index 0)

// Java
int[] numbers = {1, 2, 3, 4, 5};
int first = numbers[0];

// Python
numbers = [1, 2, 3, 4, 5]
first = numbers[0]  # Access first element`,
        visualDescription: 'Visual: Imagine a row of numbered boxes (0, 1, 2, 3, 4), each containing a value. When you access array[2], you directly go to box number 2.'
      },
      {
        heading: 'Array Indexing and Memory Layout',
        content: `Understanding how arrays are stored in memory is crucial for understanding their efficiency.

Memory Layout:
- Arrays are stored in contiguous (adjacent) memory locations
- If an integer takes 4 bytes, and you have an array of 5 integers starting at memory address 1000:
  - Index 0: Address 1000
  - Index 1: Address 1004
  - Index 2: Address 1008
  - Index 3: Address 1012
  - Index 4: Address 1016

Why This Matters:
Because elements are stored contiguously, the computer can calculate the exact memory address of any element using a simple formula:
address = base_address + (index × size_of_element)

This is why array access is O(1) - it's just simple arithmetic!`,
        codeExample: `// Demonstrating array indexing

int arr[5] = {10, 20, 30, 40, 50};

// Accessing elements
cout << arr[0] << endl;  // Output: 10
cout << arr[2] << endl;  // Output: 30
cout << arr[4] << endl;  // Output: 50

// Common mistake: accessing out of bounds
// cout << arr[5] << endl;  // ERROR! Index out of bounds`,
        visualDescription: 'Visual: A memory diagram showing consecutive memory addresses with array elements. Arrows show how index 0 maps to the first address, index 1 to the next, etc.'
      },
      {
        heading: 'Common Array Operations',
        content: `Arrays support several fundamental operations, each with different time complexities:

1. Access (Read)
- Time Complexity: O(1) - Constant time
- Direct access using index
- Syntax: element = array[index]

2. Update (Modify)
- Time Complexity: O(1) - Constant time
- Direct modification using index
- Syntax: array[index] = new_value

3. Search (Find Element)
- Time Complexity: O(n) - Linear time
- Must check each element until found
- Worst case: element not found, check all n elements

4. Insertion
- Time Complexity: O(n) - Linear time
- Must shift elements to make space
- Inserting at beginning requires shifting all elements

5. Deletion
- Time Complexity: O(n) - Linear time
- Must shift elements to fill the gap
- Deleting from beginning requires shifting all elements`,
        codeExample: `// Common array operations

int arr[5] = {1, 2, 3, 4, 5};

// 1. Access
int value = arr[2];  // O(1)

// 2. Update
arr[2] = 99;  // O(1)

// 3. Search (linear search)
int target = 3;
bool found = false;
for (int i = 0; i < 5; i++) {
    if (arr[i] == target) {
        found = true;
        break;
    }
}  // O(n)

// 4. Insert at position (requires shifting)
// This is simplified - actual insertion needs dynamic array
int pos = 2;
int newValue = 10;
// Shift elements right
for (int i = 4; i > pos; i--) {
    arr[i] = arr[i-1];
}
arr[pos] = newValue;  // O(n)`,
        visualDescription: 'Visual: Animated diagram showing each operation - access (instant arrow), search (scanning through elements), insertion (shifting elements right), deletion (shifting elements left).'
      },
      {
        heading: 'Advantages and Disadvantages',
        content: `Understanding when to use arrays is as important as knowing how they work.

Advantages:
- Fast Access: O(1) time to access any element by index
- Memory Efficient: No extra overhead, just the data
- Cache Friendly: Contiguous memory improves cache performance
- Simple: Easy to understand and implement
- Predictable: Fixed size makes memory usage predictable

Disadvantages:
- Fixed Size: Cannot easily resize (in many languages)
- Slow Insertion/Deletion: O(n) time, requires shifting
- Memory Waste: If array is larger than needed, memory is wasted
- No Dynamic Growth: Cannot add elements beyond initial size easily

When to Use Arrays:
- When you know the size in advance
- When you need fast random access
- When you're doing mostly read operations
- For implementing other data structures (stacks, queues, etc.)`,
        codeExample: `// Arrays are perfect for:
// 1. Storing fixed-size collections
int scores[10];  // Store 10 test scores

// 2. Lookup tables
char grades[5] = {'A', 'B', 'C', 'D', 'F'};
char grade = grades[scoreIndex];  // Fast lookup

// 3. Implementing other structures
int stack[100];
int top = -1;

void push(int value) {
    stack[++top] = value;  // Using array as stack
}`,
        visualDescription: 'Visual: A comparison chart showing arrays vs other data structures, highlighting speed of access but limitations in flexibility.'
      },
      {
        heading: 'Real-World Applications',
        content: `Arrays are everywhere in programming! Here are some common use cases:

1. Image Processing
- Pixels in an image are stored as arrays
- Each pixel has RGB values stored in a 2D array structure

2. Game Development
- Player inventory stored as arrays
- High scores maintained in arrays
- Game boards represented as 2D arrays (like chess board)

3. Data Analysis
- Temperature readings stored daily in arrays
- Stock prices tracked over time in arrays

4. System Programming
- Buffer management uses arrays
- Memory allocation relies on array structures
- Process scheduling queues implemented with arrays

5. Algorithm Implementation
- Sorting algorithms work on arrays
- Dynamic programming uses arrays for memoization
- Graph representations use adjacency matrices (2D arrays)`,
        codeExample: `// Real-world example: Temperature tracking

float temperatures[7];  // Store weekly temperatures

// Input temperatures
for (int i = 0; i < 7; i++) {
    cin >> temperatures[i];
}

// Calculate average
float sum = 0;
for (int i = 0; i < 7; i++) {
    sum += temperatures[i];
}
float average = sum / 7;

// Find maximum
float max = temperatures[0];
for (int i = 1; i < 7; i++) {
    if (temperatures[i] > max) {
        max = temperatures[i];
    }
}`,
        visualDescription: 'Visual: Examples of arrays in real applications - image pixels, game boards, data charts, showing how arrays are the foundation of many systems.'
      }
    ],
    keyTakeaways: [
      'Arrays store elements of the same type in contiguous memory locations',
      'Array access by index is O(1) - extremely fast constant time',
      'Arrays have fixed size in most languages, making them memory-efficient but less flexible',
      'Insertion and deletion operations are O(n) because they require shifting elements',
      'Arrays are the foundation for many other data structures and algorithms'
    ]
  },

  // C++ - Variables & Data Types - Introduction to Variables
  'cpp-variables-intro': {
    title: 'Introduction to Variables',
    overview: 'Variables are fundamental building blocks in C++ programming. They act as containers that store data values in memory. Understanding variables is the first step to writing meaningful programs. In this section, you\'ll learn what variables are, how to declare them, and how to use them effectively.',
    sections: [
      {
        heading: 'What are Variables?',
        content: `A variable is a named storage location in memory that holds a value. Think of it like a labeled box where you can store and retrieve information. The name of the variable is like the label on the box, and the value is what's inside.

Key Concepts:
- Variables have a name (identifier) that you use to access them
- Variables have a data type that determines what kind of data they can store
- Variables must be declared before they can be used
- Variables can be assigned values that can be changed later

Why Variables Matter:
Variables allow programs to store and manipulate data dynamically. Without variables, programs would be static and unable to process different inputs or maintain state.`,
        codeExample: `// Basic variable declaration and usage

int age;           // Declare an integer variable named 'age'
age = 25;          // Assign value 25 to age

int score = 100;   // Declare and initialize in one line

// Using variables in expressions
int total = age + score;  // total = 125

// Displaying variable values
cout << "Age: " << age << endl;
cout << "Score: " << score << endl;
cout << "Total: " << total << endl;`,
        visualDescription: 'Visual: Imagine memory as a grid of boxes. Each variable is a labeled box (age, score, total) that can hold a value. When you use the variable name, you access the value in that box.'
      },
      {
        heading: 'Variable Naming Rules',
        content: `C++ has specific rules for naming variables. Following these rules ensures your code compiles correctly and is readable.

Naming Rules:
- Must start with a letter or underscore
- Can contain letters, digits, and underscores
- Cannot use C++ keywords (like int, if, for, etc.)
- Case-sensitive (age and Age are different)
- No spaces or special characters (except underscore)

Best Practices:
- Use meaningful names that describe the variable's purpose
- Use camelCase or snake_case consistently
- Avoid single-letter names except for loop counters
- Start variable names with lowercase letters`,
        codeExample: `// Valid variable names
int age;
int userAge;
int user_age;
int _count;
int totalScore;
int numberOfStudents;

// Invalid variable names
// int 2age;        // Cannot start with digit
// int user age;    // Cannot have spaces
// int user-age;    // Cannot use hyphens
// int int;         // Cannot use keyword
// int return;      // Cannot use keyword

// Good naming examples
int studentCount;      // Clear and descriptive
int maxTemperature;    // Describes purpose
int totalRevenue;      // Meaningful name`,
        visualDescription: 'Visual: A diagram showing valid variable names (green checkmarks) and invalid names (red X marks) with explanations for each rule.'
      },
      {
        heading: 'Variable Declaration and Initialization',
        content: `In C++, you must declare a variable before using it. Declaration tells the compiler about the variable's name and type. Initialization assigns an initial value to the variable.

Declaration:
- Syntax: data_type variable_name;
- Creates the variable but doesn't assign a value
- Uninitialized variables contain garbage values

Initialization:
- Syntax: data_type variable_name = value;
- Declares and assigns a value in one step
- Ensures variable has a known value from the start

Multiple Declarations:
- You can declare multiple variables of the same type in one statement
- Each variable can be initialized separately`,
        codeExample: `// Declaration only
int x;              // Declared but not initialized (contains garbage)
int y;              // Another declaration

// Declaration with initialization
int age = 25;       // Declared and initialized
int score = 100;    // Another initialized variable

// Multiple declarations
int a, b, c;        // Three variables declared
int p = 10, q = 20; // Two variables declared and initialized

// Using variables
x = 5;              // Now x has value 5
y = x + 10;         // y = 15

cout << "x = " << x << endl;  // Output: x = 5
cout << "y = " << y << endl;  // Output: y = 15`,
        visualDescription: 'Visual: Memory diagram showing variables being declared (empty boxes) and then initialized (boxes with values). Arrows show the assignment process.'
      },
      {
        heading: 'Variable Scope',
        content: `Variable scope determines where in your program a variable can be accessed. Understanding scope prevents errors and helps organize your code.

Local Scope:
- Variables declared inside a function or block
- Only accessible within that function or block
- Destroyed when the block ends

Global Scope:
- Variables declared outside all functions
- Accessible from anywhere in the program
- Exist for the entire program lifetime

Best Practice:
- Prefer local variables over global ones
- Keep variable scope as small as possible
- This makes code easier to understand and debug`,
        codeExample: `// Global variable
int globalVar = 100;  // Accessible everywhere

void myFunction() {
    // Local variable
    int localVar = 50;  // Only accessible in this function
    
    cout << globalVar << endl;  // Can access global
    cout << localVar << endl;   // Can access local
}

int main() {
    int mainVar = 200;  // Local to main
    
    cout << globalVar << endl;  // Can access global
    // cout << localVar << endl;  // ERROR! Not accessible here
    cout << mainVar << endl;    // Can access local
    
    return 0;
}`,
        visualDescription: 'Visual: A diagram showing different scopes as nested boxes. Global scope is the outer box, function scopes are inner boxes. Variables are shown only in their accessible scope.'
      }
    ],
    keyTakeaways: [
      'Variables are named storage locations that hold values in memory',
      'Variables must be declared with a data type before use',
      'Variable names must follow C++ naming rules and conventions',
      'Variables can be declared and initialized separately or together',
      'Understanding variable scope helps prevent errors and organize code'
    ]
  },

  // Java - Java Basics - Hello World
  'java-basics-hello-world': {
    title: 'Hello World - Your First Java Program',
    overview: 'The "Hello World" program is the traditional first program when learning any programming language. It introduces you to the basic structure of a Java program, how to compile and run code, and the fundamental syntax. This is your gateway into Java programming.',
    sections: [
      {
        heading: 'Understanding the Hello World Program',
        content: `Let's break down a simple Hello World program to understand Java's basic structure. Every Java program follows a similar pattern that you'll use throughout your programming journey.

Program Structure:
- Every Java program must have at least one class
- The class name must match the filename
- The main method is the entry point of the program
- System.out.println() is used to display output

Key Components:
- public class: Defines a class accessible from anywhere
- public static void main: The starting point of execution
- String[] args: Command-line arguments (optional)
- System.out.println: Prints text to the console`,
        codeExample: `// HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}

// Output:
// Hello, World!`,
        visualDescription: 'Visual: A flowchart showing program execution starting from main method, executing the println statement, and displaying output on the console.'
      },
      {
        heading: 'Compiling and Running Java Programs',
        content: `Java is a compiled language, meaning you must compile your source code before running it. Understanding this process is crucial for Java development.

Compilation Process:
1. Write source code in a .java file
2. Compile using javac command: javac HelloWorld.java
3. This creates a .class file (bytecode)
4. Run using java command: java HelloWorld

Key Points:
- javac compiles Java source code to bytecode
- java runs the bytecode on the Java Virtual Machine (JVM)
- The .class file contains platform-independent bytecode
- JVM interprets bytecode for your specific platform`,
        codeExample: `// Step 1: Write HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}

// Step 2: Compile (in terminal/command prompt)
// javac HelloWorld.java
// This creates HelloWorld.class

// Step 3: Run (in terminal/command prompt)
// java HelloWorld
// Output: Hello, World!

// Note: No .class extension when running`,
        visualDescription: 'Visual: A diagram showing the compilation process: .java file → javac compiler → .class bytecode → JVM → execution and output.'
      },
      {
        heading: 'Understanding Java Syntax',
        content: `Java has specific syntax rules that must be followed. Learning these rules early will help you write correct code and understand error messages.

Syntax Rules:
- Statements end with semicolons
- Code blocks use curly braces
- Class names start with uppercase (convention)
- Method names start with lowercase (convention)
- Java is case-sensitive
- Indentation improves readability (not required but recommended)

Common Syntax Elements:
- Comments: // for single-line, /* */ for multi-line
- String literals: Enclosed in double quotes
- Method calls: object.methodName()
- Package declaration: package name; (optional)`,
        codeExample: `// Single-line comment
/* Multi-line
   comment */

public class SyntaxExample {
    // Method declaration
    public static void main(String[] args) {
        // Statement ending with semicolon
        System.out.println("Hello");
        
        // Multiple statements
        System.out.println("World");
        System.out.println("Java");
        
        // Code block with braces
        if (true) {
            System.out.println("Inside block");
        }
    }
}`,
        visualDescription: 'Visual: An annotated code example highlighting different syntax elements: comments, braces, semicolons, method calls, with color-coded explanations.'
      },
      {
        heading: 'Common Errors and How to Fix Them',
        content: `As a beginner, you'll encounter common errors. Understanding these errors helps you debug your code quickly.

Common Errors:
1. Missing semicolon: Statements must end with ;
2. Mismatched braces: Every { must have a matching }
3. Class name mismatch: Class name must match filename
4. Case sensitivity: Java is case-sensitive (Main ≠ main)
5. Missing main method: Program must have main method

Error Messages:
- Compile-time errors: Found during compilation
- Runtime errors: Found when program runs
- Logical errors: Program runs but produces wrong output`,
        codeExample: `// ERROR 1: Missing semicolon
public class ErrorExample {
    public static void main(String[] args) {
        System.out.println("Hello")  // Missing semicolon
    }
}
// Error: ';' expected

// ERROR 2: Mismatched braces
public class ErrorExample {
    public static void main(String[] args) {
        System.out.println("Hello");
    // Missing closing brace
// Error: '}' expected

// CORRECT VERSION:
public class ErrorExample {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}`,
        visualDescription: 'Visual: Side-by-side comparison showing incorrect code with error indicators (red X marks) and correct code with checkmarks, highlighting the fixes.'
      }
    ],
    keyTakeaways: [
      'Every Java program must have a class with a main method',
      'Java source code is compiled to bytecode before execution',
      'The main method is the entry point where program execution begins',
      'System.out.println() is used to display output to the console',
      'Understanding common syntax errors helps in debugging code'
    ]
  },

  // Python - Python Basics - Python Syntax
  'python-basics-syntax': {
    title: 'Python Syntax Fundamentals',
    overview: 'Python is known for its clean and readable syntax. Unlike many languages, Python uses indentation to define code blocks, making it visually intuitive. This section introduces you to Python\'s unique syntax features and how to write your first Python programs.',
    sections: [
      {
        heading: 'Python\'s Unique Syntax Features',
        content: `Python stands out from other programming languages with its emphasis on readability and simplicity. Understanding Python's syntax philosophy will help you write better code.

Key Features:
- Indentation-based blocks (no braces required)
- Dynamic typing (no need to declare variable types)
- Simple and readable syntax
- Minimal punctuation required
- Clear and expressive code structure

Python Philosophy:
- Code should be readable and beautiful
- Simple is better than complex
- Readability counts
- There should be one obvious way to do things`,
        codeExample: `# Python's clean syntax

# Simple print statement
print("Hello, World!")

# Variables (no type declaration needed)
name = "Python"
age = 30
height = 5.9

# Indentation defines blocks (no braces)
if age > 18:
    print("Adult")
    print("Can vote")
else:
    print("Minor")

# Functions are simple
def greet(name):
    print(f"Hello, {name}!")

greet("World")`,
        visualDescription: 'Visual: A comparison diagram showing Python syntax (clean, indented) vs other languages (with braces), highlighting Python\'s simplicity.'
      },
      {
        heading: 'Indentation and Code Blocks',
        content: `Python uses indentation (whitespace) to define code blocks instead of braces or keywords. This is one of Python's most distinctive features.

Indentation Rules:
- Use consistent indentation (spaces or tabs, but not both)
- Standard is 4 spaces per indentation level
- Indentation determines which code belongs to which block
- Incorrect indentation causes IndentationError

Code Blocks:
- if/else statements
- for/while loops
- function definitions
- class definitions
- try/except blocks

Best Practice:
- Always use 4 spaces for indentation
- Configure your editor to use spaces, not tabs`,
        codeExample: `# Correct indentation
if True:
    print("This is indented")
    print("Same level")
    if False:
        print("Nested block")
        print("More indented")
    print("Back to first level")

# Incorrect indentation (will cause error)
# if True:
# print("Not indented")  # ERROR!

# Function with proper indentation
def calculate_sum(a, b):
    result = a + b
    return result

# Loop with proper indentation
for i in range(5):
    print(i)
    if i == 2:
        print("Found 2!")`,
        visualDescription: 'Visual: A diagram showing code blocks with different indentation levels, color-coded to show which statements belong to which block.'
      },
      {
        heading: 'Comments and Documentation',
        content: `Comments help explain your code to others (and yourself). Python supports several ways to add comments and documentation.

Single-line Comments:
- Start with # symbol
- Everything after # on that line is ignored
- Used for short explanations

Multi-line Comments:
- Use triple quotes (""" or ''')
- Can span multiple lines
- Often used for documentation strings (docstrings)

Docstrings:
- Special comments that document functions/classes
- Placed immediately after definition
- Accessible via .__doc__ attribute
- Used by help() function`,
        codeExample: `# This is a single-line comment
name = "Python"  # Inline comment

# Multi-line comment using #
# This explains
# multiple lines
# of code

"""
This is a multi-line string
that can be used as a comment
or documentation
"""

def greet(name):
    """
    This is a docstring - documents the function
    
    Parameters:
    name (str): The name to greet
    
    Returns:
    None: Prints a greeting
    """
    print(f"Hello, {name}!")

# Access docstring
print(greet.__doc__)
help(greet)`,
        visualDescription: 'Visual: Code examples with different types of comments highlighted in different colors, showing single-line, multi-line, and docstring comments.'
      },
      {
        heading: 'Running Python Programs',
        content: `Python is an interpreted language, meaning you can run code directly without compilation. Understanding how to run Python programs is essential.

Running Python:
1. Interactive Mode: Type python in terminal, write code directly
2. Script Mode: Save code in .py file, run with python filename.py
3. IDE/Editor: Use integrated development environments

File Execution:
- Save code with .py extension
- Run from terminal: python script.py
- Or use: python3 script.py (on some systems)

Interactive Mode:
- Great for testing and learning
- Immediate feedback
- Type exit() or Ctrl+D to quit`,
        codeExample: `# Save as hello.py
print("Hello, World!")
print("Python is fun!")

# Run in terminal:
# python hello.py
# Output:
# Hello, World!
# Python is fun!

# Interactive mode example:
# $ python
# >>> print("Hello")
# Hello
# >>> name = "Python"
# >>> print(name)
# Python
# >>> exit()`,
        visualDescription: 'Visual: Screenshots/diagrams showing terminal with Python interactive mode, file editor with .py file, and terminal running the script.'
      }
    ],
    keyTakeaways: [
      'Python uses indentation instead of braces to define code blocks',
      'Python syntax emphasizes readability and simplicity',
      'Consistent indentation (4 spaces) is crucial for Python code',
      'Python is interpreted, allowing immediate execution without compilation',
      'Comments and docstrings help document and explain code'
    ]
  },

  // OOPS - Classes & Objects - Class Concept
  'oops-classes-class-concept': {
    title: 'Understanding Classes and Objects',
    overview: 'Object-Oriented Programming (OOP) is a programming paradigm based on the concept of objects. Classes are blueprints for creating objects, and objects are instances of classes. This fundamental concept is the foundation of modern software development.',
    sections: [
      {
        heading: 'What is a Class?',
        content: `A class is a blueprint or template for creating objects. Think of it like an architectural blueprint for a house - the blueprint defines the structure, but you need to build actual houses (objects) from it.

Class Definition:
- A class defines attributes (data) and methods (functions)
- It describes what an object will have and what it can do
- Classes are reusable templates
- One class can create many objects

Real-world Analogy:
- Class: Car blueprint
- Object: Your specific car, neighbor's car, etc.
- Attributes: color, model, year
- Methods: start(), stop(), accelerate()`,
        codeExample: `// Class definition (C++ example)
class Car {
    // Attributes (data members)
    string color;
    string model;
    int year;
    
    // Methods (member functions)
    void start() {
        cout << "Car started!" << endl;
    }
    
    void stop() {
        cout << "Car stopped!" << endl;
    }
};

// Creating objects from the class
Car myCar;        // Object 1
Car neighborCar;  // Object 2

// Each object has its own attributes
myCar.color = "Red";
myCar.model = "Toyota";
neighborCar.color = "Blue";
neighborCar.model = "Honda";`,
        visualDescription: 'Visual: A diagram showing a class blueprint (Car) with attributes and methods, and multiple objects (myCar, neighborCar) created from that blueprint, each with different attribute values.'
      },
      {
        heading: 'What is an Object?',
        content: `An object is an instance of a class. It's a concrete realization of the class blueprint, with actual values for its attributes. Objects are the working entities in object-oriented programming.

Object Characteristics:
- Created from a class using the 'new' keyword (in some languages)
- Has its own set of attribute values
- Can call methods defined in its class
- Each object is independent of other objects
- Objects interact with each other through method calls

Object Lifecycle:
1. Creation: Object is instantiated from class
2. Usage: Object's methods are called, attributes accessed
3. Destruction: Object is removed from memory (automatic in many languages)`,
        codeExample: `// Creating objects
Car car1;  // Object 1
Car car2;  // Object 2

// Setting attributes (each object has its own)
car1.color = "Red";
car1.model = "Toyota";
car1.year = 2020;

car2.color = "Blue";
car2.model = "Honda";
car2.year = 2021;

// Calling methods on objects
car1.start();  // Output: Car started!
car2.start();  // Output: Car started!

// Each object maintains its own state
cout << car1.color << endl;  // Output: Red
cout << car2.color << endl;  // Output: Blue`,
        visualDescription: 'Visual: Memory diagram showing multiple objects (car1, car2) in memory, each with its own attribute values, demonstrating that objects are independent instances.'
      },
      {
        heading: 'Class vs Object',
        content: `Understanding the difference between a class and an object is crucial for OOP. They are related but serve different purposes.

Class:
- Template or blueprint
- Defined once
- Doesn't occupy memory for data
- Defines structure and behavior
- Like a cookie cutter

Object:
- Instance of a class
- Created multiple times
- Occupies memory
- Has actual data values
- Like actual cookies made from the cutter

Key Differences:
- Class is abstract (concept), Object is concrete (real)
- Class is defined once, Objects are created many times
- Class has no memory for data, Objects have memory
- Class defines what objects will have, Objects have actual values`,
        codeExample: `// CLASS: Definition (template)
class Student {
    string name;
    int age;
    float gpa;
    
    void study() {
        cout << "Studying..." << endl;
    }
};

// OBJECTS: Instances (actual entities)
Student student1;  // Object 1
Student student2;  // Object 2
Student student3;  // Object 3

// Each object has its own data
student1.name = "Alice";
student1.age = 20;
student1.gpa = 3.8;

student2.name = "Bob";
student2.age = 21;
student2.gpa = 3.5;

// All objects can use class methods
student1.study();  // Alice is studying
student2.study();  // Bob is studying`,
        visualDescription: 'Visual: A side-by-side comparison showing the class definition (abstract template) on the left and multiple objects (concrete instances with data) on the right.'
      },
      {
        heading: 'Benefits of Classes and Objects',
        content: `Object-Oriented Programming provides several advantages that make code more organized, reusable, and maintainable.

Key Benefits:
- Code Reusability: Write a class once, create many objects
- Modularity: Code is organized into logical units
- Encapsulation: Data and methods are bundled together
- Maintainability: Easier to update and fix code
- Real-world Modeling: Programs model real-world entities

Organization:
- Related data and functions are grouped together
- Clear structure and relationships
- Easier to understand and navigate
- Better code organization

Real-world Application:
- Classes model real-world entities (Car, Student, BankAccount)
- Objects represent specific instances
- Methods represent actions these entities can perform`,
        codeExample: `// Example: Bank Account class
class BankAccount {
    string accountNumber;
    double balance;
    
    void deposit(double amount) {
        balance += amount;
        cout << "Deposited: $" << amount << endl;
    }
    
    void withdraw(double amount) {
        if (balance >= amount) {
            balance -= amount;
            cout << "Withdrawn: $" << amount << endl;
        } else {
            cout << "Insufficient funds!" << endl;
        }
    }
    
    void displayBalance() {
        cout << "Balance: $" << balance << endl;
    }
};

// Create multiple accounts (objects)
BankAccount account1;
BankAccount account2;

// Each account is independent
account1.deposit(1000);
account2.deposit(500);
account1.displayBalance();  // Shows account1's balance
account2.displayBalance();  // Shows account2's balance`,
        visualDescription: 'Visual: A diagram showing how classes enable code reuse - one BankAccount class creating multiple account objects, each maintaining its own balance.'
      }
    ],
    keyTakeaways: [
      'A class is a blueprint that defines attributes and methods for objects',
      'An object is an instance of a class with actual data values',
      'One class can create multiple independent objects',
      'Classes promote code reusability and organization',
      'OOP models real-world entities as classes and objects'
    ]
  },

  // DBMS - DBMS Introduction - What is DBMS?
  'dbms-introduction-what-is-dbms': {
    title: 'What is Database Management System (DBMS)?',
    overview: 'A Database Management System (DBMS) is software that manages databases. It provides an interface for storing, retrieving, and managing data efficiently. Understanding DBMS is essential for anyone working with data, from web applications to enterprise systems.',
    sections: [
      {
        heading: 'Introduction to DBMS',
        content: `A Database Management System (DBMS) is software that allows users to create, maintain, and control access to databases. It acts as an intermediary between users and the database, providing a systematic way to manage data.

What is DBMS?
- Software system for managing databases
- Provides tools for data storage, retrieval, and manipulation
- Ensures data integrity and security
- Supports multiple users simultaneously
- Handles data relationships and constraints

Key Components:
- Database: Collection of related data
- DBMS Software: Manages the database
- Users: People or applications that interact with the database
- Hardware: Computers and storage devices`,
        codeExample: `// Conceptual example of DBMS operations

// Creating a database
CREATE DATABASE SchoolDB;

// Creating a table (structure)
CREATE TABLE Students (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    age INT,
    grade VARCHAR(10)
);

// Inserting data
INSERT INTO Students VALUES (1, 'Alice', 20, 'A');
INSERT INTO Students VALUES (2, 'Bob', 19, 'B');

// Retrieving data
SELECT * FROM Students;

// Output:
// id | name  | age | grade
// 1  | Alice | 20  | A
// 2  | Bob   | 19  | B`,
        visualDescription: 'Visual: A diagram showing DBMS as a central system managing a database, with users and applications connecting to it, and data being stored, retrieved, and managed.'
      },
      {
        heading: 'Why Do We Need DBMS?',
        content: `Before DBMS, data was stored in files, which led to many problems. DBMS solves these issues and provides a better way to manage data.

Problems with File System:
- Data redundancy: Same data stored multiple times
- Data inconsistency: Different copies have different values
- Difficult data access: Need to write custom programs
- No data integrity: No enforcement of rules
- Concurrent access issues: Multiple users cause problems
- Security problems: No centralized access control

Benefits of DBMS:
- Data independence: Data separate from applications
- Reduced redundancy: Data stored once
- Data consistency: Single source of truth
- Better security: Access control and authorization
- Concurrent access: Multiple users can work simultaneously
- Data integrity: Rules and constraints enforced`,
        codeExample: `// File System Approach (Problems)
// student1.txt: Alice, 20, A
// student2.txt: Bob, 19, B
// student3.txt: Alice, 20, A+  // Inconsistency!

// DBMS Approach (Solutions)
// Single source of truth
Students Table:
id | name  | age | grade
1  | Alice | 20  | A
2  | Bob   | 19  | B

// Update once, reflects everywhere
UPDATE Students SET grade = 'A+' WHERE id = 1;

// All queries now show consistent data
SELECT * FROM Students WHERE name = 'Alice';
// Always returns: Alice, 20, A+`,
        visualDescription: 'Visual: A comparison diagram showing file system problems (multiple files, redundancy, inconsistency) vs DBMS benefits (single database, consistency, integrity).'
      },
      {
        heading: 'Types of DBMS',
        content: `DBMS can be classified based on how data is organized and stored. Understanding different types helps you choose the right system for your needs.

Relational DBMS (RDBMS):
- Data stored in tables (rows and columns)
- Tables related through keys
- Most common type (MySQL, PostgreSQL, Oracle)
- Uses SQL for queries
- ACID properties for reliability

NoSQL DBMS:
- Non-relational databases
- Flexible data models
- Types: Document, Key-Value, Graph, Column-family
- Good for big data and real-time applications
- Examples: MongoDB, Cassandra, Redis

Hierarchical DBMS:
- Tree-like structure
- Parent-child relationships
- Less common now
- Example: IMS (IBM)

Network DBMS:
- Graph-like structure
- More flexible than hierarchical
- Less common now`,
        codeExample: `// Relational DBMS (RDBMS) Example
// Tables with relationships
Students Table:
id | name  | course_id
1  | Alice | 101
2  | Bob   | 102

Courses Table:
id | name
101| Math
102| Science

// Query with JOIN (relationship)
SELECT s.name, c.name 
FROM Students s
JOIN Courses c ON s.course_id = c.id;

// NoSQL Example (Document-based)
{
  "student_id": 1,
  "name": "Alice",
  "courses": ["Math", "Science"],
  "grades": {"Math": "A", "Science": "B"}
}`,
        visualDescription: 'Visual: Diagrams showing different DBMS types: relational (tables with relationships), NoSQL (document structure), hierarchical (tree structure), with examples.'
      },
      {
        heading: 'DBMS Architecture',
        content: `DBMS architecture defines how users interact with the database system. Understanding architecture helps you work effectively with databases.

Three-Tier Architecture:
1. Presentation Layer: User interface (web browser, mobile app)
2. Application Layer: Business logic and processing
3. Database Layer: DBMS and actual data storage

Two-Tier Architecture:
- Client directly connects to database
- Simpler but less scalable
- Good for small applications

Key Components:
- Query Processor: Processes SQL queries
- Storage Manager: Manages data storage
- Transaction Manager: Handles transactions
- Buffer Manager: Manages memory
- Security Manager: Handles authentication`,
        codeExample: `// Three-Tier Architecture Flow

// Tier 1: Presentation (Browser)
User clicks "View Students"

// Tier 2: Application (Server)
function getStudents() {
    // Business logic
    const query = "SELECT * FROM Students";
    return db.execute(query);
}

// Tier 3: Database (DBMS)
// Executes query, returns results
SELECT * FROM Students;

// Results flow back:
// Database → Application → Presentation → User`,
        visualDescription: 'Visual: Architecture diagram showing three tiers (Presentation, Application, Database) with data flow arrows, and key DBMS components (Query Processor, Storage Manager, etc.).'
      }
    ],
    keyTakeaways: [
      'DBMS is software that manages databases and provides data access',
      'DBMS solves problems of data redundancy, inconsistency, and security',
      'Relational DBMS (RDBMS) is the most common type, using tables and SQL',
      'DBMS provides data independence, integrity, and concurrent access',
      'Understanding DBMS architecture helps in effective database design'
    ]
  },

  // OS - OS Introduction - What is OS?
  'os-introduction-what-is-os': {
    title: 'What is an Operating System (OS)?',
    overview:
      'An operating system (OS) is the core software that manages hardware and provides services for application programs. Understanding OS concepts like processes, memory, and scheduling is critical for system-level thinking and placement interviews.',
    sections: [
      {
        heading: 'Role of an Operating System',
        content: `An Operating System acts as a bridge between the user, application programs, and the hardware.

Key Responsibilities:
- Process Management: Creates, schedules, and terminates processes
- Memory Management: Allocates and deallocates memory safely
- File System Management: Organizes data on storage devices
- Device Management: Manages I/O devices using drivers
- Security and Protection: Controls access to system resources

Without an OS, every application would have to manage hardware directly, making systems complex and unsafe. The OS centralizes these responsibilities and exposes a clean interface to programs.`,
        codeExample: `// Conceptual view (not real code)
// User Program -> System Call -> Operating System -> Hardware

readFile(\"notes.txt\")   // High-level API
  ↓
System Call: read()
  ↓
OS: locates file blocks on disk, manages buffers, handles errors
  ↓
Disk Controller + Hardware`,
        visualDescription:
          'Visual: Three-layer diagram - User & Applications at the top, Operating System in the middle, Hardware at the bottom, with arrows showing requests flowing through the OS.'
      },
      {
        heading: 'Services Provided by an OS',
        content: `From a user's and programmer's perspective, the OS provides several important services:

User-Oriented Services:
- Program Execution: Load, run, and terminate programs
- I/O Operations: Standard input/output streams, device access
- File Manipulation: Create, delete, read, write, and rename files
- Error Detection: Detect and handle hardware and software errors

System-Oriented Services:
- Resource Allocation: Fair distribution of CPU, memory, and I/O
- Accounting: Tracking resource usage (time, memory, disk)
- Protection: Preventing one process from harming another

In interviews, you are often asked to list these services and explain them with real-world analogies (for example, OS as a manager allocating meeting rooms, time slots, and storage).`,
        codeExample: `// Example: OS services visible in a typical C program
int main() {
    // 1. Program execution (OS loads this program)
    // 2. I/O operations (printf uses OS system calls under the hood)
    printf(\"Hello from OS-managed program!\\n\");

    // 3. Memory management (malloc/free managed by OS + runtime)
    int *arr = (int*)malloc(10 * sizeof(int));
    // ...
    free(arr);

    return 0;  // OS cleans up process resources
}`,
        visualDescription:
          'Visual: Table with two columns: "User Services" and "System Services", each listing key OS services with icons (CPU, memory chip, disk, shield).'
      },
      {
        heading: 'Types of Operating Systems',
        content: `Different systems use different kinds of operating systems, optimized for their use cases.

Common Types:
- Batch OS: Jobs processed in batches with little user interaction (early mainframes)
- Time-Sharing / Multi-User OS: Multiple users share the CPU using time slices (Unix, Linux)
- Multi-Programming OS: Multiple programs loaded in memory to improve CPU utilization
- Real-Time OS (RTOS): Strict timing guarantees, used in embedded systems and critical control systems
- Mobile OS: Optimized for touch, power usage, and apps (Android, iOS)

For interviews, you should be able to:
- Define each type briefly
- Give 1–2 examples
- Explain where it is used in the real world.`,
        codeExample: `// Pseudo configuration examples (conceptual)
// Desktop / Server
OS = \"Linux (time-sharing, multi-user)\";

// Embedded Controller
OS = \"Real-Time OS (RTOS) with strict timing\";

// Smartphone
OS = \"Android / iOS (mobile OS)\";`,
        visualDescription:
          'Visual: Timeline showing CPU time slices for different users (time-sharing), contrasted with a single dedicated job in a batch system, plus icons representing desktop, embedded device, and smartphone.'
      }
    ],
    keyTakeaways: [
      'An Operating System is the main software that manages hardware and provides services to programs',
      'Key OS responsibilities include process, memory, file, device, and security management',
      'The OS offers user-level services (program execution, I/O, files) and system-level services (allocation, accounting, protection)',
      'Different types of OS (batch, time-sharing, real-time, mobile) are optimized for different environments'
    ]
  },

  // CN - Networks Introduction - Network Basics
  'cn-introduction-network-basics': {
    title: 'Network Basics',
    overview:
      'Computer networks connect devices to share data and resources. Understanding basic networking concepts is essential for system design, backend development, and many interview questions.',
    sections: [
      {
        heading: 'What is a Computer Network?',
        content: `A computer network is a collection of interconnected devices (nodes) that communicate and share resources.

Core Ideas:
- Nodes: Computers, servers, routers, switches, IoT devices
- Links: Physical (cables, fiber) or wireless (Wi‑Fi, cellular)
- Data: Packets carrying information between nodes

Goals of Networking:
- Resource Sharing: Printers, files, internet connection
- Communication: Email, messaging, video calls
- Reliability: Redundant paths and fault tolerance
- Scalability: Add more devices without redesigning everything`,
        codeExample: `// Everyday examples of networks (conceptual)
HomeNetwork = {
  devices: ['Laptop', 'Phone', 'Smart TV'],
  medium: 'Wi‑Fi / Ethernet',
  router: 'Home Wi‑Fi Router',
  internet: true
}

OfficeNetwork = {
  devices: ['Developer PCs', 'Servers', 'Printers'],
  medium: 'Ethernet + Wi‑Fi',
  topology: 'Star / Hierarchical',
  internet: true
}`,
        visualDescription:
          'Visual: Simple diagram with multiple devices (laptop, phone, server) connected to a router, which connects to the internet cloud.'
      },
      {
        heading: 'Basic Network Terminology',
        content: `Key terms you must know for interviews:

- Host: Any device that sends/receives data on the network
- IP Address: Logical address that identifies a host on a network
- MAC Address: Physical address of a network interface card (NIC)
- Port: Logical endpoint used to identify specific applications (e.g., port 80 for HTTP)
- Bandwidth: Maximum data transfer rate of a link
- Latency: Time taken for data to travel from source to destination

Interviewers often expect you to define these in simple language and give a quick example (e.g., IP address is like a house address, port is like a flat number).`,
        codeExample: `// Example: A backend service listening on a TCP port
// Host IP: 192.168.1.10, Port: 8080

// Pseudo-code
startServer({
  host: '192.168.1.10',
  port: 8080
});

// Client connects to <IP, Port> pair to talk to the service`,
        visualDescription:
          'Visual: Diagram showing a host with IP address and ports, plus arrows showing data flowing between two hosts over a network link.'
      },
      {
        heading: 'Network Classification and Topologies',
        content: `Networks are categorized by size and layout:

By Size:
- LAN (Local Area Network): Small area (home, office, lab)
- MAN (Metropolitan Area Network): City‑scale networks
- WAN (Wide Area Network): Large geographic area (internet)

By Topology (Physical/Logical Layout):
- Bus: All devices share a single communication line
- Star: All devices connect to a central switch/hub
- Ring: Each device connects to two others, forming a ring
- Mesh: Devices interconnect with many redundant paths

These concepts come up in both theory questions and system design discussions (for example, how data centers are networked).`,
        codeExample: `// Conceptual summary
Network1 = 'Office LAN using Star topology with a central switch';
Network2 = 'ISP WAN connecting multiple cities using Mesh / Hierarchical design';`,
        visualDescription:
          'Visual: Multiple small diagrams for LAN/MAN/WAN and bus/star/ring topologies, each labeled with a short description.'
      }
    ],
    keyTakeaways: [
      'A computer network connects devices to share data and resources',
      'Key networking terms include host, IP address, MAC address, port, bandwidth, and latency',
      'Networks are classified by size (LAN, MAN, WAN) and topology (bus, star, ring, mesh)',
      'Networking fundamentals are important for backend, DevOps, and system design interviews'
    ]
  },

  // System Design - Introduction - What is System Design?
  'system-design-introduction-what-is-sd': {
    title: 'What is System Design?',
    overview:
      'System Design is about designing large‑scale software systems that are scalable, reliable, and maintainable. It combines data structures/algorithms with real‑world constraints like latency, throughput, and cost.',
    sections: [
      {
        heading: 'Why System Design Matters',
        content: `In product‑based companies, system design is a separate interview round focused on how you architect complex systems.

What System Design Covers:
- Breaking requirements into clear functional and non‑functional requirements
- Choosing the right architecture (monolith, microservices, layered, event‑driven)
- Selecting appropriate data stores (SQL, NoSQL, caches, message queues)
- Handling scale, failures, and security

Examples of System Design Problems:
- Design a URL shortener
- Design an Instagram‑like feed
- Design a chat application

Interviewers are less interested in perfect code and more in your reasoning, trade‑offs, and clarity of thought.`,
        codeExample: `// High-level steps when faced with a system design problem
1. Clarify requirements (features, scale, constraints)
2. Define APIs and core data models
3. Propose a high-level architecture (clients, gateways, services, databases)
4. Discuss data partitioning, caching, and consistency
5. Address bottlenecks, failures, and monitoring`,
        visualDescription:
          'Visual: Block diagram showing clients, load balancer, application servers, databases, cache, and message queue with arrows for data flow.'
      },
      {
        heading: 'Core Building Blocks in System Design',
        content: `Most system design problems reuse a common set of building blocks:

- Load Balancers: Distribute traffic across multiple servers
- Application Servers / Microservices: Implement business logic
- Databases: Relational (consistency, transactions) and NoSQL (scale, flexibility)
- Caches: In‑memory stores (Redis, Memcached) to speed up reads
- Message Queues: Decouple producers and consumers (Kafka, RabbitMQ)
- CDN: Serve static content closer to users

Knowing what each component does and when to use it is more important than knowing exact configuration flags.`,
        codeExample: `// Pseudo deployment description
System = {
  clients: ['Web', 'Mobile'],
  entry: 'API Gateway + Load Balancer',
  services: ['UserService', 'FeedService', 'NotificationService'],
  storage: ['PostgreSQL', 'Redis Cache'],
  async: ['Kafka Topic for events']
}`,
        visualDescription:
          'Visual: Layered architecture diagram with client layer, API gateway, services layer, data layer (DB + cache), and async layer (queue).'
      },
      {
        heading: 'Thinking in Trade‑offs',
        content: `System design is never about a single "correct" answer, but about trade‑offs.

Key Trade‑offs:
- Consistency vs Availability (CAP theorem)
- Latency vs Throughput
- Simplicity vs Flexibility
- Strong schema (SQL) vs flexible schema (NoSQL)

For interviews:
- Always state assumptions and constraints
- Justify your choices (\"I prefer strong consistency here because...\" or \"I choose eventual consistency because...\")
- Be ready to discuss how you would evolve the design as scale increases.`,
        codeExample: `// Example trade-off comment (pseudo)
// Using Redis cache to reduce read latency from ~100 ms (DB) to ~5 ms (cache),
// accepting eventual consistency for non-critical counters like view counts.`,
        visualDescription:
          'Visual: Two‑axis chart showing trade‑offs (e.g., consistency vs availability), with points representing different designs.'
      }
    ],
    keyTakeaways: [
      'System Design focuses on architecting large‑scale, reliable, and maintainable systems',
      'Typical interview problems ask you to design real products like chat apps, feeds, or URL shorteners',
      'Core building blocks include load balancers, services, databases, caches, queues, and CDNs',
      'Good answers emphasize clear requirements, sensible architecture, and well‑explained trade‑offs'
    ]
  },

  // Frontend - HTML Basics - Introduction to HTML
  'html-basics-intro': {
    title: 'Introduction to HTML',
    overview:
      'HTML (HyperText Markup Language) is the standard language for structuring content on the web. Every web page you see in a browser is built on top of HTML.',
    sections: [
      {
        heading: 'What is HTML?',
        content: `HTML defines the structure and meaning of content in a web page.

Key Concepts:
- Elements: Building blocks written as tags (for example, <p>, <h1>, <a>)
- Attributes: Extra information inside tags (for example, href, src, alt)
- Document Structure: html, head, and body tags

HTML is not a programming language; it is a markup language. It tells the browser what each part of the page represents: a heading, a paragraph, an image, a link, etc.`,
        codeExample: `<!DOCTYPE html>
<html>
  <head>
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>This is my first HTML page.</p>
    <a href=\"https://example.com\">Visit a site</a>
  </body>
</html>`,
        visualDescription:
          'Visual: Browser window on the right showing the rendered page, and the HTML source on the left with arrows mapping headings, paragraphs, and links.'
      },
      {
        heading: 'Basic Page Structure',
        content: `A minimal HTML page follows a predictable structure:

- <!DOCTYPE html>: Tells the browser to use modern HTML5
- <html>: Root element of the page
- <head>: Metadata (title, charset, styles, scripts)
- <body>: Visible content (text, images, forms, etc.)

Understanding this structure is essential before learning CSS and JavaScript.`,
        codeExample: `<!DOCTYPE html>
<html>
  <head>
    <meta charset=\"UTF-8\">
    <title>Structure Demo</title>
  </head>
  <body>
    <h1>Page Title</h1>
    <p>Content goes here.</p>
  </body>
</html>`,
        visualDescription:
          'Visual: Tree diagram showing html at the root, with head and body as children, and content elements nested under body.'
      }
    ],
    keyTakeaways: [
      'HTML is the markup language that defines the structure of web pages',
      'An HTML document is built from elements, attributes, and a fixed page structure',
      'Learning HTML well makes it easier to understand CSS and JavaScript on top of it'
    ]
  },

  // Frontend - CSS Basics - Introduction to CSS
  'css-basics-intro': {
    title: 'Introduction to CSS',
    overview:
      'CSS (Cascading Style Sheets) controls the visual presentation of HTML. It allows you to style text, layout, colors, and responsive behavior.',
    sections: [
      {
        heading: 'What is CSS?',
        content: `CSS separates content (HTML) from presentation (styles).

With CSS you can:
- Change colors, fonts, and spacing
- Create layouts (flexbox, grid)
- Add animations and transitions
- Make pages responsive on different screen sizes`,
        codeExample: `/* Example: Basic CSS */
body {
  font-family: system-ui, sans-serif;
  background-color: #0b1120;
  color: #e5e7eb;
}

h1 {
  color: #22d3ee;
}

button.primary {
  background: #22c55e;
  color: #020617;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}`,
        visualDescription:
          'Visual: Before/after comparison of a plain HTML page vs the same page after applying CSS styles.'
      },
      {
        heading: 'Selectors and the Box Model',
        content: `Two foundational ideas in CSS:

Selectors:
- Select elements to style (element, class, id selectors)
- Example: p, .btn-primary, #main

Box Model:
- Every element is a rectangular box: content, padding, border, margin
- Understanding the box model is crucial to debug layout issues.`,
        codeExample: `/* Selectors */
p {
  margin-bottom: 1rem;
}

.btn-primary {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
}

#main {
  max-width: 800px;
  margin: 0 auto;
}`,
        visualDescription:
          'Visual: Diagram of the CSS box model, labeling content, padding, border, and margin, plus arrows showing how selectors target elements.'
      }
    ],
    keyTakeaways: [
      'CSS styles HTML to control colors, fonts, spacing, and layout',
      'Selectors choose which elements to style; the box model explains element sizing and spacing',
      'Mastering basic CSS is essential for building modern frontends'
    ]
  },

  // Frontend - JavaScript Basics - Introduction to JavaScript
  'javascript-basics-intro': {
    title: 'Introduction to JavaScript',
    overview:
      'JavaScript adds interactivity and logic to web pages. Together with HTML and CSS, it forms the core of frontend development.',
    sections: [
      {
        heading: 'What is JavaScript Used For?',
        content: `JavaScript runs in the browser (and on servers via Node.js) to add behavior.

Common Uses:
- Responding to user actions (clicks, key presses)
- Manipulating the DOM (adding/removing elements)
- Making network requests (fetch API, AJAX)
- Validating form inputs on the client side`,
        codeExample: `// Example: Simple click handler
const button = document.querySelector('#greet');

button.addEventListener('click', function () {
  alert('Hello from JavaScript!');
});`,
        visualDescription:
          'Visual: Browser showing a button; when clicked, a popup appears, with arrows connecting JavaScript code to the behavior.'
      },
      {
        heading: 'Basic Syntax and Variables',
        content: `Modern JavaScript uses let and const for variables and supports many data types.

Examples:
- Primitive types: string, number, boolean, null, undefined
- Reference types: objects, arrays, functions

Using let and const:
- const: value should not be reassigned
- let: value can be reassigned`,
        codeExample: `// Variables
const pi = 3.14;
let counter = 0;

// Arrays and objects
const languages = ['C++', 'Java', 'Python', 'JavaScript'];
const user = { name: 'Alex', level: 3 };

// Function
function greet(name) {
  console.log('Hello, ' + name + '!');
}

greet(user.name);`,
        visualDescription:
          'Visual: Code snippet with highlights over let/const, arrays, and objects, plus a console output panel showing the result of greet().'
      }
    ],
    keyTakeaways: [
      'JavaScript provides logic and interactivity in web applications',
      'It runs in browsers and on servers (Node.js), sharing the same core language',
      'Understanding variables, types, and basic syntax is the first step in JS mastery'
    ]
  },

  // Backend - Node.js Basics - Introduction to Node.js
  'nodejs-basics-intro': {
    title: 'Introduction to Node.js',
    overview:
      'Node.js lets you run JavaScript on the server. It uses an event‑driven, non‑blocking I/O model that makes it efficient for I/O‑heavy applications.',
    sections: [
      {
        heading: 'What is Node.js?',
        content: `Node.js is a runtime built on Chrome\'s V8 JavaScript engine.

Key Points:
- Allows JavaScript to run outside the browser
- Uses a single‑threaded event loop with non‑blocking I/O
- Ideal for APIs, real‑time apps, and microservices`,
        codeExample: `// Minimal HTTP server in Node.js
import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello from Node.js server!');
});

server.listen(3000);`,
        visualDescription:
          'Visual: Diagram showing clients sending HTTP requests to a single Node.js server, with an event loop handling multiple connections concurrently.'
      },
      {
        heading: 'Modules and NPM',
        content: `Node.js encourages modular code and has a huge ecosystem via NPM.

- Modules: Split logic into separate files and reuse via import/require
- NPM: Package manager with libraries for almost anything (web frameworks, databases, testing, etc.)

In backend interviews, expect to discuss how you structure Node.js projects and manage dependencies.`,
        codeExample: `// Example: Using a third-party module (Express)
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello from Express on Node.js');
});

app.listen(3000);`,
        visualDescription:
          'Visual: Tree view of a Node.js project with node_modules, source files, and a package.json file describing dependencies.'
      }
    ],
    keyTakeaways: [
      'Node.js is a JavaScript runtime for building server‑side applications',
      'Its event‑driven, non‑blocking model is well‑suited for I/O‑bound workloads',
      'NPM provides a massive ecosystem of reusable packages'
    ]
  },

  // Backend - Express Basics - Introduction to Express
  'express-basics-intro': {
    title: 'Introduction to Express.js',
    overview:
      'Express.js is a minimal and flexible Node.js framework for building web servers and APIs. It simplifies routing, middleware, and request handling.',
    sections: [
      {
        heading: 'Why Use Express?',
        content: `Without a framework, building HTTP servers in Node.js requires manual routing and boilerplate.

Express Provides:
- Simple routing (GET, POST, PUT, DELETE)
- Middleware pipeline for logging, auth, validation
- Easy integration with templates and JSON APIs`,
        codeExample: `import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});`,
        visualDescription:
          'Visual: Request lifecycle diagram showing an HTTP request entering Express, flowing through middleware, then reaching a route handler and returning a response.'
      }
    ],
    keyTakeaways: [
      'Express.js is a lightweight web framework on top of Node.js',
      'It simplifies routing and request handling using a middleware pipeline',
      'Most Node.js backend projects start with Express or a similar framework'
    ]
  },

  // AIML - ML Basics - What is Machine Learning?
  'ml-basics-introduction-what-is-ml': {
    title: 'What is Machine Learning?',
    overview:
      'Machine Learning (ML) is a subset of AI where systems learn patterns from data instead of being explicitly programmed for every rule.',
    sections: [
      {
        heading: 'Core Idea of ML',
        content: `Traditional programming uses explicit rules: if condition then action.
In ML, we give data and let algorithms learn patterns automatically.

Key Elements:
- Data: Examples with features and (optionally) labels
- Model: Mathematical function that maps inputs to outputs
- Training: Process of adjusting model parameters using data
- Evaluation: Measuring how well the model generalizes`,
        codeExample: `# Pseudo-code: Training a simple ML model
data = load_data()
model = Model()
model.train(data.train_features, data.train_labels)
accuracy = model.evaluate(data.test_features, data.test_labels)
print(\"Test accuracy:\", accuracy)`,
        visualDescription:
          'Visual: Pipeline diagram showing raw data → training → trained model → predictions on new data.'
      },
      {
        heading: 'Types of Machine Learning',
        content: `Common categories you must know for interviews:

- Supervised Learning: Learn from labeled data (input, correct output)
  Examples: regression, classification
- Unsupervised Learning: Discover structure in unlabeled data
  Examples: clustering, dimensionality reduction
- Reinforcement Learning: Learn by interacting with an environment and receiving rewards`,
        codeExample: `# Examples of ML tasks (conceptual)
task1 = 'Predict house prices (regression, supervised)'
task2 = 'Group customers by behavior (clustering, unsupervised)'
task3 = 'Train an agent to play a game (reinforcement learning)'`,
        visualDescription:
          'Visual: Three boxes labeled Supervised, Unsupervised, Reinforcement, each with a simple example and diagram (labeled points, clusters, agent-environment loop).'
      }
    ],
    keyTakeaways: [
      'Machine Learning lets systems learn patterns from data instead of hard-coded rules',
      'Core pipeline: data → model → training → evaluation → prediction',
      'You should be able to explain supervised, unsupervised, and reinforcement learning with simple examples'
    ]
  }
}

/**
 * Get theory content for a specific subject, unit, and subtopic
 * Handles both subtopic names and IDs
 */
export function getTheoryForSubtopic(
  subject: string,
  unit: string,
  subtopic: string
): TheoryContent | null {
  // Normalize keys: convert to lowercase and replace spaces/special chars
  let normalizedSubject = subject.toLowerCase().replace(/\s+/g, '-')
  let normalizedUnit = unit.toLowerCase().replace(/\s+/g, '-')
  let normalizedSubtopic = subtopic.toLowerCase().replace(/\s+/g, '-').replace(/[?.,!;:]/g, '') // Remove punctuation
  
  // Handle subject name variations
  if (normalizedSubject.includes('data-structures') || normalizedSubject.includes('dsa')) {
    normalizedSubject = 'dsa'
  }
  
  // Handle subject name variations
  if (normalizedSubject.includes('c++') || normalizedSubject.includes('cpp') || normalizedSubject === 'c-fundamentals') {
    normalizedSubject = 'cpp'
  }
  if (normalizedSubject.includes('object-oriented') || normalizedSubject.includes('oops') || normalizedSubject.includes('oop')) {
    normalizedSubject = 'oops'
  }
  if (normalizedSubject.includes('database') || normalizedSubject.includes('dbms')) {
    normalizedSubject = 'dbms'
  }
  
  // Handle unit name variations - remove subject prefix if present
  if (normalizedUnit.startsWith('dbms-')) {
    normalizedUnit = normalizedUnit.replace(/^dbms-/, '')
  }
  if (normalizedUnit.startsWith('cpp-') || normalizedUnit.startsWith('c++-') || normalizedUnit.startsWith('c-fundamentals-')) {
    normalizedUnit = normalizedUnit.replace(/^(cpp-|c\+\+-|c-fundamentals-)/, '')
  }
  if (normalizedUnit.startsWith('java-') || normalizedUnit.startsWith('java-basics-')) {
    normalizedUnit = normalizedUnit.replace(/^(java-|java-basics-)/, '')
  }
  if (normalizedUnit.startsWith('python-') || normalizedUnit.startsWith('python-basics-')) {
    normalizedUnit = normalizedUnit.replace(/^(python-|python-basics-)/, '')
  }
  if (normalizedUnit.startsWith('oops-') || normalizedUnit.startsWith('oop-')) {
    normalizedUnit = normalizedUnit.replace(/^(oops-|oop-)/, '')
  }
  
  // Handle subtopic name variations - map common names to IDs
  const subtopicMappings: Record<string, string> = {
    'introduction-to-arrays': 'intro',
    'introduction': 'intro',
    'intro': 'intro',
    'array-operations': 'operations',
    'operations': 'operations',
    'searching-in-arrays': 'searching',
    'searching': 'searching',
    'sorting-arrays': 'sorting',
    'sorting': 'sorting',
    'introduction-to-variables': 'intro',
    'hello-world': 'hello-world',
    'python-syntax': 'syntax',
    'syntax': 'syntax',
    'class-concept': 'class-concept',
    'what-is-dbms': 'what-is-dbms',
    'what-is-dbms?': 'what-is-dbms'
  }
  
  // Try to map the subtopic name to an ID
  if (subtopicMappings[normalizedSubtopic]) {
    normalizedSubtopic = subtopicMappings[normalizedSubtopic]
  }
  
  // Try with the mapped ID first
  let key = `${normalizedSubject}-${normalizedUnit}-${normalizedSubtopic}` as TheoryKey
  let theory = theoryDatabase[key]
  
  // If not found, try with the original normalized name (without mapping)
  if (!theory) {
    const originalSubtopic = subtopic.toLowerCase().replace(/\s+/g, '-').replace(/[?.,!;:]/g, '')
    key = `${normalizedSubject}-${normalizedUnit}-${originalSubtopic}` as TheoryKey
    theory = theoryDatabase[key]
  }
  
  // If still not found, try alternative unit names
  if (!theory) {
    // Try with "variables" instead of "variables-data-types"
    if (normalizedUnit.includes('variables')) {
      const altUnit = 'variables'
      key = `${normalizedSubject}-${altUnit}-${normalizedSubtopic}` as TheoryKey
      theory = theoryDatabase[key]
    }
    // Try with "basics" instead of "java-basics" or "python-basics"
    if (!theory && (normalizedUnit.includes('basics') || normalizedUnit === 'basics')) {
      const altUnit = 'basics'
      key = `${normalizedSubject}-${altUnit}-${normalizedSubtopic}` as TheoryKey
      theory = theoryDatabase[key]
    }
  }
  
  // If still not found, generate comprehensive theory on-the-fly
  if (!theory) {
    return generateTheoryForSubtopic(subject, unit, subtopic)
  }
  
  return theory
}

/**
 * Generate comprehensive theory content for any subtopic
 * This ensures every subtopic has theory content even if not in the database
 */
function generateTheoryForSubtopic(
  subject: string,
  unit: string,
  subtopic: string
): TheoryContent {
  const title = `${subtopic} - ${unit}`
  const overview = `${subtopic} is an important concept in ${unit} within ${subject}. This section covers the core ideas, practical applications, and interview‑focused insights you need to master this topic.`
  
  // Generate context-appropriate content based on subtopic name
  const subtopicLower = subtopic.toLowerCase()
  const unitLower = unit.toLowerCase()
  const subjectLower = subject.toLowerCase()
  
  let section1Heading = `Understanding ${subtopic}`
  let section1Content = `${subtopic} is a core concept in ${unit} for ${subject}. It plays a crucial role in building a strong foundation in this area. Understanding ${subtopic} will help you reason about problems, write correct code, and explain your approach clearly in interviews.`
  
  let section2Heading = `Key Concepts and Applications`
  let section2Content = `In practice, ${subtopic} is used in multiple real‑world scenarios. Mastering this concept means knowing the definition, how it behaves with edge cases, and where it fits in system design. This knowledge is essential for coding rounds, machine coding, and design interviews.`

  // Extra section specifically for placement preparation subjects
  let section3Heading = `Interview Focus for ${subtopic}`
  let section3Content = `For placement preparation, interviewers often test ${subtopic} by giving you small but tricky problems.\n\nYou should be able to:\n- State a clear definition of ${subtopic} in one or two sentences\n- Give 1–2 simple examples in ${subject}\n- Discuss time/space complexity (if algorithm/data‑structure related)\n- Mention common pitfalls and how to avoid them\n\nAlways practise writing code for ${subtopic} on paper/whiteboard and then in your preferred language (C++ / Java / Python).`
  
  let codeExample = `// Example: ${subtopic} in ${subject}
// This demonstrates the basic usage and patterns

function example() {
    // ${subtopic} implementation
    return "This is a practical example"
}`

  // Customize content based on subtopic keywords
  if (subtopicLower.includes('introduction') || subtopicLower.includes('intro') || subtopicLower.includes('basics')) {
    section1Heading = `Introduction to ${subtopic}`
    section1Content = `${subtopic} is the starting point for learning ${unit} in ${subject}. This fundamental concept provides the building blocks for more advanced topics. Understanding ${subtopic} is essential before moving to complex concepts.`
    section2Heading = `Why ${subtopic} Matters`
    section2Content = `${subtopic} forms the foundation of ${unit}. It's used extensively in real-world applications and is frequently tested in technical interviews. Mastering this concept early will make learning advanced topics much easier.`
  } else if (subtopicLower.includes('advanced') || subtopicLower.includes('complex')) {
    section1Heading = `Advanced ${subtopic}`
    section1Content = `${subtopic} represents advanced concepts in ${unit} for ${subject}. This topic builds upon fundamental knowledge and introduces sophisticated techniques and patterns used by experienced developers.`
    section2Heading = `Mastering ${subtopic}`
    section2Content = `To master ${subtopic}, you need a solid understanding of the basics. This advanced topic requires practice and deep understanding of underlying principles. It's commonly asked in senior-level interviews.`
  } else if (subtopicLower.includes('algorithm') || subtopicLower.includes('sort') || subtopicLower.includes('search')) {
    section1Heading = `${subtopic} Algorithm`
    section1Content = `The ${subtopic} algorithm is a fundamental technique in ${unit} for ${subject}. Understanding how this algorithm works, its time complexity, and when to use it is crucial for solving coding problems efficiently.`
    section2Heading = `Algorithm Analysis`
    section2Content = `The ${subtopic} algorithm has specific time and space complexity characteristics. Understanding these helps you choose the right approach for different problem scenarios and optimize your solutions.`
    codeExample = `// ${subtopic} Algorithm Implementation
function ${subtopicLower.replace(/\s+/g, '')}(arr) {
    // Algorithm logic here
    // Time Complexity: O(n log n) typically
    // Space Complexity: O(1) or O(n) depending on implementation
    return result
}`
  } else if (subtopicLower.includes('data structure') || subtopicLower.includes('tree') || subtopicLower.includes('graph') || subtopicLower.includes('list')) {
    section1Heading = `${subtopic} Data Structure`
    section1Content = `${subtopic} is an important data structure in ${unit} for ${subject}. Understanding its structure, operations, and use cases is essential for efficient problem-solving and system design.`
    section2Heading = `Operations and Complexity`
    section2Content = `${subtopic} supports various operations like insertion, deletion, and traversal. Each operation has specific time and space complexity that you should understand to use this data structure effectively.`
    codeExample = `// ${subtopic} Data Structure Example
class ${subtopicLower.replace(/\s+/g, '')} {
    constructor() {
        // Initialize structure
    }
    
    // Common operations
    insert(value) { /* ... */ }
    delete(value) { /* ... */ }
    search(value) { /* ... */ }
}`
  } else if (subtopicLower.includes('design') || subtopicLower.includes('pattern') || subtopicLower.includes('architecture')) {
    section1Heading = `${subtopic} Design`
    section1Content = `${subtopic} is a crucial design concept in ${unit} for ${subject}. Understanding design principles, patterns, and best practices helps you build scalable and maintainable systems.`
    section2Heading = `Design Principles`
    section2Content = `When implementing ${subtopic}, consider scalability, maintainability, and performance. This design knowledge is essential for system design interviews and building production-ready applications.`
  }

  // Placement‑specific tuning (C++ / Java / Python / DSA / OOPS / DBMS / OS / CN / System Design)
  const isPlacementSubject =
    subjectLower.includes('c++') ||
    subjectLower.includes('cpp') ||
    subjectLower.includes('java') ||
    subjectLower.includes('python') ||
    subjectLower.includes('data structures') ||
    subjectLower.includes('dsa') ||
    subjectLower.includes('object-oriented') ||
    subjectLower.includes('oops') ||
    subjectLower.includes('database') ||
    subjectLower.includes('dbms') ||
    subjectLower.includes('operating systems') ||
    subjectLower.includes('os') ||
    subjectLower.includes('computer networks') ||
    subjectLower.includes('cn') ||
    subjectLower.includes('system design')

  if (isPlacementSubject) {
    // Make the content more focused on coding interviews and CS fundamentals
    section2Heading = `How ${subtopic} Appears in Interviews`
    section2Content = `In placement and product‑based company interviews, ${subtopic} is tested in both theory and coding rounds.\n\nTypical patterns:\n- Direct theory questions: definitions, properties, and real‑world use cases\n- Coding questions: implement or apply ${subtopic} to solve a problem\n- Optimization follow‑ups: analyse time/space and suggest improvements\n\nAlways connect ${subtopic} back to core CS ideas like complexity analysis, memory layout, and trade‑offs between different approaches.`

    section3Heading = `Checklist for ${subtopic} (Placement Prep)`
    section3Content = `Before your interview, make sure you can:\n- Explain ${subtopic} with a small diagram or example\n- Write a clean, bug‑free implementation in your preferred language\n- Analyse the time and space complexity\n- Talk about edge cases (empty input, large input, invalid data)\n- Compare ${subtopic} with at least one related concept and explain when to use which.`
  }
  
  return {
    title,
    overview,
    sections: [
      {
        heading: section1Heading,
        content: section1Content,
        codeExample,
        visualDescription: `Visual: A diagram illustrating ${subtopic} in the context of ${unit}, showing key components and relationships.`
      },
      {
        heading: section2Heading,
        content: section2Content,
        codeExample: `// Advanced ${subtopic} Example
// This shows practical implementation patterns

class Advanced${subtopic.replace(/\s+/g, '')} {
    // Implementation details
}`,
        visualDescription: `Visual: An advanced diagram showing ${subtopic} applications, patterns, and best practices.`
      },
      {
        heading: section3Heading,
        content: section3Content,
        codeExample: `// Quick revision snippet for ${subtopic}\n// Use this as a starting point when practising for interviews.\n\n// 1. Write the core idea in comments\n// 2. Implement it in your preferred language\n// 3. Add test cases and discuss complexity.`,
        visualDescription: `Visual: Bullet‑point checklist for revising ${subtopic} before interviews (definition, example, complexity, edge cases, trade‑offs).`
      }
    ],
    keyTakeaways: [
      `${subtopic} is a fundamental concept in ${unit} for ${subject}`,
      `Understanding ${subtopic} is essential for technical interviews`,
      `Practice implementing ${subtopic} to master the concept`,
      `Apply ${subtopic} knowledge to solve real-world problems`
    ]
  }
}

/**
 * Check if theory exists for a subtopic
 */
export function hasTheoryForSubtopic(
  subject: string,
  unit: string,
  subtopic: string
): boolean {
  return getTheoryForSubtopic(subject, unit, subtopic) !== null
}

/**
 * Get all available theory topics
 */
export function getAllTheoryTopics(): Array<{ subject: string; unit: string; subtopic: string }> {
  return Object.keys(theoryDatabase).map(key => {
    const parts = key.split('-')
    return {
      subject: parts[0],
      unit: parts[1],
      subtopic: parts.slice(2).join('-')
    }
  })
}

