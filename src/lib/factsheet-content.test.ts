import { describe, it, expect } from 'vitest';
import { getFactsheetContent, getAllFactsheetContent, isOutOfScope, getOfflineAssistantResponse, hasIndicatorVocabulary, isMetaQuestion, OUT_OF_SCOPE_RESPONSE } from './factsheet-content';

describe('factsheet-content', () => {
  it('returns factsheet content for a valid indicator ID', () => {
    const result = getFactsheetContent('BMI-01');
    expect(result).toBeTruthy();
    expect(result!.id).toBe('BMI-01');
    expect(result!.name).toBe('Benthic Macroinvertebrates');
    expect(result!.citizen_question).toBeTruthy();
    expect(result!.citizen_state_labels).toBeDefined();
  });

  it('returns null for an invalid indicator ID', () => {
    const result = getFactsheetContent('INVALID');
    expect(result).toBeNull();
  });

  it('returns all factsheet content for citizen-observable indicators', () => {
    const all = getAllFactsheetContent();
    expect(all.length).toBeGreaterThan(0);
    all.forEach((entry) => {
      expect(entry.citizen_question).toBeTruthy();
      expect(entry.source).toBeTruthy();
    });
  });

  it('marks lab-only indicators correctly', () => {
    const fcl = getFactsheetContent('FCL-06');
    expect(fcl).toBeTruthy();
    expect(fcl!.lab_only).toBe(true);

    const dia = getFactsheetContent('DIA-10');
    expect(dia).toBeTruthy();
    expect(dia!.lab_only).toBe(true);
  });

  it('isOutOfScope returns true for diagnostic questions', () => {
    expect(isOutOfScope('What tier is my stream?')).toBe(true);
    expect(isOutOfScope('Is my stream healthy?')).toBe(true);
    expect(isOutOfScope('What score does this get?')).toBe(true);
  });

  it('isOutOfScope returns false for observation questions', () => {
    expect(isOutOfScope('What macroinvertebrates do you see?')).toBe(false);
    expect(isOutOfScope('How many birds were observed?')).toBe(false);
  });

  it('isOutOfScope returns true for purpose-of-work questions', () => {
    expect(isOutOfScope('What is the purpose of this work?')).toBe(true);
  });

  it('isOutOfScope does not flag equipment or protocol questions', () => {
    expect(isOutOfScope('What equipment do I need for this sample?')).toBe(false);
    expect(isOutOfScope('What is the purpose of membrane filtration?')).toBe(false);
  });
});

describe('offline assistant pipeline', () => {
  it('returns three genuinely different responses for in-scope, nonsense, and meta questions', () => {
    const inScope = getOfflineAssistantResponse('FCL-06', 'What do I collect for this sample?');
    const nonsense = getOfflineAssistantResponse('FCL-06', 'What is the capital of France?');
    const meta = getOfflineAssistantResponse('FCL-06', 'Why do you keep saying the same thing?');

    expect(new Set([inScope, nonsense, meta]).size).toBe(3);
    expect(inScope).toContain('Based on the OneAquaHealth factsheet');
    expect(nonsense).toBe(OUT_OF_SCOPE_RESPONSE);
    expect(meta).toContain('offline mode');
    expect(meta).not.toBe(OUT_OF_SCOPE_RESPONSE);
  });

  it('FCL-06 offline answer describes fecal coliforms lab work, not probe-based water chemistry', () => {
    const answer = getOfflineAssistantResponse('FCL-06', 'What do I collect for this sample?');
    expect(answer).toContain('Fecal Coliforms');
    expect(answer).toContain('laboratory-only');
    expect(answer).not.toContain('dissolved oxygen');
    expect(answer).not.toContain('standardized probes');
    expect(answer).not.toContain('physicochemical');
  });

  it('refuses questions containing no indicator vocabulary, including oddly-phrased legitimate ones', () => {
    expect(hasIndicatorVocabulary('What is the capital of France?')).toBe(false);
    expect(hasIndicatorVocabulary('When should I do this?')).toBe(false);
    const refused = getOfflineAssistantResponse('BMI-01', 'When should I do this?');
    expect(refused).toBe(OUT_OF_SCOPE_RESPONSE);
    expect(refused).toContain('protocol, states, or sampling');
  });

  it('every UI question and citizen_question passes the vocabulary check', () => {
    const uiQuestions = [
      'What does this indicator measure?',
      'What should I do during sampling?',
      'What equipment do I need?',
      'Explain this indicator',
      'What equipment do I need for this sample?',
    ];
    getAllFactsheetContent().forEach((entry) => uiQuestions.push(entry.citizen_question));
    uiQuestions.forEach((q) => {
      expect(hasIndicatorVocabulary(q), `vocabulary miss for: ${q}`).toBe(true);
      expect(isOutOfScope(q), `false out-of-scope for: ${q}`).toBe(false);
      const answer = getOfflineAssistantResponse('BMI-01', q);
      expect(answer).toContain('Based on the OneAquaHealth factsheet');
    });
  });

  it('diagnostic blocklist still outranks the vocabulary check', () => {
    const answer = getOfflineAssistantResponse('BMI-01', 'Is my stream healthy?');
    expect(answer).toBe(OUT_OF_SCOPE_RESPONSE);
  });

  it('isMetaQuestion catches meta phrasing and nothing else', () => {
    expect(isMetaQuestion('Why do you keep saying the same thing?')).toBe(true);
    expect(isMetaQuestion('You always give me the same answer')).toBe(true);
    expect(isMetaQuestion('How many birds were observed?')).toBe(false);
  });
});
