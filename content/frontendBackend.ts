// Question database for Frontend and Backend domains
// Each topic has Basic, Medium, and Hard level questions

export type Difficulty = 'Basic' | 'Medium' | 'Hard'
export type Subject = string
export type Unit = string
export type Subtopic = string

export interface FrontendBackendQuestion {
  subject: Subject
  unit: Unit
  subtopic: Subtopic
  difficulty: Difficulty
  title: string
  description: string
  requirements: string[]
  starterCode?: {
    html?: string
    css?: string
    javascript?: string
    react?: string
    nodejs?: string
    express?: string
    django?: string
    flask?: string
  }
  expectedOutput?: string
  hints: string[]
  solution?: {
    html?: string
    css?: string
    javascript?: string
    react?: string
    nodejs?: string
    express?: string
    django?: string
    flask?: string
  }
}

// Helper function to get questions for a specific topic
export function getQuestionsForTopic(
  subject: Subject,
  unit: Unit,
  subtopic: Subtopic,
  difficulty?: Difficulty
): FrontendBackendQuestion[] {
  const allQuestions = FRONTEND_BACKEND_QUESTIONS.filter(
    q => q.subject === subject && q.unit === unit && q.subtopic === subtopic
  )
  
  if (difficulty) {
    return allQuestions.filter(q => q.difficulty === difficulty)
  }
  
  return allQuestions
}

// Helper function to get a random question for a topic and difficulty
export function getRandomQuestion(
  subject: Subject,
  unit: Unit,
  subtopic: Subtopic,
  difficulty: Difficulty
): FrontendBackendQuestion | null {
  const questions = getQuestionsForTopic(subject, unit, subtopic, difficulty)
  if (questions.length === 0) return null
  return questions[Math.floor(Math.random() * questions.length)]
}

