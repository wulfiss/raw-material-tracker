export const formText = (data: FormData, key: string) =>
  String(data.get(key) ?? '').trim();
