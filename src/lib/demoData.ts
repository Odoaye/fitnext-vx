export type Role = 'admin' | 'student' | 'lecturer';

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
  department_id?: string;
  faculty_id?: string;
  year?: number;
  courses: string[];
}

export interface Department {
  id: string;
  name: string;
  faculty_id: string;
}

export interface Faculty {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department_id: string;
  lecturer_id: string;
  year_level: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  course_id: string;
  lecturer_id: string;
  deadline: string;
  type: 'assignment' | 'quiz';
  allow_retake: boolean;
  created_at: string;
  questions?: QuizQuestion[];
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: 'pending' | 'submitted' | 'late' | 'graded';
  submitted_at?: string;
  grade?: string;
  feedback?: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'notes';
  course_id: string;
  department_id: string;
  year_level: number;
  lecturer_id: string;
  uploaded_at: string;
}

export interface Comment {
  id: string;
  assignment_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'comment' | 'deadline' | 'grade';
  message: string;
  read: boolean;
  created_at: string;
  link: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  student_id: string;
  answers: Record<string, number>;
  score: number;
  completed_at: string;
}

const now = Date.now();
const d = (days: number) => new Date(now + 86400000 * days).toISOString();

export const seedData = {
  faculties: [
    { id: 'f1', name: 'Engineering' },
    { id: 'f2', name: 'Commerce' },
    { id: 'f3', name: 'Natural Sciences' },
  ],
  departments: [
    { id: 'd1', name: 'Computer Science', faculty_id: 'f1' },
    { id: 'd2', name: 'Mechanical Engineering', faculty_id: 'f1' },
    { id: 'd3', name: 'Business Administration', faculty_id: 'f2' },
  ],
  users: [
    { id: 'u1', name: 'Dr. Admin', role: 'admin' as const, username: 'admin', courses: [] },
    { id: 'u2', name: 'Alice Johnson', role: 'student' as const, username: 'student1', department_id: 'd1', faculty_id: 'f1', year: 2, courses: ['c1', 'c2', 'c3'] },
    { id: 'u3', name: 'Bob Smith', role: 'student' as const, username: 'student2', department_id: 'd3', faculty_id: 'f2', year: 1, courses: ['c4', 'c5'] },
    { id: 'u4', name: 'Prof. Sarah Chen', role: 'lecturer' as const, username: 'lect1', department_id: 'd1', faculty_id: 'f1', courses: ['c1', 'c2', 'c3'] },
    { id: 'u5', name: 'Prof. James Osei', role: 'lecturer' as const, username: 'lect2', department_id: 'd3', faculty_id: 'f2', courses: ['c4', 'c5'] },
  ],
  courses: [
    { id: 'c1', code: 'CS201', name: 'Data Structures', department_id: 'd1', lecturer_id: 'u4', year_level: 2 },
    { id: 'c2', code: 'CS202', name: 'Algorithm Design', department_id: 'd1', lecturer_id: 'u4', year_level: 2 },
    { id: 'c3', code: 'MATH201', name: 'Discrete Mathematics', department_id: 'd1', lecturer_id: 'u4', year_level: 2 },
    { id: 'c4', code: 'BUS101', name: 'Introduction to Business', department_id: 'd3', lecturer_id: 'u5', year_level: 1 },
    { id: 'c5', code: 'MATH101', name: 'Calculus I', department_id: 'd3', lecturer_id: 'u5', year_level: 1 },
  ],
  assignments: [
    {
      id: 'a1',
      title: 'Binary Search Tree Implementation',
      description: 'Implement a Binary Search Tree (BST) in C++ with insert, delete, search, and all three traversal functions (in-order, pre-order, post-order). Your implementation must handle edge cases such as: deleting a node with two children using the in-order successor, searching in an empty tree, and inserting duplicate values. Include a comprehensive test suite with at least 15 test cases. Provide a written time and space complexity analysis for each operation and explain the practical advantages of BSTs over linear data structures.',
      course_id: 'c1',
      lecturer_id: 'u4',
      deadline: d(5),
      type: 'assignment' as const,
      allow_retake: false,
      created_at: d(-7),
    },
    {
      id: 'a2',
      title: 'CS201 Midterm Quiz',
      description: 'This quiz covers all material from Weeks 1 to 6, including arrays, linked lists, stacks, queues, binary trees, and basic sorting algorithms. Review all lecture notes and tutorial recordings before attempting. You have one 60-minute window per attempt.',
      course_id: 'c1',
      lecturer_id: 'u4',
      deadline: d(2),
      type: 'quiz' as const,
      allow_retake: true,
      created_at: d(-3),
      questions: [
        { id: 'q1', question: 'Which data structure follows the Last-In, First-Out (LIFO) principle?', options: ['Queue', 'Stack', 'Linked List', 'Priority Queue'], correct: 1 },
        { id: 'q2', question: 'What is the average-case time complexity of searching in a balanced Binary Search Tree?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], correct: 1 },
        { id: 'q3', question: 'Which traversal visits BST nodes in ascending sorted order?', options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'], correct: 2 },
        { id: 'q4', question: 'What is the worst-case time complexity of QuickSort?', options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'], correct: 2 },
        { id: 'q5', question: 'Which of the following is NOT a self-balancing binary search tree?', options: ['AVL Tree', 'Red-Black Tree', 'Splay Tree', 'Binary Heap'], correct: 3 },
      ],
    },
    {
      id: 'a3',
      title: 'Dynamic Programming Problem Set',
      description: 'Solve the following five dynamic programming problems: (1) Longest Common Subsequence for two given strings, (2) 0/1 Knapsack with capacity of 50 units, (3) Matrix Chain Multiplication to find optimal parenthesization, (4) Coin Change Problem with denominations {1, 5, 10, 25}, (5) Edit Distance between two strings. For each problem, implement both a top-down memoized recursive solution and a bottom-up tabulation solution. Compare their time and space complexities in a summary table. Include clearly commented code and at least 3 test cases per problem.',
      course_id: 'c2',
      lecturer_id: 'u4',
      deadline: d(8),
      type: 'assignment' as const,
      allow_retake: false,
      created_at: d(-2),
    },
    {
      id: 'a4',
      title: 'Algorithm Analysis Quiz',
      description: 'This quiz covers time complexity analysis, Big O notation, recurrence relations, sorting algorithms, and graph traversal algorithms from Weeks 3 to 8. Review your lecture notes on Dijkstra\'s algorithm, Kruskal\'s MST, and the Master Theorem before attempting.',
      course_id: 'c2',
      lecturer_id: 'u4',
      deadline: d(4),
      type: 'quiz' as const,
      allow_retake: false,
      created_at: d(-1),
      questions: [
        { id: 'q1', question: 'What does Big O notation formally describe?', options: ['Average-case performance', 'Best-case performance', 'An upper bound on growth rate', 'Exact execution time in milliseconds'], correct: 2 },
        { id: 'q2', question: 'Which sorting algorithm guarantees O(n log n) time complexity in ALL cases?', options: ['Bubble Sort', 'Merge Sort', 'Insertion Sort', 'QuickSort'], correct: 1 },
        { id: 'q3', question: 'What is the space complexity of an iterative DFS using an explicit stack on a graph with V vertices?', options: ['O(1)', 'O(V)', 'O(V²)', 'O(E + V)'], correct: 1 },
        { id: 'q4', question: "Dijkstra's shortest path algorithm fails when the graph contains:", options: ['Multiple edges between same nodes', 'Negative weight edges', 'Disconnected components', 'Self-loops'], correct: 1 },
      ],
    },
    {
      id: 'a5',
      title: 'Graph Theory Problem Set',
      description: 'Complete all 10 problems in Chapter 5 of the prescribed textbook. Problems include: (1) Proving Euler\'s theorem for connected graphs, (2) Finding Hamiltonian circuits in the given graphs, (3) Applying Dijkstra\'s shortest path algorithm on the provided weighted directed graph, (4) Determining chromatic numbers using the greedy coloring algorithm, (5) Proving planarity or non-planarity of given graphs using Kuratowski\'s Theorem. Show all intermediate workings and cite relevant theorems by name and number.',
      course_id: 'c3',
      lecturer_id: 'u4',
      deadline: d(-2),
      type: 'assignment' as const,
      allow_retake: false,
      created_at: d(-14),
    },
    {
      id: 'a6',
      title: 'Market Analysis Report',
      description: 'Research and write a 1,500-word market analysis report on a company of your choice from the Fast-Moving Consumer Goods (FMCG) sector. Your report must include: (1) A company overview and market position statement, (2) A SWOT analysis with at least 4 points per quadrant, (3) Porter\'s Five Forces analysis for the FMCG sector, (4) A comparison of at least two major direct competitors using quantitative data, (5) Strategic recommendations for growth over the next 3 years with justification. Use at least 5 credible sources and cite them in APA 7th edition format. Attach your reference list at the end.',
      course_id: 'c4',
      lecturer_id: 'u5',
      deadline: d(6),
      type: 'assignment' as const,
      allow_retake: false,
      created_at: d(-5),
    },
    {
      id: 'a7',
      title: 'Business Fundamentals Quiz',
      description: 'This quiz tests your understanding of Chapters 1 through 4 covering business types, financial statements, cost classifications, pricing strategies, and macroeconomic principles. Review your study notes and lecture slides for Weeks 1 to 4 before attempting. You have one 45-minute window per attempt.',
      course_id: 'c4',
      lecturer_id: 'u5',
      deadline: d(3),
      type: 'quiz' as const,
      allow_retake: true,
      created_at: d(-2),
      questions: [
        { id: 'q1', question: 'What does GDP stand for?', options: ['General Distribution Protocol', 'Gross Domestic Product', 'Global Demand Pipeline', 'Governmental Development Plan'], correct: 1 },
        { id: 'q2', question: 'Which of the following is classified as a fixed cost for a manufacturing business?', options: ['Raw material costs', 'Sales commissions', 'Factory rent', 'Packaging and shipping'], correct: 2 },
        { id: 'q3', question: 'The break-even point is the level of output at which:', options: ['Total revenue equals total costs', 'Fixed costs are fully recovered', 'Profit exceeds variable costs', 'Sales volume is maximized'], correct: 0 },
        { id: 'q4', question: 'Which financial statement reports revenues, expenses, and profit over a period of time?', options: ['Balance Sheet', 'Statement of Cash Flows', 'Income Statement', 'Statement of Equity'], correct: 2 },
      ],
    },
    {
      id: 'a8',
      title: 'Calculus Problem Sheet 1 – Limits & Derivatives',
      description: 'Complete all 20 problems in Problem Sheet 1. Problems are grouped as follows: Section A (Problems 1–8) covers evaluating limits algebraically and using limit laws; Section B (Problems 9–12) requires applying L\'Hôpital\'s Rule to indeterminate forms; Section C (Problems 13–17) involves finding derivatives using the chain rule, product rule, and quotient rule; Section D (Problems 18–20) covers implicit differentiation and related rates applications. Show all intermediate steps clearly. A non-programmable calculator is permitted for Section D only.',
      course_id: 'c5',
      lecturer_id: 'u5',
      deadline: d(7),
      type: 'assignment' as const,
      allow_retake: false,
      created_at: d(-3),
    },
  ],
  submissions: [
    { id: 's1', assignment_id: 'a5', student_id: 'u2', status: 'graded' as const, submitted_at: d(-3), grade: '95', feedback: 'Excellent work on all sections. Your proof of Euler\'s theorem was well-structured and clearly argued. The Dijkstra\'s implementation was correct. Minor suggestion: provide more detail in the chromatic polynomial derivation in Problem 9.' },
    { id: 's2', assignment_id: 'a1', student_id: 'u2', status: 'submitted' as const, submitted_at: d(-1) },
  ],
  library_items: [
    { id: 'l1', title: 'Week 1 Lecture Slides – Introduction to Data Structures', type: 'pdf' as const, course_id: 'c1', department_id: 'd1', year_level: 2, lecturer_id: 'u4', uploaded_at: d(-30) },
    { id: 'l2', title: 'CS201 Lecture Recording – Week 3: Linked Lists & Stacks', type: 'video' as const, course_id: 'c1', department_id: 'd1', year_level: 2, lecturer_id: 'u4', uploaded_at: d(-21) },
    { id: 'l3', title: 'Algorithm Design Notes – Sorting & Searching Techniques', type: 'notes' as const, course_id: 'c2', department_id: 'd1', year_level: 2, lecturer_id: 'u4', uploaded_at: d(-14) },
    { id: 'l4', title: 'CS202 Tutorial Video – Merge Sort vs Quick Sort Analysis', type: 'video' as const, course_id: 'c2', department_id: 'd1', year_level: 2, lecturer_id: 'u4', uploaded_at: d(-10) },
    { id: 'l5', title: 'Discrete Mathematics – Complete Reference Sheet', type: 'pdf' as const, course_id: 'c3', department_id: 'd1', year_level: 2, lecturer_id: 'u4', uploaded_at: d(-7) },
    { id: 'l6', title: 'Week 5 Lecture Notes – Graph Theory Fundamentals', type: 'notes' as const, course_id: 'c3', department_id: 'd1', year_level: 2, lecturer_id: 'u4', uploaded_at: d(-5) },
    { id: 'l7', title: 'Introduction to Business – Week 1 Lecture Slides', type: 'pdf' as const, course_id: 'c4', department_id: 'd3', year_level: 1, lecturer_id: 'u5', uploaded_at: d(-25) },
    { id: 'l8', title: 'Business Case Studies Workbook – Weeks 1 & 2', type: 'pdf' as const, course_id: 'c4', department_id: 'd3', year_level: 1, lecturer_id: 'u5', uploaded_at: d(-18) },
    { id: 'l9', title: 'Calculus Tutorial Video – Understanding Limits Intuitively', type: 'video' as const, course_id: 'c5', department_id: 'd3', year_level: 1, lecturer_id: 'u5', uploaded_at: d(-12) },
    { id: 'l10', title: 'Calculus I Quick Reference – Formulas & Identities', type: 'pdf' as const, course_id: 'c5', department_id: 'd3', year_level: 1, lecturer_id: 'u5', uploaded_at: d(-6) },
  ],
  comments: [
    { id: 'cm1', assignment_id: 'a1', user_id: 'u4', content: 'Good effort so far. Make sure your delete operation correctly handles nodes with two children — use the in-order successor approach. Also, please add inline comments to your code explaining the logic at each major step. The grader will look for this.', created_at: d(-5) },
    { id: 'cm2', assignment_id: 'a1', user_id: 'u2', content: "Thank you, Prof. I'm struggling with the two-children delete case specifically. Is there a section in the textbook that explains it clearly? I've re-read the lecture notes but I'm still confused about which node to use as the replacement.", created_at: d(-4) },
    { id: 'cm3', assignment_id: 'a1', user_id: 'u4', content: "See CLRS Chapter 12, Section 12.3. The key insight is that the in-order successor of a node is the leftmost node in its right subtree — that's always a valid replacement. Try dry-running your algorithm on a tree of 7 nodes drawn on paper. Come to office hours on Thursday if you're still stuck.", created_at: d(-3) },
    { id: 'cm4', assignment_id: 'a2', user_id: 'u2', content: "Prof, just to confirm — will the quiz cover AVL trees and rebalancing, or only standard BSTs? I want to prioritise my revision time correctly before the deadline.", created_at: d(-2) },
    { id: 'cm5', assignment_id: 'a2', user_id: 'u4', content: "The quiz focuses on standard BSTs and the sorting algorithms covered in lectures. No AVL tree rotations will be tested. However, you should understand conceptually why balanced trees matter. Focus on traversal types and time complexities.", created_at: d(-1) },
    { id: 'cm6', assignment_id: 'a3', user_id: 'u4', content: "For Problem 3 (Matrix Chain Multiplication), make sure you are minimising the number of scalar multiplications, not additions — this is the most common mistake in past submissions. Refer to the recurrence relation on Lecture 7 Slide 14. Your memoized solution must show the DP table clearly.", created_at: d(-1) },
    { id: 'cm7', assignment_id: 'a6', user_id: 'u5', content: "Remember that your SWOT analysis must be evidence-based, not general assumptions. Use the company's most recent annual report and at least two independent industry publications. APA 7th edition citation format is mandatory — deductions apply for incorrect formatting.", created_at: d(-3) },
    { id: 'cm8', assignment_id: 'a6', user_id: 'u3', content: "Prof, is it acceptable to choose a company outside the FMCG sector if I can demonstrate its relevance? I have access to strong data for a technology company that overlaps significantly with FMCG distribution.", created_at: d(-2) },
    { id: 'cm9', assignment_id: 'a6', user_id: 'u5', content: "Please stick to the FMCG sector as specified in the brief. The sector-specific competitive dynamics are central to the learning objectives of this assignment. If you have concerns, bring them to office hours before making a different choice.", created_at: d(-1) },
  ],
  notifications: [
    { id: 'nt1', user_id: 'u2', type: 'grade' as const, message: 'Your "Graph Theory Problem Set" submission has been graded. Score: 95/100. Feedback available.', read: false, created_at: d(-2), link: '/student/assignments' },
    { id: 'nt2', user_id: 'u2', type: 'comment' as const, message: 'Prof. Sarah Chen replied to your question on "Binary Search Tree Implementation"', read: false, created_at: d(-3), link: '/student/assignments' },
    { id: 'nt3', user_id: 'u2', type: 'deadline' as const, message: 'CS201 Midterm Quiz is due in 2 days. You have not yet attempted this quiz.', read: true, created_at: d(-1), link: '/student/assignments' },
    { id: 'nt4', user_id: 'u2', type: 'comment' as const, message: 'Prof. Sarah Chen left a comment on "Binary Search Tree Implementation"', read: true, created_at: d(-5), link: '/student/assignments' },
    { id: 'nt5', user_id: 'u4', type: 'comment' as const, message: 'Alice Johnson asked a question on "Binary Search Tree Implementation"', read: false, created_at: d(-4), link: '/lecturer/assignments' },
    { id: 'nt6', user_id: 'u4', type: 'comment' as const, message: 'Alice Johnson commented on "CS201 Midterm Quiz"', read: true, created_at: d(-2), link: '/lecturer/assignments' },
    { id: 'nt7', user_id: 'u5', type: 'comment' as const, message: 'Bob Smith asked about the sector requirement for "Market Analysis Report"', read: false, created_at: d(-2), link: '/lecturer/assignments' },
  ],
  quiz_attempts: [] as QuizAttempt[],
};
