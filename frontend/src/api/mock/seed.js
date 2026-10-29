// Sample data for mock mode. All names, scores and reviews are made up.
// Each class lists target averages; the generator in ./db.js builds individual reviews that match them.

export const SCHOOL = 'Midstate University';

export const TAGS = ['Clear rubric', 'Tough grader', 'Curve', 'Project heavy', 'Attendance taken', 'Open-note exams',
  'Group work', 'Lots of reading', 'Weekly homework', 'Great lectures', 'No attendance'];

export const TERMS = ['Fall 2026', 'Spring 2026', 'Fall 2025', 'Spring 2025', 'Fall 2024'];
export const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

// [code, title, department, credits, {score, n, workload, difficulty, lecture, retake}, instructors[[name, share]], tags{label: weight}, extras]
export const CLASSES = [
  ['CS 240', 'Data Structures & Algorithms', 'Computer Science', 4, { score: 4.6, n: 128, workload: 4.1, difficulty: 3.0, lecture: 4.8, retake: 92 },
    [['Rivera, M.', 64], ['Chen, L.', 31], ['Abara, K.', 19], ['Novak, P.', 14]], { 'Clear rubric': 0.7, 'Project heavy': 0.6, Curve: 0.4, 'Tough grader': 0.17 },
    { prereqs: ['CS 140'], terms: ['Fall', 'Spring'], sections: 4, hoursPerWeek: 8, description: 'Lists, stacks, queues, trees, heaps, hashing and graphs, with weekly programming projects.',
      featured: [
        { score: 5, term: 'Fall 2026', instructor: 'Rivera, M.', year: 'Sophomore', text: 'Lectures build every structure from scratch on the board, so you actually see why a heap works. Start each project the day it drops — the last two take a full week. Thursday office hours are gold.', highlight: 'Start each project the day it drops', tags: ['Clear rubric', 'Project heavy'], helpful: 41, mine: true, workload: 4, difficulty: 3, lecture: 5, retake: 'Yes' },
        { score: 3, term: 'Spring 2026', instructor: 'Chen, L.', year: 'Junior', text: 'Fair but fast. The midterm was harder than the practice exam and there was no curve that term. If you squeaked through CS 140, review recursion over winter break.', highlight: 'review recursion over winter break', tags: ['Tough grader'], helpful: 27 },
        { score: 5, term: 'Fall 2026', instructor: 'Rivera, M.', year: 'Sophomore', text: 'The autograder gives instant feedback, so you know your grade before you submit. Group work is optional. The textbook was useless — the slides are everything.', highlight: 'the slides are everything', tags: ['Clear rubric', 'Curve'], helpful: 18 },
      ] }],
  ['PSY 110', 'Introduction to Psychology', 'Psychology', 3, { score: 4.8, n: 61, workload: 2.2, difficulty: 2.0, lecture: 4.9, retake: 95 },
    [['Okafor, J.', 1]], { 'Great lectures': 0.8, 'Clear rubric': 0.5, 'Open-note exams': 0.3 },
    { terms: ['Fall', 'Spring', 'Summer'], sections: 6, hoursPerWeek: 4, quote: 'Every lecture ends with a study you can use on the exam. Go to class.', highlight: 'Go to class',
      featured: [{ score: 5, term: 'Spring 2025', instructor: 'Okafor, J.', year: 'Freshman', text: 'Every lecture ends with a study you can use on the exam. Go to class.', highlight: 'Go to class', tags: ['Great lectures'], helpful: 13, mine: true, workload: 2, difficulty: 2, lecture: 5, retake: 'Yes' }] }],
  ['IT 168', 'Structured Problem Solving', 'Information Technology', 4, { score: 4.7, n: 47, workload: 3.0, difficulty: 2.6, lecture: 4.6, retake: 90 },
    [['Patel, R.', 1]], { 'Clear rubric': 0.6, 'Weekly homework': 0.5, 'Great lectures': 0.4 },
    { terms: ['Fall', 'Spring'], sections: 5, hoursPerWeek: 6, quote: 'Best intro class here. Labs are where it clicks.', highlight: 'Labs are where it clicks' }],
  ['HIST 135', 'Modern World History', 'History', 3, { score: 4.5, n: 24, workload: 2.6, difficulty: 2.3, lecture: 4.8, retake: 91 },
    [['Brennan, D.', 1]], { 'Lots of reading': 0.7, 'Great lectures': 0.7 },
    { terms: ['Fall', 'Spring'], sections: 2, hoursPerWeek: 5, quote: 'Lectures feel like stories. The final paper is the only big stress.', highlight: 'feel like stories' }],
  ['CS 140', 'Intro to Programming in Python', 'Computer Science', 4, { score: 4.5, n: 52, workload: 2.8, difficulty: 2.4, lecture: 4.5, retake: 89 },
    [['Rivera, M.', 0.7], ['Abara, K.', 0.3]], { 'Clear rubric': 0.6, 'Weekly homework': 0.6, 'Great lectures': 0.3 },
    { terms: ['Fall', 'Spring', 'Summer'], sections: 8, hoursPerWeek: 6, quote: 'Never coded before? This is the one. Go to every lab.', highlight: 'Go to every lab',
      featured: [{ score: 4, term: 'Spring 2026', instructor: 'Rivera, M.', year: 'Freshman', text: 'Great first class. Go to every lab — that is where it clicks.', highlight: 'Go to every lab', tags: ['Weekly homework'], helpful: 22, mine: true, workload: 3, difficulty: 2, lecture: 4, retake: 'Yes' }] }],
  ['IT 179', 'Intro to Data Structures', 'Information Technology', 4, { score: 4.4, n: 26, workload: 3.1, difficulty: 2.9, lecture: 4.2, retake: 83 },
    [['Lindgren, T.', 1]], { 'Weekly homework': 0.7, 'Clear rubric': 0.6 },
    { prereqs: ['IT 168'], terms: ['Fall', 'Spring'], sections: 3, hoursPerWeek: 7, quote: 'Weekly homework, but the rubric is crystal clear.', highlight: 'crystal clear' }],
  ['DS 101', 'Programming for Data Analysis', 'Data Science', 3, { score: 4.3, n: 23, workload: 2.0, difficulty: 2.6, lecture: 4.2, retake: 88 },
    [['Osei, B.', 1]], { 'Project heavy': 0.4, 'Clear rubric': 0.5, 'Open-note exams': 0.4 },
    { terms: ['Fall', 'Spring'], sections: 2, hoursPerWeek: 5, quote: 'Every assignment uses a real data set. Office hours are worth it.', highlight: 'real data set' }],
  ['ENG 101', 'Composition & Rhetoric', 'English', 3, { score: 4.2, n: 29, workload: 2.9, difficulty: 2.4, lecture: 4.0, retake: 80 },
    [['Haddad, S.', 0.6], ['Moreau, A.', 0.4]], { 'Lots of reading': 0.5, 'Attendance taken': 0.6 },
    { terms: ['Fall', 'Spring', 'Summer'], sections: 14, hoursPerWeek: 5, quote: 'Drafts get real comments, not just a grade.', highlight: 'real comments',
      featured: [{ score: 4, term: 'Fall 2025', instructor: 'Haddad, S.', year: 'Freshman', text: 'Drafts get real comments. Peer review days are actually useful.', highlight: 'Peer review days', tags: ['Attendance taken'], helpful: 17, mine: true, workload: 3, difficulty: 2, lecture: 4, retake: 'Yes' }] }],
  ['CS 330', 'Databases', 'Computer Science', 3, { score: 4.1, n: 21, workload: 3.0, difficulty: 3.4, lecture: 3.9, retake: 79 },
    [['Kim, S.', 1]], { 'Group work': 0.7, 'Project heavy': 0.6 },
    { prereqs: ['CS 240'], terms: ['Fall', 'Spring'], sections: 2, hoursPerWeek: 7, quote: 'Group project is the whole class. Pick your team early.', highlight: 'Pick your team early' }],
  ['CS 141', 'Programming II', 'Computer Science', 4, { score: 4.0, n: 31, workload: 3.2, difficulty: 3.0, lecture: 3.8, retake: 77 },
    [['Chen, L.', 1]], { 'Clear rubric': 0.5, 'Weekly homework': 0.5 },
    { prereqs: ['CS 140'], terms: ['Fall', 'Spring'], sections: 4, hoursPerWeek: 6, quote: 'Steady workload, fair exams, no surprises.', highlight: 'no surprises' }],
  ['MUS 105', 'History of Rock', 'Music', 3, { score: 3.6, n: 18, workload: 1.8, difficulty: 1.6, lecture: 3.5, retake: 70 },
    [['Vance, C.', 1]], { 'Weekly homework': 0.5, 'Open-note exams': 0.4 },
    { terms: ['Fall', 'Spring', 'Online'], sections: 3, hoursPerWeek: 3, quote: 'Easy gen-ed. Quizzes every week, so keep up with the listening.', highlight: 'keep up with the listening' }],
  ['MATH 130', 'Computing for Mathematics', 'Mathematics', 3, { score: 3.6, n: 11, workload: 2.2, difficulty: 2.8, lecture: 3.4, retake: 72 },
    [['Duarte, F.', 1]], { 'Weekly homework': 0.6 }, { terms: ['Spring'], sections: 1, hoursPerWeek: 5 }],
  ['MATH 145', 'Calculus I', 'Mathematics', 4, { score: 3.4, n: 30, workload: 3.6, difficulty: 3.6, lecture: 3.3, retake: 61 },
    [['Lindqvist, E.', 0.6], ['Duarte, F.', 0.4]], { 'Weekly homework': 0.8, Curve: 0.3 },
    { terms: ['Fall', 'Spring', 'Summer'], sections: 9, hoursPerWeek: 8,
      featured: [{ score: 3, term: 'Fall 2025', instructor: 'Lindqvist, E.', year: 'Freshman', text: 'Weekly homework is long, but the exams match the review sheets.', highlight: 'the exams match the review sheets', tags: ['Weekly homework'], helpful: 19, mine: true, workload: 4, difficulty: 3, lecture: 3, retake: 'Maybe' }] }],
  ['CS 310', 'Operating Systems', 'Computer Science', 4, { score: 2.6, n: 22, workload: 4.8, difficulty: 4.6, lecture: 2.8, retake: 54 },
    [['Novak, P.', 1]], { 'Project heavy': 0.8, 'Tough grader': 0.6 },
    { prereqs: ['CS 240'], terms: ['Fall'], sections: 1, hoursPerWeek: 12, tip: 'Start projects week one and use the TA hours.' }],
  ['CHEM 140', 'General Chemistry I', 'Chemistry', 4, { score: 2.1, n: 44, workload: 4.4, difficulty: 4.5, lecture: 2.4, retake: 31 },
    [['Hale, R.', 0.6], ['Ibarra, N.', 0.4]], { 'Tough grader': 0.6, 'Weekly homework': 0.7, 'Attendance taken': 0.4 },
    { terms: ['Fall', 'Spring'], sections: 6, hoursPerWeek: 10, tip: 'Do every practice problem. The exams are built from them.' }],
  ['BIO 196', 'Biological Diversity', 'Biology', 4, { score: 2.4, n: 37, workload: 4.2, difficulty: 4.0, lecture: 2.6, retake: 38 },
    [['Sato, K.', 1]], { 'Lots of reading': 0.8, 'Tough grader': 0.4 },
    { terms: ['Fall', 'Spring'], sections: 4, hoursPerWeek: 9, tip: 'Read before lecture, not after. Labs take longer than listed.' }],
  ['PHYS 110', 'College Physics I', 'Physics', 4, { score: 2.7, n: 33, workload: 4.0, difficulty: 4.3, lecture: 2.9, retake: 42 },
    [['Brandt, H.', 1]], { 'Weekly homework': 0.7, 'Tough grader': 0.5 },
    { terms: ['Fall', 'Spring'], sections: 3, hoursPerWeek: 9, tip: 'Old exams are on reserve at the library.' }],
  ['MATH 147', 'Calculus II', 'Mathematics', 4, { score: 2.8, n: 48, workload: 4.1, difficulty: 4.4, lecture: 3.0, retake: 44 },
    [['Lindqvist, E.', 0.5], ['Pryor, J.', 0.5]], { 'Weekly homework': 0.8, Curve: 0.4 },
    { prereqs: ['MATH 145'], terms: ['Fall', 'Spring'], sections: 6, hoursPerWeek: 9, tip: 'Form a study group for the series unit.' }],
  ['ACC 131', 'Financial Accounting', 'Accounting', 3, { score: 2.9, n: 29, workload: 3.6, difficulty: 3.8, lecture: 2.9, retake: 47 },
    [['Fenwick, L.', 1]], { 'Weekly homework': 0.8 }, { terms: ['Fall', 'Spring'], sections: 5, hoursPerWeek: 7, tip: 'Homework is auto-graded. Use the unlimited retries.' }],
  ['ECO 105', 'Principles of Economics', 'Economics', 3, { score: 3.0, n: 40, workload: 3.0, difficulty: 3.4, lecture: 3.0, retake: 50 },
    [['Mbeki, T.', 1]], { 'Attendance taken': 0.6, 'Weekly homework': 0.5 }, { terms: ['Fall', 'Spring', 'Online'], sections: 7, hoursPerWeek: 5, tip: 'Weekly quizzes add up. Never skip one.' }],
  ['STA 120', 'Statistics I', 'Mathematics', 3, { score: 3.0, n: 36, workload: 3.2, difficulty: 3.5, lecture: 2.9, retake: 52 },
    [['Ruiz, D.', 0.5], ['Pryor, J.', 0.5]], { 'Weekly homework': 0.6, 'Open-note exams': 0.3 }, { terms: ['Fall', 'Spring'], sections: 6, hoursPerWeek: 6, tip: 'Take the 11am section if you can.' }],
  ['CHEM 141', 'General Chemistry II', 'Chemistry', 4, { score: 3.1, n: 21, workload: 4.0, difficulty: 4.1, lecture: 3.2, retake: 55 },
    [['Ibarra, N.', 1]], { 'Weekly homework': 0.6, Curve: 0.5 }, { prereqs: ['CHEM 140'], terms: ['Spring'], sections: 3, hoursPerWeek: 9, tip: 'Supplemental instruction sessions really help.' }],
  ['IT 261', 'Systems Development', 'Information Technology', 3, { score: 3.1, n: 20, workload: 3.6, difficulty: 3.1, lecture: 3.0, retake: 56 },
    [['Okonkwo, E.', 1]], { 'Group work': 0.9, 'Project heavy': 0.6 }, { prereqs: ['IT 179'], terms: ['Fall', 'Spring'], sections: 2, hoursPerWeek: 7, tip: 'Clear the group roles on day one.' }],
  ['CS 351', 'Computer Networks', 'Computer Science', 3, { score: 3.8, n: 3, workload: 3.4, difficulty: 3.3, lecture: 3.8, retake: 67 },
    [['Abara, K.', 1]], { 'Project heavy': 0.5 }, { prereqs: ['CS 240'], terms: ['Fall', 'Spring'], sections: 1, hoursPerWeek: 7, description: 'Network layers, TCP/IP, routing and socket programming, with weekly labs.' }],
];

