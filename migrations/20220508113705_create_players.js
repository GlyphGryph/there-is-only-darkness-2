/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.createTable('players', (table) => {
		table.increments('id').primary()
		table.string('name')
		table.string('username')
		table.string('channelId')
		table.integer('worldId').unsigned().notNullable()
		table.foreign('worldId').references('id').inTable('worlds')
		table.integer('roomId').unsigned().notNullable()
		table.foreign('roomId').references('id').inTable('rooms')
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
  return knex.schema.dropTableIfExists('players')
}
