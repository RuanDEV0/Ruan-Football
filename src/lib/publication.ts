interface PublicationEntry {
  readonly data: { readonly publishable: boolean };
  readonly body?: string;
}

export function isPublishable(entry: PublicationEntry): boolean {
  if (!entry.data.publishable) return false;
  if (JSON.stringify(entry).includes('[[PENDENTE')) {
    throw new Error('Conteúdo público contém informação pendente; revise antes de publicar.');
  }
  return true;
}
