/**
 * utility functions for knowledge base operations
 * handles validation and checks for knowledge base associations
 */

/**
 * check if a knowledge base ID is valid
 * @param knowledgeBaseId - knowledge base ID to validate
 * @returns true if the ID represents a knowledge base
 */
export function isValidKnowledgeBaseId(
  knowledgeBaseId?: string | null,
): boolean {
  if (!knowledgeBaseId) return false

  // common invalid/placeholder knowledge base IDs
  const invalidIds = ['null', 'undefined']

  return !invalidIds.includes(knowledgeBaseId)
}

/**
 * check if a file is actually indexed
 * @param file - file object to check
 * @returns true if file is indexed in a knowledge base
 */
export function isFileIndexed(file: {
  knowledge_base_id?: string | null
}): boolean {
  return isValidKnowledgeBaseId(file.knowledge_base_id)
}

/**
 * check if a file can be deindexed
 * @param file - file object to check
 * @returns true if file can be deindexed
 */
export function canDeindexFile(file: {
  knowledge_base_id?: string | null
}): boolean {
  return isValidKnowledgeBaseId(file.knowledge_base_id)
}
