import { buildAthleteRosterMock } from './bud.mocks';
import { createBudStore } from './bud.store';
import { createLocalBudBrain } from './localBrain';

export const budRoster = buildAthleteRosterMock();

export const budStore = createBudStore();

export const budBrain = createLocalBudBrain({ roster: budRoster });
