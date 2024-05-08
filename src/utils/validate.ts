export function validateEmail(email: string) {
	return !!email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i)
}

export function validatePassword(password: string) {
	return password.length >= 8
}