/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.table('items', (table) => {
		table.dropColumn('name')
		table.dropColumn('description')
		table.string('templateId')
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.table('items', (table) => {
		table.dropColumn('templateId')
	})
};