// Main question database
const FRONTEND_BACKEND_QUESTIONS: FrontendBackendQuestion[] = [
  // ============ HTML QUESTIONS ============
  {
    subject: 'HTML',
    unit: 'HTML Basics',
    subtopic: 'Introduction to HTML',
    difficulty: 'Basic',
    title: 'Create Your First HTML Page',
    description: 'Create a basic HTML page with a title "Welcome" and a heading that says "Hello World".',
    requirements: [
      'Include proper HTML5 document structure',
      'Add a title tag with "Welcome"',
      'Add an h1 heading with "Hello World"'
    ],
    starterCode: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title></title>
</head>
<body>
  
</body>
</html>`
    },
    hints: [
      'Use the <title> tag inside <head>',
      'Use <h1> tag for the main heading',
      'Make sure all tags are properly closed'
    ],
    solution: {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>`
    }
  },
  {
    subject: 'HTML',
    unit: 'HTML Basics',
    subtopic: 'HTML Structure',
    difficulty: 'Basic',
    title: 'Build a Proper HTML Document',
    description: 'Create a well-structured HTML document with head, body, and semantic elements.',
    requirements: [
      'Include DOCTYPE declaration',
      'Add meta tags for charset and viewport',
      'Include a title',
      'Add semantic HTML5 elements'
    ],
    starterCode: {
      html: `<!-- Your HTML here -->`
    },
    hints: [
      'Start with <!DOCTYPE html>',
      'Use <html>, <head>, and <body> tags',
      'Add semantic tags like <header>, <main>, <footer>'
    ]
  },
  {
    subject: 'HTML',
    unit: 'HTML Basics',
    subtopic: 'HTML Elements',
    difficulty: 'Medium',
    title: 'Create a Product Card',
    description: 'Build an HTML structure for a product card with image, title, description, and price.',
    requirements: [
      'Use semantic HTML elements',
      'Include an image placeholder',
      'Add product title, description, and price',
      'Structure it as a card layout'
    ],
    starterCode: {
      html: `<!-- Create a product card structure -->`
    },
    hints: [
      'Use <article> or <div> for the card container',
      'Use <img> for the product image',
      'Use <h2> or <h3> for the title',
      'Use <p> for description and price'
    ]
  },
  {
    subject: 'HTML',
    unit: 'Forms',
    subtopic: 'Form Basics',
    difficulty: 'Basic',
    title: 'Create a Contact Form',
    description: 'Create a contact form with name, email, and message fields.',
    requirements: [
      'Add a form element',
      'Include input fields for name and email',
      'Add a textarea for message',
      'Include a submit button'
    ],
    starterCode: {
      html: `<!-- Create a contact form -->`
    },
    hints: [
      'Use <form> tag',
      'Use <input> with type="text" for name',
      'Use <input> with type="email" for email',
      'Use <textarea> for message',
      'Use <button type="submit"> for submit'
    ]
  },
  
  // ============ CSS QUESTIONS ============
  {
    subject: 'CSS',
    unit: 'CSS Basics',
    subtopic: 'Introduction to CSS',
    difficulty: 'Basic',
    title: 'Style Your First Page',
    description: 'Add CSS to style a heading with blue color and center alignment.',
    requirements: [
      'Create a style tag or external CSS',
      'Target the h1 element',
      'Set color to blue',
      'Center align the text'
    ],
    starterCode: {
      html: `<h1>Welcome</h1>`,
      css: `/* Your CSS here */`
    },
    hints: [
      'Use h1 selector',
      'Use color property',
      'Use text-align: center'
    ],
    solution: {
      css: `h1 {
  color: blue;
  text-align: center;
}`
    }
  },
  {
    subject: 'CSS',
    unit: 'CSS Basics',
    subtopic: 'Selectors',
    difficulty: 'Basic',
    title: 'Use Different Selectors',
    description: 'Style elements using element, class, and ID selectors.',
    requirements: [
      'Style all paragraphs with a font size',
      'Create a class for highlighted text',
      'Create an ID for a special element'
    ],
    starterCode: {
      html: `<p>Regular paragraph</p>
<p class="highlight">Highlighted text</p>
<p id="special">Special element</p>`,
      css: `/* Style using element, class, and ID selectors */`
    },
    hints: [
      'Use p selector for element',
      'Use .highlight for class',
      'Use #special for ID'
    ]
  },
  {
    subject: 'CSS',
    unit: 'Layout',
    subtopic: 'Flexbox',
    difficulty: 'Medium',
    title: 'Create a Flexbox Navigation',
    description: 'Create a horizontal navigation bar using Flexbox with evenly spaced items.',
    requirements: [
      'Use display: flex',
      'Space items evenly',
      'Center items vertically',
      'Add hover effects'
    ],
    starterCode: {
      html: `<nav>
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Services</a>
  <a href="#">Contact</a>
</nav>`,
      css: `/* Create flexbox navigation */`
    },
    hints: [
      'Set display: flex on nav',
      'Use justify-content: space-evenly',
      'Use align-items: center',
      'Add :hover pseudo-class'
    ]
  },
  {
    subject: 'CSS',
    unit: 'Layout',
    subtopic: 'CSS Grid',
    difficulty: 'Hard',
    title: 'Build a Grid Layout',
    description: 'Create a responsive grid layout with 3 columns that becomes 1 column on mobile.',
    requirements: [
      'Use CSS Grid',
      '3 columns on desktop',
      '1 column on mobile',
      'Use media queries'
    ],
    starterCode: {
      html: `<div class="grid-container">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
  <div class="item">Item 4</div>
  <div class="item">Item 5</div>
  <div class="item">Item 6</div>
</div>`,
      css: `/* Create responsive grid layout */`
    },
    hints: [
      'Use display: grid',
      'Use grid-template-columns: repeat(3, 1fr)',
      'Use @media query for mobile',
      'Set grid-template-columns: 1fr for mobile'
    ]
  },
  
  // ============ JAVASCRIPT QUESTIONS ============
  {
    subject: 'JavaScript',
    unit: 'JavaScript Basics',
    subtopic: 'Introduction to JavaScript',
    difficulty: 'Basic',
    title: 'Your First JavaScript Program',
    description: 'Write JavaScript code to display "Hello, JavaScript!" in the console and in an alert.',
    requirements: [
      'Use console.log()',
      'Use alert()',
      'Display the same message in both'
    ],
    starterCode: {
      html: `<button onclick="greet()">Click Me</button>`,
      javascript: `// Write your JavaScript here
function greet() {
  
}`
    },
    hints: [
      'Use console.log("Hello, JavaScript!")',
      'Use alert("Hello, JavaScript!")',
      'Call both functions in greet()'
    ],
    solution: {
      javascript: `function greet() {
  console.log("Hello, JavaScript!");
  alert("Hello, JavaScript!");
}`
    }
  },
  {
    subject: 'JavaScript',
    unit: 'JavaScript Basics',
    subtopic: 'Variables',
    difficulty: 'Basic',
    title: 'Work with Variables',
    description: 'Create variables using let, const, and var. Store your name, age, and a boolean for student status.',
    requirements: [
      'Use let for name',
      'Use const for age',
      'Use var for student status',
      'Display all values'
    ],
    starterCode: {
      javascript: `// Create variables here`
    },
    hints: [
      'let name = "Your Name"',
      'const age = 25',
      'var isStudent = true',
      'Use console.log to display'
    ]
  },
  {
    subject: 'JavaScript',
    unit: 'Functions',
    subtopic: 'Function Basics',
    difficulty: 'Medium',
    title: 'Create a Calculator Function',
    description: 'Create a function that takes two numbers and an operator (+, -, *, /) and returns the result.',
    requirements: [
      'Function should accept 3 parameters',
      'Handle all 4 operators',
      'Return the result',
      'Handle division by zero'
    ],
    starterCode: {
      javascript: `function calculator(num1, operator, num2) {
  // Your code here
}`
    },
    hints: [
      'Use if-else or switch for operators',
      'Check for division by zero',
      'Return the calculated result'
    ]
  },
  {
    subject: 'JavaScript',
    unit: 'DOM Manipulation',
    subtopic: 'DOM Selectors',
    difficulty: 'Medium',
    title: 'Interactive Button Counter',
    description: 'Create a button that increments a counter displayed on the page each time it\'s clicked.',
    requirements: [
      'Use querySelector or getElementById',
      'Add event listener to button',
      'Update counter display',
      'Start counter at 0'
    ],
    starterCode: {
      html: `<div id="counter">0</div>
<button id="incrementBtn">Increment</button>`,
      javascript: `// Add your JavaScript here`
    },
    hints: [
      'Use getElementById to get elements',
      'Use addEventListener for click event',
      'Use textContent or innerHTML to update',
      'Keep track of count in a variable'
    ]
  },
  {
    subject: 'JavaScript',
    unit: 'DOM Manipulation',
    subtopic: 'Event Handling',
    difficulty: 'Hard',
    title: 'Todo List Application',
    description: 'Create a todo list where users can add, remove, and toggle completion of items.',
    requirements: [
      'Input field and add button',
      'Display list of todos',
      'Each todo has delete and toggle buttons',
      'Store todos in an array'
    ],
    starterCode: {
      html: `<input type="text" id="todoInput" placeholder="Add a todo">
<button id="addBtn">Add</button>
<ul id="todoList"></ul>`,
      javascript: `// Create todo list functionality`
    },
    hints: [
      'Use array to store todos',
      'Create function to render todos',
      'Add event listeners for add, delete, toggle',
      'Update DOM after each operation'
    ]
  },
  
  // ============ REACT QUESTIONS ============
  {
    subject: 'React',
    unit: 'React Basics',
    subtopic: 'Introduction to React',
    difficulty: 'Basic',
    title: 'Your First React Component',
    description: 'Create a simple React functional component that displays "Hello, React!"',
    requirements: [
      'Create a functional component',
      'Return JSX',
      'Export the component'
    ],
    starterCode: {
      react: `import React from 'react';

function Welcome() {
  // Your component code here
}

export default Welcome;`
    },
    hints: [
      'Use function keyword or arrow function',
      'Return JSX with <h1>Hello, React!</h1>',
      'Export using export default'
    ],
    solution: {
      react: `import React from 'react';

function Welcome() {
  return <h1>Hello, React!</h1>;
}

export default Welcome;`
    }
  },
  {
    subject: 'React',
    unit: 'React Basics',
    subtopic: 'Components',
    difficulty: 'Basic',
    title: 'Create a Button Component',
    description: 'Create a reusable Button component that accepts text and onClick handler as props.',
    requirements: [
      'Accept props',
      'Display button text from props',
      'Handle onClick event',
      'Style the button'
    ],
    starterCode: {
      react: `function Button({ text, onClick }) {
  // Your component code here
}`
    },
    hints: [
      'Destructure props in parameters',
      'Use onClick prop in button element',
      'Display text prop',
      'Add className for styling'
    ]
  },
  {
    subject: 'React',
    unit: 'State Management',
    subtopic: 'useState Hook',
    difficulty: 'Medium',
    title: 'Counter with useState',
    description: 'Create a counter component using useState hook with increment and decrement buttons.',
    requirements: [
      'Import useState',
      'Initialize state with 0',
      'Create increment function',
      'Create decrement function'
    ],
    starterCode: {
      react: `import React, { useState } from 'react';

function Counter() {
  // Your code here
}`
    },
    hints: [
      'const [count, setCount] = useState(0)',
      'Create increment: () => setCount(count + 1)',
      'Create decrement: () => setCount(count - 1)',
      'Display count in JSX'
    ]
  },
  {
    subject: 'React',
    unit: 'State Management',
    subtopic: 'useEffect Hook',
    difficulty: 'Hard',
    title: 'Fetch Data with useEffect',
    description: 'Create a component that fetches and displays user data from an API using useEffect.',
    requirements: [
      'Use useState for data and loading',
      'Use useEffect to fetch on mount',
      'Handle loading state',
      'Display fetched data'
    ],
    starterCode: {
      react: `import React, { useState, useEffect } from 'react';

function UserProfile() {
  // Your code here
}`
    },
    hints: [
      'Use useState for user and loading',
      'Use useEffect with empty dependency array',
      'Use fetch() or axios',
      'Update state after fetch'
    ]
  },
  
  // ============ NODE.JS QUESTIONS ============
  {
    subject: 'Node.js',
    unit: 'Node.js Basics',
    subtopic: 'Introduction to Node.js',
    difficulty: 'Basic',
    title: 'Create a Simple Server',
    description: 'Create a Node.js server using the http module that responds with "Hello, Node.js!" on port 3000.',
    requirements: [
      'Import http module',
      'Create server',
      'Listen on port 3000',
      'Return "Hello, Node.js!"'
    ],
    starterCode: {
      nodejs: `const http = require('http');

// Your server code here`
    },
    hints: [
      'Use http.createServer()',
      'Handle request and response',
      'Use res.writeHead() and res.end()',
      'Use server.listen(3000)'
    ],
    solution: {
      nodejs: `const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, Node.js!');
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});`
    }
  },
  {
    subject: 'Node.js',
    unit: 'Node.js Basics',
    subtopic: 'Modules',
    difficulty: 'Basic',
    title: 'Create and Export a Module',
    description: 'Create a utility module that exports a function to calculate the sum of two numbers.',
    requirements: [
      'Create a module file',
      'Export a function',
      'Import and use in another file'
    ],
    starterCode: {
      nodejs: `// mathUtils.js
// Your module code here

// app.js
// Import and use the module`
    },
    hints: [
      'Use module.exports or exports',
      'Create function sum(a, b)',
      'Use require() to import',
      'Call the function'
    ]
  },
  {
    subject: 'Node.js',
    unit: 'Asynchronous Programming',
    subtopic: 'Promises',
    difficulty: 'Medium',
    title: 'Handle Async Operations',
    description: 'Create a function that reads a file using promises and handles both success and error cases.',
    requirements: [
      'Use fs.promises',
      'Handle .then() and .catch()',
      'Return file content on success',
      'Handle errors properly'
    ],
    starterCode: {
      nodejs: `const fs = require('fs').promises;

async function readFileAsync(filename) {
  // Your code here
}`
    },
    hints: [
      'Use fs.promises.readFile()',
      'Use .then() for success',
      'Use .catch() for errors',
      'Return the result'
    ]
  },
  
  // ============ EXPRESS.JS QUESTIONS ============
  {
    subject: 'Express.js',
    unit: 'Express Basics',
    subtopic: 'Introduction to Express',
    difficulty: 'Basic',
    title: 'Create Your First Express App',
    description: 'Create an Express server that responds with "Hello, Express!" on the root route.',
    requirements: [
      'Install and require Express',
      'Create app instance',
      'Define root route',
      'Listen on port 3000'
    ],
    starterCode: {
      express: `const express = require('express');
const app = express();

// Your routes here

// Start server`
    },
    hints: [
      'Use app.get("/", ...)',
      'Send response with res.send()',
      'Use app.listen(3000)',
      'Add console.log for confirmation'
    ],
    solution: {
      express: `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`
    }
  },
  {
    subject: 'Express.js',
    unit: 'Express Basics',
    subtopic: 'Routing',
    difficulty: 'Basic',
    title: 'Create Multiple Routes',
    description: 'Create routes for /home, /about, and /contact that return different messages.',
    requirements: [
      'Create /home route',
      'Create /about route',
      'Create /contact route',
      'Each returns unique message'
    ],
    starterCode: {
      express: `const express = require('express');
const app = express();

// Your routes here`
    },
    hints: [
      'Use app.get() for each route',
      'Return different messages',
      'Use res.send() or res.json()'
    ]
  },
  {
    subject: 'Express.js',
    unit: 'REST API',
    subtopic: 'API Endpoints',
    difficulty: 'Medium',
    title: 'Build a REST API',
    description: 'Create a REST API with GET, POST, PUT, and DELETE endpoints for managing a list of items.',
    requirements: [
      'GET /items - return all items',
      'POST /items - add new item',
      'PUT /items/:id - update item',
      'DELETE /items/:id - delete item'
    ],
    starterCode: {
      express: `const express = require('express');
const app = express();

app.use(express.json());

let items = [];

// Your API routes here`
    },
    hints: [
      'Use app.get(), app.post(), app.put(), app.delete()',
      'Use req.params for ID',
      'Use req.body for data',
      'Store items in array'
    ]
  },
  {
    subject: 'Express.js',
    unit: 'REST API',
    subtopic: 'API Endpoints',
    difficulty: 'Hard',
    title: 'Advanced REST API with Validation',
    description: 'Create a REST API with input validation, error handling, and proper status codes.',
    requirements: [
      'Validate input data',
      'Return appropriate status codes',
      'Handle errors gracefully',
      'Add middleware for validation'
    ],
    starterCode: {
      express: `const express = require('express');
const app = express();

app.use(express.json());

// Your API with validation`
    },
    hints: [
      'Check req.body properties',
      'Return 400 for bad requests',
      'Return 404 for not found',
      'Use try-catch for errors'
    ]
  }
]

// Export the questions array
export { FRONTEND_BACKEND_QUESTIONS }



