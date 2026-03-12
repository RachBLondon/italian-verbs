export type Pronoun = 'io' | 'tu' | 'lui/lei' | 'noi' | 'voi' | 'loro';

export const PRONOUNS: Pronoun[] = ['io', 'tu', 'lui/lei', 'noi', 'voi', 'loro'];

export type VerbEntry = {
  infinitive: string;
  english: string;
  present: Record<Pronoun, string>;
};
