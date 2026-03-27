const fs = require('fs');
const sourcePath = 'FORM_FIELDS_AUDIT.md';
const targetPath = 'FULL_FORMS_ANALYSIS.md';

const src = fs.readFileSync(sourcePath, 'utf8');
const lines = src.split(/\r?\n/);

let currentFile = null;
const files = [];
for (const l of lines) {
  const mf = l.match(/^###\s+(src\/[^\s]+)$/);
  if (mf) {
    currentFile = { file: mf[1], forms: [] };
    files.push(currentFile);
    continue;
  }
  const mc = l.match(/^- Field count:\s+(\d+)/);
  if (mc && currentFile) currentFile.forms.push(Number(mc[1]));
}

const sum = (arr) => arr.reduce((a,b)=>a+b,0);
const totalFiles = files.length;
const totalForms = sum(files.map(f => f.forms.length));
const totalFields = sum(files.map(f => sum(f.forms)));

const groups = [
  ['Auth', /^src\/app\/\(auth\)\//],
  ['Master Admin', /^src\/app\/\(master-admin\)\//],
  ['Institute (School Group)', /^src\/app\/\(school\)\//],
  ['Teacher Portal', /^src\/app\/teacher\//],
  ['Student Portal', /^src\/app\/student\//],
  ['Parent Portal', /^src\/app\/parent\//],
  ['Reusable Pages', /^src\/components\/pages\//],
];

const groupRows = groups.map(([name, re]) => {
  const subset = files.filter(f => re.test(f.file));
  return {
    name,
    files: subset.length,
    forms: sum(subset.map(f => f.forms.length)),
    fields: sum(subset.map(f => sum(f.forms)))
  };
});

const generatedOn = new Date().toISOString();

const header = [
  '# Full Forms Analysis',
  '',
  `Generated on: ${generatedOn}`,
  `Source: ${sourcePath}`,
  '',
  '## Executive Summary',
  '',
  `- Files with forms: ${totalFiles}`,
  `- Total forms detected: ${totalForms}`,
  `- Total fields detected: ${totalFields}`,
  '',
  '## Area-wise Summary',
  '',
  '| Area | Files | Forms | Fields |',
  '|---|---:|---:|---:|',
  ...groupRows.map(r => `| ${r.name} | ${r.files} | ${r.forms} | ${r.fields} |`),
  '',
  '## Notes',
  '',
  '- This report is based on static JSX scanning; dynamic conditional fields may appear only at runtime.',
  '- Some field labels/names can be unresolved when components are generated via loops/templates.',
  '- Full raw detailed listing is included below (all forms, all detected fields, labels, components).',
  '',
  '---',
  '',
  '## Full Detailed Forms Listing',
  ''
].join('\n');

fs.writeFileSync(targetPath, `${header}\n${src}`, 'utf8');
console.log(`Created ${targetPath}`);
