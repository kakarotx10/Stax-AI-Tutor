/**
 * SQL Question Database — Stax AI Tutor
 *
 * Hand-authored SQL challenges with realistic schemas and seed data.
 * Each question ships with:
 *  - Production-shaped schema (proper FK relationships, indexes implied)
 *  - 5-10 row seed dataset (large enough to exercise edge cases)
 *  - `expectedQuery` — a reference solution used by the validator
 *  - Progressive hints (concept → operator → final approach)
 */

export interface SQLQuestion {
  id: string
  title: string
  description: string
  difficulty: 'Basic' | 'Medium' | 'Advanced'
  schema: string
  seedData: string
  expectedQuery?: string
  hints: string[]
}

export interface SQLSchema {
  questionId: string
  schema: string
  seedData: string
}

// ─────────────────────────────────────────────────────────────────────
// Common reusable schemas
// ─────────────────────────────────────────────────────────────────────

const EMPLOYEES_SCHEMA = `
  CREATE TABLE departments (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    location    TEXT NOT NULL
  );
  CREATE TABLE employees (
    id            INTEGER PRIMARY KEY,
    name          TEXT NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    salary        INTEGER NOT NULL,
    hire_date     TEXT NOT NULL,
    manager_id    INTEGER REFERENCES employees(id)
  );
`

const EMPLOYEES_SEED = `
  INSERT INTO departments (id, name, location) VALUES
    (1, 'Engineering', 'Bangalore'),
    (2, 'Marketing',   'Mumbai'),
    (3, 'Sales',       'Delhi'),
    (4, 'HR',          'Bangalore');

  INSERT INTO employees (id, name, department_id, salary, hire_date, manager_id) VALUES
    (1, 'Aarav Sharma',   1, 75000, '2020-01-15', NULL),
    (2, 'Priya Patel',    2, 65000, '2019-03-20', NULL),
    (3, 'Rohan Mehta',    1, 80000, '2018-06-10', 1),
    (4, 'Anika Williams', 3, 60000, '2021-02-05', NULL),
    (5, 'Chirag Singh',   1, 95000, '2017-11-30', 1),
    (6, 'Diya Nair',      2, 72000, '2022-08-12', 2),
    (7, 'Karan Joshi',    1, 58000, '2023-04-01', 3),
    (8, 'Meera Iyer',     3, 88000, '2019-09-15', 4);
`

const ECOMMERCE_SCHEMA = `
  CREATE TABLE customers (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    country     TEXT NOT NULL,
    created_at  TEXT NOT NULL
  );
  CREATE TABLE products (
    id          INTEGER PRIMARY KEY,
    title       TEXT NOT NULL,
    category    TEXT NOT NULL,
    price       INTEGER NOT NULL
  );
  CREATE TABLE orders (
    id           INTEGER PRIMARY KEY,
    customer_id  INTEGER REFERENCES customers(id),
    product_id   INTEGER REFERENCES products(id),
    quantity     INTEGER NOT NULL,
    ordered_at   TEXT NOT NULL,
    status       TEXT NOT NULL  -- 'paid' | 'shipped' | 'refunded'
  );
`

const ECOMMERCE_SEED = `
  INSERT INTO customers (id, name, country, created_at) VALUES
    (1, 'Aarav Sharma',  'India',   '2024-01-10'),
    (2, 'Emily Carter',  'USA',     '2024-02-22'),
    (3, 'Hiro Tanaka',   'Japan',   '2024-03-05'),
    (4, 'Sofia Rossi',   'Italy',   '2024-04-18'),
    (5, 'Liam Walsh',    'Ireland', '2024-05-30');

  INSERT INTO products (id, title, category, price) VALUES
    (101, 'Mechanical Keyboard', 'Hardware',     9000),
    (102, 'Noise Cancelling Headphones', 'Audio', 18000),
    (103, '4K Monitor',          'Display',     35000),
    (104, 'USB-C Hub',           'Accessories',  3500),
    (105, 'Standing Desk',       'Furniture',   42000);

  INSERT INTO orders (id, customer_id, product_id, quantity, ordered_at, status) VALUES
    (1001, 1, 101, 1, '2024-06-01', 'shipped'),
    (1002, 1, 104, 2, '2024-06-08', 'shipped'),
    (1003, 2, 102, 1, '2024-06-12', 'refunded'),
    (1004, 2, 103, 1, '2024-06-15', 'shipped'),
    (1005, 3, 101, 3, '2024-06-20', 'paid'),
    (1006, 4, 105, 1, '2024-07-02', 'shipped'),
    (1007, 5, 102, 1, '2024-07-05', 'shipped'),
    (1008, 1, 103, 1, '2024-07-09', 'paid'),
    (1009, 3, 104, 4, '2024-07-12', 'shipped'),
    (1010, 5, 101, 2, '2024-07-15', 'shipped');
`

// ─────────────────────────────────────────────────────────────────────
// Questions
// ─────────────────────────────────────────────────────────────────────

