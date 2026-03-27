const fs = require('fs');
const p = 'FORM_FIELDS_AUDIT.md';
const text = fs.readFileSync(p,'utf8');
const lines = text.split(/\r?\n/);
let currentFile = null;
const files = [];
for (let i=0;i<lines.length;i++) {
  const l = lines[i];
  const mFile = l.match(/^###\s+(src\/[^\s]+)$/);
  if (mFile) { currentFile = { file: mFile[1], forms: [] }; files.push(currentFile); continue; }
  const mFieldCount = l.match(/^- Field count:\s+(\d+)/);
  if (mFieldCount && currentFile) { currentFile.forms.push(Number(mFieldCount[1])); }
}
const sum = (arr)=>arr.reduce((a,b)=>a+b,0);
const out = {
 totalFiles: files.length,
 totalForms: sum(files.map(f=>f.forms.length)),
 totalFields: sum(files.map(f=>sum(f.forms))),
 byArea: {}
};
const areas = [
 ['auth', /^src\/app\/\(auth\)\//],
 ['master-admin', /^src\/app\/\(master-admin\)\//],
 ['institute-type', /^src\/app\/\(institute\)\/\[type\]\//],
 ['school-group', /^src\/app\/\(school\)\//],
 ['teacher', /^src\/app\/teacher\//],
 ['student', /^src\/app\/student\//],
 ['parent', /^src\/app\/parent\//],
 ['components-pages', /^src\/components\/pages\//],
 ['other', /.*/]
];
for (const [name, re] of areas) {
 const subset = files.filter(f=>re.test(f.file));
 out.byArea[name] = { files: subset.length, forms: sum(subset.map(f=>f.forms.length)), fields: sum(subset.map(f=>sum(f.forms))) };
}
console.log(JSON.stringify(out,null,2));
