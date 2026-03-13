// School Basketball Tournament Data
// All data extracted from tournament bracket images and schedules
import { useState, useEffect } from 'react';
import { resultsRef, onValue, set } from './firebase';

export const ADMIN_PIN = "1234";

export const courts = [
  { id: 1, name: "Court 1", location: "Indoor hoop near the gym lobby" },
  { id: 2, name: "Court 2", location: "Indoor hoop near the Stage" },
  { id: 3, name: "Court 3", location: "Black Top Court next to the Turf Field" },
  { id: 4, name: "Court 4", location: "Black Top Court near to the fence line" },
  { id: 5, name: "Court 5", location: "Portable Hoop on the Turf Field" },
];

// All teams organized by division
export const divisions = [
  "3rd Boys",
  "3rd Girls",
  "4th Boys",
  "4th Girls",
  "5th Boys",
  "5th Girls",
];

export const teams = [
  // --- 3rd Grade Boys ---
  { name: "Camo Cranberries", division: "3rd Boys", roster: ["Atticus Heath", "Field Lux", "Sean Zimmerman"] },
  { name: "Bucket Corgis", division: "3rd Boys", roster: ["Tripp Johnson", "Bennett Nelson", "Whit Payne"] },
  { name: "Net Swishers", division: "3rd Boys", roster: ["Peter Bryce", "Sam Hite", "Avett Teass"] },
  { name: "Grizzly Bears", division: "3rd Boys", roster: ["Austin Chorey", "Charles Freeman", "Zach Pleasants"] },
  { name: "Hersheys", division: "3rd Boys", roster: ["Luke Ashley", "Cohen Silvers", "Hugh White"] },
  { name: "Burnt Chicken Nuggets", division: "3rd Boys", roster: ["Graham Barrett", "Brooks Buerlein", "Liam Hanley", "Joshua Kim"] },
  { name: "The Hoops", division: "3rd Boys", roster: ["Knox Cunningham", "William Fields", "Liam Vu"] },
  { name: "Tropical Boys", division: "3rd Boys", roster: ["Aiden Campbell", "Pearse Moore", "Marvin Pivonka", "Ben Taylor"] },

  // --- 3rd Grade Girls ---
  { name: "The Bananas", division: "3rd Girls", roster: ["Mollie James Luck", "Selah Merrill", "Luciana Portell"] },
  { name: "Dunkin' Donuts", division: "3rd Girls", roster: ["Ruth Godwin", "Poppy Nash", "Campbell Smith"] },
  { name: "Neon Fruits", division: "3rd Girls", roster: ["Pate Crigler", "Aliyana Ellis-Monsanto", "Annabelle Guerreri", "Poppy Ring"] },
  { name: "Pink Superstars", division: "3rd Girls", roster: ["Olivia April", "Morgan Capogreco", "Addie Mae Davis", "James Joyce"] },
  { name: "Eagles", division: "3rd Girls", roster: ["Liv Dugger", "Lucy Farley", "Emmaline Mathas"] },
  { name: "Sassy Fashion", division: "3rd Girls", roster: ["Eliza Lynn", "Claire Robbins", "Eva Stump"] },
  { name: "Good Vibes", division: "3rd Girls", roster: ["Magnolia Baggett", "Olivia Keyser", "Maddie Ritter"] },
  { name: "Crazy Coconuts", division: "3rd Girls", roster: ["Anya Keng", "Isabel Lynn", "Olivia Grace Passanessi", "Junie Stauffer"] },

  // --- 4th Grade Boys ---
  { name: "BUNZ", division: "4th Boys", roster: ["Finn Gregory", "Coleman McFarland", "Hawkins Taliaferro"] },
  { name: "CC&G", division: "4th Boys", roster: ["Calvin McDonald", "Christian Pitts", "Gideon Will"] },
  { name: "Scammer Bananers", division: "4th Boys", roster: ["Daniel Chen", "Eli Rice", "George Sanders", "Aiden Shumate"] },
  { name: "NC Tarheels", division: "4th Boys", roster: ["John Robbins", "Johnny Smith", "Waylon Wood", "Wilson Wright"] },
  { name: "The Kobes", division: "4th Boys", roster: ["Emerson Gray", "Jack Payne", "William Peterson"] },
  { name: "Hoopers", division: "4th Boys", roster: ["Ethan Castline", "Luke Lawrence", "Ellis Parker", "Reece Vega"] },
  { name: "GOATS", division: "4th Boys", roster: ["Tyler Galie", "Sandor Nieto-Ralston", "Aiden Ross"] },
  { name: "Peppa Pig Biggies", division: "4th Boys", roster: ["Joseph Bates", "Luke Dizon", "Wesley Fields", "Goodwin Frazer"] },

  // --- 4th Grade Girls ---
  { name: "Nothing But Nets", division: "4th Girls", roster: ["Anna Jarrell", "Emmie Smith", "Elise Thompson"] },
  { name: "Triple Basket Girls", division: "4th Girls", roster: ["Winnie Greer", "Chloe Leedham", "Eila McKinney"] },
  { name: "The Sea Turtles", division: "4th Girls", roster: ["Darcy Fairchild", "Hadley McGarey", "Carter Teague"] },
  { name: "Pink Palm Trees", division: "4th Girls", roster: ["Olivia Bryne", "Charlotte King", "Mya Trudel", "Charlotte Turner"] },
  { name: "Super Stars", division: "4th Girls", roster: ["Addie Bouck", "Charlotte Canales", "Brynn Schweiker"] },
  { name: "Crumble Cookies", division: "4th Girls", roster: ["Priscilla Baggett", "Zoe Lee", "Emma Schuster"] },
  { name: "The Howlers", division: "4th Girls", roster: ["Harper Car", "CeCe McDonald", "Ella Turner"] },
  { name: "Dream Team Champions", division: "4th Girls", roster: ["Virginia Ball", "Zelie Moore", "Libby Thomas"] },

  // --- 5th Grade Boys (7 teams - Gnarly Dudes has a first-round bye) ---
  { name: "Gnarly Dudes", division: "5th Boys", roster: ["Hobson Herndon", "Ari Mannem", "Ben Weikel"] },
  { name: "Bucks", division: "5th Boys", roster: ["Eli Besecker", "James Griffin", "Jack Lukens"] },
  { name: "BKTSCWOD", division: "5th Boys", roster: ["Jacob Cavignac", "Eli Gala", "Landon White"] },
  { name: "Cliffbars Arent Healthy", division: "5th Boys", roster: ["Ethan Campbell", "Austin Morton", "Wyatt Pritchard"] },
  { name: "The Goats", division: "5th Boys", roster: ["Adrian Atcho", "George Hite", "George Moore"] },
  { name: "Knee Walkers", division: "5th Boys", roster: ["Grayson Lewis", "Emmett Noble", "Aiden Taylor"] },
  { name: "The Bucket Boys", division: "5th Boys", roster: ["Toddy Henderson", "Cars Luck", "Henry Pivonka"] },

  // --- 5th Grade Girls ---
  { name: "The Sawiches", division: "5th Girls", roster: ["Lauren Craddock", "Bonnie Froehlich", "Anna McConnell", "Johanna Venton"] },
  { name: "B-Ball Blizzards", division: "5th Girls", roster: ["Annala Brijbasse", "Liza Love Catalino", "Helen Glassick", "Serena Rossman"] },
  { name: "The Biggie Eagles", division: "5th Girls", roster: ["Josie Bartow", "Emily Gentzler", "Bea Hilliard", "Annabelle Walker"] },
  { name: "Ducky Dudes", division: "5th Girls", roster: ["Rose Godwin", "Kacey Kotarski", "Elise Lee"] },
  { name: "The A.Q. (Attitude Queens)", division: "5th Girls", roster: ["Alan Heath", "Josie O'Brien", "CeCe Stauffer"] },
  { name: "Da Thunderbolts", division: "5th Girls", roster: ["Laura Lee Aldrich", "Callie Martin", "Eva Moore", "Charlotte Sever"] },
  { name: "B-Ball Queens", division: "5th Girls", roster: ["Corinne Freeman", "Anna Huffman", "Faith Merrill", "Nora Mutter"] },
  { name: "The Blue Stars", division: "5th Girls", roster: ["Sophia Dakolios", "Keaton Griffith", "Vivian Henderson", "Georgia Walters"] },
];

