export interface PaginationResult<T> {
	page: number
	total: number
	data: T[]
}