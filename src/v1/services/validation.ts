export function validateInt(param: string): boolean {
    const pattern = new RegExp(/^[0-9]+$/)
    return pattern.test(param)
}

export function validateDate(param: string): boolean {
    const pattern = new RegExp(/^20[0-9]{2}-[0-9]{2}-[0-9]{2}$/)
    return pattern.test(param)
}
