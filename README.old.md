# 🚀 AI Tutor Platform - Gamified CS Learning Ecosystem

> **Next-generation AI-powered, gamified Computer Science learning platform**

Prototype Demo Video :https://drive.google.com/file/d/1hgJFdet9n1P81ult-L6F90vr1l7Vn-Za/view?usp=sharing

A visually stunning, game-like learning ecosystem where users progress through knowledge like a journey. Built with Next.js, TypeScript, Gemini AI, and modern animations.

<img width="1790" height="872" alt="Screenshot 2026-01-17 122832" src="https://github.com/user-attachments/assets/1ca44682-ef41-4686-96e4-be9e7fca7537" />

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Detailed Features](#-detailed-features)
- [API Integration](#-api-integration)
- [Project Structure](#-project-structure)
- [Usage Guide](#-usage-guide)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

### 🎮 Core Learning Flow

The platform follows a structured learning path that ensures comprehensive understanding:

#### 1. **Visual Journey Map**
- Interactive, animated roadmap showing your learning progress
- Locked/unlocked states for units and subtopics
- Visual indicators for completed phases
- Snake-like path connecting all learning phases

<img width="1862" height="847" alt="Screenshot 2026-01-17 123217" src="https://github.com/user-attachments/assets/a062d688-2fc6-415b-9f09-e071e95b7417" />

#### 2. **Theory Learning Phase**
- AI-generated comprehensive theory content
- Structured sections with code examples
- Visual descriptions and analogies
- Markdown-formatted content with syntax highlighting
- Smooth scroll animations
- Progress tracking

![WhatsApp Image 2026-02-15 at 17 18 29](https://github.com/user-attachments/assets/b2392f29-91fe-4c15-a802-17cb37613f93)

#### 3. **MCQ Gate (Progression Gate)**
- Mandatory MCQ test to unlock coding challenges
- 5 high-quality questions per unit
- Instant feedback with explanations
- 70% passing score required
- Reinforcement learning for failed concepts
- Re-teaching with simplified explanations
- Retry mechanism with new questions

![MCQ Gate](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=MCQ+Gate+Interface)
*Add screenshot of MCQ interface here*

#### 4. **Coding Challenges - Progressive Difficulty**

##### Basic Level
- Introduction to problem-solving
- Simple algorithms and data structures
- Step-by-step guidance
- XP reward: 30 points

![Basic Coding](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=Basic+Coding+Challenge)
*Add screenshot of basic coding challenge here*

##### Medium Level
- Intermediate problem complexity
- Multiple approaches possible
- Requires deeper understanding
- XP reward: 40 points

![Medium Coding](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=Medium+Coding+Challenge)
*Add screenshot of medium coding challenge here*

##### Hard Level
- Advanced problem-solving
- Complex algorithms
- Optimization challenges
- XP reward: 50 points

![Hard Coding](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=Hard+Coding+Challenge)
*Add screenshot of hard coding challenge here*

#### 5. **Personalized Assignment Generation**
- AI-generated custom coding problems after completing hard level
- Tailored to your learning progress
- AI verification using DeepSeek Coder (via Hugging Face)
- Real-time code execution with Judge0
- Comprehensive test case validation
- Detailed feedback and suggestions

![Assignment](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=Personalized+Assignment)
*Add screenshot of assignment interface here*

### 🎯 Gamification Features

#### XP & Leveling System
- Earn XP for completing phases
- Level up based on total XP
- Visual progress bars
- Achievement celebrations

#### Badge System
- **Arrays Master Badge** - Complete all phases of Arrays unit
- More badges coming soon for other units
- Epic, Rare, Legendary rarity levels
- Badge collection display in profile

![Badges](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=Badge+Collection)
*Add screenshot of badges section here*

#### Profile & Stats
- Comprehensive user profile
- Total XP and level display
- Global ranking
- Problems solved counter
- Contest wins
- Duel statistics
- Marathon completions
- Streak tracking
- Average time per problem

![Profile](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=User+Profile)
*Add screenshot of profile page here*

### 🏆 Competitive Features

#### Contests
- Scheduled coding contests
- Leaderboard rankings
- Real-time problem solving
- Time-based challenges
- Prize system (coming soon)

![Contests](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=Coding+Contests)
*Add screenshot of contests page here*

#### Duels (1v1)
- Challenge other learners
- Head-to-head coding battles
- Real-time problem solving
- Win/loss tracking
- Duel history

![Duels](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=1v1+Duels)
*Add screenshot of duels page here*

#### Standoffs (3v3)
- Team-based competitions
- 3 players per team
- Collaborative problem solving
- Team rankings

![Standoffs](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=3v3+Standoffs)
*Add screenshot of standoffs page here*

#### Marathons
- Extended coding challenges
- Multiple problems in sequence
- Endurance testing
- Marathon leaderboards

![Marathons](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=Coding+Marathons)
*Add screenshot of marathons page here*

### 💻 Code Editor Features

#### Monaco Editor Integration
- VS Code-like editing experience
- Syntax highlighting for multiple languages
- Auto-completion
- Code formatting
- Line numbers
- Error detection
- Multi-language support (C++, Java, Python, JavaScript)

![Code Editor](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=Monaco+Code+Editor)
*Add screenshot of code editor here*

#### AI-Powered Hints
- Line-by-line code analysis
- Contextual hints without revealing solutions
- Error detection and explanation
- Learning-focused guidance
- Progressive hint system

![AI Hints](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=AI+Hints+System)
*Add screenshot of AI hints feature here*

#### Real-Time Code Execution
- Judge0 integration for code execution
- Multiple language support
- Test case validation
- Runtime and memory analysis
- Submission tracking

### 🎨 UI/UX Highlights

- **Dark Mode** with neon accents (cyan, pink, purple, green, yellow)
- **Glassmorphism** design elements throughout
- **Smooth Animations** using Framer Motion
- **Micro-interactions** on every element
- **Confetti Celebrations** on achievements
- **Responsive Design** for all devices (mobile, tablet, desktop)
- **Loading States** with beautiful animations
- **Error Handling** with user-friendly messages
- **Toast Notifications** for feedback

![UI Design](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=UI+Design+Showcase)
*Add screenshot showcasing UI design here*

### 📚 Subjects Covered

- **C++ Fundamentals** - Variables, Control Flow, Functions, Pointers, Classes
- **Java Fundamentals** - Basics, Collections, OOP, Exception Handling
- **Python Fundamentals** - Syntax, Data Structures, Functions, OOP
- **Data Structures & Algorithms (DSA)** - Arrays, Linked Lists, Trees, Sorting
- **Object-Oriented Programming (OOPS)** - Principles, Design Patterns
- **Database Management Systems (DBMS)** - SQL, Normalization, Transactions

![Subjects](https://via.placeholder.com/1200x600/0a0a0f/00ffff?text=Subject+Selection)
*Add screenshot of subject selection page here*

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Monaco Editor** - VS Code-like code editor
- **Canvas Confetti** - Celebration effects
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Node.js** - Runtime environment

### AI Integration
- **Google Gemini AI** - Dynamic content generation
  - Automatic model detection (gemini-flash-2.5, gemini-2.0-flash-exp, etc.)
  - Theory generation
  - MCQ creation
  - Coding problems
  - Hints and explanations
  - Reinforcement learning
  - Personalized assignments

- **Hugging Face API** - AI question verification
  - DeepSeek Coder integration
  - Assignment verification
  - Code quality analysis

### Code Execution
- **Judge0** - Code execution engine
  - Multiple language support
  - Test case validation
  - Runtime analysis
  - Via RapidAPI or self-hosted

### Database (Optional)
- **Supabase** - PostgreSQL database
  - User progress tracking
  - Contest data
  - Leaderboards
  - Profile information

---

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Gemini API Key (required)
- Judge0 API Key (optional, for code execution)
- Hugging Face API Key (optional, for assignment verification)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-tutor-platform

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API keys to .env.local
# GEMINI_API_KEY=your_key_here

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the platform.

---

## 📖 Detailed Features

### Learning Flow Architecture

```
Subject Selection
    ↓
Unit Selection
    ↓
Subtopic Selection
    ↓
Theory Phase (AI-generated content)
    ↓
MCQ Gate (Must score 70%+)
    ↓
Basic Coding Challenge
    ↓
Medium Coding Challenge
    ↓
Hard Coding Challenge
    ↓
Personalized Assignment (AI-generated + verified)
    ↓
Next Subtopic / Unit Completion Badge
```

### AI Content Generation

The platform uses Google Gemini AI to generate all learning content dynamically:

1. **Theory Generation**
   - Comprehensive explanations
   - Code examples with syntax highlighting
   - Visual descriptions
   - Key takeaways
   - Real-world applications

2. **MCQ Generation**
   - 5 questions per unit
   - Multiple choice format
   - Detailed explanations
   - Difficulty-appropriate questions

3. **Coding Problems**
   - Problem statements
   - Input/output examples
   - Constraints
   - Test cases
   - Hints (progressive disclosure)

4. **Personalized Assignments**
   - Custom problems based on progress
   - Adaptive difficulty
   - AI verification
   - Comprehensive feedback

### Gamification Mechanics

- **XP System**: Earn XP for each completed phase
- **Leveling**: Level up based on total XP (1000 XP per level)
- **Badges**: Unlock badges for unit completions
- **Leaderboards**: Global and unit-specific rankings
- **Streaks**: Daily practice streaks
- **Achievements**: Unlock achievements for milestones

### Code Execution Flow

1. User writes code in Monaco Editor
2. Selects programming language
3. Clicks "Run Code"
4. Code sent to Judge0 API
5. Test cases executed
6. Results displayed with:
   - Pass/fail status
   - Runtime
   - Memory usage
   - Error messages (if any)
   - Output comparison

---

## 🔌 API Integration

### Required: Google Gemini API

The platform requires Gemini API for content generation. See [SETUP.md](./SETUP.md) for setup instructions.

**Endpoints:**
- `/api/gemini/theory` - Generate theory content
- `/api/gemini/mcq` - Generate MCQs
- `/api/gemini/coding-problem` - Generate coding problems
- `/api/gemini/hint` - Generate AI hints
- `/api/gemini/assignment` - Generate personalized assignments
- `/api/gemini/reinforcement-mcq` - Generate reinforcement questions
- `/api/gemini/reteach` - Generate simplified explanations
- `/api/gemini/verify-key` - Verify API key
- `/api/gemini/list-models` - List available models

### Optional: Judge0 API

For real code execution. Can use RapidAPI or self-hosted instance.

**Endpoint:**
- `/api/judge0/execute` - Execute code

### Optional: Hugging Face API

For AI-powered assignment verification using DeepSeek Coder.

**Configuration:**
- `HUGGINGFACE_API_KEY` - Your Hugging Face token
- `DEEPSEEK_MODEL_ID` - Model ID (default: deepseek-ai/deepseek-coder-6.7b-instruct)

### Optional: Supabase

For database persistence (user progress, contests, etc.).

**Configuration:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your service role key

---

## 📁 Project Structure

```
ai-tutor-platform/
├── app/
│   ├── api/
│   │   ├── gemini/
│   │   │   ├── theory/route.ts
│   │   │   ├── mcq/route.ts
│   │   │   ├── coding-problem/route.ts
│   │   │   ├── hint/route.ts
│   │   │   ├── assignment/route.ts
│   │   │   ├── reinforcement-mcq/route.ts
│   │   │   ├── reteach/route.ts
│   │   │   ├── verify-key/route.ts
│   │   │   └── list-models/route.ts
│   │   └── judge0/
│   │       └── execute/route.ts
│   ├── subject/
│   │   └── [subjectId]/
│   │       ├── page.tsx
│   │       └── unit/
│   │           └── [unitId]/
│   │               ├── page.tsx
│   │               ├── journey/
│   │               │   └── page.tsx
│   │               └── subtopic/
│   │                   └── [subtopicId]/
│   │                       └── [phase]/
│   │                           └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── contests/
│   │   └── page.tsx
│   ├── duels/
│   │   └── page.tsx
│   ├── marathons/
│   │   └── page.tsx
│   ├── standoffs/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Navigation.tsx
│   ├── JourneyMap.tsx
│   ├── GamifiedJourney.tsx
│   ├── ConceptLearning.tsx
│   ├── MCQGate.tsx
│   ├── CodingChallenge.tsx
│   ├── PersonalizedAssignment.tsx
│   ├── LeaderboardUnlock.tsx
│   └── BadgeUnlock.tsx
├── lib/
│   ├── gemini.ts
│   ├── huggingface.ts
│   ├── badges.ts
│   ├── subjects.ts
│   ├── theoryDatabase.ts
│   ├── codingProblemDatabase.ts
│   ├── supabase.ts
│   └── types/
│       ├── profile.ts
│       └── contests.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── README.md
└── SETUP.md
```

---

## 🎯 Usage Guide

### For Students

1. **Start Your Journey**
   - Navigate to the homepage
   - Select a subject (e.g., "Data Structures & Algorithms")
   - Choose an unlocked unit (e.g., "Arrays")

2. **Learn Theory**
   - Read through AI-generated theory content
   - Review code examples
   - Understand key concepts
   - Complete all sections

3. **Pass MCQ Gate**
   - Answer 5 questions correctly
   - Score 70% or higher to proceed
   - If you fail, get reinforcement learning
   - Retry with new questions

4. **Solve Coding Challenges**
   - Start with Basic difficulty
   - Use Monaco Editor to write code
   - Run code to test your solution
   - Use AI hints if stuck (they won't reveal the solution)
   - Progress to Medium and Hard levels

5. **Complete Personalized Assignment**
   - After Hard level, get a custom assignment
   - Solve the AI-generated problem
   - Get verified by DeepSeek Coder
   - Receive detailed feedback

6. **Track Your Progress**
   - View your profile for stats
   - Check badges earned
   - See XP and level
   - Monitor your global rank

7. **Compete**
   - Join coding contests
   - Challenge others in duels
   - Form teams for standoffs
   - Participate in marathons

### For Developers

#### Adding a New Subject

Edit `lib/subjects.ts`:

```typescript
export const SUBJECTS: Record<Subject, SubjectConfig> = {
  // ... existing subjects
  newSubject: {
    id: 'newSubject',
    name: 'New Subject Name',
    icon: '🎯',
    color: 'neon-cyan',
    units: [
      {
        id: 'unit1',
        name: 'Unit 1',
        description: 'Unit description',
        locked: false,
        completed: false,
        xpReward: 100,
        subtopics: [...]
      }
    ]
  }
}
```

#### Customizing AI Prompts

Edit `lib/gemini.ts` to modify prompt templates:

```typescript
export const PROMPT_TEMPLATES = {
  theory: (subject: string, unit: string, subtopic?: string) => `
    Generate comprehensive theory for ${subject} - ${unit}${subtopic ? ` - ${subtopic}` : ''}
    // Your custom prompt here
  `
}
```

#### Adding New Badges

Edit `lib/badges.ts`:

```typescript
export function getNewBadge(): Badge {
  return {
    id: 'new-badge',
    name: 'New Badge Name',
    description: 'Badge description',
    icon: '🏆',
    earnedAt: new Date(),
    rarity: 'epic'
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

1. **"GEMINI_API_KEY is not set"**
   - Ensure `.env.local` exists in root directory
   - Check API key is correctly formatted (starts with "AIza")
   - Restart dev server after adding env vars
   - Verify file is named `.env.local` (not `.env`)

2. **"No working Gemini model found"**
   - Check API key is valid
   - Verify billing is enabled (if required)
   - Visit https://aistudio.google.com/ to check available models
   - Try the `/api/gemini/list-models` endpoint

3. **API Rate Limit Errors**
   - Wait 1 minute between requests
   - Consider upgrading to paid tier
   - Implement request throttling

4. **Monaco Editor Not Loading**
   - Check browser console for errors
   - Ensure JavaScript is enabled
   - Try clearing browser cache
   - Check network tab for failed requests

5. **Code Execution Not Working**
   - Verify Judge0 API key is set
   - Check Judge0 service is running (if self-hosted)
   - Verify RapidAPI subscription is active
   - Check API rate limits

6. **Build Errors**
   - Run `npm install` again
   - Delete `node_modules` and `.next` folders
   - Check Node.js version (18+)
   - Clear npm cache: `npm cache clean --force`

7. **Profile/Badges Not Showing**
   - Check browser localStorage is enabled
   - Clear localStorage and refresh
   - Verify completion tracking is working

---

## 🚧 Future Enhancements

- [ ] User authentication system
- [ ] Social features (friends, following)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Voice narration for theory
- [ ] Video explanations
- [ ] More subjects (GATE prep, System Design, etc.)
- [ ] Custom problem creation
- [ ] Study groups
- [ ] Certificate generation
- [ ] Integration with GitHub
- [ ] AI-powered code review
- [ ] Real-time collaboration

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review API documentation
- Check [SETUP.md](./SETUP.md) for setup help

---

## 🎉 Acknowledgments

- **Google Gemini** - For AI capabilities
- **Next.js Team** - For the amazing framework
- **Framer Motion** - For smooth animations
- **Monaco Editor** - For code editing experience
- **Judge0** - For code execution
- **Hugging Face** - For AI verification
- **Supabase** - For database infrastructure

---

**Built with ❤️ for the next generation of CS learners**

---