export const SQL_QUESTIONS: Record<string, SQLQuestion> = {
  // ─────────────── BASIC ───────────────
  'dbms-sql-select-basic': {
    id: 'dbms-sql-select-basic',
    title: 'Select All Employees',
    description:
      'Return every row from the `employees` table with all columns. This is the simplest possible read query — useful when you first inspect an unfamiliar table.',
    difficulty: 'Basic',
    schema: EMPLOYEES_SCHEMA,
    seedData: EMPLOYEES_SEED,
    expectedQuery: 'SELECT * FROM employees;',
    hints: [
      '`SELECT *` selects every column. The asterisk is a shorthand.',
      '`FROM <table>` tells the engine where to read from.',
      'Always end SQL statements with a semicolon to be portable across clients.',
    ],
  },

  'dbms-sql-select-where-basic': {
    id: 'dbms-sql-select-where-basic',
    title: 'Filter Engineering Department',
    description:
      'Return the `name` and `salary` of every employee whose `department_id` is 1 (Engineering). Order the result so the highest earner appears first.',
    difficulty: 'Basic',
    schema: EMPLOYEES_SCHEMA,
    seedData: EMPLOYEES_SEED,
    expectedQuery:
      'SELECT name, salary FROM employees WHERE department_id = 1 ORDER BY salary DESC;',
    hints: [
      'Use `WHERE` to filter rows before projection.',
      'Select only the columns the question asks for — avoid `SELECT *` in production code.',
      '`ORDER BY salary DESC` sorts numerically, largest first.',
    ],
  },

  // ─────────────── MEDIUM ───────────────
  'dbms-sql-select-orderby-medium': {
    id: 'dbms-sql-select-orderby-medium',
    title: 'Top 3 Highest-Paid Employees',
    description:
      'Return the `name`, `salary`, and `department_id` of the three highest-paid employees, sorted by salary descending. Tie-break by `name` ascending to keep results deterministic.',
    difficulty: 'Medium',
    schema: EMPLOYEES_SCHEMA,
    seedData: EMPLOYEES_SEED,
    expectedQuery:
      'SELECT name, salary, department_id FROM employees ORDER BY salary DESC, name ASC LIMIT 3;',
    hints: [
      '`ORDER BY` can take multiple columns — each with its own direction.',
      '`LIMIT` (SQLite/MySQL/Postgres) caps the number of rows returned.',
      'Without a tie-breaker, two rows with equal salary may appear in any order between runs.',
    ],
  },

  'dbms-sql-join-medium': {
    id: 'dbms-sql-join-medium',
    title: 'Employee + Department Name',
    description:
      'For every employee, return their `name`, their `salary`, and the `name` of their department (aliased as `department_name`). Sort by department name, then employee name.',
    difficulty: 'Medium',
    schema: EMPLOYEES_SCHEMA,
    seedData: EMPLOYEES_SEED,
    expectedQuery: `
      SELECT e.name, e.salary, d.name AS department_name
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      ORDER BY d.name, e.name;
    `.trim(),
    hints: [
      'Use `JOIN` to combine rows from two tables on a shared key.',
      '`ON e.department_id = d.id` says which columns to match.',
      'Aliasing (`AS department_name`) avoids the column-name collision with `employees.name`.',
    ],
  },

  'dbms-sql-aggregation-medium': {
    id: 'dbms-sql-aggregation-medium',
    title: 'Order Count + Revenue per Customer',
    description:
      'For every customer who has at least one *non-refunded* order, return `customer_name`, the number of such orders (`order_count`), and the total revenue (`quantity * price` summed across all their non-refunded orders, aliased as `total_revenue`). Sort by `total_revenue` descending.',
    difficulty: 'Medium',
    schema: ECOMMERCE_SCHEMA,
    seedData: ECOMMERCE_SEED,
    expectedQuery: `
      SELECT
        c.name AS customer_name,
        COUNT(o.id) AS order_count,
        SUM(o.quantity * p.price) AS total_revenue
      FROM customers c
      JOIN orders o   ON o.customer_id = c.id
      JOIN products p ON p.id = o.product_id
      WHERE o.status <> 'refunded'
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC;
    `.trim(),
    hints: [
      'You need a three-way JOIN: customers ↔ orders ↔ products.',
      'Filter `status <> \'refunded\'` in the `WHERE` clause so refunded rows do not pollute the aggregate.',
      '`GROUP BY` by customer; aggregate functions (`COUNT`, `SUM`) collapse the grouped rows.',
    ],
  },

  // ─────────────── ADVANCED ───────────────
  'dbms-sql-join-aggregate-advanced': {
    id: 'dbms-sql-join-aggregate-advanced',
    title: 'Department Salary Stats',
    description:
      'For each department, return `department_name`, the *number* of employees in it (`headcount`), the *average* salary, and the *highest* salary. Only include departments that have at least 2 employees. Sort by `average_salary` descending.',
    difficulty: 'Advanced',
    schema: EMPLOYEES_SCHEMA,
    seedData: EMPLOYEES_SEED,
    expectedQuery: `
      SELECT
        d.name        AS department_name,
        COUNT(e.id)   AS headcount,
        AVG(e.salary) AS average_salary,
        MAX(e.salary) AS highest_salary
      FROM departments d
      JOIN employees e ON e.department_id = d.id
      GROUP BY d.id, d.name
      HAVING COUNT(e.id) >= 2
      ORDER BY average_salary DESC;
    `.trim(),
    hints: [
      '`HAVING` filters *groups* — use it instead of `WHERE` when the predicate refers to an aggregate.',
      '`AVG`, `COUNT`, and `MAX` can be used in the same `SELECT` over the same group.',
      'A single-employee department like HR (id=4) should not appear in the result.',
    ],
  },

  'dbms-sql-subquery-advanced': {
    id: 'dbms-sql-subquery-advanced',
    title: 'Employees Above Department Average',
    description:
      'Return the `name`, `salary`, and `department_id` of every employee whose salary is *strictly greater* than the average salary of their own department. Sort by `department_id`, then `salary` descending.',
    difficulty: 'Advanced',
    schema: EMPLOYEES_SCHEMA,
    seedData: EMPLOYEES_SEED,
    expectedQuery: `
      SELECT name, salary, department_id
      FROM employees e
      WHERE salary > (
        SELECT AVG(salary)
        FROM employees
        WHERE department_id = e.department_id
      )
      ORDER BY department_id, salary DESC;
    `.trim(),
    hints: [
      'You need a *correlated subquery* — the inner query references the outer row.',
      'For each employee, compute the average salary in their own department, then compare.',
      'Equivalent solution using window functions: `SELECT ... FROM (SELECT *, AVG(salary) OVER (PARTITION BY department_id) AS dept_avg FROM employees) WHERE salary > dept_avg`.',
    ],
  },

  'dbms-sql-window-advanced': {
    id: 'dbms-sql-window-advanced',
    title: 'Rank Employees Within Each Department',
    description:
      'For every employee, return `name`, `department_id`, `salary`, and their *salary rank within the department* (1 = highest). Use a window function — do not use a subquery. Sort by `department_id` ascending, then `rank` ascending.',
    difficulty: 'Advanced',
    schema: EMPLOYEES_SCHEMA,
    seedData: EMPLOYEES_SEED,
    expectedQuery: `
      SELECT
        name,
        department_id,
        salary,
        RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rank
      FROM employees
      ORDER BY department_id, rank;
    `.trim(),
    hints: [
      '`RANK() OVER (...)` is a window function — no `GROUP BY` needed; it preserves every row.',
      '`PARTITION BY department_id` restarts the ranking inside each department.',
      'Choose `RANK` (gaps after ties) vs `DENSE_RANK` (no gaps) vs `ROW_NUMBER` (strict 1..N, breaks ties arbitrarily) based on the requirement.',
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────
// Resolver
// ─────────────────────────────────────────────────────────────────────

/**
 * Look up a SQL question for a given subject/unit/subtopic/difficulty.
 *
 * Falls back to a difficulty-bucketed selection when the exact key is not
 * present, using a stable hash so repeat visits get the same question.
 * Non-DBMS subjects return null — they are routed to the coding-problem path.
 */
export function getSQLQuestion(
  subject: string,
  unit: string,
  subtopic: string,
  difficulty: 'Basic' | 'Medium' | 'Advanced'
): SQLQuestion | null {
  const normalizedSubject = subject.toLowerCase().replace(/\s+/g, '-')
  if (
    !normalizedSubject.includes('database') &&
    !normalizedSubject.includes('dbms') &&
    !normalizedSubject.includes('sql')
  ) {
    return null
  }

  const normalizedUnit = unit.toLowerCase().replace(/\s+/g, '-')
  const normalizedSubtopic = subtopic.toLowerCase().replace(/\s+/g, '-')
  const normalizedDifficulty = difficulty.toLowerCase()

  const exactKey = `dbms-${normalizedUnit}-${normalizedSubtopic}-${normalizedDifficulty}`
  if (SQL_QUESTIONS[exactKey]) {
    return SQL_QUESTIONS[exactKey]
  }

  const pools: Record<string, string[]> = {
    basic: ['dbms-sql-select-basic', 'dbms-sql-select-where-basic'],
    medium: [
      'dbms-sql-select-orderby-medium',
      'dbms-sql-join-medium',
      'dbms-sql-aggregation-medium',
    ],
    advanced: [
      'dbms-sql-join-aggregate-advanced',
      'dbms-sql-subquery-advanced',
      'dbms-sql-window-advanced',
    ],
  }

  const pool = pools[normalizedDifficulty] ?? pools.basic
  const seed = `${subject}-${unit}-${subtopic}`
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const idx = Math.abs(seed) % pool.length
  return SQL_QUESTIONS[pool[idx]] ?? null
}

/** Schema + seed bundle for the SQL execution sandbox. */
export function getSQLSchema(questionId: string): SQLSchema | null {
  const question = SQL_QUESTIONS[questionId]
  if (!question) return null
  return {
    questionId: question.id,
    schema: question.schema.trim(),
    seedData: question.seedData.trim(),
  }
}
