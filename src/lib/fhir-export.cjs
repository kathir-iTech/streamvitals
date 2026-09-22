const fs = require('fs');
const path = require('path');
const indicatorsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/indicators.json'), 'utf8'));

const INDICATOR_MAP = new Map(indicatorsData.map((ind) => [ind.id, ind]));

const STATE_MAP = {
  diverse_sensitive: 'Diverse_Sensitive',
  tolerant_only: 'Tolerant_Only',
  absent_or_dead: 'Absent_Or_Dead',
};

function buildFhirBundle(observations, patientId = 'patient/streamvitals-001') {
  const timestamp = new Date().toISOString();
  const entries = [];

  const questionnaireAnswers = observations
    .filter((o) => o.confirmed)
    .map((obs) => ({
      question: obs.indicatorId,
      answer: { valueString: STATE_MAP[obs.state] || obs.state },
    }));

  const qr = {
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
      const observation = {
        resourceType: 'Observation',
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'environment', display: 'Environmental' }] }],
        code: { coding: [{ system: 'http://oneaquahealth.eu/fhir/StructureDefinition/oh-indicator', code: obs.indicatorId, display: ind.name }] },
        subject: { reference: patientId },
        effectiveDateTime: timestamp,
        valueString: STATE_MAP[obs.state] || obs.state,
        note: ind.framework_basis.citation ? [{ text: `Source: ${ind.framework_basis.document}. Citation: ${ind.framework_basis.citation}. OAH-FHIR Implementation Guide: draft/CI-build, not certified.` }] : undefined,
      };
      return observation;
    })
    .filter(Boolean);

  observationResources.forEach((obs, i) => {
    entries.push({
      resource: obs,
      fullUrl: `${patientId}/observation/streamvitals-001-${i}`,
      request: { method: 'POST', url: 'Observation' },
    });
  });

  return { resourceType: 'Bundle', type: 'collection', timestamp, entry: entries };
}

function validateFhirBundle(bundle) {
  const errors = [];
  if (bundle.resourceType !== 'Bundle') errors.push('Bundle.resourceType must be "Bundle"');
  if (!bundle.timestamp) errors.push('Bundle.timestamp is required');
  if (!bundle.entry || bundle.entry.length === 0) errors.push('Bundle.entry must contain at least one resource');
  for (const entry of bundle.entry) {
    if (!entry.resource || !entry.resource.resourceType) errors.push('Each entry must have a resource with resourceType');
    if (!entry.fullUrl) errors.push('Each entry must have a fullUrl');
    if (!entry.request || !entry.request.method) errors.push('Each entry must have a request.method');
  }
  const qrEntry = bundle.entry.find(e => e.resource.resourceType === 'QuestionnaireResponse');
  if (qrEntry && qrEntry.resource.status !== 'completed') errors.push('QuestionnaireResponse.status must be "completed"');
  return { valid: errors.length === 0, errors };
}

function getFhirDisclaimer() {
  return 'FHIR R4 export using current OAH CI-build structures where applicable — draft implementation guide, not certified.';
}

module.exports = { buildFhirBundle, validateFhirBundle, getFhirDisclaimer };