// Bracket structure for each division
// Each division has 8 teams in standard seeded bracket: 1v8, 5v4, 3v6, 7v2
export const brackets = {
  "3rd Boys": {
    quarterFinals: [
      { gameId: "3B-QF1", team1: "Camo Cranberries", team2: "Bucket Corgis" },
      { gameId: "3B-QF2", team1: "Net Swishers", team2: "Grizzly Bears" },
      { gameId: "3B-QF3", team1: "Hersheys", team2: "Burnt Chicken Nuggets" },
      { gameId: "3B-QF4", team1: "The Hoops", team2: "Tropical Boys" },
    ],
    semiFinals: [
      { gameId: "3B-SF1", team1: null, team2: null, source: ["3B-QF1", "3B-QF2"] },
      { gameId: "3B-SF2", team1: null, team2: null, source: ["3B-QF3", "3B-QF4"] },
    ],
    final: [
      { gameId: "3B-F", team1: null, team2: null, source: ["3B-SF1", "3B-SF2"] },
    ],
  },
  "3rd Girls": {
    quarterFinals: [
      { gameId: "3G-QF1", team1: "The Bananas", team2: "Dunkin' Donuts" },
      { gameId: "3G-QF2", team1: "Neon Fruits", team2: "Pink Superstars" },
      { gameId: "3G-QF3", team1: "Eagles", team2: "Sassy Fashion" },
      { gameId: "3G-QF4", team1: "Good Vibes", team2: "Crazy Coconuts" },
    ],
    semiFinals: [
      { gameId: "3G-SF1", team1: null, team2: null, source: ["3G-QF1", "3G-QF2"] },
      { gameId: "3G-SF2", team1: null, team2: null, source: ["3G-QF3", "3G-QF4"] },
    ],
    final: [
      { gameId: "3G-F", team1: null, team2: null, source: ["3G-SF1", "3G-SF2"] },
    ],
  },
  "4th Boys": {
    quarterFinals: [
      { gameId: "4B-QF1", team1: "BUNZ", team2: "CC&G" },
      { gameId: "4B-QF2", team1: "Scammer Bananers", team2: "NC Tarheels" },
      { gameId: "4B-QF3", team1: "The Kobes", team2: "Hoopers" },
      { gameId: "4B-QF4", team1: "GOATS", team2: "Peppa Pig Biggies" },
    ],
    semiFinals: [
      { gameId: "4B-SF1", team1: null, team2: null, source: ["4B-QF1", "4B-QF2"] },
      { gameId: "4B-SF2", team1: null, team2: null, source: ["4B-QF3", "4B-QF4"] },
    ],
    final: [
      { gameId: "4B-F", team1: null, team2: null, source: ["4B-SF1", "4B-SF2"] },
    ],
  },
  "4th Girls": {
    quarterFinals: [
      { gameId: "4G-QF1", team1: "Nothing But Nets", team2: "Triple Basket Girls" },
      { gameId: "4G-QF2", team1: "The Sea Turtles", team2: "Pink Palm Trees" },
      { gameId: "4G-QF3", team1: "Super Stars", team2: "Crumble Cookies" },
      { gameId: "4G-QF4", team1: "The Howlers", team2: "Dream Team Champions" },
    ],
    semiFinals: [
      { gameId: "4G-SF1", team1: null, team2: null, source: ["4G-QF1", "4G-QF2"] },
      { gameId: "4G-SF2", team1: null, team2: null, source: ["4G-QF3", "4G-QF4"] },
    ],
    final: [
      { gameId: "4G-F", team1: null, team2: null, source: ["4G-SF1", "4G-SF2"] },
    ],
  },
  "5th Boys": {
    quarterFinals: [
      { gameId: "5B-QF1", team1: "Gnarly Dudes", team2: null, bye: true },
      { gameId: "5B-QF2", team1: "Bucks", team2: "BKTSCWOD" },
      { gameId: "5B-QF3", team1: "Cliffbars Arent Healthy", team2: "The Goats" },
      { gameId: "5B-QF4", team1: "Knee Walkers", team2: "The Bucket Boys" },
    ],
    semiFinals: [
      { gameId: "5B-SF1", team1: null, team2: null, source: ["5B-QF1", "5B-QF2"] },
      { gameId: "5B-SF2", team1: null, team2: null, source: ["5B-QF3", "5B-QF4"] },
    ],
    final: [
      { gameId: "5B-F", team1: null, team2: null, source: ["5B-SF1", "5B-SF2"] },
    ],
  },
  "5th Girls": {
    quarterFinals: [
      { gameId: "5G-QF1", team1: "The Sawiches", team2: "B-Ball Blizzards" },
      { gameId: "5G-QF2", team1: "The Biggie Eagles", team2: "Ducky Dudes" },
      { gameId: "5G-QF3", team1: "The A.Q. (Attitude Queens)", team2: "Da Thunderbolts" },
      { gameId: "5G-QF4", team1: "B-Ball Queens", team2: "The Blue Stars" },
    ],
    semiFinals: [
      { gameId: "5G-SF1", team1: null, team2: null, source: ["5G-QF1", "5G-QF2"] },
      { gameId: "5G-SF2", team1: null, team2: null, source: ["5G-QF3", "5G-QF4"] },
    ],
    final: [
      { gameId: "5G-F", team1: null, team2: null, source: ["5G-SF1", "5G-SF2"] },
    ],
  },
};

