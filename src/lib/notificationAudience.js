/**
 * Builds the `audience` + body for POST /notifications/send (see NOTIFICATIONS_SPEC.md):
 *   { title, body, audience: { type: 'all'|'branch'|'class'|'section'|'role', branch_id?, class_id?, section_id?, roles? } }
 *
 * `roles` is only sent when it is a subset of all roles (sending nothing means "everyone in that scope").
 * Scope 'all' with a subset of roles becomes type 'role'.
 */
export const ALL_ROLES = ['TEACHER', 'PARENT', 'STUDENT', 'STAFF'];
export const ROLE_LABELS = { TEACHER: 'Teachers', PARENT: 'Parents', STUDENT: 'Students', STAFF: 'Staff' };

export const TITLE_MAX = 120;
export const BODY_MAX = 1000;

// Class/section audiences are students + their parents only (TEACHER/STAFF are rejected by the server)
export const CLASS_ROLES = ['STUDENT', 'PARENT'];
export const rolesForScope = (scope) => (scope === 'class' || scope === 'section' ? CLASS_ROLES : ALL_ROLES);

/**
 * @param {{ title, message, scope: 'all'|'branch'|'class'|'section', branch_id?, class_id?, section_id?, roles: string[] }} sel
 * @returns {{ ok: boolean, errors: Record<string,string>, payload?: object }}
 */
export function buildNotificationPayload(sel = {}) {
  const errors = {};
  const title = String(sel.title ?? '').trim();
  const body = String(sel.message ?? '').trim();
  const scope = sel.scope || 'all';
  const allowed = rolesForScope(scope);
  const roles = [...new Set((sel.roles || []).filter((r) => allowed.includes(r)))];

  if (!title) errors.title = 'Enter a title';
  else if (title.length > TITLE_MAX) errors.title = `Title can be at most ${TITLE_MAX} characters`;
  if (!body) errors.message = 'Enter a message';
  else if (body.length > BODY_MAX) errors.message = `Message can be at most ${BODY_MAX} characters`;
  if (roles.length === 0) errors.roles = 'Choose at least one group to notify';

  if (!['all', 'branch', 'class', 'section'].includes(scope)) errors.scope = 'Choose who to notify';
  if (scope === 'branch' && !sel.branch_id) errors.branch_id = 'Select a campus';
  if ((scope === 'class' || scope === 'section') && !sel.class_id) errors.class_id = 'Select a class';
  if (scope === 'section' && !sel.section_id) errors.section_id = 'Select a section';

  if (Object.keys(errors).length) return { ok: false, errors };

  const allRoles = roles.length === allowed.length; // server defaults: everyone in scope / students+parents for class and section
  let audience;
  if (scope === 'all') audience = allRoles ? { type: 'all' } : { type: 'role', roles };
  else if (scope === 'branch') audience = { type: 'branch', branch_id: sel.branch_id, ...(allRoles ? {} : { roles }) };
  else if (scope === 'class') audience = { type: 'class', class_id: sel.class_id, ...(allRoles ? {} : { roles }) };
  else audience = { type: 'section', class_id: sel.class_id, section_id: sel.section_id, ...(allRoles ? {} : { roles }) };

  return { ok: true, errors: {}, payload: { title, body, audience } };
}

/** Plain-language audience description for the preview / confirm dialog. */
export function describeAudience(sel = {}, names = {}) {
  const allowed = rolesForScope(sel.scope);
  const roles = (sel.roles || []).filter((r) => allowed.includes(r));
  const who = roles.length === allowed.length ? (allowed === CLASS_ROLES ? 'students and parents' : 'everyone') : roles.map((r) => ROLE_LABELS[r].toLowerCase()).join(', ') || 'nobody';
  switch (sel.scope) {
    case 'branch':
      return `${who} at ${names.branch || 'the selected campus'}`;
    case 'class':
      return `${who} of ${names.class || 'the selected class'}`;
    case 'section':
      return `${who} of ${names.class || 'the selected class'} – ${names.section || 'the selected section'}`;
    default:
      return `${who} in the whole school`;
  }
}
