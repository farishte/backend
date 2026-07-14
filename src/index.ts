import type { Core } from '@strapi/strapi';

// Read actions we want the public (unauthenticated) role to have.
// One find/findOne pair per content type the frontend reads.
const READ_TYPES = [
  'api::institutional-eye.institutional-eye',
  'api::iias-in-new.iias-in-new',
  'api::governance-new.governance-new',
  'api::category.category',
  'api::tag.tag',
  'api::policy.policy',
  'api::disclosure.disclosure',
  'api::team-member.team-member',
];
const PUBLIC_ACTIONS = READ_TYPES.flatMap((uid) => [
  `${uid}.find`,
  `${uid}.findOne`,
]);

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * Grants the Public role read access to Articles so the frontend can fetch
   * them without a token. Idempotent — safe to run on every boot / DB reset.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    for (const action of PUBLIC_ACTIONS) {
      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action, role: publicRole.id } });

      if (!existing) {
        await strapi
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: publicRole.id } });
      }
    }
  },
};