// Schedule: all games with court assignments and time slots
// Slot numbers represent the order of games on each court
export const schedule = [
  // Court 1 - Round 1
  { gameId: "5G-QF1", court: 1, slot: 1, round: "Quarter-Final", division: "5th Girls", team1: "The Sawiches", team2: "B-Ball Blizzards" },
  { gameId: "5B-QF2", court: 1, slot: 2, round: "Quarter-Final", division: "5th Boys", team1: "Bucks", team2: "BKTSCWOD" },
  { gameId: "5G-QF2", court: 1, slot: 3, round: "Quarter-Final", division: "5th Girls", team1: "The Biggie Eagles", team2: "Ducky Dudes" },
  { gameId: "5B-QF3", court: 1, slot: 4, round: "Quarter-Final", division: "5th Boys", team1: "Cliffbars Arent Healthy", team2: "The Goats" },
  { gameId: "5G-QF3", court: 1, slot: 5, round: "Quarter-Final", division: "5th Girls", team1: "The A.Q. (Attitude Queens)", team2: "Da Thunderbolts" },
  // Court 1 - Later rounds
  { gameId: "5G-SF1", court: 1, slot: 6, round: "Semi-Final", division: "5th Girls", team1: null, team2: null, label: "5th Grade Girls Semi-Final Game 1" },
  { gameId: "3B-SF1", court: 1, slot: 7, round: "Semi-Final", division: "3rd Boys", team1: null, team2: null, label: "3rd Grade Boys Semi-Final Game 1" },
  { gameId: "3B-SF2", court: 1, slot: 8, round: "Semi-Final", division: "3rd Boys", team1: null, team2: null, label: "3rd Grade Boys Semi-Final Game 2" },
  { gameId: "4B-F", court: 1, slot: 9, round: "Final", division: "4th Boys", team1: null, team2: null, label: "4th Grade Boys FINAL" },
  { gameId: "5B-F", court: 1, slot: 10, round: "Final", division: "5th Boys", team1: null, team2: null, label: "5th Grade Boys FINAL" },

  // Court 2 - Round 1
  { gameId: "4B-QF1", court: 2, slot: 1, round: "Quarter-Final", division: "4th Boys", team1: "BUNZ", team2: "CC&G" },
  { gameId: "4G-QF1", court: 2, slot: 2, round: "Quarter-Final", division: "4th Girls", team1: "Nothing But Nets", team2: "Triple Basket Girls" },
  { gameId: "4B-QF2", court: 2, slot: 3, round: "Quarter-Final", division: "4th Boys", team1: "Scammer Bananers", team2: "NC Tarheels" },
  { gameId: "4G-QF2", court: 2, slot: 4, round: "Quarter-Final", division: "4th Girls", team1: "The Sea Turtles", team2: "Pink Palm Trees" },
  { gameId: "4B-QF3", court: 2, slot: 5, round: "Quarter-Final", division: "4th Boys", team1: "The Kobes", team2: "Hoopers" },
  // Court 2 - Later rounds
  { gameId: "5B-SF1", court: 2, slot: 6, round: "Semi-Final", division: "5th Boys", team1: null, team2: null, label: "5th Grade Boys Semi-Final Game 1" },
  { gameId: "4G-SF1", court: 2, slot: 7, round: "Semi-Final", division: "4th Girls", team1: null, team2: null, label: "4th Grade Girls Semi-Final Game 1" },
  { gameId: "3G-F", court: 2, slot: 8, round: "Final", division: "3rd Girls", team1: null, team2: null, label: "3rd Grade Girls FINAL" },
  { gameId: "5G-F", court: 2, slot: 9, round: "Final", division: "5th Girls", team1: null, team2: null, label: "5th Grade Girls FINAL" },

  // Court 3 - Round 1
  { gameId: "5G-QF4", court: 3, slot: 1, round: "Quarter-Final", division: "5th Girls", team1: "The Blue Stars", team2: "B-Ball Queens" },
  { gameId: "4B-QF4", court: 3, slot: 2, round: "Quarter-Final", division: "4th Boys", team1: "Peppa Pig Biggies", team2: "GOATS" },
  { gameId: "4G-QF3", court: 3, slot: 3, round: "Quarter-Final", division: "4th Girls", team1: "Super Stars", team2: "Crumble Cookies" },
  { gameId: "5B-QF4", court: 3, slot: 4, round: "Quarter-Final", division: "5th Boys", team1: "The Bucket Boys", team2: "Knee Walkers" },
  { gameId: "4G-QF4", court: 3, slot: 5, round: "Quarter-Final", division: "4th Girls", team1: "Dream Team Champions", team2: "The Howlers" },
  // Court 3 - Later rounds
  { gameId: "5B-QF-PLAY", court: 3, slot: 6, round: "Quarter-Final", division: "5th Boys", team1: "Gnarly Dudes", team2: null, label: "Gnarly Dudes vs. Winner Game 1 (Court 1) (5B)" },
  { gameId: "5G-SF2", court: 3, slot: 7, round: "Semi-Final", division: "5th Girls", team1: null, team2: null, label: "5th Grade Girls Semi-Final Game 2" },
  { gameId: "3B-F", court: 3, slot: 8, round: "Final", division: "3rd Boys", team1: null, team2: null, label: "3rd Grade Boys FINAL" },

  // Court 4 - Round 1
  { gameId: "3B-QF1", court: 4, slot: 1, round: "Quarter-Final", division: "3rd Boys", team1: "Camo Cranberries", team2: "Bucket Corgis" },
  { gameId: "3B-QF2", court: 4, slot: 2, round: "Quarter-Final", division: "3rd Boys", team1: "Net Swishers", team2: "Grizzly Bears" },
  { gameId: "3B-QF3", court: 4, slot: 3, round: "Quarter-Final", division: "3rd Boys", team1: "Hersheys", team2: "Burnt Chicken Nuggets" },
  { gameId: "3B-QF4", court: 4, slot: 4, round: "Quarter-Final", division: "3rd Boys", team1: "Tropical Boys", team2: "The Hoops" },
  // Court 4 - Later rounds
  { gameId: "4B-SF2", court: 4, slot: 5, round: "Semi-Final", division: "4th Boys", team1: null, team2: null, label: "4th Grade Boys Semi-Final Game 2" },
  { gameId: "5B-SF2", court: 4, slot: 6, round: "Semi-Final", division: "5th Boys", team1: null, team2: null, label: "5th Grade Boys Semi-Final Game 2" },
  { gameId: "4G-F", court: 4, slot: 7, round: "Final", division: "4th Girls", team1: null, team2: null, label: "4th Grade Girls FINAL" },

  // Court 5 - Round 1
  { gameId: "3G-QF1", court: 5, slot: 1, round: "Quarter-Final", division: "3rd Girls", team1: "The Bananas", team2: "Dunkin' Donuts" },
  { gameId: "3G-QF2", court: 5, slot: 2, round: "Quarter-Final", division: "3rd Girls", team1: "Neon Fruits", team2: "Pink Superstars" },
  { gameId: "3G-QF3", court: 5, slot: 3, round: "Quarter-Final", division: "3rd Girls", team1: "Eagles", team2: "Sassy Fashion" },
  { gameId: "3G-QF4", court: 5, slot: 4, round: "Quarter-Final", division: "3rd Girls", team1: "Crazy Coconuts", team2: "Good Vibes" },
  // Court 5 - Later rounds
  { gameId: "3G-SF1", court: 5, slot: 5, round: "Semi-Final", division: "3rd Girls", team1: null, team2: null, label: "3rd Grade Girls Semi-Final Game 1" },
  { gameId: "3G-SF2", court: 5, slot: 6, round: "Semi-Final", division: "3rd Girls", team1: null, team2: null, label: "3rd Grade Girls Semi-Final Game 2" },
  { gameId: "4G-SF2", court: 5, slot: 7, round: "Semi-Final", division: "4th Girls", team1: null, team2: null, label: "4th Grade Girls Semi-Final Game 2" },
];

