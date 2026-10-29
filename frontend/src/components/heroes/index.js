// Home page heroes. Change HERO_DEFAULT to pick the one the site uses;
// preview any of them with ?hero=ruler | board | question | deck on the home page.
import RulerHero from './RulerHero.jsx';
import BoardHero from './BoardHero.jsx';
import QuestionHero from './QuestionHero.jsx';
import DeckHero from './DeckHero.jsx';

export const HEROES = { ruler: RulerHero, board: BoardHero, question: QuestionHero, deck: DeckHero };
export const HERO_DEFAULT = 'question';
