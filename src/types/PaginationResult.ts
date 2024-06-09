export interface PaginationResult<T> {
	page: number
	totalPages: number
	totalEntries: number,
	data: T[]
}