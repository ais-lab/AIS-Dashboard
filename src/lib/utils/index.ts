import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const checkPasswordStrength = (password: string) => {
  const containsUppercase = (ch: string) => /[A-Z]/.test(ch)
  const containsLowercase = (ch: string) => /[a-z]/.test(ch)
  let countOfUpperCase = 0,
    countOfLowerCase = 0,
    countOfNumbers = 0
  for (let i = 0; i < password.length; i++) {
    let ch = password.charAt(i)
    if (!isNaN(+ch)) countOfNumbers++
    else if (containsUppercase(ch)) countOfUpperCase++
    else if (containsLowercase(ch)) countOfLowerCase++
  }
  return {
    hasLowerCase: countOfLowerCase > 0,
    hasUpperCase: countOfUpperCase > 0,
    hasNumber: countOfNumbers > 0,
    isValid: countOfLowerCase > 0 && countOfUpperCase > 0 && countOfNumbers > 0,
  }
}

export function cleanObject<T>(obj: T | any, removeEmptyString = false): T {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object")
      cleanObject(obj[key], removeEmptyString)
    else if (obj[key] == null || obj[key] == undefined) delete obj[key]
    else if (removeEmptyString && obj[key] === "") delete obj[key]
  })
  return obj
}