// Short lines the generator mixes into reviews for the bulk of each class's scores.
export const LINES = {
  high: ['Would take it again in a heartbeat.', 'Office hours make a huge difference.', 'Clear expectations from day one.', 'You learn a lot without feeling buried.',
    'The instructor clearly cares whether you get it.', 'Exams look exactly like the practice material.', 'One of the better classes I have taken here.'],
  mid: ['Fine overall. Keep up and you will be okay.', 'Some weeks are heavy, others are easy.', 'Lectures are hit or miss, the homework is where you learn.',
    'Fair, but do not fall behind.', 'Not exciting, but you get what you need.'],
  low: ['Plan for a lot more hours than the syllabus says.', 'Exams are much harder than the homework.', 'Find a study group early — you will need it.',
    'Grading felt inconsistent between sections.', 'Brutal pace. Go to every review session.'],
};

export const DEMO_USER = {
  id: 'u-ct', displayName: 'ct_builds', email: 'ctaylor@midstate.edu', verified: true, school: SCHOOL, major: 'Computer Science', classYear: '2028',
  memberSince: '2026-08-15', prefs: { notifyFavorites: true, notifyRemind: true, notifyHelpful: false, showYear: true }, classesAdded: 1,
};

export const DEMO_FAVORITES = [['hist-135', '2026-10-20'], ['ds-101', '2026-10-18'], ['cs-330', '2026-10-11'], ['mus-105', '2026-10-02'], ['cs-351', '2026-09-28']];
export const DEMO_TO_SCORE = ['math-147', 'it-168'];
