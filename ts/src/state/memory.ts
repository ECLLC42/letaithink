export type VectorRecord = {
  id: string
  text: string
  embedding: number[]
  meta?: Record<string, unknown>
}

export class InMemoryVectorStore {
  private data: Map<string, VectorRecord> = new Map()

  upsert(record: VectorRecord): void { this.data.set(record.id, record) }
  get(id: string): VectorRecord | undefined { return this.data.get(id) }
  searchByText(text: string): VectorRecord[] {
    // Placeholder: naive contains-based search for now
    const q = text.toLowerCase()
    return Array.from(this.data.values()).filter(r => r.text.toLowerCase().includes(q))
  }
}

export const vectorStore = new InMemoryVectorStore()



