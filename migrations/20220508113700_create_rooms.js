/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable('rooms', (table) => {
		table.increments('id').primary()
		table.text('description')
		table.integer('inventoryId').unsigned().notNullable()
		table.foreign('inventoryId').references('id').inTable('inventories')
		table.timestamps()
	})
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists('rooms')
}
