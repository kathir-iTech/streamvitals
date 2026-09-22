import { indicators } from '@/data/indicators.json';

const INDICATOR_MAP = new Map(indicators.map((ind) => [ind.id, ind]));

interface AssessmentInput {
  indicatorId: string;
  state: string;
  confirmed: boolean;
  citizenObservation?: string;
}

export interface FhirObservation {
  resourceType: 'Observation';
  status: 'final';
  category: { coding: { system: string; code: string; display: string }[] }[];
  code: { coding: { system: string; code: string; display: string }[] };
  subject: { reference: string };
  effectiveDateTime: string;
  valueString?: string;
  note?: { text: string }[];
}

export interface FhirQuestionnaireResponse {
  resourceType: 'QuestionnaireResponse';
  status: 'completed';
  questionnaire: string;
  subject: { reference: string };
  authored: string;
  answer: Array<{
    question: string;
    answer: { valueString: string };
  }>;
}

export interface FhirBundle {
  resourceType: 'Bundle';
  type: 'collection';
  timestamp: string;
  entry: Array<{
    resource: FhirQuestionnaireResponse | FhirObservation;
    fullUrl: string;
    request: { method: string; url: string };
  }>;
}

const STATE_MAP: Record<string, string> = {
  diverse_sensitive: 'Diverse_Sensitive',
  tolerant_only: 'Tolerant_Only',
  absent_or_dead: 'Absent_Or_Dead',
};

export function buildFhirBundle(
  observations: AssessmentInput[],
  patientId: string = 'patient/streamvitals-001'
): FhirBundle {
  const timestamp = new Date().toISOString();
  const entries: FhirBundle['entry'] = [];

  const questionnaireAnswers = observations
    .filter((o) => o.confirmed)
    .map((obs) => ({
      question: obs.indicatorId,
      answer: { valueString: STATE_MAP[obs.state] ?? obs.state },
    }));

  const qr: FhirQuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    status: 'completed',
    questionnaire: 'https://oneaquahealth.eu/health-assessment-framework',
    subject: { reference: patientId },
    authored: timestamp,
    answer: questionnaireAnswers,
  };

  entries.push({
    resource: qr,
    fullUrl: `${patientId}/questionnaireresponse/streamvitals-001`,
    request: { method: 'POST', url: 'QuestionnaireResponse' },
  });

  const observationResources = observations
    .filter((o) => o.confirmed)
    .map((obs) => {
      const ind = INDICATOR_MAP.get(obs.indicatorId);
      if (!ind) return null;
      const observation: FhirObservation = {
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'environment',
                display: 'Environmental',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://oneaquahealth.eu/fhir/StructureDefinition/oh-indicator',
              code: obs.indicatorId,
              display: ind.name,
            },
          ],
        },
        subject: { reference: patientId },
        effectiveDateTime: timestamp,
        valueString: STATE_MAP[obs.state] ?? obs.state,
        note: ind.framework_basis.citation
          ? [
              {
                text: `Source: ${ind.framework_basis.document}. Citation: ${ind.framework_basis.citation}. OAH-FHIR Implementation Guide: draft/CI-build, not certified.`,
              },
            ]
          : undefined,
      };
      return observation;
    })
    .filter((o): o is FhirObservation => o !== null);

  observationResources.forEach((obs, i) => {
    entries.push({
      resource: obs,
      fullUrl: `${patientId}/observation/streamvitals-001-${i}`,
      request: { method: 'POST', url: 'Observation' },
    });
  });

  return {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp,
    entry: entries,
  };
}

export function validateFhirBundle(bundle: FhirBundle): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (bundle.resourceType !== 'Bundle') {
    errors.push('Bundle.resourceType must be "Bundle"');
  }
  if (!bundle.timestamp) {
    errors.push('Bundle.timestamp is required');
  }
  if (!bundle.entry || bundle.entry.length === 0) {
    errors.push('Bundle.entry must contain at least one resource');
  }

  for (const entry of bundle.entry) {
    if (!entry.resource.resourceType) {
      errors.push('Each entry must have a resource with resourceType');
    }
    if (!entry.fullUrl) {
      errors.push('Each entry must have a fullUrl');
    }
    if (!entry.request || !entry.request.method) {
      errors.push('Each entry must have a request.method');
    }
  }

  const qrEntry = bundle.entry.find(
    (e) => (e.resource as FhirQuestionnaireResponse).resourceType === 'QuestionnaireResponse'
  );
  if (qrEntry) {
    const qr = qrEntry.resource as FhirQuestionnaireResponse;
    if (qr.status !== 'completed') {
      errors.push('QuestionnaireResponse.status must be "completed"');
    }
    if (!qr.questionnaire) {
      errors.push('QuestionnaireResponse.questionnaire is required');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function getFhirDisclaimer(): string {
  return 'FHIR R4 export using current OAH CI-build structures where applicable — draft implementation guide, not certified.';
}