// Build player lookup: maps player name -> { teamName, division }
export const playerLookup = {};
teams.forEach((team) => {
  team.roster.forEach((player) => {
    playerLookup[player] = { teamName: team.name, division: team.division };
  });
});

// Helper: get all games for a specific team
export function getTeamSchedule(teamName) {
  return schedule.filter(
    (game) => game.team1 === teamName || game.team2 === teamName
  );
}

// Helper: get team info by name
export function getTeamByName(teamName) {
  return teams.find((t) => t.name === teamName);
}

// Helper: get all teams in a division
export function getTeamsByDivision(division) {
  return teams.filter((t) => t.division === division);
}

// Helper: get bracket for a division
export function getBracket(division) {
  return brackets[division];
}

// Game results storage with Firebase sync
const RESULTS_KEY = "tournament-results";
const SELECTED_CHILDREN_KEY = "tournament-selected-children";
const ACTIVE_CHILD_KEY = "tournament-active-child-index";

// In-memory cache and subscriber system
let _results = {};
const _subscribers = new Set();

function _notifySubscribers() {
  const snapshot = { ..._results };
  _subscribers.forEach((cb) => cb(snapshot));
}

// Initialize: seed from localStorage, then attach Firebase listener
export function initResultsSync() {
  // Seed from localStorage for instant load
  try {
    const stored = localStorage.getItem(RESULTS_KEY);
    if (stored) _results = JSON.parse(stored);
  } catch {}

  // Attach Firebase real-time listener
  if (resultsRef) {
    onValue(resultsRef, (snapshot) => {
      const data = snapshot.val();
      _results = data || {};
      // Keep localStorage in sync as offline cache
      localStorage.setItem(RESULTS_KEY, JSON.stringify(_results));
      _notifySubscribers();
    });
  }
}

