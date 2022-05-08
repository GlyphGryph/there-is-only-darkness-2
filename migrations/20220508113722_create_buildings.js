/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable('buildings', (table) => {
		table.increments('id').primary()
		table.integer('templateId')
		table.boolean('complete')
		table.integer('roomId').unsigned().notNullable()
		table.foreign('roomId').references('id').inTable('rooms')
		table.integer('inventoryId').unsigned().notNullable()
		table.foreign('inventoryId').references('id').inTable('inventories')
		table.timestamps()
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists('buildings')
};
