export function payload(body = {}) {
  const fields = ['title', 'content', 'category', 'color', 'pinned'];
  const data = Object.fromEntries(
    fields
      .filter(key => Object.hasOwn(body, key))
      .map(key => [key, body[key]])
  );

  if (Object.hasOwn(data, 'title') && typeof data.title !== 'string') {
    throw Object.assign(new Error('Title must be text.'), { status: 400 });
  }

  if (Object.hasOwn(data, 'content') && typeof data.content !== 'string') {
    throw Object.assign(new Error('Content must be text.'), { status: 400 });
  }

  if (Object.hasOwn(data, 'pinned') && typeof data.pinned !== 'boolean') {
    throw Object.assign(new Error('Pinned must be true or false.'), { status: 400 });
  }

  return data;
}
