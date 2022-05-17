/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('items', (table) => {
		table.string('templateId')
		table.text('description')

	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('items', (table) => {
		table.dropColumn('templateId')
		table.dropColumn('description')
	})
};