// Subscribe to results changes — returns unsubscribe function
export function subscribeToResults(callback) {
  _subscribers.add(callback);
  return () => _subscribers.delete(callback);
}

// React hook for components
export function useGameResults() {
  const [results, setResults] = useState(() => ({ ..._results }));
  useEffect(() => {
    const unsub = subscribeToResults((r) => setResults(r));
    return unsub;
  }, []);
  return results;
}

export function getGameResults() {
  return { ..._results };
}

function _persistResults() {
  localStorage.setItem(RESULTS_KEY, JSON.stringify(_results));
  if (resultsRef) {
    set(resultsRef, _results).catch((e) => console.error('Firebase write error:', e));
  }
  _notifySubscribers();
}

export function saveGameResult(gameId, score1, score2, winner) {
  _results[gameId] = { score1, score2, winner };
  _persistResults();
}

export function clearAllResults() {
  _results = {};
  localStorage.removeItem(RESULTS_KEY);
  if (resultsRef) {
    set(resultsRef, null).catch((e) => console.error('Firebase write error:', e));
  }
  _notifySubscribers();
}

export function getDownstreamGameIds(gameId) {
  // Find all games in any bracket that depend on this game's result
  const downstream = [];
  for (const division of divisions) {
    const bracket = brackets[division];
    if (!bracket) continue;
    const allGames = [...bracket.quarterFinals, ...bracket.semiFinals, ...bracket.final];
    // BFS: find games whose source includes this gameId, then their dependents
    const queue = [gameId];
    while (queue.length > 0) {
      const current = queue.shift();
      for (const g of allGames) {
        if (g.source && g.source.includes(current) && !downstream.includes(g.gameId)) {
          downstream.push(g.gameId);
          queue.push(g.gameId);
        }
      }
    }
  }
  return downstream;
}

