// Data shapes the frontend expects from the backend (JSDoc only — no runtime code).
// Field names are camelCase. Anything marked optional may be omitted or null.

/**
 * @typedef {Object} ClassSummary
 * @property {string} id              URL-safe id, e.g. "cs-240"
 * @property {string} code            "CS 240"
 * @property {string} title           "Data Structures & Algorithms"
 * @property {string} department      "Computer Science"
 * @property {number} credits
 * @property {number|null} score      0–5 average, null when fewer than 5 scores
 * @property {number} reviewCount
 * @property {number|null} workload    1–5 average
 * @property {number|null} difficulty  1–5 average
 * @property {number|null} lecture     1–5 average
 * @property {number|null} retakePct   0–100, share who answered "Yes"
 * @property {number|null=} hoursPerWeek  typical hours outside class (used by the semester weigh-in)
 * @property {string=} topInstructor  most-reviewed instructor, "Rivera, M."
 * @property {string=} quote          a short line from the most helpful review
 * @property {string=} highlight      phrase inside `quote` to underline
 * @property {boolean=} isFavorite    for the signed-in user
 */

/**
 * @typedef {ClassSummary & {
 *   prereqs: string[], terms: string[], sections: number, hoursPerWeek: number|null, description: string,
 *   instructors: {name: string, reviewCount: number, score: number|null}[],
 *   tags: {label: string, count: number}[],
 *   reviewTerms: string[],
 *   myReviewId: string|null   the signed-in user's review of this class, if any
 * }} ClassDetail
 */

/** @typedef {ClassSummary & { rank: number, tip?: string }} RankedClass  tip = "what helps" line for the bottom 10 */

/**
 * @typedef {Object} SearchResult
 * @property {ClassSummary[]} items
 * @property {number} total
 * @property {number} page
 * @property {number} pageSize
 * @property {{label: string, count: number}[]} tagCounts  tag counts across all matches (for the filter list)
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} classId
 * @property {string=} classCode
 * @property {string=} classTitle
 * @property {number} score       1–5
 * @property {number} workload    1–5
 * @property {number} difficulty  1–5
 * @property {number} lecture     1–5
 * @property {"Yes"|"Maybe"|"No"} retake
 * @property {string} text
 * @property {string=} highlight
 * @property {string[]} tags
 * @property {string} instructor
 * @property {string} term        "Fall 2026"
 * @property {string=} year       "Sophomore" (omitted when the author hides it)
 * @property {string=} grade
 * @property {number} helpful
 * @property {boolean=} helpfulByMe
 * @property {boolean=} mine
 * @property {string} createdAt   ISO date
 */

/** @typedef {{ score: number, workload: number, difficulty: number, lecture: number, retake: string, text: string, highlight?: string, tags: string[], instructor: string, term: string, grade?: string }} NewReview */

/** @typedef {{ department: string, prefix: string, number: string, title: string, credits: number, prereqs: string[], instructors: string[], terms: string[], description?: string, catalogUrl?: string }} NewClass */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} displayName
 * @property {string} email
 * @property {boolean} verified
 * @property {string} school
 * @property {string=} major
 * @property {string} classYear
 * @property {string} memberSince  ISO date
 * @property {{ notifyFavorites: boolean, notifyRemind: boolean, notifyHelpful: boolean, showYear: boolean }} prefs
 * @property {{ reviews: number, helpful: number, favorites: number, classesAdded: number }} stats
 */

/** @typedef {ClassSummary & { savedAt: string }} Favorite */

export {};
