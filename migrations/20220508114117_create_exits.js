/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable('exits', (table) => {
		table.increments('id').primary()
		table.integer('sourceId').unsigned().notNullable()
		table.foreign('sourceId').references('id').inTable('rooms')
		table.integer('destinationId').unsigned().notNullable()
		table.foreign('destinationId').references('id').inTable('rooms')
		table.timestamps()
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists('exits')
}