export function clearGameResult(gameId) {
  const toClear = [gameId, ...getDownstreamGameIds(gameId)];
  toClear.forEach((id) => delete _results[id]);
  _persistResults();
}

export function clearDivisionResults(division) {
  const bracket = brackets[division];
  if (!bracket) return;
  const gameIds = new Set();
  bracket.quarterFinals.forEach((g) => gameIds.add(g.gameId));
  bracket.semiFinals.forEach((g) => gameIds.add(g.gameId));
  bracket.final.forEach((g) => gameIds.add(g.gameId));
  gameIds.forEach((id) => delete _results[id]);
  _persistResults();
}

// Multi-child support
export function getSelectedChildren() {
  try {
    const stored = localStorage.getItem(SELECTED_CHILDREN_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getActiveChildIndex() {
  try {
    const stored = localStorage.getItem(ACTIVE_CHILD_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

export function setActiveChildIndex(index) {
  localStorage.setItem(ACTIVE_CHILD_KEY, String(index));
}

export function getSelectedChild() {
  const children = getSelectedChildren();
  if (children.length === 0) return null;
  const idx = getActiveChildIndex();
  return children[Math.min(idx, children.length - 1)] || null;
}

export function saveSelectedChild(playerName, teamName, division) {
  const children = getSelectedChildren();
  const existing = children.findIndex(
    (c) => c.playerName === playerName && c.teamName === teamName
  );
  if (existing >= 0) {
    setActiveChildIndex(existing);
    return;
  }
  children.push({ playerName, teamName, division });
  localStorage.setItem(SELECTED_CHILDREN_KEY, JSON.stringify(children));
  setActiveChildIndex(children.length - 1);
}

export function removeChild(index) {
  const children = getSelectedChildren();
  children.splice(index, 1);
  localStorage.setItem(SELECTED_CHILDREN_KEY, JSON.stringify(children));
  const activeIdx = getActiveChildIndex();
  if (activeIdx >= children.length) {
    setActiveChildIndex(Math.max(0, children.length - 1));
  }
}

export function clearSelectedChild() {
  localStorage.removeItem(SELECTED_CHILDREN_KEY);
  localStorage.removeItem(ACTIVE_CHILD_KEY);
}

// Elimination & next game helpers
export function isTeamEliminated(teamName, division) {
  const results = getGameResults();
  const bracket = getBracket(division);
  if (!bracket) return false;

  const resolved = resolveFullBracket(bracket, results);
  const allGames = [
    ...resolved.quarterFinals,
    ...resolved.semiFinals,
    ...resolved.final,
  ];

  for (const game of allGames) {
    const r = results[game.gameId];
    if (r && r.winner && (game.team1 === teamName || game.team2 === teamName)) {
      if (r.winner !== teamName) return true;
    }
  }
  return false;
}

export function getTeamNextGame(teamName, division) {
  const results = getGameResults();
  const bracket = getBracket(division);
  if (!bracket) return null;

  const resolved = resolveFullBracket(bracket, results);
  const allGames = [
    ...resolved.quarterFinals,
    ...resolved.semiFinals,
    ...resolved.final,
  ];

  for (const game of allGames) {
    if (game.team1 === teamName || game.team2 === teamName) {
      const r = results[game.gameId];
      if (!r || r.winner == null) {
        const scheduleEntry = schedule.find((s) => s.gameId === game.gameId);
        return {
          gameId: game.gameId,
          opponent: game.team1 === teamName ? game.team2 : game.team1,
          round: scheduleEntry?.round || '',
          court: scheduleEntry?.court,
          slot: scheduleEntry?.slot,
          game,
        };
      }
    }
  }
  return null;
}

// Resolve bracket fully (exported for reuse)
export function resolveFullBracket(bracket, results) {
  const resolved = JSON.parse(JSON.stringify(bracket));

  function getWinner(game, result) {
    if (game.bye) return { winner: game.team1 };
    if (result && result.winner) {
      return { winner: result.winner };
    }
    return null;
  }

  resolved.semiFinals.forEach((sf) => {
    if (sf.source) {
      const [src1Id, src2Id] = sf.source;
      const src1 = resolved.quarterFinals.find((g) => g.gameId === src1Id);
      const src2 = resolved.quarterFinals.find((g) => g.gameId === src2Id);
      const w1 = getWinner(src1, results[src1Id]);
      const w2 = getWinner(src2, results[src2Id]);
      if (w1) { sf.team1 = w1.winner; }
      if (w2) { sf.team2 = w2.winner; }
    }
  });

  resolved.final.forEach((f) => {
    if (f.source) {
      const [src1Id, src2Id] = f.source;
      const r1 = results[src1Id];
      const r2 = results[src2Id];
      if (r1 && r1.winner) {
        f.team1 = r1.winner;
      }
      if (r2 && r2.winner) {
        f.team2 = r2.winner;
      }
    }
  });

  return resolved;
}
