export function payload(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw Object.assign(new Error('Invalid note.'), { status: 400 });
  const data = Object.fromEntries(['title','content','category','color','pinned']
    .filter(key => Object.hasOwn(body, key)).map(key => [key, body[key]]));
  if (Object.hasOwn(data, 'title') && (typeof data.title !== 'string' || !data.title.trim())) throw Object.assign(new Error('Title is required.'), { status: 400 });
  if (Object.hasOwn(data, 'content') && typeof data.content !== 'string') throw Object.assign(new Error('Content must be text.'), { status: 400 });
  if (Object.hasOwn(data, 'pinned') && typeof data.pinned !== 'boolean') throw Object.assign(new Error('Pinned must be true or false.'), { status: 400 });
  return data;
}
