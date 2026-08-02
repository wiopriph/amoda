// Частичный upsert по id падает на NOT NULL колонках (Postgres проверяет
// вставляемую строку до разрешения конфликта), поэтому обновляем по одной.
export async function updateRowsById(
  client: any,
  table: string,
  rows: ({ id: number } & Record<string, unknown>)[],
) {
  const chunkSize = 20;

  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);

    const results = await Promise.all(
      chunk.map(({ id, ...fields }) => client.from(table).update(fields)
        .eq('id', id)),
    );

    for (const { error } of results) {
      if (error) {
        throw createError({ statusCode: 500, statusMessage: error.message });
      }
    }
  }
}
