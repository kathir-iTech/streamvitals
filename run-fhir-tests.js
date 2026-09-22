const { buildFhirBundle, validateFhirBundle, getFhirDisclaimer } = require('./src/lib/fhir-export.cjs');

const testObservations = [
  { indicatorId: 'BMI-01', state: 'diverse_sensitive', confirmed: true },
  { indicatorId: 'BMI-04', state: 'tolerant_only', confirmed: true },
  { indicatorId: 'BMI-02', state: 'absent_or_dead', confirmed: false },
];

const bundle = buildFhirBundle(testObservations);

console.log('--- FHIR Bundle Validation Tests ---');

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) { passed++; console.log(`PASS: ${label}`); }
  else { failed++; console.log(`FAIL: ${label}`); }
}

assert('Bundle resourceType is Bundle', bundle.resourceType === 'Bundle');
assert('Bundle type is collection', bundle.type === 'collection');
assert('Bundle has timestamp', !!bundle.timestamp);
assert('Bundle has entries', bundle.entry.length > 0);
assert('Bundle has QuestionnaireResponse', bundle.entry.some(e => e.resource.resourceType === 'QuestionnaireResponse'));
assert('Bundle has Observation resources', bundle.entry.some(e => e.resource.resourceType === 'Observation'));
assert('QuestionnaireResponse status is completed', bundle.entry.find(e => e.resource.resourceType === 'QuestionnaireResponse').resource.status === 'completed');
assert('Observation resources have resourceType', bundle.entry.filter(e => e.resource.resourceType === 'Observation').every(e => e.resource.resourceType === 'Observation'));
assert('Observations have category', bundle.entry.filter(e => e.resource.resourceType === 'Observation').every(e => e.resource.category && e.resource.category.length > 0));

const validation = validateFhirBundle(bundle);
assert('FHIR bundle validates', validation.valid);
assert('No validation errors', validation.errors.length === 0);

const invalidBundle = { resourceType: 'Bundle', type: 'collection', timestamp: '', entry: [] };
const invalidValidation = validateFhirBundle(invalidBundle);
assert('Invalid bundle fails validation', !invalidValidation.valid);
assert('Invalid bundle has errors', invalidValidation.errors.length > 0);

console.log(`\n--- FHIR Results: ${passed} passed, ${failed} failed ---`);
console.log(getFhirDisclaimer());
