/**
 * MCQ Database — Stax AI Tutor
 *
 * Static, hand-authored MCQs. Each entry is interview-grade:
 *  - 4 plausible options (no throwaways)
 *  - `explanation` justifies the correct choice
 *  - `wrongExplanations` keyed by option index — explains why each distractor fails
 *
 * Subject / unit / subtopic strings MUST match `content/subjects.ts` exactly.
 */

import { SUBJECTS } from './subjects'

export type Difficulty = 'Basic' | 'Medium' | 'Advanced'

export interface MCQData {
  subject: string
  unit: string
  subtopic: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  wrongExplanations?: Record<number, string>
  difficulty: Difficulty
}

const CURATED_MCQ_DATABASE: MCQData[] = [
  // ─────────────────────────────────────────────────────────────
  // C++ Programming → C++ Basics → Introduction to C++
  // ─────────────────────────────────────────────────────────────
  {
    subject: 'C++ Programming',
    unit: 'C++ Basics',
    subtopic: 'Introduction to C++',
    question: 'Which of the following best describes the relationship between C++ and C?',
    options: [
      'C++ is a strict superset of C — every valid C program compiles as C++',
      'C++ is almost a superset of C but adds reserved words and stricter type rules that can break C code',
      'C++ replaces C entirely; the two share no syntax in common',
      'C++ is interpreted while C is compiled, making them incompatible',
    ],
    correctAnswer: 1,
    explanation:
      'Although C++ was designed as "C with classes", it adds reserved words like `class`, `new`, `delete`, and `template`, and enforces stricter type conversions (e.g. `void*` → `T*` requires a cast). So a C program that uses `class` as a variable name or relies on implicit `void*` conversions will not compile under C++.',
    wrongExplanations: {
      0: 'Common misconception. C++ adds keywords (`class`, `new`, `template`, `this`) that are valid identifiers in C, so some C code fails to compile as C++.',
      2: 'C++ inherits C\'s syntax, operators, and most standard-library functions. They are deeply related.',
      3: 'Both languages are typically compiled, not interpreted.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'C++ Programming',
    unit: 'C++ Basics',
    subtopic: 'Introduction to C++',
    question: 'What is the role of the `main()` function in a C++ program?',
    options: [
      'It is one of several optional entry points; the linker picks any function named like `main`',
      'It is the single entry point invoked by the runtime; the program terminates when it returns',
      'It only exists for compatibility with C and is ignored by modern C++ compilers',
      'It must be declared `static` to be visible to the linker',
    ],
    correctAnswer: 1,
    explanation:
      '`main()` is the designated program entry point per the C++ standard. When `main` returns, static destructors run and the process exits with the returned value (or 0 if return is omitted — `main` is the only function allowed to omit `return`).',
    wrongExplanations: {
      0: 'There is exactly one `main`. Defining multiple `main` functions causes a linker error.',
      2: 'Modern C++ still requires `main` as the entry point for hosted environments.',
      3: '`main` must have external linkage (the default). Declaring it `static` is ill-formed.',
    },
    difficulty: 'Basic',
  },

  // C++ Programming → C++ Basics → Variables & Data Types
  {
    subject: 'C++ Programming',
    unit: 'C++ Basics',
    subtopic: 'Variables & Data Types',
    question: 'What happens when you read from an uninitialized local `int` variable in C++?',
    options: [
      'It is guaranteed to be zero — C++ default-initializes locals to 0',
      'The program reads an indeterminate value, which is undefined behavior',
      'The compiler always raises a hard error and refuses to build',
      'The OS automatically zeroes the stack, so the value is 0',
    ],
    correctAnswer: 1,
    explanation:
      'Local variables of fundamental types are *default-initialized*, which for `int` means no initialization at all — the storage holds whatever bytes were there. Reading that value is undefined behavior per [basic.indet]. Compilers may warn (`-Wuninitialized`) but are not required to error.',
    wrongExplanations: {
      0: 'Only **static** and **thread-local** objects are zero-initialized. Locals are not.',
      2: 'Reading uninitialized memory is UB, not a compile error — many compilers only warn.',
      3: 'The OS zeroes pages on first commit, but the stack is reused as functions return, so old data persists.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'C++ Programming',
    unit: 'C++ Basics',
    subtopic: 'Variables & Data Types',
    question: 'Which statement about `int` size in C++ is true?',
    options: [
      '`int` is always exactly 32 bits on every platform',
      '`int` is at least 16 bits but its exact size is implementation-defined',
      '`int` matches the pointer size of the platform (32-bit on x86, 64-bit on x64)',
      '`sizeof(int)` is always equal to `sizeof(long)`',
    ],
    correctAnswer: 1,
    explanation:
      'The standard only guarantees minimum widths: `char` ≥ 8 bits, `short` ≥ 16, `int` ≥ 16, `long` ≥ 32, `long long` ≥ 64. Actual widths are implementation-defined. Use `<cstdint>` (`int32_t`, `int64_t`) when an exact size matters.',
    wrongExplanations: {
      0: 'On most desktop platforms `int` is 32 bits, but embedded targets (8/16-bit MCUs) use 16-bit ints.',
      2: '`int` is unrelated to pointer size. On x86-64 Linux, `int` is 32 bits but `void*` is 64 bits.',
      3: 'On LLP64 (Windows 64-bit) `long` is 32 bits; on LP64 (Linux 64-bit) `long` is 64 bits. They differ.',
    },
    difficulty: 'Medium',
  },

  // C++ Programming → C++ Basics → Operators
  {
    subject: 'C++ Programming',
    unit: 'C++ Basics',
    subtopic: 'Operators',
    question: 'What is the value of the expression `5 / 2 + 5.0 / 2` in C++?',
    options: ['4', '4.5', '5.0', '5'],
    correctAnswer: 1,
    explanation:
      '`5 / 2` is integer division → `2`. `5.0 / 2` promotes the integer to `double` → `2.5`. Sum: `2 + 2.5 = 4.5`. The takeaway: at least one operand must be floating-point to keep fractional precision.',
    wrongExplanations: {
      0: 'You would get `4` only if both divisions were integer (e.g. `5/2 + 5/2`).',
      2: '`5.0` ignores you would need both halves to be `5.0 / 2`.',
      3: 'Integer truncation is only applied per-operator, not across the whole expression.',
    },
    difficulty: 'Basic',
  },

  // C++ Programming → Object-Oriented Programming → Classes & Objects
  {
    subject: 'C++ Programming',
    unit: 'Object-Oriented Programming',
    subtopic: 'Classes & Objects',
    question: 'What is the default access specifier for members of a `class` and a `struct` in C++?',
    options: [
      'Both default to `public`',
      'Both default to `private`',
      '`class` defaults to `private`; `struct` defaults to `public`',
      '`class` defaults to `public`; `struct` defaults to `private`',
    ],
    correctAnswer: 2,
    explanation:
      'The *only* language-level difference between `class` and `struct` is the default access (and default inheritance specifier). `class` → `private`, `struct` → `public`. Beyond that they are interchangeable.',
    wrongExplanations: {
      0: 'Would mean `class` and `struct` are identical. They differ in default access.',
      1: 'Would break C compatibility — C `struct` members are accessed without qualification.',
      3: 'Reversed. C++ inherits C\'s public-by-default `struct` and adds private-by-default `class`.',
    },
    difficulty: 'Basic',
  },
  {
    subject: 'C++ Programming',
    unit: 'Object-Oriented Programming',
    subtopic: 'Classes & Objects',
    question: 'Given `class Foo { public: int x; };`, what is `sizeof(Foo)` likely to be on a 64-bit platform?',
    options: [
      '0 — the class is empty of methods',
      '4 — exactly the size of the `int` member',
      '4 or 8 — implementation-defined due to alignment padding',
      '16 — every class carries a hidden vptr',
    ],
    correctAnswer: 2,
    explanation:
      '`Foo` has one `int` member. On most ABIs it is 4 bytes, but the compiler may add trailing padding to match the alignment of the next member if this is placed in an array. Since `Foo` has no virtual functions, there is no vptr.',
    wrongExplanations: {
      0: 'Only an *empty* class (no non-static data members) has `sizeof` ≥ 1, never 0.',
      1: 'Close, but ignores that the standard permits trailing padding for alignment.',
      3: 'A vptr is only added when the class has at least one virtual function.',
    },
    difficulty: 'Advanced',
  },

  // C++ Programming → Object-Oriented Programming → Inheritance
  {
    subject: 'C++ Programming',
    unit: 'Object-Oriented Programming',
    subtopic: 'Inheritance',
    question:
      'A base class destructor is non-virtual. You `delete` a derived object through a base pointer. What happens?',
    options: [
      'The derived destructor runs first, then the base destructor — correct cleanup',
      'Only the base destructor runs — derived members leak; behavior is undefined',
      'The compiler emits an error at the `delete` site',
      'A runtime exception is thrown',
    ],
    correctAnswer: 1,
    explanation:
      'Without a virtual destructor, deleting a derived object via a base pointer is undefined behavior. In practice only `~Base` runs, so any derived-class resources (heap memory, file handles) leak. Fix: declare `virtual ~Base() = default;` in any class intended for polymorphic deletion.',
    wrongExplanations: {
      0: 'Destructor chaining via the vtable only happens when the destructor is `virtual`.',
      2: 'The compiler cannot prove the static and dynamic types differ; this compiles cleanly.',
      3: 'C++ does not throw on this — it is silent UB, which is worse.',
    },
    difficulty: 'Advanced',
  },

  // C++ Programming → STL → STL Containers
  {
    subject: 'C++ Programming',
    unit: 'STL (Standard Template Library)',
    subtopic: 'STL Containers',
    question: 'You need O(1) average lookup and the ability to iterate keys in sorted order. Which container fits?',
    options: [
      '`std::unordered_map` — already O(1) and iterates in sorted order',
      'Use `std::unordered_map` for lookup *and* `std::set` for sorted iteration in parallel',
      '`std::map` — O(log n) lookup, sorted iteration; closest single-container match',
      '`std::vector<pair<K,V>>` — O(1) lookup if sorted, sorted iteration for free',
    ],
    correctAnswer: 2,
    explanation:
      'The requirements conflict for a single container: `unordered_map` gives O(1) average lookup but unordered iteration; `map` gives O(log n) lookup but sorted iteration. If you must keep a single container, `std::map` is the closest fit. Option B is a valid pattern but uses two structures.',
    wrongExplanations: {
      0: '`unordered_map` iterates in bucket order, which has no relation to key ordering.',
      1: 'Technically works but the question asks for the best single-container match.',
      3: 'Lookup in a sorted vector is O(log n) via `std::lower_bound`, not O(1). Insertions are O(n).',
    },
    difficulty: 'Medium',
  },

  // ─────────────────────────────────────────────────────────────
  // Java Programming → Java Basics → Introduction to Java
  // ─────────────────────────────────────────────────────────────
  {
    subject: 'Java Programming',
    unit: 'Java Basics',
    subtopic: 'Introduction to Java',
    question: 'What does the JVM\'s "write once, run anywhere" promise actually mean?',
    options: [
      'Java source code is interpreted directly by the OS without compilation',
      'Compiled Java bytecode runs on any platform that has a compatible JVM',
      'Java programs are platform-independent because they have no system calls',
      'The JVM rewrites bytecode into x86 machine code at install time',
    ],
    correctAnswer: 1,
    explanation:
      'Java source compiles to platform-neutral *bytecode* (`.class` files). Any JVM that conforms to the JVM specification can execute that bytecode. Native code is generated at runtime by the JIT, not at install time.',
    wrongExplanations: {
      0: 'The JVM, not the OS, executes Java. The OS knows nothing about Java syntax.',
      2: 'Java does make system calls — through JNI and the standard library — but they are abstracted by the JVM.',
      3: 'JIT compilation happens at runtime (per method, after warmup), not at install time.',
    },
    difficulty: 'Basic',
  },
  {
    subject: 'Java Programming',
    unit: 'Java Basics',
    subtopic: 'Introduction to Java',
    question: 'Which of these is NOT true about Java\'s garbage collector?',
    options: [
      'It reclaims memory occupied by objects that are no longer reachable',
      'It runs deterministically — calling `System.gc()` guarantees an immediate collection',
      'It can introduce pause times that matter for latency-sensitive applications',
      'Different collectors (G1, ZGC, Parallel) trade throughput vs latency differently',
    ],
    correctAnswer: 1,
    explanation:
      '`System.gc()` is only a *hint* to the JVM; the runtime may ignore it entirely. GC is non-deterministic, which is why long-running services tune collectors (G1 by default, ZGC/Shenandoah for sub-ms pauses) rather than try to force collections manually.',
    wrongExplanations: {
      0: 'Correct statement about GC; the question asks which is NOT true.',
      2: 'Correct — stop-the-world pauses are a real concern; modern GCs minimize them.',
      3: 'Correct — JVM ships multiple collectors with different trade-offs.',
    },
    difficulty: 'Medium',
  },

  // Java Programming → OOP in Java → Classes & Objects
  {
    subject: 'Java Programming',
    unit: 'OOP in Java',
    subtopic: 'Classes & Objects',
    question: 'In Java, when you assign one object reference to another, what is copied?',
    options: [
      'The entire object is deep-copied to a new memory location',
      'Only the reference (pointer); both variables now point to the same object',
      'Nothing — Java passes-by-value, so the assignment is a no-op',
      'A shallow copy is made automatically by the JVM',
    ],
    correctAnswer: 1,
    explanation:
      'Object references in Java are essentially pointers. Assignment copies the reference value, not the object. Mutating through one variable is visible through the other. Use `clone()`, copy constructors, or libraries (Jackson, MapStruct) for actual copying.',
    wrongExplanations: {
      0: 'Java never deep-copies on assignment. Deep copies require explicit code.',
      2: 'Java *is* pass-by-value, but the value of a reference variable is the reference itself, so assignment still aliases.',
      3: 'No automatic copying happens. `Object.clone()` exists but must be called explicitly.',
    },
    difficulty: 'Medium',
  },

  // Java Programming → Collections Framework → HashMap
  {
    subject: 'Java Programming',
    unit: 'Collections Framework',
    subtopic: 'HashMap',
    question: 'What is the worst-case time complexity of `HashMap.get()` in Java 8+?',
    options: [
      'O(1) — always constant',
      'O(n) — degrades to linked-list scan on hash collisions',
      'O(log n) — buckets convert to red-black trees beyond a threshold',
      'O(n log n) — sorting cost on insert',
    ],
    correctAnswer: 2,
    explanation:
      'Java 8 changed `HashMap` so that when a bucket has ≥ 8 entries (`TREEIFY_THRESHOLD`) and the table has ≥ 64 buckets, the bucket converts from a linked list to a red-black tree. This caps worst-case lookup at O(log n) instead of O(n) under adversarial hash inputs.',
    wrongExplanations: {
      0: 'O(1) is the *average* case under good hashing, not the worst case.',
      1: 'True before Java 8; modernized in JEP-180 to O(log n) via treeification.',
      3: 'Inserts are amortized O(1); no sort is performed.',
    },
    difficulty: 'Advanced',
  },

  // Java Programming → Multithreading → Synchronization
  {
    subject: 'Java Programming',
    unit: 'Multithreading',
    subtopic: 'Synchronization',
    question: 'What is the primary difference between `synchronized` and `java.util.concurrent.locks.ReentrantLock`?',
    options: [
      'They are identical; `ReentrantLock` is just a wrapper around `synchronized`',
      '`ReentrantLock` offers interruptible/timed lock acquisition and fairness policies; `synchronized` does not',
      '`synchronized` is faster in all cases and should always be preferred',
      '`ReentrantLock` cannot be reentered by the holding thread, unlike `synchronized`',
    ],
    correctAnswer: 1,
    explanation:
      '`ReentrantLock` adds capabilities `synchronized` lacks: `tryLock(timeout)`, `lockInterruptibly()`, fairness mode (FIFO), and condition variables (`newCondition()`). Trade-off: must `unlock()` manually in a `finally` block, whereas `synchronized` auto-releases on scope exit.',
    wrongExplanations: {
      0: '`ReentrantLock` is a separate implementation using AQS, not a wrapper.',
      2: 'Modern JVMs optimize both heavily; performance is comparable. Use the API that fits the need.',
      3: 'Both are reentrant by design — the same thread can re-acquire without deadlocking.',
    },
    difficulty: 'Advanced',
  },

  // ─────────────────────────────────────────────────────────────
  // Python Programming
  // ─────────────────────────────────────────────────────────────
  {
    subject: 'Python Programming',
    unit: 'Python Basics',
    subtopic: 'Introduction to Python',
    question: 'What is the Global Interpreter Lock (GIL) and what is its main effect?',
    options: [
      'A lock that protects every Python object; you must acquire it manually',
      'A lock CPython holds while executing bytecode, preventing two threads from running Python code simultaneously',
      'A lock used only during garbage collection; threading is otherwise unaffected',
      'A deprecated feature removed in Python 3.0',
    ],
    correctAnswer: 1,
    explanation:
      'The GIL serializes execution of Python bytecode in CPython. CPU-bound multithreading does not scale across cores — use `multiprocessing` or release the GIL via C extensions (NumPy, async I/O). PEP 703 (free-threaded Python) is making the GIL optional in 3.13+.',
    wrongExplanations: {
      0: 'The GIL is held automatically by CPython; user code never interacts with it directly.',
      2: 'The GIL is held continuously during bytecode execution, not only during GC.',
      3: 'The GIL still exists in Python 3.x. Optional removal is in progress (PEP 703).',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'Python Programming',
    unit: 'Python Basics',
    subtopic: 'Python Syntax',
    question: 'What does the `if __name__ == "__main__":` idiom accomplish?',
    options: [
      'It is required for any Python script to run',
      'It makes the indented block run only when the file is executed directly, not when imported',
      'It declares the file as the "main" module for the interpreter',
      'It is a leftover from Python 2 and has no effect in Python 3',
    ],
    correctAnswer: 1,
    explanation:
      'When a file is imported, `__name__` is set to the module name. When it is run directly (`python foo.py`), `__name__` is `"__main__"`. The idiom separates reusable definitions from script-only side effects (CLI handling, test runs).',
    wrongExplanations: {
      0: 'Many Python scripts have no `if __name__` guard and run fine.',
      2: 'It is a runtime check, not a declaration. The interpreter sets `__name__` before any code runs.',
      3: 'Fully supported in Python 3 and idiomatic.',
    },
    difficulty: 'Basic',
  },
  {
    subject: 'Python Programming',
    unit: 'Data Structures',
    subtopic: 'Lists',
    question: 'What is the time complexity of `list.append(x)` vs `list.insert(0, x)` in CPython?',
    options: [
      'Both are O(1)',
      '`append` is O(1) amortized; `insert(0, x)` is O(n) because elements shift',
      'Both are O(n) since lists are linked lists internally',
      '`append` is O(log n); `insert(0, x)` is O(1)',
    ],
    correctAnswer: 1,
    explanation:
      'CPython lists are dynamic arrays. `append` is amortized O(1) (occasional resize doubles capacity). `insert(0, x)` shifts every existing element right by one slot — O(n). Use `collections.deque` if you need O(1) prepends.',
    wrongExplanations: {
      0: 'Insertion at the front requires shifting all elements.',
      2: 'Python `list` is a dynamic array, not a linked list. `LinkedList` would be `collections.deque`.',
      3: 'No `O(log n)` operation exists on a flat list.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'Python Programming',
    unit: 'Data Structures',
    subtopic: 'Dictionaries',
    question: 'Since which Python version does `dict` guarantee insertion order during iteration?',
    options: [
      'Python 2.7 — `OrderedDict` has been the default',
      'Python 3.7 — insertion order is an official language guarantee (3.6 in CPython as an implementation detail)',
      'Python 3.10 — added when `match` was introduced',
      'Never — `dict` order is always unspecified',
    ],
    correctAnswer: 1,
    explanation:
      'CPython 3.6 made `dict` preserve insertion order as an implementation detail. Python 3.7 elevated it to a language guarantee across all conformant implementations. `OrderedDict` is now mostly redundant except for its `move_to_end` API.',
    wrongExplanations: {
      0: 'Python 2 `dict` was unordered. `OrderedDict` existed but was a separate type.',
      2: 'The guarantee predates 3.10 by three releases.',
      3: 'It is guaranteed since 3.7.',
    },
    difficulty: 'Advanced',
  },
  {
    subject: 'Python Programming',
    unit: 'OOP in Python',
    subtopic: 'Classes',
    question: 'What is the difference between a `@classmethod` and a `@staticmethod`?',
    options: [
      'They are aliases for the same decorator',
      '`@classmethod` receives the class as its first argument (`cls`); `@staticmethod` receives no implicit argument',
      '`@staticmethod` cannot be called on an instance; `@classmethod` can',
      '`@classmethod` is faster because it skips method resolution',
    ],
    correctAnswer: 1,
    explanation:
      '`@classmethod` is bound to the class and gets `cls` as the first parameter — useful for alternative constructors (`@classmethod def from_dict(cls, d): return cls(...)`). `@staticmethod` is just a function namespaced under the class; it gets no implicit argument and cannot reference the class without naming it.',
    wrongExplanations: {
      0: 'They are distinct decorators with different binding behavior.',
      2: 'Both can be called on instance or class.',
      3: 'No measurable speed difference — both go through standard attribute lookup.',
    },
    difficulty: 'Medium',
  },

  // ─────────────────────────────────────────────────────────────
  // Data Structures & Algorithms
  // ─────────────────────────────────────────────────────────────
  {
    subject: 'Data Structures & Algorithms',
    unit: 'Arrays',
    subtopic: 'Introduction to Arrays',
    question: 'Why is accessing `arr[i]` in a contiguous array O(1), regardless of `i`?',
    options: [
      'The CPU caches every array element on creation',
      'The address is computed as `base + i * sizeof(element)` — a single arithmetic operation',
      'The OS maintains a hash table from index to address',
      'Modern arrays use binary search internally, which is amortized O(1)',
    ],
    correctAnswer: 1,
    explanation:
      'Random access by index is a single multiply-and-add: `base_address + i * stride`. It takes the same time whether `i` is 0 or 10⁶, which is the defining property of arrays. Cache behavior makes sequential access fast in practice, but the algorithmic complexity is set by the address calculation.',
    wrongExplanations: {
      0: 'CPU caches store recently used memory, not the entire array at creation.',
      2: 'No hash table is involved; that would be a `HashMap`, not an array.',
      3: 'Binary search is O(log n) and only applies to sorted data.',
    },
    difficulty: 'Basic',
  },
  {
    subject: 'Data Structures & Algorithms',
    unit: 'Arrays',
    subtopic: 'Searching in Arrays',
    question:
      'You have a sorted array of 1,000,000 integers. What is the maximum number of comparisons binary search performs to find an element?',
    options: ['1,000,000', '500,000', 'About 20', 'About 1,000'],
    correctAnswer: 2,
    explanation:
      'Binary search halves the search space each step, so worst case is ⌈log₂(n)⌉. log₂(1,000,000) ≈ 19.93, so 20 comparisons. This is why binary search is preferred over linear search for any non-trivial sorted dataset.',
    wrongExplanations: {
      0: 'That would be a linear scan — the *worst* case for linear search, not binary.',
      1: 'Halving once gives 500,000, but binary search halves repeatedly.',
      3: '√n ≈ 1000 would be a jump-search complexity, not binary search.',
    },
    difficulty: 'Basic',
  },
  {
    subject: 'Data Structures & Algorithms',
    unit: 'Arrays',
    subtopic: 'Sorting Arrays',
    question: 'Which sort is best for a *nearly sorted* array of small size (e.g. 50 elements)?',
    options: [
      'Quick sort — O(n log n) average always wins',
      'Insertion sort — O(n) on nearly-sorted input, low constant factor for small n',
      'Merge sort — guaranteed O(n log n)',
      'Bubble sort — simplest implementation',
    ],
    correctAnswer: 1,
    explanation:
      'Insertion sort is O(n) when the array is already nearly sorted because each element travels a short distance. Combined with its low constant factor, it beats O(n log n) sorts for small or nearly-sorted inputs. Real-world hybrid sorts (Timsort, Introsort) switch to insertion sort below a threshold (~16-32 elements).',
    wrongExplanations: {
      0: 'Quick sort has high constant factor and can degrade to O(n²) on already-sorted input without good pivot choice.',
      2: 'Merge sort allocates O(n) extra space; overkill for tiny inputs.',
      3: 'Bubble sort is the worst of the choices — O(n²) average, no practical benefit.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'Data Structures & Algorithms',
    unit: 'Linked Lists',
    subtopic: 'Introduction to Linked Lists',
    question: 'Compared to an array, what is the linked list\'s defining advantage?',
    options: [
      'O(1) random access by index',
      'O(1) insertion and removal at a known position, without shifting elements',
      'Better CPU cache behavior',
      'Lower memory footprint per element',
    ],
    correctAnswer: 1,
    explanation:
      'Inserting or removing a node when you already hold a pointer to its neighbor is O(1) — you just rewire `.next` pointers. Arrays require shifting. The cost: linked lists lose O(1) random access (now O(n)) and have worse cache locality due to pointer-chasing.',
    wrongExplanations: {
      0: 'Random access in a linked list is O(n); you must walk from the head.',
      2: 'Nodes are scattered in memory, which is *worse* for cache than contiguous arrays.',
      3: 'Each node carries pointer overhead (8 bytes for a singly linked list on 64-bit), making linked lists *larger* than arrays.',
    },
    difficulty: 'Basic',
  },
  {
    subject: 'Data Structures & Algorithms',
    unit: 'Linked Lists',
    subtopic: 'Introduction to Linked Lists',
    question:
      'You are given the *head* of a singly linked list and need to delete a node `n` (not the tail) in O(1) — without access to `n`\'s predecessor. How?',
    options: [
      'Impossible — deletion requires the predecessor pointer',
      'Copy `n.next.value` into `n.value`, then set `n.next = n.next.next` (effectively deleting `n.next`)',
      'Walk from head to find `n`\'s predecessor, then unlink — still O(n)',
      'Swap `n` and `head`, then delete `head`',
    ],
    correctAnswer: 1,
    explanation:
      'Classic trick: instead of removing `n`, *overwrite* `n` with its successor\'s data and unlink the successor. End result: the value at position `n` is gone in O(1). Caveat: cannot remove the tail this way, and external references to the next node become dangling.',
    wrongExplanations: {
      0: 'It seems impossible only if you insist on physically unlinking `n`.',
      2: 'That works but is O(n), not the O(1) the question requires.',
      3: 'Swap-and-delete would change the head; the rest of the list still references the old head node.',
    },
    difficulty: 'Advanced',
  },
  {
    subject: 'Data Structures & Algorithms',
    unit: 'Stacks & Queues',
    subtopic: 'Stacks',
    question: 'Which real-world feature is most directly powered by a stack data structure?',
    options: [
      'A printer\'s job queue',
      'A web browser\'s back/forward navigation history',
      'A database connection pool',
      'A network packet router',
    ],
    correctAnswer: 1,
    explanation:
      'Back/forward navigation is LIFO — the most recently visited page is the one you return to first. Function call stacks, expression evaluation, and undo/redo all share this pattern. Print queues and connection pools are FIFO (queues).',
    wrongExplanations: {
      0: 'Print jobs are processed in arrival order — FIFO queue.',
      2: 'Connection pools typically use FIFO or LIFO depending on implementation; not the most direct example.',
      3: 'Routers use queues at each port, not stacks.',
    },
    difficulty: 'Basic',
  },
  {
    subject: 'Data Structures & Algorithms',
    unit: 'Trees',
    subtopic: 'Binary Trees',
    question: 'What is the difference between a Binary Tree and a Binary Search Tree (BST)?',
    options: [
      'They are synonyms — both have at most two children per node',
      'A BST imposes an ordering invariant: for every node, all left-subtree values < node < all right-subtree values',
      'A BST allows duplicates; a Binary Tree does not',
      'A BST is always balanced; a Binary Tree may not be',
    ],
    correctAnswer: 1,
    explanation:
      'A Binary Tree only constrains the *shape* (≤ 2 children). A BST adds the *ordering* invariant that enables O(log n) search on a balanced tree. Common BST variants (AVL, red-black) additionally maintain balance to guarantee O(log n) even under worst-case insert order.',
    wrongExplanations: {
      0: 'A BST is a binary tree, but with an extra invariant.',
      2: 'Duplicate handling is implementation-specific for both types.',
      3: 'A plain BST is not necessarily balanced — that requires AVL/red-black/etc.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'Data Structures & Algorithms',
    unit: 'Hashing',
    subtopic: 'Hash Tables',
    question: 'A hash table starts with 16 buckets and a load factor threshold of 0.75. What happens at the 13th insert?',
    options: [
      'The table rejects the insert until you call `clear()`',
      'The table doubles its bucket count and rehashes every existing entry',
      'The 13th element overwrites the oldest entry (LRU eviction)',
      'Nothing — load factor only affects performance, never triggers resize',
    ],
    correctAnswer: 1,
    explanation:
      '12 / 16 = 0.75 — adding the 13th entry crosses the threshold, triggering a resize. The bucket array is doubled (typical) and every existing key is re-hashed into the new table. This makes individual inserts amortized O(1), with occasional O(n) resize events.',
    wrongExplanations: {
      0: 'Standard hash tables never reject inserts due to load factor.',
      2: 'Hash tables are not LRU caches; eviction is not part of their contract.',
      3: 'Load factor *does* trigger resize in most implementations (Java HashMap, Python dict, C++ unordered_map).',
    },
    difficulty: 'Advanced',
  },
  {
    subject: 'Data Structures & Algorithms',
    unit: 'Graphs',
    subtopic: 'Graph Traversal',
    question: 'You need to find the *shortest path* (fewest edges) in an unweighted graph. Best algorithm?',
    options: [
      'Depth-First Search (DFS)',
      'Breadth-First Search (BFS)',
      'Dijkstra\'s algorithm',
      'Floyd-Warshall',
    ],
    correctAnswer: 1,
    explanation:
      'BFS explores layer by layer; the first time it reaches a node, it has done so in the minimum number of edges. Dijkstra works but degenerates to BFS on unweighted graphs (with O(V+E log V) overhead). DFS does not guarantee shortest paths.',
    wrongExplanations: {
      0: 'DFS goes deep first and may find a long path before a short one.',
      2: 'Correct in general but uses a priority queue you do not need for unit weights.',
      3: 'Floyd-Warshall is all-pairs O(V³) — overkill for a single source.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'Data Structures & Algorithms',
    unit: 'Dynamic Programming',
    subtopic: 'Introduction to DP',
    question: 'What is the difference between memoization and tabulation in DP?',
    options: [
      'They are different names for the same technique',
      'Memoization is top-down with recursion + cache; tabulation is bottom-up iterative',
      'Memoization is faster; tabulation is for academic interest only',
      'Tabulation uses less memory because it does not store any results',
    ],
    correctAnswer: 1,
    explanation:
      'Memoization wraps a recursive function with a cache: results are computed on demand. Tabulation builds a table iteratively from base cases up. Both have the same asymptotic complexity. Tabulation usually has lower constant factors (no recursion overhead) but memoization can skip unreachable states.',
    wrongExplanations: {
      0: 'Both achieve DP but via opposite control flows.',
      2: 'Tabulation is the dominant pattern in competitive programming for its speed and stack-safety.',
      3: 'Tabulation *does* store results — that is its defining feature.',
    },
    difficulty: 'Medium',
  },

  // ─────────────────────────────────────────────────────────────
  // Frontend Technologies → JavaScript / React
  // ─────────────────────────────────────────────────────────────
  {
    subject: 'Frontend Technologies',
    unit: 'JavaScript',
    subtopic: 'Variables & Scope',
    question: 'What is the key difference between `let` and `var` in JavaScript?',
    options: [
      'They are interchangeable; `let` is just the modern syntax',
      '`let` is block-scoped and not hoisted; `var` is function-scoped and hoisted (with `undefined` initialization)',
      '`var` is faster than `let` because it skips the temporal dead zone',
      '`let` cannot be reassigned; `var` can',
    ],
    correctAnswer: 1,
    explanation:
      '`var` declarations are hoisted to the top of their *function* scope and initialized to `undefined`. `let` is hoisted to its *block* scope but lives in the temporal dead zone until execution reaches the declaration — accessing it earlier throws `ReferenceError`. This makes `let` safer and is why it is preferred in modern code.',
    wrongExplanations: {
      0: 'Scoping rules and TDZ behavior are meaningfully different.',
      2: 'Engines optimize both identically in steady state; TDZ overhead is negligible.',
      3: 'Both `let` and `var` are reassignable. `const` is the one that is not.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'Frontend Technologies',
    unit: 'JavaScript',
    subtopic: 'Event Loop',
    question: 'What is logged?\n\n```\nconsole.log("1");\nsetTimeout(() => console.log("2"), 0);\nPromise.resolve().then(() => console.log("3"));\nconsole.log("4");\n```',
    options: ['1 2 3 4', '1 4 2 3', '1 4 3 2', '1 3 4 2'],
    correctAnswer: 2,
    explanation:
      'Synchronous code runs first: `1`, `4`. Then the microtask queue drains before any macrotask, so the Promise callback (`3`) runs before the `setTimeout` (`2`). Microtasks always have priority over macrotasks at each tick of the event loop.',
    wrongExplanations: {
      0: 'Synchronous statements after `setTimeout` and `Promise` still run first.',
      1: 'Treats microtasks and macrotasks as the same queue — they are not.',
      3: 'Mixes up sync/async ordering. `4` comes from the sync log statement, not after the promise.',
    },
    difficulty: 'Advanced',
  },
  {
    subject: 'Frontend Technologies',
    unit: 'JavaScript',
    subtopic: 'Closures',
    question: 'What is a closure in JavaScript?',
    options: [
      'A function that has finished executing and been removed from memory',
      'A function bundled together with references to the variables in its lexical scope',
      'An immediately invoked function expression (IIFE)',
      'A method that runs when an object is destroyed',
    ],
    correctAnswer: 1,
    explanation:
      'A closure is the combination of a function and the lexical environment in which it was declared. The function "closes over" its outer variables, keeping them alive even after the outer function returns. This powers data privacy, currying, and React hook state.',
    wrongExplanations: {
      0: 'The opposite — a closure *retains* its scope.',
      2: 'An IIFE is a *use case* for closures, not a synonym.',
      3: 'JavaScript has no destructors; that\'s not a closure.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'Frontend Technologies',
    unit: 'React',
    subtopic: 'Hooks',
    question: 'Why must hooks (`useState`, `useEffect`, etc.) be called at the top level of a component, never inside loops or conditions?',
    options: [
      'It is a style preference enforced by ESLint, but the code works either way',
      'React identifies hooks by *call order*, not by name. Conditional calls break the index-to-hook mapping across renders',
      'Conditional hooks trigger a full re-render of the parent tree',
      'It is a security restriction to prevent prototype pollution',
    ],
    correctAnswer: 1,
    explanation:
      'React stores hook state in an array indexed by call order. If you call `useState` inside an `if`, the index for `useEffect` shifts between renders, and React reads/writes the wrong slot. The rule guarantees a stable mapping. Use the official ESLint plugin (`eslint-plugin-react-hooks`) to enforce it.',
    wrongExplanations: {
      0: 'It is a real runtime constraint, not just lint sugar.',
      2: 'No special re-render is triggered; the data simply gets misaligned.',
      3: 'Unrelated — prototype pollution is a different vulnerability class.',
    },
    difficulty: 'Advanced',
  },
  {
    subject: 'Frontend Technologies',
    unit: 'React',
    subtopic: 'Rendering',
    question: 'A parent re-renders. What determines whether a child component re-renders too?',
    options: [
      'Always — every child re-renders when the parent does',
      'Only if the child\'s props changed by reference',
      'By default, every child re-renders. `React.memo` (or class `PureComponent`) opts in to skipping re-renders when props are shallowly equal',
      'Only when the child uses `useState`',
    ],
    correctAnswer: 2,
    explanation:
      'React\'s default is to re-render the entire subtree on any state change above it. `React.memo(Component)` performs a shallow prop comparison and skips re-render if nothing changed. Watch out for inline objects/functions — new references break memoization. Pair with `useMemo`/`useCallback`.',
    wrongExplanations: {
      0: 'True without `memo` — but `memo` is the override mechanism.',
      1: 'That would be `memo`\'s behavior, not the default.',
      3: '`useState` is irrelevant to whether a parent re-render propagates.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'Frontend Technologies',
    unit: 'React',
    subtopic: 'State Management',
    question: 'When should you reach for Redux/Zustand instead of `useState` + Context?',
    options: [
      'Always — Context is too slow for production apps',
      'When you have many components reading or updating the same state and Context\'s "all consumers re-render" behavior becomes a perf or DX problem',
      'Only when using Redux DevTools',
      'When working with TypeScript, since `useState` lacks types',
    ],
    correctAnswer: 1,
    explanation:
      'Context broadcasts every value change to every consumer — fine for low-frequency app-level state (theme, auth) but painful for many independent slices. State libraries (Zustand, Redux, Jotai) let you subscribe to specific slices, dedupe, and middleware-trace updates. Use the simplest tool that solves the actual problem.',
    wrongExplanations: {
      0: 'Context is fine for low-update-frequency global state.',
      2: 'DevTools are nice but not the reason to adopt a library.',
      3: '`useState` is fully type-safe via TypeScript generics.',
    },
    difficulty: 'Medium',
  },

  // Frontend → CSS / Layout
  {
    subject: 'Frontend Technologies',
    unit: 'CSS',
    subtopic: 'Box Model',
    question: 'What does `box-sizing: border-box` change?',
    options: [
      'It removes all padding and margin from the element',
      'It makes `width`/`height` include padding and border, instead of being the content-box',
      'It enables flexbox layout',
      'It forces the element to be a positioned block',
    ],
    correctAnswer: 1,
    explanation:
      'By default `width` defines the *content* box; padding and border are added outside. With `border-box`, `width` defines the *outer* edge including padding and border. This makes layout math (and CSS grids) much more predictable, which is why modern resets set `* { box-sizing: border-box; }`.',
    wrongExplanations: {
      0: 'It does not remove padding; it just changes how `width` is calculated.',
      2: 'Flexbox is enabled via `display: flex`, not `box-sizing`.',
      3: 'Unrelated to positioning.',
    },
    difficulty: 'Basic',
  },
  {
    subject: 'Frontend Technologies',
    unit: 'CSS',
    subtopic: 'Flexbox',
    question:
      'You have `display: flex; gap: 16px` on a container and three children with `flex: 1`. What sizes does each child take in a 700px-wide container?',
    options: [
      'Exactly 233.33px each — 700 / 3',
      'About 222.67px each — (700 - 2 × 16) / 3',
      '300px, 200px, 200px — first child wider',
      'Whatever their content needs',
    ],
    correctAnswer: 1,
    explanation:
      '`gap` removes 32px (16 × 2 between 3 items) from the distributable space. The remaining 668px is split equally because `flex: 1` means equal `flex-grow` with `flex-basis: 0`. (668 / 3 ≈ 222.67px).',
    wrongExplanations: {
      0: 'Ignores the `gap` taking space.',
      2: 'All children share equal `flex: 1`, so they get equal share.',
      3: '`flex-basis: 0` overrides intrinsic content size when grow is set.',
    },
    difficulty: 'Advanced',
  },

  // ─────────────────────────────────────────────────────────────
  // Backend Technologies → Node.js / DBMS / System Design
  // ─────────────────────────────────────────────────────────────
  {
    subject: 'Backend Technologies',
    unit: 'Node.js',
    subtopic: 'Event Loop',
    question: 'Why does a long-running synchronous loop in Node.js block *all* incoming HTTP requests?',
    options: [
      'Node.js has only one OS thread for I/O',
      'Node.js executes JavaScript on a single thread; a sync loop occupies the event loop and prevents any callbacks (including HTTP) from running',
      'V8 sleeps the event loop after each request',
      'Node.js uses cooperative multitasking; the loop must yield manually',
    ],
    correctAnswer: 1,
    explanation:
      'Node\'s JavaScript runs on one thread driven by libuv\'s event loop. While JS executes, no other JS callback (HTTP handler, timer, promise resolution) can run. CPU-bound work must be offloaded to worker threads, child processes, or moved to a queue worker.',
    wrongExplanations: {
      0: 'I/O actually uses a thread pool. The bottleneck is JS execution.',
      2: 'The event loop never sleeps between requests in steady state.',
      3: 'It is *preemptive at the OS level* but uses a single JS thread; the loop only "yields" between completed tasks.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'Backend Technologies',
    unit: 'Databases',
    subtopic: 'DBMS Fundamentals',
    question: 'What does ACID stand for, and why does it matter for transactions?',
    options: [
      'Atomicity, Consistency, Isolation, Durability — the guarantees a relational transaction provides',
      'Asynchronous, Consistent, Indexed, Distributed — the design of NoSQL stores',
      'Acknowledged, Committed, Idempotent, Done — the steps of two-phase commit',
      'Always Connected Internet Database — a marketing term',
    ],
    correctAnswer: 0,
    explanation:
      'ACID means: **A**tomicity (all-or-nothing), **C**onsistency (constraints upheld), **I**solation (concurrent transactions appear sequential), **D**urability (committed writes survive crashes). These give application code strong reasoning power. NoSQL stores often trade some of these (typically isolation) for scalability.',
    wrongExplanations: {
      1: 'This is the BASE acronym\'s philosophy, not ACID.',
      2: 'Not the standard ACID expansion.',
      3: 'Not an acronym in the database literature.',
    },
    difficulty: 'Basic',
  },
  {
    subject: 'Backend Technologies',
    unit: 'Databases',
    subtopic: 'Indexes',
    question: 'You add an index on `(country, city)` to a 10M-row `users` table. Which queries benefit?',
    options: [
      'Any query that filters or sorts by `country` and/or by `country, city`',
      'Any query touching `city`, regardless of whether `country` is in the WHERE clause',
      'All queries on the `users` table',
      'Only queries that select all three columns',
    ],
    correctAnswer: 0,
    explanation:
      'A composite B-tree index supports prefix lookups: queries filtering by `country` alone, or by `(country, city)` together, use the index. Filtering by `city` alone cannot use this index — the storage is sorted by `country` first. Switch column order, or add a separate index on `city`, if that query matters.',
    wrongExplanations: {
      1: 'A leading-column index can only be used left-to-right.',
      2: 'Indexes accelerate matching predicates only; unrelated queries get no benefit.',
      3: 'Index selection depends on WHERE/ORDER BY columns, not on SELECT columns (except for covering indexes).',
    },
    difficulty: 'Advanced',
  },
  {
    subject: 'Backend Technologies',
    unit: 'Databases',
    subtopic: 'Normalization',
    question:
      'You denormalize a heavily-read schema to avoid expensive joins. What is the primary risk you accept?',
    options: [
      'Slower read queries',
      'Update anomalies — the same fact lives in multiple rows and can drift out of sync',
      'Loss of foreign key support',
      'The database can no longer use indexes',
    ],
    correctAnswer: 1,
    explanation:
      'Denormalization stores derived or redundant data to skip joins. If the source of truth changes, every copy must be updated atomically (often via triggers, application code, or scheduled reconciliation). Forgetting one path causes drift. Worth it for read-heavy systems, but the cost must be deliberate.',
    wrongExplanations: {
      0: 'Reads usually get *faster*, which is why denormalization is done in the first place.',
      2: 'Foreign keys still work on denormalized tables.',
      3: 'Indexes are unaffected by normalization level.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'Backend Technologies',
    unit: 'API Design',
    subtopic: 'REST Principles',
    question: 'Which HTTP method is *not* idempotent by the REST contract?',
    options: ['GET', 'PUT', 'DELETE', 'POST'],
    correctAnswer: 3,
    explanation:
      'Idempotent = calling N times has the same effect as calling once. `GET`/`PUT`/`DELETE` are idempotent by contract. `POST` typically creates a new resource on every call, so two POSTs produce two records. Clients can retry GET/PUT/DELETE safely; POST retries need explicit idempotency keys.',
    wrongExplanations: {
      0: 'GET is safe *and* idempotent — no side effects.',
      1: 'PUT replaces a resource; replacing twice with the same body is the same as once.',
      2: 'DELETE removes the resource; deleting twice yields the same state.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'System Design',
    unit: 'Scalability',
    subtopic: 'Caching',
    question:
      'You add a Redis cache in front of a slow database. After deploy, a small fraction of users still see stale data. What is the most likely cause?',
    options: [
      'Redis is corrupted and must be reinstalled',
      'Cache invalidation is incorrect — writes update the DB but not the cache, leaving stale entries',
      'TCP keepalive is misconfigured between Redis and the app',
      'Redis is single-threaded and cannot serve traffic at scale',
    ],
    correctAnswer: 1,
    explanation:
      '"There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton. A read-through cache gets stale when writes only update the DB without invalidating the corresponding cache key. Patterns to fix: write-through, write-behind, TTLs, or explicit invalidation on every mutation path.',
    wrongExplanations: {
      0: 'Corruption would affect *all* reads, not just a fraction.',
      2: 'Keepalive issues cause connection errors, not stale data.',
      3: 'Redis is single-threaded but handles 100k+ ops/sec on commodity hardware — capacity is rarely the issue.',
    },
    difficulty: 'Medium',
  },
  {
    subject: 'System Design',
    unit: 'Scalability',
    subtopic: 'Load Balancing',
    question: 'Which load-balancing strategy best preserves session state for users hitting a stateful backend?',
    options: [
      'Round-robin',
      'Least connections',
      'Sticky sessions (consistent hashing on user ID or IP)',
      'Random',
    ],
    correctAnswer: 2,
    explanation:
      'Sticky sessions route a user to the same backend repeatedly, keeping in-memory state (cart, session) consistent. Round-robin and random distribute evenly but break in-memory state. Better long-term: move state out of the app (Redis, DB) so any backend can serve any user.',
    wrongExplanations: {
      0: 'Round-robin will rotate users across backends, losing session state.',
      1: '"Least connections" optimizes load, not affinity.',
      3: 'Same problem as round-robin.',
    },
    difficulty: 'Advanced',
  },
]

const CONCEPTUAL_PRACTICE_SUBJECT_IDS = ['os', 'cn'] as const
const MCQ_DIFFICULTIES: Difficulty[] = ['Basic', 'Medium', 'Advanced']

function mcqKey(mcq: Pick<MCQData, 'subject' | 'unit' | 'subtopic' | 'difficulty'>): string {
  return `${mcq.subject}|||${mcq.unit}|||${mcq.subtopic}|||${mcq.difficulty}`
}

function generatedConceptualMCQ(subject: string, unit: string, subtopic: string, difficulty: Difficulty): MCQData {
  if (difficulty === 'Basic') {
    return {
      subject,
      unit,
      subtopic,
      difficulty,
      question: `In ${subject}, what is the main purpose of ${subtopic}?`,
      options: [
        `It explains a core responsibility or behavior inside ${unit}.`,
        'It is only a visual styling rule used in frontend pages.',
        `It is unrelated to ${subject} and is usually ignored.`,
        'It is a shortcut that removes the need to understand the rest of the unit.',
      ],
      correctAnswer: 0,
      explanation: `${subtopic} is part of ${unit}; at the basic level, the goal is to understand the responsibility it has in ${subject}.`,
      wrongExplanations: {
        1: `${subtopic} is a ${subject} concept, not a frontend styling rule.`,
        2: `The learning journey includes ${subtopic} because it is relevant to ${unit}.`,
        3: 'Individual concepts build on each other; none replaces the rest of the unit.',
      },
    }
  }

  if (difficulty === 'Medium') {
    return {
      subject,
      unit,
      subtopic,
      difficulty,
      question: `When applying ${subtopic} in ${unit}, what should you reason about first?`,
      options: [
        'The inputs, responsibilities, constraints, and the state changes involved.',
        'Only the definition, without considering any scenario or tradeoff.',
        'A random implementation detail from another subject.',
        'The final answer only; intermediate reasoning does not matter.',
      ],
      correctAnswer: 0,
      explanation: `Medium-level practice should connect ${subtopic} to practical behavior: what enters the system, what changes, what constraints apply, and what output or effect is expected.`,
      wrongExplanations: {
        1: 'Definitions help, but practical questions require applying the concept to a scenario.',
        2: `The scenario should stay anchored to ${subject} and ${unit}.`,
        3: 'Interviewers and real debugging both depend on the reasoning path, not just the final answer.',
      },
    }
  }

  return {
    subject,
    unit,
    subtopic,
    difficulty,
    question: `An interviewer asks you to analyze a failure involving ${subtopic}. What makes the answer strong?`,
    options: [
      'Explain the tradeoffs, edge cases, and how the concept interacts with neighboring parts of the system.',
      'Give a memorized one-line definition and stop.',
      'Ignore failure modes because advanced questions only test syntax.',
      'Switch to a different topic that is easier to explain.',
    ],
    correctAnswer: 0,
    explanation: `Advanced ${subject} questions test whether you can reason about ${subtopic} under constraints, failures, and interactions with the rest of ${unit}.`,
    wrongExplanations: {
      1: 'A definition is not enough for an advanced scenario.',
      2: `${subject} concepts are often tested through behavior and failure cases, not syntax alone.`,
      3: 'A strong answer stays on the asked topic and handles its hard parts directly.',
    },
  }
}

function buildGeneratedConceptualMCQs(): MCQData[] {
  const covered = new Set(CURATED_MCQ_DATABASE.map(mcqKey))
  const generated: MCQData[] = []

  for (const subjectId of CONCEPTUAL_PRACTICE_SUBJECT_IDS) {
    const subject = SUBJECTS[subjectId]
    for (const unit of subject.units) {
      for (const subtopic of unit.subtopics) {
        for (const difficulty of MCQ_DIFFICULTIES) {
          const candidate = {
            subject: subject.name,
            unit: unit.name,
            subtopic: subtopic.name,
            difficulty,
          }

          if (!covered.has(mcqKey(candidate))) {
            const mcq = generatedConceptualMCQ(subject.name, unit.name, subtopic.name, difficulty)
            covered.add(mcqKey(mcq))
            generated.push(mcq)
          }
        }
      }
    }
  }

  return generated
}

export const MCQ_DATABASE: MCQData[] = [
  ...CURATED_MCQ_DATABASE,
  ...buildGeneratedConceptualMCQs(),
]

// ─────────────────────────────────────────────────────────────────────
// Lookup helpers
// ─────────────────────────────────────────────────────────────────────

/**
 * Find all MCQs for a given subject/unit/subtopic. Returns an empty array if
 * none exist — the caller (route or component) decides how to handle that
 * (fall back to AI generation, show a "coming soon" state, etc.).
 *
 * NOTE: the old `generateMCQsForSubtopic` template fallback was removed —
 * synthetic interpolated MCQs were low-signal and made testing harder.
 */
export function getMCQsForSubtopic(
  subject: string,
  unit: string,
  subtopic: string
): MCQData[] {
  return MCQ_DATABASE.filter(
    (mcq) =>
      mcq.subject === subject && mcq.unit === unit && mcq.subtopic === subtopic
  )
}

/** Convenience: all MCQs for a (subject, unit), across subtopics. */
export function getMCQsForUnit(subject: string, unit: string): MCQData[] {
  return MCQ_DATABASE.filter(
    (mcq) => mcq.subject === subject && mcq.unit === unit
  )
}
