export function isValidPassword(password: string) {
  // Mot passe valide : 
  // - au moins 8 caractères (CNIL recommande 12)
  // - au moins un chiffre
  // - au moins une majuscule
  // - au moins une minuscule
  // - au moins un caractère spécial

  if (password.length < 8) { return false; }
  if (!/[0-9]/.test(password)) { return false; }
  if (!/[A-Z]/.test(password)) { return false; }
  if (!/[a-z]/.test(password)) { return false; }
  if (!/[!@#$%^&*(),.?":{}|<>;'`~]/.test(password)) { return false; }

  return true;
}

